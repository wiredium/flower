/**
 * AI and OpenRouter-related type definitions
 */

export interface GenerateOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
  userId?: string
  projectId?: string
}

export interface ModelConfig {
  model: string
  inputCostPer1M: number
  outputCostPer1M: number
  maxTokens: number
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
}

export interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message?: {
      role: string
      content: string
    }
    delta?: {
      content?: string
    }
    finish_reason?: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIGenerationInput {
  taskType: AITaskType
  prompt: string
  context?: any
  options?: GenerateOptions
}

export enum AITaskType {
  CODE_GENERATION = 'code-generation',
  DOCUMENTATION = 'documentation',
  SIMPLE_TASKS = 'simple-tasks',
  ANALYSIS = 'analysis',
  CREATIVE = 'creative',
}

export interface ModelPerformance {
  id: string
  model: string
  taskType: string
  avgLatency: number
  avgCost: number
  avgQuality: number
  successRate: number
  sampleCount: number
  updatedAt: Date
}

export interface CostEstimate {
  estimatedCost: number
  inputTokens: number
  outputTokens: number
  model: string
}

export interface AIUsageStats {
  totalGenerations: number
  totalCost: number
  totalTokens: number
  averageLatency: number
  creditBalance: number
  mostUsedModels: Array<{
    model: string
    count: number
    totalCost: number
  }>
}

// Model selection strategy
export interface ModelSelectionStrategy {
  taskType: AITaskType | string
  fallbackModels?: string[]
  maxRetries?: number
  costThreshold?: number
}

// AI service configuration
export interface AIServiceConfig {
  apiKey: string
  apiUrl?: string
  defaultModel?: string
  maxTokensPerRequest?: number
  budgetPerUser?: number
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
}

// AI generation history
export interface AIGenerationHistory {
  id: string
  userId: string
  projectId?: string
  model: string
  provider: string
  prompt: string
  response: string
  inputTokens: number
  outputTokens: number
  cost: number
  latency: number
  taskType: string
  quality?: number
  createdAt: Date
}