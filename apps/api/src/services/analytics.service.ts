import { prisma } from '@repo/database'
import type { Prisma } from '@prisma/client'

interface WorkflowExecutionData {
  projectId: string
  success: boolean
  duration?: number
  nodesExecuted?: number
  error?: string
  userId?: string
  aiCalls?: number
  cost?: number
}

interface NodeExecutionData {
  projectId: string
  nodeId: string
  nodeType: string
  success: boolean
  duration: number
}

interface DailyMetricsData {
  projectId: string
  date?: Date
  executions?: number
  successes?: number
  failures?: number
  totalDuration?: number
  uniqueUsers?: Set<string>
  aiCalls?: number
  cost?: number
}

interface AnalyticsReport {
  projectId: string
  period: 'day' | 'week' | 'month' | 'year' | 'all'
  metrics: {
    totalExecutions: number
    successRate: number
    averageDuration: number
    totalCost: number
    totalAICalls: number
    uniqueUsers: number
    topNodes: Array<{
      nodeId: string
      nodeType: string
      executionCount: number
      successRate: number
    }>
    dailyTrends: Array<{
      date: Date
      executions: number
      successes: number
      failures: number
    }>
  }
}

export class AnalyticsService {
  /**
   * Track workflow execution
   */
  async trackWorkflowExecution(data: WorkflowExecutionData) {
    const { projectId, success, duration, nodesExecuted, error, userId, aiCalls, cost } = data

    // Get or create analytics record
    let analytics = await prisma.workflowAnalytics.findUnique({
      where: { projectId },
    })

    if (!analytics) {
      analytics = await prisma.workflowAnalytics.create({
        data: {
          projectId,
          totalExecutions: 0,
          successfulRuns: 0,
          failedRuns: 0,
        },
      })
    }

    // Calculate new average duration
    const newTotalExecutions = analytics.totalExecutions + 1
    const newAverageDuration = duration
      ? Math.round(
          (analytics.averageDuration * analytics.totalExecutions + duration) /
          newTotalExecutions
        )
      : analytics.averageDuration

    // Update analytics
    await prisma.workflowAnalytics.update({
      where: { id: analytics.id },
      data: {
        totalExecutions: { increment: 1 },
        successfulRuns: success ? { increment: 1 } : undefined,
        failedRuns: !success ? { increment: 1 } : undefined,
        averageDuration: newAverageDuration,
        totalNodesExecuted: nodesExecuted ? { increment: nodesExecuted } : undefined,
        totalAICalls: aiCalls ? { increment: aiCalls } : undefined,
        totalCost: cost ? { increment: cost } : undefined,
        lastExecutedAt: new Date(),
      },
    })

    // Update daily metrics
    await this.updateDailyMetrics({
      projectId,
      executions: 1,
      successes: success ? 1 : 0,
      failures: !success ? 1 : 0,
      totalDuration: duration || 0,
      uniqueUsers: userId ? new Set([userId]) : new Set(),
      aiCalls: aiCalls || 0,
      cost: cost || 0,
    })
  }

  /**
   * Track node execution
   */
  async trackNodeExecution(data: NodeExecutionData) {
    const { projectId, nodeId, nodeType, success, duration } = data

    // Get analytics record
    const analytics = await prisma.workflowAnalytics.findUnique({
      where: { projectId },
    })

    if (!analytics) {
      return
    }

    // Get or create node analytics
    let nodeAnalytics = await prisma.nodeAnalytics.findUnique({
      where: {
        analyticsId_nodeId: {
          analyticsId: analytics.id,
          nodeId,
        },
      },
    })

    if (!nodeAnalytics) {
      nodeAnalytics = await prisma.nodeAnalytics.create({
        data: {
          analyticsId: analytics.id,
          nodeId,
          nodeType,
        },
      })
    }

    // Calculate new average duration
    const newExecutionCount = nodeAnalytics.executionCount + 1
    const newAverageDuration = Math.round(
      (nodeAnalytics.averageDuration * nodeAnalytics.executionCount + duration) /
      newExecutionCount
    )

    // Update node analytics
    await prisma.nodeAnalytics.update({
      where: { id: nodeAnalytics.id },
      data: {
        executionCount: { increment: 1 },
        successCount: success ? { increment: 1 } : undefined,
        failureCount: !success ? { increment: 1 } : undefined,
        averageDuration: newAverageDuration,
      },
    })
  }

  /**
   * Update daily metrics
   */
  async updateDailyMetrics(data: DailyMetricsData) {
    const {
      projectId,
      date = new Date(),
      executions = 0,
      successes = 0,
      failures = 0,
      totalDuration = 0,
      uniqueUsers = new Set(),
      aiCalls = 0,
      cost = 0,
    } = data

    // Get analytics record
    const analytics = await prisma.workflowAnalytics.findUnique({
      where: { projectId },
    })

    if (!analytics) {
      return
    }

    // Get today's date (start of day)
    const today = new Date(date)
    today.setHours(0, 0, 0, 0)

    // Get or create daily metric
    let metric = await prisma.dailyMetrics.findUnique({
      where: {
        analyticsId_date: {
          analyticsId: analytics.id,
          date: today,
        },
      },
    })

    if (!metric) {
      metric = await prisma.dailyMetrics.create({
        data: {
          analyticsId: analytics.id,
          date: today,
        },
      })
    }

    // Update daily metric
    await prisma.dailyMetrics.update({
      where: { id: metric.id },
      data: {
        executions: { increment: executions },
        successes: { increment: successes },
        failures: { increment: failures },
        totalDuration: { increment: totalDuration },
        uniqueUsers: Math.max(metric.uniqueUsers, uniqueUsers.size),
        aiCalls: { increment: aiCalls },
        cost: { increment: cost },
      },
    })
  }

  /**
   * Get analytics report for a project
   */
  async getAnalyticsReport(
    projectId: string,
    period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month'
  ): Promise<AnalyticsReport> {
    const analytics = await prisma.workflowAnalytics.findUnique({
      where: { projectId },
      include: {
        nodeAnalytics: {
          orderBy: { executionCount: 'desc' },
          take: 10,
        },
        dailyMetrics: {
          orderBy: { date: 'desc' },
          take: this.getDaysForPeriod(period),
        },
      },
    })

    if (!analytics) {
      return {
        projectId,
        period,
        metrics: {
          totalExecutions: 0,
          successRate: 0,
          averageDuration: 0,
          totalCost: 0,
          totalAICalls: 0,
          uniqueUsers: 0,
          topNodes: [],
          dailyTrends: [],
        },
      }
    }

    // Calculate success rate
    const successRate = analytics.totalExecutions > 0
      ? (analytics.successfulRuns / analytics.totalExecutions) * 100
      : 0

    // Get unique users count from daily metrics
    const uniqueUsers = analytics.dailyMetrics.reduce(
      (sum, metric) => sum + metric.uniqueUsers,
      0
    )

    // Format top nodes
    const topNodes = analytics.nodeAnalytics.map(node => ({
      nodeId: node.nodeId,
      nodeType: node.nodeType,
      executionCount: node.executionCount,
      successRate: node.executionCount > 0
        ? (node.successCount / node.executionCount) * 100
        : 0,
    }))

    // Format daily trends
    const dailyTrends = analytics.dailyMetrics.map(metric => ({
      date: metric.date,
      executions: metric.executions,
      successes: metric.successes,
      failures: metric.failures,
    }))

    return {
      projectId,
      period,
      metrics: {
        totalExecutions: analytics.totalExecutions,
        successRate,
        averageDuration: analytics.averageDuration,
        totalCost: Number(analytics.totalCost),
        totalAICalls: analytics.totalAICalls,
        uniqueUsers,
        topNodes,
        dailyTrends,
      },
    }
  }

  /**
   * Get comparative analytics for multiple projects
   */
  async getComparativeAnalytics(projectIds: string[]) {
    const analytics = await prisma.workflowAnalytics.findMany({
      where: {
        projectId: { in: projectIds },
      },
    })

    return analytics.map(a => ({
      projectId: a.projectId,
      totalExecutions: a.totalExecutions,
      successRate: a.totalExecutions > 0
        ? (a.successfulRuns / a.totalExecutions) * 100
        : 0,
      averageDuration: a.averageDuration,
      totalCost: Number(a.totalCost),
      lastExecutedAt: a.lastExecutedAt,
    }))
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    const startDate = this.getStartDateForPeriod(period)

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        analytics: {
          include: {
            dailyMetrics: {
              where: {
                date: { gte: startDate },
              },
            },
          },
        },
      },
    })

    // Aggregate metrics
    let totalExecutions = 0
    let totalSuccesses = 0
    let totalCost = 0
    let totalAICalls = 0

    projects.forEach(project => {
      if (project.analytics) {
        project.analytics.dailyMetrics.forEach(metric => {
          totalExecutions += metric.executions
          totalSuccesses += metric.successes
          totalCost += Number(metric.cost)
          totalAICalls += metric.aiCalls
        })
      }
    })

    return {
      userId,
      period,
      totalProjects: projects.length,
      totalExecutions,
      successRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0,
      totalCost,
      totalAICalls,
      projectMetrics: projects.map(p => ({
        projectId: p.id,
        name: p.name,
        executions: p.analytics?.totalExecutions || 0,
        lastExecutedAt: p.analytics?.lastExecutedAt,
      })),
    }
  }

  /**
   * Get trending workflows (most executed in last 7 days)
   */
  async getTrendingWorkflows(limit: number = 10) {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const analytics = await prisma.workflowAnalytics.findMany({
      where: {
        lastExecutedAt: { gte: sevenDaysAgo },
      },
      orderBy: {
        totalExecutions: 'desc',
      },
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return analytics.map(a => ({
      projectId: a.projectId,
      projectName: a.project.name,
      projectDescription: a.project.description,
      owner: a.project.owner,
      executions: a.totalExecutions,
      successRate: a.totalExecutions > 0
        ? (a.successfulRuns / a.totalExecutions) * 100
        : 0,
    }))
  }

  /**
   * Clean up old metrics (older than 90 days)
   */
  async cleanupOldMetrics() {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const deleted = await prisma.dailyMetrics.deleteMany({
      where: {
        date: { lt: ninetyDaysAgo },
      },
    })

    return { deleted: deleted.count }
  }

  /**
   * Get days for period
   */
  private getDaysForPeriod(period: 'day' | 'week' | 'month' | 'year' | 'all'): number {
    switch (period) {
      case 'day':
        return 1
      case 'week':
        return 7
      case 'month':
        return 30
      case 'year':
        return 365
      case 'all':
        return 9999
      default:
        return 30
    }
  }

  /**
   * Get start date for period
   */
  private getStartDateForPeriod(period: 'day' | 'week' | 'month'): Date {
    const date = new Date()
    switch (period) {
      case 'day':
        date.setDate(date.getDate() - 1)
        break
      case 'week':
        date.setDate(date.getDate() - 7)
        break
      case 'month':
        date.setDate(date.getDate() - 30)
        break
    }
    return date
  }

  /**
   * Generate analytics summary for dashboard
   */
  async getDashboardSummary(userId: string) {
    const userProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })

    const projectIds = userProjects.map(p => p.id)

    // Get aggregated analytics
    const analytics = await prisma.workflowAnalytics.findMany({
      where: {
        projectId: { in: projectIds },
      },
    })

    // Calculate totals
    const totals = analytics.reduce(
      (acc, a) => ({
        executions: acc.executions + a.totalExecutions,
        successes: acc.successes + a.successfulRuns,
        failures: acc.failures + a.failedRuns,
        cost: acc.cost + Number(a.totalCost),
        aiCalls: acc.aiCalls + a.totalAICalls,
      }),
      { executions: 0, successes: 0, failures: 0, cost: 0, aiCalls: 0 }
    )

    // Get recent activity
    const recentExecutions = await prisma.workflowExecution.findMany({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return {
      totals: {
        projects: userProjects.length,
        executions: totals.executions,
        successRate: totals.executions > 0
          ? (totals.successes / totals.executions) * 100
          : 0,
        totalCost: totals.cost,
        aiCalls: totals.aiCalls,
      },
      recentActivity: recentExecutions.map(e => ({
        id: e.id,
        projectId: e.projectId,
        projectName: e.project.name,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
      })),
    }
  }
}

export const analyticsService = new AnalyticsService()