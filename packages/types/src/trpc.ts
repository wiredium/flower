/**
 * tRPC-related type definitions
 * 
 * Note: The actual tRPC types are defined in the web app's lib/trpc.ts
 * This file is kept for backward compatibility but should not import from API
 */

// Export AppRouter as any to avoid circular dependencies
// The actual router type is defined in the API but we use any here
export type AppRouter = any

// Export empty types to avoid circular dependencies
// The actual types are handled in the web app
export type RouterInputs = any
export type RouterOutputs = any
export type UserRouterInputs = any
export type UserRouterOutputs = any
export type HealthRouterOutputs = any