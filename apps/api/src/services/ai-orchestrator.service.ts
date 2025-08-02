import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import { OpenRouterService } from './openrouter.service.js'
import type { AITaskType, GenerateOptions } from '@repo/types'

interface AITask {
  type: AITaskType | string
  prompt: string
  context?: any
  budget?: number
  quality?: 'low' | 'medium' | 'high'
  speed?: 'fast' | 'balanced' | 'quality'
  userId?: string
  projectId?: string
}

interface ModelSelection {
  model: string
  reason: string
  estimatedCost: number
  estimatedLatency: number
  confidence: number
}

interface AIResponse {
  success: boolean
  response: string
  model: string
  cost: number
  latency: number
  tokens: {
    input: number
    output: number
  }
  metadata?: any
}

export class AIOrchestrator {
  private openRouterService: OpenRouterService
  private modelPerformanceCache: Map<string, any> = new Map()
  
  // Advanced model configuration with fallbacks
  private modelHierarchy = {
    'code-generation': {
      primary: 'anthropic/claude-3-opus',
      fallbacks: ['openai/gpt-4-turbo', 'anthropic/claude-3-sonnet'],
      budget: ['deepseek/deepseek-coder', 'mistralai/codestral-latest'],
    },
    'documentation': {
      primary: 'openai/gpt-4-turbo',
      fallbacks: ['anthropic/claude-3-opus', 'openai/gpt-3.5-turbo'],
      budget: ['mistralai/mistral-7b-instruct', 'meta-llama/llama-3-8b-instruct'],
    },
    'analysis': {
      primary: 'anthropic/claude-3-sonnet',
      fallbacks: ['openai/gpt-4', 'anthropic/claude-3-haiku'],
      budget: ['mistralai/mixtral-8x7b-instruct', 'meta-llama/llama-3-70b-instruct'],
    },
    'creative': {
      primary: 'openai/gpt-4-turbo',
      fallbacks: ['anthropic/claude-3-opus', 'google/gemini-pro'],
      budget: ['mistralai/mistral-7b-instruct', 'meta-llama/llama-3-8b-instruct'],
    },
    'simple-tasks': {
      primary: 'mistralai/mistral-7b-instruct',
      fallbacks: ['meta-llama/llama-3-8b-instruct', 'openai/gpt-3.5-turbo'],
      budget: ['mistralai/mistral-7b-instruct', 'meta-llama/llama-3-8b-instruct'],
    },
  }

  constructor() {
    this.openRouterService = new OpenRouterService()
    this.loadModelPerformanceData()
  }

  /**
   * Route task to optimal model based on multiple factors
   */
  async routeTask(task: AITask): Promise<AIResponse> {
    const complexity = this.analyzeComplexity(task)
    const modelSelection = await this.selectOptimalModel(
      task.type,
      complexity,
      task.budget,
      task.quality,
      task.speed
    )

    try {
      // Try primary model
      const response = await this.executeWithModel(modelSelection.model, task)
      
      // Track performance
      await this.trackModelPerformance(
        modelSelection.model,
        task.type,
        response.latency,
        response.cost,
        true
      )

      return response
    } catch (error) {
      // Try fallback models
      return await this.executeWithFallback(task, modelSelection)
    }
  }

  /**
   * Analyze task complexity
   */
  private analyzeComplexity(task: AITask): number {
    let complexity = 0

    // Prompt length factor
    const promptLength = task.prompt.length
    if (promptLength > 2000) complexity += 0.3
    else if (promptLength > 1000) complexity += 0.2
    else if (promptLength > 500) complexity += 0.1

    // Task type factor
    const complexTasks = ['code-generation', 'analysis']
    if (complexTasks.includes(task.type)) complexity += 0.3

    // Context factor
    if (task.context) {
      const contextSize = JSON.stringify(task.context).length
      if (contextSize > 5000) complexity += 0.2
      else if (contextSize > 1000) complexity += 0.1
    }

    // Special requirements
    if (task.quality === 'high') complexity += 0.2
    if (task.prompt.includes('complex') || task.prompt.includes('detailed')) complexity += 0.1

    return Math.min(complexity, 1.0)
  }

  /**
   * Select optimal model based on multiple factors
   */
  private async selectOptimalModel(
    taskType: string,
    complexity: number,
    budget?: number,
    quality?: 'low' | 'medium' | 'high',
    speed?: 'fast' | 'balanced' | 'quality'
  ): Promise<ModelSelection> {
    const models = this.modelHierarchy[taskType as keyof typeof this.modelHierarchy] || 
                   this.modelHierarchy['simple-tasks']

    // Budget constraint
    if (budget && budget < 0.01) {
      return {
        model: models.budget[0]!,
        reason: 'Budget constraint',
        estimatedCost: 0.001,
        estimatedLatency: 1000,
        confidence: 0.7,
      }
    }

    // Quality requirement
    if (quality === 'high' && complexity > 0.6) {
      return {
        model: models.primary,
        reason: 'High quality requirement with complex task',
        estimatedCost: 0.02,
        estimatedLatency: 3000,
        confidence: 0.95,
      }
    }

    // Speed requirement
    if (speed === 'fast') {
      const fastModel = models.budget[0]! // Budget models are typically faster
      return {
        model: fastModel,
        reason: 'Speed priority',
        estimatedCost: 0.001,
        estimatedLatency: 500,
        confidence: 0.8,
      }
    }

    // Performance-based selection
    const performance = await this.getModelPerformance(models.primary, taskType)
    
    if (performance && performance.successRate < 0.8) {
      // Use fallback if primary model has poor performance
      return {
        model: models.fallbacks[0]!,
        reason: 'Primary model performance issues',
        estimatedCost: 0.015,
        estimatedLatency: 2000,
        confidence: 0.85,
      }
    }

    // Default to primary model
    return {
      model: models.primary,
      reason: 'Default selection based on task type',
      estimatedCost: 0.02,
      estimatedLatency: 2500,
      confidence: 0.9,
    }
  }

  /**
   * Execute task with specific model
   */
  private async executeWithModel(model: string, task: AITask): Promise<AIResponse> {
    const startTime = Date.now()

    const options: GenerateOptions = {
      temperature: this.getTemperatureForTask(task.type),
      maxTokens: this.getMaxTokensForTask(task.type),
      userId: task.userId,
      projectId: task.projectId,
    }

    try {
      const result = await this.openRouterService.generateWithModel(
        model,
        task.prompt,
        options
      )

      return {
        success: true,
        response: result.response,
        model: result.model,
        cost: result.cost,
        latency: Date.now() - startTime,
        tokens: result.tokens,
        metadata: {
          complexity: this.analyzeComplexity(task),
          taskType: task.type,
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Model ${model} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  /**
   * Execute with fallback models
   */
  private async executeWithFallback(
    task: AITask,
    originalSelection: ModelSelection
  ): Promise<AIResponse> {
    const models = this.modelHierarchy[task.type as keyof typeof this.modelHierarchy] || 
                   this.modelHierarchy['simple-tasks']

    for (const fallbackModel of models.fallbacks) {
      try {
        const response = await this.executeWithModel(fallbackModel, task)
        
        // Track fallback usage
        await this.trackModelPerformance(
          fallbackModel,
          task.type,
          response.latency,
          response.cost,
          true
        )

        return {
          ...response,
          metadata: {
            ...response.metadata,
            usedFallback: true,
            originalModel: originalSelection.model,
          },
        }
      } catch (error) {
        continue // Try next fallback
      }
    }

    // All models failed
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'All models failed to process the request',
    })
  }

  /**
   * Get temperature setting for task type
   */
  private getTemperatureForTask(taskType: string): number {
    const temperatures: Record<string, number> = {
      'code-generation': 0.3,
      'documentation': 0.5,
      'analysis': 0.4,
      'creative': 0.8,
      'simple-tasks': 0.7,
    }
    return temperatures[taskType] || 0.7
  }

  /**
   * Get max tokens for task type
   */
  private getMaxTokensForTask(taskType: string): number {
    const maxTokens: Record<string, number> = {
      'code-generation': 2000,
      'documentation': 1500,
      'analysis': 2000,
      'creative': 1000,
      'simple-tasks': 500,
    }
    return maxTokens[taskType] || 1000
  }

  /**
   * Load model performance data from database
   */
  private async loadModelPerformanceData() {
    const performances = await prisma.modelPerformance.findMany()
    
    performances.forEach(perf => {
      const key = `${perf.model}:${perf.taskType}`
      this.modelPerformanceCache.set(key, perf)
    })
  }

  /**
   * Get model performance metrics
   */
  private async getModelPerformance(model: string, taskType: string) {
    const key = `${model}:${taskType}`
    
    // Check cache first
    if (this.modelPerformanceCache.has(key)) {
      return this.modelPerformanceCache.get(key)
    }

    // Load from database
    const performance = await prisma.modelPerformance.findUnique({
      where: {
        model_taskType: {
          model,
          taskType,
        },
      },
    })

    if (performance) {
      this.modelPerformanceCache.set(key, performance)
    }

    return performance
  }

  /**
   * Track model performance
   */
  private async trackModelPerformance(
    model: string,
    taskType: string,
    latency: number,
    cost: number,
    success: boolean
  ) {
    const existing = await prisma.modelPerformance.findUnique({
      where: {
        model_taskType: {
          model,
          taskType,
        },
      },
    })

    if (existing) {
      // Update existing performance metrics
      const newSampleCount = existing.sampleCount + 1
      const newAvgLatency = (existing.avgLatency * existing.sampleCount + latency) / newSampleCount
      const newAvgCost = (Number(existing.avgCost) * existing.sampleCount + cost) / newSampleCount
      const newSuccessRate = success 
        ? (existing.successRate * existing.sampleCount + 1) / newSampleCount
        : (existing.successRate * existing.sampleCount) / newSampleCount

      await prisma.modelPerformance.update({
        where: { id: existing.id },
        data: {
          avgLatency: Math.round(newAvgLatency),
          avgCost: newAvgCost,
          successRate: newSuccessRate,
          sampleCount: newSampleCount,
        },
      })
    } else {
      // Create new performance record
      await prisma.modelPerformance.create({
        data: {
          model,
          taskType,
          avgLatency: latency,
          avgCost: cost,
          avgQuality: 0.8, // Default quality
          successRate: success ? 1.0 : 0.0,
          sampleCount: 1,
        },
      })
    }

    // Update cache
    await this.loadModelPerformanceData()
  }

  /**
   * Get model recommendations for a task
   */
  async getModelRecommendations(task: AITask): Promise<ModelSelection[]> {
    const complexity = this.analyzeComplexity(task)
    const recommendations: ModelSelection[] = []

    // Get all suitable models
    const models = this.modelHierarchy[task.type as keyof typeof this.modelHierarchy] || 
                   this.modelHierarchy['simple-tasks']

    // Primary recommendation
    recommendations.push(await this.selectOptimalModel(
      task.type,
      complexity,
      task.budget,
      task.quality,
      task.speed
    ))

    // Budget option
    recommendations.push({
      model: models.budget[0]!,
      reason: 'Budget-friendly option',
      estimatedCost: 0.001,
      estimatedLatency: 1000,
      confidence: 0.7,
    })

    // Quality option
    recommendations.push({
      model: models.primary,
      reason: 'Highest quality option',
      estimatedCost: 0.02,
      estimatedLatency: 3000,
      confidence: 0.95,
    })

    return recommendations
  }

  /**
   * Validate model output
   */
  async validateOutput(output: string, taskType: string): Promise<boolean> {
    // Basic validation rules
    if (!output || output.length === 0) return false

    switch (taskType) {
      case 'code-generation':
        // Check for code-like patterns
        return output.includes('{') || output.includes('function') || output.includes('class')
      
      case 'documentation':
        // Check for proper formatting
        return output.length > 100 && (output.includes('#') || output.includes('\n'))
      
      case 'analysis':
        // Check for structured output
        return output.length > 200
      
      default:
        return output.length > 10
    }
  }
}

export const aiOrchestrator = new AIOrchestrator()