import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import { randomBytes } from 'crypto'
import type { CollaboratorRole } from '@repo/types'

export class CollaborationService {
  /**
   * Generate an invite code
   */
  generateInviteCode(): string {
    return randomBytes(16).toString('hex')
  }

  /**
   * Create a project invitation
   */
  async createInvitation(
    projectId: string,
    inviterId: string,
    email: string,
    role: CollaboratorRole = 'viewer',
    expiresIn: number = 7 * 24 * 60 * 60 * 1000 // 7 days
  ) {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: inviterId },
          {
            collaborators: {
              some: {
                userId: inviterId,
                role: { in: ['owner', 'editor'] },
              },
            },
          },
        ],
      },
    })

    if (!project) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to invite collaborators',
      })
    }

    // Check if user is already a collaborator
    const existingCollaborator = await prisma.user.findFirst({
      where: {
        email,
        collaborations: {
          some: { projectId },
        },
      },
    })

    if (existingCollaborator) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User is already a collaborator',
      })
    }

    // Create invitation
    const inviteCode = this.generateInviteCode()
    const expiresAt = new Date(Date.now() + expiresIn)

    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        inviterId,
        email,
        role,
        inviteCode,
        expiresAt,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return invitation
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(inviteCode: string, userId: string) {
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        inviteCode,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        project: true,
      },
    })

    if (!invitation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invalid or expired invitation',
      })
    }

    // Add user as collaborator
    const [collaborator, _] = await prisma.$transaction([
      prisma.projectCollaborator.create({
        data: {
          projectId: invitation.projectId,
          userId,
          role: invitation.role,
        },
      }),
      prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      }),
    ])

    return {
      collaborator,
      project: invitation.project,
    }
  }

  /**
   * Remove a collaborator
   */
  async removeCollaborator(projectId: string, userId: string, requesterId: string) {
    // Check if requester has permission
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: requesterId },
          {
            collaborators: {
              some: {
                userId: requesterId,
                role: 'owner',
              },
            },
          },
        ],
      },
    })

    if (!project) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to remove collaborators',
      })
    }

    // Cannot remove the project owner
    if (userId === project.ownerId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot remove the project owner',
      })
    }

    // Remove collaborator
    await prisma.projectCollaborator.deleteMany({
      where: {
        projectId,
        userId,
      },
    })

    return { success: true }
  }

  /**
   * Update collaborator role
   */
  async updateCollaboratorRole(
    projectId: string,
    userId: string,
    newRole: CollaboratorRole,
    requesterId: string
  ) {
    // Check if requester has permission
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: requesterId },
          {
            collaborators: {
              some: {
                userId: requesterId,
                role: 'owner',
              },
            },
          },
        ],
      },
    })

    if (!project) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update collaborator roles',
      })
    }

    // Update role
    const collaborator = await prisma.projectCollaborator.update({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: { role: newRole },
    })

    return collaborator
  }

  /**
   * Get project collaborators
   */
  async getCollaborators(projectId: string, userId: string) {
    // Verify user has access to the project
    const hasAccess = await this.checkProjectAccess(projectId, userId, 'viewer')
    
    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this project',
      })
    }

    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    })

    return collaborators
  }

  /**
   * Check if user has access to a project
   */
  async checkProjectAccess(
    projectId: string,
    userId: string,
    requiredRole: CollaboratorRole = 'viewer'
  ): Promise<boolean> {
    const roleHierarchy: Record<CollaboratorRole, number> = {
      viewer: 0,
      editor: 1,
      owner: 2,
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { visibility: 'PUBLIC' },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        collaborators: {
          where: { userId },
        },
      },
    })

    if (!project) {
      return false
    }

    // Owner has all permissions
    if (project.ownerId === userId) {
      return true
    }

    // Public projects allow viewer access
    if (project.visibility === 'PUBLIC' && requiredRole === 'viewer') {
      return true
    }

    // Check collaborator role
    const collaborator = project.collaborators[0]
    if (!collaborator) {
      return false
    }

    const collaboratorRole = collaborator.role as CollaboratorRole
    return roleHierarchy[collaboratorRole] >= roleHierarchy[requiredRole]
  }

  /**
   * Get pending invitations for a project
   */
  async getPendingInvitations(projectId: string, requesterId: string) {
    // Check if requester has permission
    const hasAccess = await this.checkProjectAccess(projectId, requesterId, 'editor')
    
    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view invitations',
      })
    }

    const invitations = await prisma.projectInvitation.findMany({
      where: {
        projectId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return invitations
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string, requesterId: string) {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: {
        project: true,
      },
    })

    if (!invitation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invitation not found',
      })
    }

    // Check if requester has permission
    const hasAccess = await this.checkProjectAccess(
      invitation.projectId,
      requesterId,
      'editor'
    )

    if (!hasAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to cancel invitations',
      })
    }

    await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'CANCELLED',
      },
    })

    return { success: true }
  }
}

export const collaborationService = new CollaborationService()