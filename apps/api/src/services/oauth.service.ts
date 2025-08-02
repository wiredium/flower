import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import { authService } from './auth.service.js'
import { config } from '../lib/config.js'
import type { User } from '@prisma/client'

interface OAuthProfile {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  provider: 'github' | 'google'
}

export class OAuthService {
  /**
   * GitHub OAuth configuration
   */
  getGitHubAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.GITHUB_CLIENT_ID || '',
      redirect_uri: `${config.API_URL}/auth/github/callback`,
      scope: 'user:email',
      state: this.generateState(),
    })
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  /**
   * Google OAuth configuration
   */
  getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${config.API_URL}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: this.generateState(),
    })
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Handle GitHub OAuth callback
   */
  async handleGitHubCallback(code: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.GITHUB_CLIENT_ID,
          client_secret: config.GITHUB_CLIENT_SECRET,
          code,
        }),
      })

      const tokenData = await tokenResponse.json() as any
      
      if (tokenData.error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: tokenData.error_description || 'Failed to exchange code',
        })
      }

      // Get user profile
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/json',
        },
      })

      const githubUser = await userResponse.json() as any

      // Get primary email if not public
      let email = githubUser.email
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/json',
          },
        })
        const emails = await emailResponse.json() as any[]
        const primaryEmail = emails.find((e: any) => e.primary)
        email = primaryEmail?.email
      }

      if (!email) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Could not retrieve email from GitHub',
        })
      }

      const profile: OAuthProfile = {
        id: githubUser.id.toString(),
        email,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        provider: 'github',
      }

      const result = await this.findOrCreateUser(profile)
      return {
        user: result.user,
        tokens: result
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'GitHub OAuth failed',
      })
    }
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.GOOGLE_CLIENT_ID || '',
          client_secret: config.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: `${config.API_URL}/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      })

      const tokenData = await tokenResponse.json() as any
      
      if (tokenData.error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: tokenData.error_description || 'Failed to exchange code',
        })
      }

      // Get user profile
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      const googleUser = await userResponse.json() as any

      const profile: OAuthProfile = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        provider: 'google',
      }

      const result = await this.findOrCreateUser(profile)
      return {
        user: result.user,
        tokens: result
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Google OAuth failed',
      })
    }
  }

  /**
   * Find or create user from OAuth profile
   */
  private async findOrCreateUser(profile: OAuthProfile) {
    // Check if user exists with this email
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          // OAuth users don't have passwords
          hashedPassword: null,
          credits: 100, // Default credits for new users
        },
      })

      // Create OAuth integration record
      await prisma.userIntegration.create({
        data: {
          userId: user.id,
          provider: profile.provider === 'github' ? 'GITHUB' : 'SLACK', // Using SLACK as placeholder for Google
          externalAccountId: profile.id,
          accessToken: '', // We don't store OAuth tokens for security
          refreshToken: null,
          scopes: [],
        },
      })
    } else {
      // Update user info if needed
      if (profile.name && !user.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            name: profile.name,
            avatarUrl: profile.avatarUrl || user.avatarUrl,
          },
        })
      }
    }

    // Generate JWT tokens
    const tokens = authService.generateTokens(user)

    return { user, ...tokens }
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  /**
   * Link OAuth account to existing user
   */
  async linkOAuthAccount(
    userId: string,
    provider: 'github' | 'google',
    externalAccountId: string
  ) {
    const existingIntegration = await prisma.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: provider === 'github' ? 'GITHUB' : 'SLACK',
        },
      },
    })

    if (existingIntegration) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `${provider} account already linked`,
      })
    }

    await prisma.userIntegration.create({
      data: {
        userId,
        provider: provider === 'github' ? 'GITHUB' : 'SLACK',
        externalAccountId,
        accessToken: '',
        refreshToken: null,
        scopes: [],
      },
    })

    return { success: true }
  }

  /**
   * Unlink OAuth account
   */
  async unlinkOAuthAccount(userId: string, provider: 'github' | 'google') {
    await prisma.userIntegration.delete({
      where: {
        userId_provider: {
          userId,
          provider: provider === 'github' ? 'GITHUB' : 'SLACK',
        },
      },
    })

    return { success: true }
  }
}

export const oauthService = new OAuthService()