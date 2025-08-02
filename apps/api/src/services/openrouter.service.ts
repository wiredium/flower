import { config } from '../lib/config.js'
import { prisma } from '@repo/database'
import { TRPCError } from '@trpc/server'
import type { 
  GenerateOptions, 
  ModelConfig, 
  OpenRouterResponse,
  CostEstimate 
} from '@repo/types'

export class OpenRouterService {
  private readonly apiKey: string
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
  
  // Model configurations with costs (per 1M tokens)
  private readonly models: Record<string, ModelConfig> = {
    'code-generation': {
      model: 'anthropic/claude-3-opus',
      inputCostPer1M: 15.00,
      outputCostPer1M: 75.00,
      maxTokens: 4096,
    },
    'documentation': {
      model: 'openai/gpt-4-turbo',
      inputCostPer1M: 10.00,
      outputCostPer1M: 30.00,
      maxTokens: 4096,
    },
    'simple-tasks': {
      model: 'mistralai/mistral-7b-instruct',
      inputCostPer1M: 0.07,
      outputCostPer1M: 0.07,
      maxTokens: 8192,
    },
    'analysis': {
      model: 'anthropic/claude-3-sonnet',
      inputCostPer1M: 3.00,
      outputCostPer1M: 15.00,
      maxTokens: 4096,
    },
    'creative': {
      model: 'anthropic/claude-3-haiku',
      inputCostPer1M: 0.25,
      outputCostPer1M: 1.25,
      maxTokens: 4096,
    },
  }

  constructor() {
    this.apiKey = config.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️ OpenRouter API key not configured')
    }
  }

  /**
   * Select the best model for a task type
   */
  selectModel(taskType: string): ModelConfig {
    return this.models[taskType] || this.models['simple-tasks']!
  }

  /**
   * Calculate cost for a generation
   */
  calculateCost(
    inputTokens: number,
    outputTokens: number,
    modelConfig: ModelConfig
  ): number {
    const inputCost = (inputTokens / 1_000_000) * modelConfig.inputCostPer1M
    const outputCost = (outputTokens / 1_000_000) * modelConfig.outputCostPer1M
    return Number((inputCost + outputCost).toFixed(6))
  }

  /**
   * Check if user has enough credits
   */
  async checkCredits(userId: string, estimatedCost: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Convert credits to dollars (assuming 1 credit = $0.01)
    const userBalance = user.credits * 0.01
    return userBalance >= estimatedCost
  }

  /**
   * Deduct credits from user
   */
  async deductCredits(userId: string, cost: number): Promise<void> {
    // Convert cost to credits (1 credit = $0.01)
    const creditsToDeduct = Math.ceil(cost / 0.01)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: creditsToDeduct,
        },
      },
    })
  }

  /**
   * Generate completion from OpenRouter
   */
  async generate(
    taskType: string,
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'OpenRouter API key not configured',
      })
    }

    const modelConfig = this.selectModel(taskType)
    const startTime = Date.now()

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://flower.app',
          'X-Title': 'Flower - Workflow Builder',
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? modelConfig.maxTokens,
          top_p: options.topP ?? 1,
          stream: false,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `OpenRouter API error: ${error}`,
        })
      }

      const data = await response.json() as OpenRouterResponse
      const content = data.choices[0]?.message?.content || ''
      const latency = Date.now() - startTime

      // Track generation if user is provided
      if (options.userId && options.projectId && data.usage) {
        const cost = this.calculateCost(
          data.usage.prompt_tokens,
          data.usage.completion_tokens,
          modelConfig
        )

        // Save generation to database
        await prisma.aIGeneration.create({
          data: {
            userId: options.userId,
            projectId: options.projectId,
            model: modelConfig.model,
            provider: 'openrouter',
            prompt,
            response: content,
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
            cost,
            latency,
            taskType,
          },
        })

        // Deduct credits
        await this.deductCredits(options.userId, cost)

        // Update model performance stats
        await this.updateModelPerformance(modelConfig.model, taskType, {
          latency,
          cost,
        })
      }

      return content
    } catch (error) {
      console.error('OpenRouter generation error:', error)
      throw error instanceof TRPCError ? error : new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate content',
      })
    }
  }

  /**
   * Stream completion from OpenRouter
   */
  async *stream(
    taskType: string,
    prompt: string,
    options: GenerateOptions = {}
  ): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'OpenRouter API key not configured',
      })
    }

    const modelConfig = this.selectModel(taskType)

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://flower.app',
        'X-Title': 'Flower - Workflow Builder',
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? modelConfig.maxTokens,
        top_p: options.topP ?? 1,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `OpenRouter API error: ${error}`,
      })
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get response stream',
      })
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data) as OpenRouterResponse
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e)
          }
        }
      }
    }
  }

  /**
   * Estimate cost for a prompt
   */
  async estimateCost(
    taskType: string, 
    prompt: string,
    maxTokens?: number
  ): Promise<CostEstimate> {
    const modelConfig = this.selectModel(taskType)
    
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedInputTokens = Math.ceil(prompt.length / 4)
    const estimatedOutputTokens = maxTokens ?? 1000 // Average output

    const estimatedCost = this.calculateCost(
      estimatedInputTokens,
      estimatedOutputTokens,
      modelConfig
    )

    return {
      estimatedCost,
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      model: modelConfig.model,
    }
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return Object.entries(this.models).map(([taskType, config]) => ({
      taskType,
      model: config.model,
      inputCostPer1M: config.inputCostPer1M,
      outputCostPer1M: config.outputCostPer1M,
      maxTokens: config.maxTokens,
    }))
  }

  /**
   * Update model performance with quality rating
   */
  async updateModelPerformance(
    model: string,
    taskType: string,
    metrics: {
      quality?: number
      latency?: number
      cost?: number
    }
  ): Promise<void> {
    try {
      const existing = await prisma.modelPerformance.findUnique({
        where: {
          model_taskType: {
            model,
            taskType,
          },
        },
      })

      if (existing) {
        // Update with moving average
        const newSampleCount = existing.sampleCount + 1
        const updates: any = {
          sampleCount: newSampleCount,
        }

        if (metrics.latency !== undefined) {
          updates.avgLatency = Math.round(
            (existing.avgLatency * existing.sampleCount + metrics.latency) / newSampleCount
          )
        }

        if (metrics.cost !== undefined) {
          updates.avgCost = 
            (Number(existing.avgCost) * existing.sampleCount + metrics.cost) / newSampleCount
        }

        if (metrics.quality !== undefined && metrics.quality > 0) {
          const currentQuality = existing.avgQuality || 0
          updates.avgQuality = 
            (currentQuality * existing.sampleCount + metrics.quality) / newSampleCount
        }

        await prisma.modelPerformance.update({
          where: {
            model_taskType: {
              model,
              taskType,
            },
          },
          data: updates,
        })
      } else if (metrics.latency && metrics.cost) {
        // Create new performance record
        await prisma.modelPerformance.create({
          data: {
            model,
            taskType,
            avgLatency: metrics.latency,
            avgCost: metrics.cost,
            avgQuality: metrics.quality || 0,
            successRate: 1.0,
            sampleCount: 1,
          },
        })
      }
    } catch (error) {
      console.error('Failed to update model performance:', error)
    }
  }

}

export const openRouterService = new OpenRouterService()