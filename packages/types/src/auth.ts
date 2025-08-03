/**
 * Authentication-related type definitions
 */

import type { User } from './user'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: Omit<User, 'hashedPassword'>
  accessToken: string
  refreshToken: string
}

export interface RegisterInput {
  email: string
  password: string
  name?: string
  username?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RefreshTokenInput {
  refreshToken: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}