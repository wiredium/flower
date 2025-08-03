import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// Use a generic router type to avoid cross-package import issues
// This allows tRPC hooks to work properly without strict typing
export const trpc = createTRPCReact<any>()

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
