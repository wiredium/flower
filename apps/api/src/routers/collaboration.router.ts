import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { collaborationService } from '../services/collaboration.service'

const inviteSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['viewer', 'editor', 'owner']).default('viewer'),
  expiresIn: z.number().min(3600000).max(2592000000).optional(), // 1 hour to 30 days
})

const acceptInviteSchema = z.object({
  inviteCode: z.string().min(1),
})

const updateRoleSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['viewer', 'editor', 'owner']),
})

const removeCollaboratorSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
})

export const collaborationRouter = router({
  // Send an invitation
  invite: protectedProcedure
    .input(inviteSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await collaborationService.createInvitation(
        input.projectId,
        ctx.user!.id,
        input.email,
        input.role,
        input.expiresIn
      )

      // TODO: Send invitation email
      // await emailService.sendInvitation(invitation)

      return invitation
    }),

  // Accept an invitation
  acceptInvite: protectedProcedure
    .input(acceptInviteSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await collaborationService.acceptInvitation(
        input.inviteCode,
        ctx.user!.id
      )

      return result
    }),

  // Get collaborators for a project
  getCollaborators: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const collaborators = await collaborationService.getCollaborators(
        input.projectId,
        ctx.user!.id
      )

      return collaborators
    }),

  // Update collaborator role
  updateRole: protectedProcedure
    .input(updateRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const collaborator = await collaborationService.updateCollaboratorRole(
        input.projectId,
        input.userId,
        input.role,
        ctx.user!.id
      )

      return collaborator
    }),

  // Remove a collaborator
  removeCollaborator: protectedProcedure
    .input(removeCollaboratorSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await collaborationService.removeCollaborator(
        input.projectId,
        input.userId,
        ctx.user!.id
      )

      return result
    }),

  // Get pending invitations
  getPendingInvitations: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const invitations = await collaborationService.getPendingInvitations(
        input.projectId,
        ctx.user!.id
      )

      return invitations
    }),

  // Cancel an invitation
  cancelInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await collaborationService.cancelInvitation(
        input.invitationId,
        ctx.user!.id
      )

      return result
    }),

  // Leave a project (remove yourself as collaborator)
  leaveProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await collaborationService.removeCollaborator(
        input.projectId,
        ctx.user!.id,
        ctx.user!.id
      )

      return result
    }),

  // Check user's access level for a project
  checkAccess: protectedProcedure
    .input(z.object({ 
      projectId: z.string().uuid(),
      requiredRole: z.enum(['viewer', 'editor', 'owner']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const hasAccess = await collaborationService.checkProjectAccess(
        input.projectId,
        ctx.user!.id,
        input.requiredRole || 'viewer'
      )

      return { hasAccess }
    }),
})