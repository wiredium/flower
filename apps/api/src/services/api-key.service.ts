import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import { randomBytes, createHash } from 'crypto'
import type { User } from '@prisma/client'

interface APIKey {
  id: string
  name: string
  key: string // Only returned on creation
  keyHash: string
  userId: string
  lastUsedAt: Date | null
  expiresAt: Date | null
  scopes: string[]
  createdAt: Date
}

export class APIKeyService {
  /**
   * Generate a new API key
   */
  generateAPIKey(): string {
    // Format: flwr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const prefix = process.env.NODE_ENV === 'production' ? 'flwr_live_' : 'flwr_test_'
    const randomPart = randomBytes(24).toString('hex')
    return prefix + randomPart
  }

  /**
   * Hash an API key for storage
   */
  private hashAPIKey(key: string): string {
    return createHash('sha256').update(key).digest('hex')
  }

  /**
   * Create a new API key for a user
   */
  async createAPIKey(
    userId: string,
    name: string,
    scopes: string[] = ['read', 'write'],
    expiresInDays?: number
  ): Promise<APIKey> {
    // Check if user already has max API keys (limit to 5)
    const existingKeys = await prisma.aPIKey.count({
      where: { userId },
    })

    if (existingKeys >= 5) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Maximum number of API keys (5) reached',
      })
    }

    const key = this.generateAPIKey()
    const keyHash = this.hashAPIKey(key)
    
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const apiKey = await prisma.aPIKey.create({
      data: {
        name,
        keyHash,
        userId,
        scopes,
        expiresAt,
      },
    })

    return {
      ...apiKey,
      key, // Return the actual key only on creation
    }
  }

  /**
   * Validate an API key
   */
  async validateAPIKey(key: string): Promise<{ valid: boolean; user?: User; scopes?: string[] }> {
    const keyHash = this.hashAPIKey(key)

    const apiKey = await prisma.aPIKey.findUnique({
      where: { keyHash },
      include: { user: true },
    })

    if (!apiKey) {
      return { valid: false }
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false }
    }

    // Update last used timestamp
    await prisma.aPIKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })

    return {
      valid: true,
      user: apiKey.user,
      scopes: apiKey.scopes,
    }
  }

  /**
   * List API keys for a user (without the actual keys)
   */
  async listAPIKeys(userId: string) {
    const keys = await prisma.aPIKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return keys.map(key => ({
      ...key,
      isExpired: key.expiresAt ? key.expiresAt < new Date() : false,
    }))
  }

  /**
   * Revoke an API key
   */
  async revokeAPIKey(userId: string, keyId: string) {
    const key = await prisma.aPIKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    })

    if (!key) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'API key not found',
      })
    }

    await prisma.aPIKey.delete({
      where: { id: keyId },
    })

    return { success: true }
  }

  /**
   * Update API key scopes
   */
  async updateAPIKeyScopes(userId: string, keyId: string, scopes: string[]) {
    const key = await prisma.aPIKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    })

    if (!key) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'API key not found',
      })
    }

    const updated = await prisma.aPIKey.update({
      where: { id: keyId },
      data: { scopes },
    })

    return updated
  }

  /**
   * Check if user has permission with API key scopes
   */
  hasPermission(scopes: string[], requiredScope: string): boolean {
    return scopes.includes(requiredScope) || scopes.includes('admin')
  }

  /**
   * Clean up expired API keys
   */
  async cleanupExpiredKeys() {
    const deleted = await prisma.aPIKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return { deleted: deleted.count }
  }
}

export const apiKeyService = new APIKeyService()