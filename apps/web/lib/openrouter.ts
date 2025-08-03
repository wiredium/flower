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
const OPENROUTER_API_KEY =
  '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'
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
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Flower Platform',
        },
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
    teamSize,
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
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Flower Platform',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert software architect with experience in modern web development, cloud architecture, and best practices.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('OpenRouter API Error:', error)
        const errorMessage =
          error.error?.message ||
          error.message ||
          `Failed to generate instructions: ${response.statusText}`

        // Check for specific error types
        if (errorMessage.includes('No allowed providers')) {
          throw new Error(
            `Model ${model} is not available. Please try a different model.`,
          )
        }
        if (errorMessage.includes('API key')) {
          throw new Error(
            'Invalid API key. Please check your OpenRouter configuration.',
          )
        }
        if (errorMessage.includes('rate limit')) {
          throw new Error(
            'Rate limit exceeded. Please wait a moment and try again.',
          )
        }

        throw new Error(errorMessage)
      }

      const data: OpenRouterResponse = await response.json()
      return (
        data.choices[0]?.message?.content || 'Failed to generate instructions'
      )
    } catch (error) {
      console.error('Error generating instructions:', error)
      throw error
    }
  }

  async compareModels({
    models,
    projectDetails,
  }: {
    models: string[]
    projectDetails: any
  }): Promise<
    Array<{ model: string; instruction: string; estimatedTime?: number }>
  > {
    const results = await Promise.all(
      models.map(async (model) => {
        try {
          const instruction = await this.generateProjectInstructions({
            model,
            ...projectDetails,
          })
          return {
            model,
            instruction,
            estimatedTime: Math.floor(Math.random() * 30 + 20),
          }
        } catch (error) {
          console.error(`Error with model ${model}:`, error)

          // If the original model fails, try a reliable fallback
          if (
            error instanceof Error &&
            error.message.includes('is not available')
          ) {
            const fallbackModel =
              RELIABLE_FALLBACK_MODELS[0] || 'meta-llama/llama-3.1-8b-instruct' // Use first reliable model with safe fallback
            console.log(`Falling back to ${fallbackModel} for ${model}`)

            try {
              const instruction = await this.generateProjectInstructions({
                model: fallbackModel,
                ...projectDetails,
              })
              return {
                model: fallbackModel, // Use fallback model ID
                instruction: `${instruction}\n\n*Note: Generated using ${fallbackModel} as ${model} was unavailable.*`,
                estimatedTime: Math.floor(Math.random() * 30 + 20),
              }
            } catch (fallbackError) {
              console.error(`Fallback also failed for ${model}:`, fallbackError)
            }
          }

          return {
            model,
            instruction: `Error: ${model} is currently unavailable. Please try a different model.`,
            estimatedTime: 0,
          }
        }
      }),
    )
    return results
  }
}

export const openRouterService = new OpenRouterService()

// Popular models for quick selection (including Cerebras models)
export const POPULAR_MODELS = [
  // Cerebras Featured Models - Known to work well
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Cerebras',
    featured: true,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    provider: 'Cerebras',
    featured: true,
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Cerebras',
    featured: true,
  },

  // Reliable OpenAI models
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },

  // Reliable Anthropic models
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
  },

  // Other reliable models
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
  },
]

// Known reliable models for fallback
export const RELIABLE_FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct',
  'meta-llama/llama-3.1-8b-instruct',
  'openai/gpt-3.5-turbo',
  'anthropic/claude-3-haiku',
]
