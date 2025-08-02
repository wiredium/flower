/**
 * API-related type definitions
 */

// API Response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Request configuration
export interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean>
  timeout?: number
}

// API Route definition
export interface ApiRoute {
  path: string
  method: HttpMethod
  auth?: boolean
  roles?: string[]
}