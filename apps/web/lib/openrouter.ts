interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
  }
  top_provider?: {
    max_completion_tokens?: number
  }
  architecture?: {
    modality: string
    tokenizer: string
    instruct_type?: string
  }
}

interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Using the provided API key directly for now
// In production, this should be stored in environment variables
const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export class OpenRouterService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = OPENROUTER_API_KEY) {
    this.apiKey = apiKey
    this.baseUrl = OPENROUTER_BASE_URL
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Flower Platform'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error)
      throw error
    }
  }

  async generateProjectInstructions({
    model,
    projectName,
    projectType,
    projectDescription,
    targetAudience,
    coreFeatures,
    techPreferences,
    constraints,
    timeline,
    budget,
    teamSize
  }: {
    model: string
    projectName: string
    projectType: string
    projectDescription: string
    targetAudience: string
    coreFeatures: string
    techPreferences?: string
    constraints?: string
    timeline?: string
    budget?: string
    teamSize?: string
  }): Promise<string> {
    const prompt = `You are an expert software architect. Generate a comprehensive project implementation guide for the following project:

Project Name: ${projectName}
Project Type: ${projectType}
Description: ${projectDescription}
Target Audience: ${targetAudience}
Core Features: ${coreFeatures}
Technical Preferences: ${techPreferences || 'Use modern, production-ready technologies'}
Constraints: ${constraints || 'None specified'}
Timeline: ${timeline || 'Flexible'}
Budget: ${budget || 'Moderate'}
Team Size: ${teamSize || 'Small team'}

Please provide:
1. A detailed technology stack recommendation with justifications
2. Architecture patterns and best practices specific to this project
3. Project structure with folder organization
4. Implementation roadmap with phases
5. Key technical decisions and trade-offs
6. Testing strategy
7. Deployment recommendations
8. Security considerations
9. Performance optimization tips
10. Potential challenges and solutions

Format the response in markdown with clear sections and bullet points where appropriate.`

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Flower Platform',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert software architect with experience in modern web development, cloud architecture, and best practices.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('OpenRouter API Error:', error)
        const errorMessage = error.error?.message || error.message || `Failed to generate instructions: ${response.statusText}`
        
        // Check for specific error types
        if (errorMessage.includes('No allowed providers')) {
          throw new Error(`Model ${model} is not available. Please try a different model.`)
        } else if (errorMessage.includes('API key')) {
          throw new Error('Invalid API key. Please check your OpenRouter configuration.')
        } else if (errorMessage.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        
        throw new Error(errorMessage)
      }

      const data: OpenRouterResponse = await response.json()
      return data.choices[0]?.message?.content || 'Failed to generate instructions'
    } catch (error) {
      console.error('Error generating instructions:', error)
      throw error
    }
  }

  async compareModels({
    models,
    projectDetails
  }: {
    models: string[]
    projectDetails: any
  }): Promise<Array<{ model: string; instruction: string; estimatedTime?: number }>> {
    const results = await Promise.all(
      models.map(async (model) => {
        try {
          const instruction = await this.generateProjectInstructions({
            model,
            ...projectDetails
          })
          return {
            model,
            instruction,
            estimatedTime: Math.floor(Math.random() * 30 + 20)
          }
        } catch (error) {
          console.error(`Error with model ${model}:`, error)
          return {
            model,
            instruction: `Error generating instructions with ${model}`,
            estimatedTime: 0
          }
        }
      })
    )
    return results
  }
}

export const openRouterService = new OpenRouterService()

// Popular models for quick selection (including Cerebras models)
export const POPULAR_MODELS = [
  // Cerebras Featured Models
  { id: 'qwen/qwen3-235b-a22b-thinking-2507', name: 'Qwen3 235B Thinking', provider: 'Cerebras', featured: true },
  { id: 'qwen/qwen3-coder-480b-a35b-instruct', name: 'Qwen3 Coder 480B', provider: 'Cerebras', featured: true },
  { id: 'qwen/qwen3-235b-a22b-instruct-2507', name: 'Qwen3 235B Instruct', provider: 'Cerebras', featured: true },
  { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', provider: 'Cerebras', featured: true },
  { id: 'meta-llama/llama-4-maverick-17b-instruct', name: 'Llama 4 Maverick', provider: 'Cerebras', featured: true },
  { id: 'meta-llama/llama-4-scout-17b-instruct', name: 'Llama 4 Scout', provider: 'Cerebras', featured: true },
  { id: 'deepseek/deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill', provider: 'Cerebras', featured: true },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Cerebras', featured: true },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Cerebras', featured: true },
  
  // Other Popular Models
  { id: 'openai/gpt-4-turbo-preview', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'Mistral' },
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere' },
]