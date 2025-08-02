/**
 * Service-related type definitions
 */

import type { WorkflowData, WorkflowExecutionContext, WorkflowNode } from './workflow'

// Workflow service types
export interface WorkflowServiceConfig {
  maxExecutionTime?: number
  maxNodeExecutions?: number
  enableLogging?: boolean
  enableMetrics?: boolean
}

export interface WorkflowExecutionOptions {
  timeout?: number
  dryRun?: boolean
  skipValidation?: boolean
  onProgress?: (event: WorkflowExecutionEvent) => void
}

export interface WorkflowExecutionEvent {
  type: 'start' | 'progress' | 'complete' | 'error'
  nodeId?: string
  message?: string
  progress?: number
  data?: any
}

export interface WorkflowExecutionResult {
  success: boolean
  executionId: string
  startTime: Date
  endTime?: Date
  results: Record<string, any>
  errors?: Array<{
    nodeId: string
    error: string
    timestamp: Date
  }>
  logs?: Array<{
    timestamp: Date
    level: 'info' | 'warn' | 'error'
    message: string
    nodeId?: string
  }>
}

// Auth service types
export interface AuthServiceConfig {
  jwtSecret: string
  jwtRefreshSecret: string
  jwtExpiresIn: string
  jwtRefreshExpiresIn: string
  bcryptRounds?: number
  passwordMinLength?: number
  passwordRequirements?: {
    uppercase?: boolean
    lowercase?: boolean
    numbers?: boolean
    symbols?: boolean
  }
}

// Integration service types
export interface IntegrationConfig {
  type: 'github' | 'jira' | 'trello' | 'slack'
  credentials: Record<string, string>
  webhookUrl?: string
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
}

export interface IntegrationEvent {
  type: string
  source: string
  data: any
  timestamp: Date
}

// Email service types
export interface EmailServiceConfig {
  provider: 'sendgrid' | 'mailgun' | 'smtp' | 'resend'
  apiKey?: string
  from: string
  replyTo?: string
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
}

export interface EmailTemplate {
  subject: string
  html?: string
  text?: string
  variables?: Record<string, any>
}

// Notification service types
export interface NotificationConfig {
  channels: Array<'email' | 'webhook' | 'slack' | 'discord'>
  defaultChannel: string
  templates: Record<string, NotificationTemplate>
}

export interface NotificationTemplate {
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channels?: Array<'email' | 'webhook' | 'slack' | 'discord'>
}

export interface NotificationPayload {
  userId: string
  type: string
  data: Record<string, any>
  channels?: string[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

// Cache service types
export interface CacheConfig {
  provider: 'memory' | 'redis'
  ttl?: number
  maxSize?: number
  redis?: {
    host: string
    port: number
    password?: string
    db?: number
  }
}

// Queue service types
export interface QueueConfig {
  provider: 'memory' | 'redis' | 'bull'
  concurrency?: number
  redis?: {
    host: string
    port: number
    password?: string
  }
}

export interface QueueJob<T = any> {
  id: string
  type: string
  data: T
  priority?: number
  delay?: number
  attempts?: number
  maxAttempts?: number
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
  failedAt?: Date
  error?: string
}

// Storage service types
export interface StorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'azure'
  basePath?: string
  s3?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
  }
  gcs?: {
    bucket: string
    projectId: string
    keyFilename: string
  }
  azure?: {
    containerName: string
    connectionString: string
  }
}

export interface StorageFile {
  key: string
  url: string
  size: number
  contentType: string
  metadata?: Record<string, any>
  createdAt: Date
}

// Analytics service types
export interface AnalyticsConfig {
  provider: 'mixpanel' | 'amplitude' | 'segment' | 'custom'
  apiKey?: string
  projectId?: string
  flushInterval?: number
  batchSize?: number
}

export interface AnalyticsEvent {
  event: string
  userId?: string
  properties?: Record<string, any>
  timestamp?: Date
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: any) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
}