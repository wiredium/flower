import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@repo/types'

// Create tRPC React client with proper typing
export const trpc = createTRPCReact<AppRouter>()

// Type placeholders for when proper typing is available
export type RouterInput = any
export type RouterOutput = any

export function getTRPCUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  return `${apiUrl}/trpc`
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

export function getAuthHeaders() {
  if (typeof window === 'undefined') return {}

  const token = localStorage.getItem('accessToken')
  if (!token) return {}

  return {
    Authorization: `Bearer ${token}`,
  }
}
