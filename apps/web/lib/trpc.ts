import { createTRPCReact } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../api/src/routers'

export const trpc = createTRPCReact<AppRouter>()

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export function getTRPCUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return 'http://localhost:3001/trpc'
  }
  // SSR should use absolute URL
  return 'http://localhost:3001/trpc'
}

export function getAuthHeaders() {
  if (typeof window === 'undefined') return {}
  
  const token = localStorage.getItem('accessToken')
  if (!token) return {}
  
  return {
    Authorization: `Bearer ${token}`,
  }
}