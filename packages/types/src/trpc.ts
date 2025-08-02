/**
 * tRPC-related type definitions
 */

import type { AppRouter } from '../../../apps/api/src/routers/index.js'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// Type helpers for the API
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

// Specific router types
export type UserRouterInputs = RouterInputs['user']
export type UserRouterOutputs = RouterOutputs['user']
export type HealthRouterOutputs = RouterOutputs['health']

// Re-export the AppRouter type
export type { AppRouter }