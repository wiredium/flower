import { createTRPCReact } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../api/src/routers/index'

// Type inference issue with cross-package dependencies - using explicit type
export const trpc: any = createTRPCReact<AppRouter>()

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

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