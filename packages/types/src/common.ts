/**
 * Common type utilities
 */

// Make all properties of T optional recursively
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

// Make all properties of T required recursively
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>
    }
  : T

// Extract the type of array elements
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

// Nullable type
export type Nullable<T> = T | null

// Maybe type (includes undefined)
export type Maybe<T> = T | undefined

// Common status types
export type Status = 'idle' | 'loading' | 'success' | 'error'

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}