/**
 * User-related type definitions
 */

export interface User {
  id: string
  email: string
  name?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  bio?: string
  avatar?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications?: NotificationPreferences
}

export interface NotificationPreferences {
  email?: boolean
  push?: boolean
  sms?: boolean
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name?: string
}