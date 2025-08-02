import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { config } from '../lib/config.js'
import { workflowService } from './workflow.service.js'
import { notificationService } from './notification.service.js'
import { analyticsService } from './analytics.service.js'
import { prisma } from '@repo/database'
import type { WorkflowData, WorkflowExecutionContext } from '@repo/types'

interface WorkflowJob {
  projectId: string
  workflowData: WorkflowData
  context: WorkflowExecutionContext
  userId: string
}

interface NotificationJob {
  userId: string
  type: string
  title: string
  message: string
  data?: any
}

interface AnalyticsJob {
  type: 'workflow_execution' | 'node_execution' | 'daily_metrics'
  data: any
}

export class QueueService {
  private workflowQueue: Queue<WorkflowJob>
  private notificationQueue: Queue<NotificationJob>
  private analyticsQueue: Queue<AnalyticsJob>
  private scheduledQueue: Queue<any>
  
  private workflowWorker?: Worker<WorkflowJob>
  private notificationWorker?: Worker<NotificationJob>
  private analyticsWorker?: Worker<AnalyticsJob>
  private scheduledWorker?: Worker<any>

  constructor() {
    const connection = {
      host: config.REDIS_HOST || 'localhost',
      port: config.REDIS_PORT || 6379,
      password: config.REDIS_PASSWORD,
    }

    // Initialize queues
    this.workflowQueue = new Queue('workflow-execution', { connection })
    this.notificationQueue = new Queue('notifications', { connection })
    this.analyticsQueue = new Queue('analytics', { connection })
    this.scheduledQueue = new Queue('scheduled-workflows', { connection })

    // Initialize workers
    this.initializeWorkers()
  }

  /**
   * Initialize queue workers
   */
  private initializeWorkers() {
    // Workflow execution worker
    this.workflowWorker = new Worker<WorkflowJob>(
      'workflow-execution',
      async (job) => {
        const { projectId, workflowData, context, userId } = job.data

        try {
          // Execute workflow
          const result = await workflowService.executeWorkflow(workflowData, context)

          // Send completion notification
          await this.addNotificationJob({
            userId,
            type: 'workflow_completed',
            title: 'Workflow Completed',
            message: `Your workflow has completed successfully`,
            data: { projectId, executionId: context.executionId },
          })

          // Track analytics
          await this.addAnalyticsJob({
            type: 'workflow_execution',
            data: {
              projectId,
              success: true,
              duration: Date.now() - job.timestamp,
              nodesExecuted: context.executionPath.length,
            },
          })

          return result
        } catch (error) {
          // Send failure notification
          await this.addNotificationJob({
            userId,
            type: 'workflow_failed',
            title: 'Workflow Failed',
            message: `Your workflow has failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            data: { projectId, executionId: context.executionId },
          })

          // Track failure analytics
          await this.addAnalyticsJob({
            type: 'workflow_execution',
            data: {
              projectId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          })

          throw error
        }
      },
      {
        connection: {
          host: config.REDIS_HOST || 'localhost',
          port: config.REDIS_PORT || 6379,
          password: config.REDIS_PASSWORD,
        },
        concurrency: 5,
      }
    )

    // Notification worker
    this.notificationWorker = new Worker<NotificationJob>(
      'notifications',
      async (job) => {
        const { userId, type, title, message, data } = job.data
        
        await notificationService.createNotification(userId, {
          type: type as any,
          title,
          message,
          data,
        })
      },
      {
        connection: {
          host: config.REDIS_HOST || 'localhost',
          port: config.REDIS_PORT || 6379,
          password: config.REDIS_PASSWORD,
        },
        concurrency: 10,
      }
    )

    // Analytics worker
    this.analyticsWorker = new Worker<AnalyticsJob>(
      'analytics',
      async (job) => {
        const { type, data } = job.data
        
        switch (type) {
          case 'workflow_execution':
            await analyticsService.trackWorkflowExecution(data)
            break
          case 'node_execution':
            await analyticsService.trackNodeExecution(data)
            break
          case 'daily_metrics':
            await analyticsService.updateDailyMetrics(data)
            break
        }
      },
      {
        connection: {
          host: config.REDIS_HOST || 'localhost',
          port: config.REDIS_PORT || 6379,
          password: config.REDIS_PASSWORD,
        },
        concurrency: 3,
      }
    )

    // Scheduled workflow worker
    this.scheduledWorker = new Worker(
      'scheduled-workflows',
      async (job) => {
        const { scheduleId } = job.data
        
        // Get schedule details
        const schedule = await prisma.scheduledWorkflow.findUnique({
          where: { id: scheduleId },
          include: { project: true },
        })

        if (!schedule || !schedule.isActive) {
          return
        }

        // Create execution record
        const execution = await prisma.scheduledExecution.create({
          data: {
            scheduleId,
            status: 'RUNNING',
            scheduledFor: new Date(),
            startedAt: new Date(),
          },
        })

        try {
          // Execute workflow
          const context: WorkflowExecutionContext = {
            projectId: schedule.projectId,
            userId: schedule.project.ownerId,
            variables: schedule.inputData as any || {},
            results: {},
            executionPath: [],
          }

          const workflowData = schedule.project.workflowData as unknown as WorkflowData
          const result = await workflowService.executeWorkflow(
            workflowData,
            context
          )

          // Update execution status
          await prisma.scheduledExecution.update({
            where: { id: execution.id },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          })

          // Update schedule stats
          await prisma.scheduledWorkflow.update({
            where: { id: scheduleId },
            data: {
              lastRunAt: new Date(),
              totalRuns: { increment: 1 },
              successfulRuns: { increment: 1 },
            },
          })

          return result
        } catch (error) {
          // Update execution status
          await prisma.scheduledExecution.update({
            where: { id: execution.id },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          })

          // Update schedule stats
          await prisma.scheduledWorkflow.update({
            where: { id: scheduleId },
            data: {
              lastRunAt: new Date(),
              totalRuns: { increment: 1 },
              failedRuns: { increment: 1 },
            },
          })

          throw error
        }
      },
      {
        connection: {
          host: config.REDIS_HOST || 'localhost',
          port: config.REDIS_PORT || 6379,
          password: config.REDIS_PASSWORD,
        },
        concurrency: 3,
      }
    )
  }

  /**
   * Add a workflow execution job to the queue
   */
  async addWorkflowJob(job: WorkflowJob, priority: number = 0) {
    return this.workflowQueue.add('execute', job, {
      priority,
      removeOnComplete: true,
      removeOnFail: false,
    })
  }

  /**
   * Add a notification job to the queue
   */
  async addNotificationJob(job: NotificationJob) {
    return this.notificationQueue.add('send', job, {
      removeOnComplete: true,
      removeOnFail: false,
    })
  }

  /**
   * Add an analytics job to the queue
   */
  async addAnalyticsJob(job: AnalyticsJob) {
    return this.analyticsQueue.add('track', job, {
      removeOnComplete: true,
      removeOnFail: false,
    })
  }

  /**
   * Schedule a workflow execution
   */
  async scheduleWorkflow(scheduleId: string, delay: number) {
    return this.scheduledQueue.add(
      'execute',
      { scheduleId },
      {
        delay,
        removeOnComplete: true,
        removeOnFail: false,
      }
    )
  }

  /**
   * Schedule a recurring workflow
   */
  async scheduleRecurringWorkflow(scheduleId: string, pattern: string) {
    return this.scheduledQueue.add(
      'execute',
      { scheduleId },
      {
        repeat: {
          pattern, // CRON pattern
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    )
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics() {
    const [
      workflowWaiting,
      workflowActive,
      workflowCompleted,
      workflowFailed,
      notificationWaiting,
      notificationActive,
      analyticsWaiting,
      analyticsActive,
    ] = await Promise.all([
      this.workflowQueue.getWaitingCount(),
      this.workflowQueue.getActiveCount(),
      this.workflowQueue.getCompletedCount(),
      this.workflowQueue.getFailedCount(),
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.analyticsQueue.getWaitingCount(),
      this.analyticsQueue.getActiveCount(),
    ])

    return {
      workflow: {
        waiting: workflowWaiting,
        active: workflowActive,
        completed: workflowCompleted,
        failed: workflowFailed,
      },
      notification: {
        waiting: notificationWaiting,
        active: notificationActive,
      },
      analytics: {
        waiting: analyticsWaiting,
        active: analyticsActive,
      },
    }
  }

  /**
   * Clean up completed jobs
   */
  async cleanupQueues() {
    await Promise.all([
      this.workflowQueue.clean(1000 * 60 * 60 * 24, 100), // Clean jobs older than 24h
      this.notificationQueue.clean(1000 * 60 * 60 * 24, 100),
      this.analyticsQueue.clean(1000 * 60 * 60 * 24 * 7, 100), // Keep analytics for 7 days
    ])
  }

  /**
   * Gracefully shutdown workers
   */
  async shutdown() {
    await Promise.all([
      this.workflowWorker?.close(),
      this.notificationWorker?.close(),
      this.analyticsWorker?.close(),
      this.scheduledWorker?.close(),
    ])
  }
}

// Only initialize if Redis is configured
export const queueService = config.REDIS_HOST ? new QueueService() : null