import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import { config } from '../lib/config'
import type { User } from '@prisma/client'
import type { TokenPayload, AuthTokens } from '@repo/types'

export class AuthService {
  private readonly saltRounds = 10

  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as any)

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    } as any)

    return { accessToken, refreshToken }
  }

  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_SECRET) as TokenPayload
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      })
    }
  }

  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token',
      })
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string, username?: string) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      // Hash password and create user
      const hashedPassword = await this.hashPassword(password)
      
      const user = await prisma.user.create({
        data: {
          email,
          name,
          hashedPassword,
        },
      })

      // Generate tokens
      const tokens = this.generateTokens(user)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          credits: user.credits,
          avatarUrl: user.avatarUrl,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    } catch (error) {
      // If it's already a TRPCError, re-throw it
      if (error instanceof TRPCError) {
        throw error
      }
      
      // Handle Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          })
        }
      }

      // Handle other errors
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to register user',
      })
    }
  }

  /**
   * Login a user
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.hashedPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.hashedPassword)
    
    if (!isValidPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      })
    }

    // Generate tokens
    const tokens = this.generateTokens(user)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        avatarUrl: user.avatarUrl,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string) {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken)

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      })
    }

    // Generate new tokens
    const tokens = this.generateTokens(user)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        avatarUrl: user.avatarUrl,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  /**
   * Get user from token
   */
  async getUserFromToken(token: string) {
    const payload = this.verifyAccessToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      })
    }

    return user
  }
}

export const authService = new AuthService()