import { prisma } from '@repo/database'
import { realtimeService } from './realtime.service.js'
import type { NotificationPayload } from '@repo/types'

export type NotificationType = 
  | 'workflow_completed'
  | 'workflow_failed'
  | 'collaboration_invite'
  | 'collaboration_accepted'
  | 'collaboration_removed'
  | 'project_shared'
  | 'comment_added'
  | 'workflow_forked'
  | 'credits_low'
  | 'system_announcement'

interface NotificationData {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  actionUrl?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification(userId: string, notification: NotificationData) {
    const notif = await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        actionUrl: notification.actionUrl,
        priority: notification.priority || 'normal',
        read: false,
      },
    })

    // Emit real-time event
    realtimeService.emitNotificationEvent(userId, notif)

    return notif
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(userIds: string[], notification: NotificationData) {
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        actionUrl: notification.actionUrl,
        priority: notification.priority || 'normal',
        read: false,
      })),
    })

    // Emit real-time events for each user
    userIds.forEach(userId => {
      realtimeService.emitNotificationEvent(userId, {
        ...notification,
        userId,
      })
    })

    return notifications
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return notification
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const notifications = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return notifications
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    options: {
      read?: boolean
      type?: NotificationType
      priority?: 'low' | 'normal' | 'high' | 'urgent'
      limit?: number
      offset?: number
    } = {}
  ) {
    const where: any = { userId }

    if (options.read !== undefined) {
      where.read = options.read
    }

    if (options.type) {
      where.type = options.type
    }

    if (options.priority) {
      where.priority = options.priority
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      }),
    ])

    return {
      notifications,
      total,
      unreadCount,
      hasMore: (options.offset || 0) + notifications.length < total,
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    })

    return { success: true }
  }

  /**
   * Delete old notifications
   */
  async cleanupOldNotifications(daysToKeep: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const deleted = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        read: true,
      },
    })

    return deleted
  }

  /**
   * Send workflow completion notification
   */
  async notifyWorkflowCompletion(
    userId: string,
    projectName: string,
    executionId: string,
    success: boolean
  ) {
    const notification: NotificationData = success ? {
      type: 'workflow_completed',
      title: 'Workflow Completed',
      message: `Your workflow "${projectName}" has completed successfully.`,
      data: { executionId },
      actionUrl: `/executions/${executionId}`,
      priority: 'normal',
    } : {
      type: 'workflow_failed',
      title: 'Workflow Failed',
      message: `Your workflow "${projectName}" has failed. Please check the logs.`,
      data: { executionId },
      actionUrl: `/executions/${executionId}`,
      priority: 'high',
    }

    return this.createNotification(userId, notification)
  }

  /**
   * Send collaboration invitation notification
   */
  async notifyCollaborationInvite(
    userId: string,
    inviterName: string,
    projectName: string,
    inviteCode: string
  ) {
    const notification: NotificationData = {
      type: 'collaboration_invite',
      title: 'Collaboration Invitation',
      message: `${inviterName} has invited you to collaborate on "${projectName}"`,
      data: { inviteCode },
      actionUrl: `/invitations/${inviteCode}`,
      priority: 'high',
    }

    return this.createNotification(userId, notification)
  }

  /**
   * Send project shared notification
   */
  async notifyProjectShared(
    userId: string,
    sharerName: string,
    projectName: string,
    projectId: string
  ) {
    const notification: NotificationData = {
      type: 'project_shared',
      title: 'Project Shared',
      message: `${sharerName} has shared "${projectName}" with you`,
      data: { projectId },
      actionUrl: `/projects/${projectId}`,
      priority: 'normal',
    }

    return this.createNotification(userId, notification)
  }

  /**
   * Send low credits warning
   */
  async notifyLowCredits(userId: string, remainingCredits: number) {
    const notification: NotificationData = {
      type: 'credits_low',
      title: 'Low Credits Warning',
      message: `You have only ${remainingCredits} credits remaining. Consider purchasing more.`,
      actionUrl: '/billing',
      priority: 'high',
    }

    return this.createNotification(userId, notification)
  }

  /**
   * Send system announcement
   */
  async sendSystemAnnouncement(
    title: string,
    message: string,
    targetUserIds?: string[]
  ) {
    const notification: NotificationData = {
      type: 'system_announcement',
      title,
      message,
      priority: 'normal',
    }

    if (targetUserIds && targetUserIds.length > 0) {
      return this.createBulkNotifications(targetUserIds, notification)
    }

    // Send to all users
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    const userIds = users.map(u => u.id)
    return this.createBulkNotifications(userIds, notification)
  }
}

export const notificationService = new NotificationService()