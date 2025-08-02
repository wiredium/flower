import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { notificationService, type NotificationType } from '../services/notification.service'

const getNotificationsSchema = z.object({
  read: z.boolean().optional(),
  type: z.enum([
    'workflow_completed',
    'workflow_failed',
    'collaboration_invite',
    'collaboration_accepted',
    'collaboration_removed',
    'project_shared',
    'comment_added',
    'workflow_forked',
    'credits_low',
    'system_announcement',
  ] as const).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export const notificationRouter = router({
  // Get notifications for the current user
  getNotifications: protectedProcedure
    .input(getNotificationsSchema)
    .query(async ({ ctx, input }) => {
      const result = await notificationService.getNotifications(
        ctx.user!.id,
        input
      )

      return result
    }),

  // Mark a notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await notificationService.markAsRead(
        input.notificationId,
        ctx.user!.id
      )

      return result
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await notificationService.markAllAsRead(ctx.user!.id)

      return result
    }),

  // Delete a notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await notificationService.deleteNotification(
        input.notificationId,
        ctx.user!.id
      )

      return result
    }),

  // Get unread count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await notificationService.getNotifications(
        ctx.user!.id,
        { read: false, limit: 0 }
      )

      return { count: result.unreadCount }
    }),

  // Test notification (development only)
  testNotification: protectedProcedure
    .input(z.object({
      type: z.enum([
        'workflow_completed',
        'workflow_failed',
        'collaboration_invite',
        'collaboration_accepted',
        'collaboration_removed',
        'project_shared',
        'comment_added',
        'workflow_forked',
        'credits_low',
        'system_announcement',
      ]),
      title: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Test notifications are only available in development')
      }

      const testNotifications = {
        workflow_completed: {
          title: 'Test Workflow Completed',
          message: 'Your test workflow has completed successfully.',
        },
        workflow_failed: {
          title: 'Test Workflow Failed',
          message: 'Your test workflow has failed.',
        },
        collaboration_invite: {
          title: 'Test Collaboration Invite',
          message: 'You have been invited to collaborate on a test project.',
        },
        collaboration_accepted: {
          title: 'Test Collaboration Accepted',
          message: 'Your collaboration invitation has been accepted.',
        },
        collaboration_removed: {
          title: 'Test Collaboration Removed',
          message: 'You have been removed from a test project.',
        },
        project_shared: {
          title: 'Test Project Shared',
          message: 'A test project has been shared with you.',
        },
        comment_added: {
          title: 'Test Comment Added',
          message: 'A new comment has been added to your project.',
        },
        workflow_forked: {
          title: 'Test Workflow Forked',
          message: 'Someone has forked your workflow.',
        },
        credits_low: {
          title: 'Test Low Credits',
          message: 'Your credits are running low.',
        },
        system_announcement: {
          title: 'Test System Announcement',
          message: 'This is a test system announcement.',
        },
      }

      const notificationData = testNotifications[input.type]

      const notification = await notificationService.createNotification(
        ctx.user!.id,
        {
          type: input.type,
          title: input.title || notificationData.title,
          message: input.message || notificationData.message,
          priority: 'normal',
        }
      )

      return notification
    }),
})