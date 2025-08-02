import { EventEmitter } from 'events'
import type { FastifyReply } from 'fastify'
import { prisma } from '@repo/database'
import type { WorkflowEvent } from '@repo/types'

interface SSEClient {
  id: string
  userId: string
  projectId?: string
  reply: FastifyReply
}

interface RealtimeEvent {
  type: string
  data: any
  timestamp: Date
  userId?: string
  projectId?: string
}

export class RealtimeService extends EventEmitter {
  private clients: Map<string, SSEClient> = new Map()
  private projectSubscriptions: Map<string, Set<string>> = new Map()
  private userSubscriptions: Map<string, Set<string>> = new Map()

  constructor() {
    super()
    this.setupEventHandlers()
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers() {
    // Workflow events
    this.on('workflow:start', (data) => this.broadcastWorkflowEvent('workflow:start', data))
    this.on('workflow:complete', (data) => this.broadcastWorkflowEvent('workflow:complete', data))
    this.on('workflow:error', (data) => this.broadcastWorkflowEvent('workflow:error', data))
    this.on('workflow:node:start', (data) => this.broadcastWorkflowEvent('workflow:node:start', data))
    this.on('workflow:node:complete', (data) => this.broadcastWorkflowEvent('workflow:node:complete', data))
    
    // Collaboration events
    this.on('project:collaborator:added', (data) => this.broadcastProjectEvent('project:collaborator:added', data))
    this.on('project:collaborator:removed', (data) => this.broadcastProjectEvent('project:collaborator:removed', data))
    this.on('project:updated', (data) => this.broadcastProjectEvent('project:updated', data))
    
    // Notification events
    this.on('notification:new', (data) => this.broadcastUserEvent('notification:new', data))
  }

  /**
   * Add a new SSE client
   */
  addClient(clientId: string, userId: string, reply: FastifyReply, projectId?: string): void {
    const client: SSEClient = {
      id: clientId,
      userId,
      projectId,
      reply,
    }

    this.clients.set(clientId, client)

    // Add to user subscriptions
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Set())
    }
    this.userSubscriptions.get(userId)!.add(clientId)

    // Add to project subscriptions if projectId provided
    if (projectId) {
      if (!this.projectSubscriptions.has(projectId)) {
        this.projectSubscriptions.set(projectId, new Set())
      }
      this.projectSubscriptions.get(projectId)!.add(clientId)
    }

    // Send initial connection event
    this.sendToClient(clientId, {
      type: 'connection',
      data: { status: 'connected', clientId },
      timestamp: new Date(),
    })
  }

  /**
   * Remove an SSE client
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId)
    if (!client) return

    // Remove from user subscriptions
    const userClients = this.userSubscriptions.get(client.userId)
    if (userClients) {
      userClients.delete(clientId)
      if (userClients.size === 0) {
        this.userSubscriptions.delete(client.userId)
      }
    }

    // Remove from project subscriptions
    if (client.projectId) {
      const projectClients = this.projectSubscriptions.get(client.projectId)
      if (projectClients) {
        projectClients.delete(clientId)
        if (projectClients.size === 0) {
          this.projectSubscriptions.delete(client.projectId)
        }
      }
    }

    this.clients.delete(clientId)
  }

  /**
   * Send event to a specific client
   */
  private sendToClient(clientId: string, event: RealtimeEvent): void {
    const client = this.clients.get(clientId)
    if (!client) return

    try {
      const data = JSON.stringify(event)
      client.reply.raw.write(`data: ${data}\n\n`)
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error)
      this.removeClient(clientId)
    }
  }

  /**
   * Broadcast event to all clients subscribed to a project
   */
  private broadcastProjectEvent(type: string, data: any): void {
    const { projectId, ...eventData } = data
    if (!projectId) return

    const event: RealtimeEvent = {
      type,
      data: eventData,
      timestamp: new Date(),
      projectId,
    }

    const clients = this.projectSubscriptions.get(projectId)
    if (!clients) return

    clients.forEach(clientId => {
      this.sendToClient(clientId, event)
    })
  }

  /**
   * Broadcast event to all clients subscribed to a user
   */
  private broadcastUserEvent(type: string, data: any): void {
    const { userId, ...eventData } = data
    if (!userId) return

    const event: RealtimeEvent = {
      type,
      data: eventData,
      timestamp: new Date(),
      userId,
    }

    const clients = this.userSubscriptions.get(userId)
    if (!clients) return

    clients.forEach(clientId => {
      this.sendToClient(clientId, event)
    })
  }

  /**
   * Broadcast workflow event
   */
  private broadcastWorkflowEvent(type: string, data: any): void {
    const { projectId, ...eventData } = data
    if (!projectId) return

    this.broadcastProjectEvent(type, {
      projectId,
      ...eventData,
    })
  }

  /**
   * Subscribe client to additional project
   */
  subscribeToProject(clientId: string, projectId: string): void {
    const client = this.clients.get(clientId)
    if (!client) return

    if (!this.projectSubscriptions.has(projectId)) {
      this.projectSubscriptions.set(projectId, new Set())
    }
    this.projectSubscriptions.get(projectId)!.add(clientId)

    this.sendToClient(clientId, {
      type: 'subscription',
      data: { projectId, status: 'subscribed' },
      timestamp: new Date(),
    })
  }

  /**
   * Unsubscribe client from project
   */
  unsubscribeFromProject(clientId: string, projectId: string): void {
    const projectClients = this.projectSubscriptions.get(projectId)
    if (!projectClients) return

    projectClients.delete(clientId)
    if (projectClients.size === 0) {
      this.projectSubscriptions.delete(projectId)
    }

    this.sendToClient(clientId, {
      type: 'subscription',
      data: { projectId, status: 'unsubscribed' },
      timestamp: new Date(),
    })
  }

  /**
   * Send heartbeat to all clients
   */
  sendHeartbeat(): void {
    const event: RealtimeEvent = {
      type: 'heartbeat',
      data: { timestamp: new Date() },
      timestamp: new Date(),
    }

    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, event)
    })
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      totalClients: this.clients.size,
      projectSubscriptions: this.projectSubscriptions.size,
      userSubscriptions: this.userSubscriptions.size,
      clients: Array.from(this.clients.values()).map(c => ({
        id: c.id,
        userId: c.userId,
        projectId: c.projectId,
      })),
    }
  }

  /**
   * Emit workflow execution events
   */
  emitWorkflowEvent(event: WorkflowEvent & { projectId: string }) {
    const eventType = `workflow:${event.type.replace('execution', '').toLowerCase()}`
    this.emit(eventType, {
      projectId: event.projectId,
      nodeId: event.nodeId,
      result: event.result,
      error: event.error,
      timestamp: event.timestamp,
    })
  }

  /**
   * Emit collaboration event
   */
  emitCollaborationEvent(type: string, data: any) {
    this.emit(type, data)
  }

  /**
   * Emit notification event
   */
  emitNotificationEvent(userId: string, notification: any) {
    this.emit('notification:new', {
      userId,
      notification,
    })
  }
}

export const realtimeService = new RealtimeService()

// Start heartbeat interval
setInterval(() => {
  realtimeService.sendHeartbeat()
}, 30000) // Every 30 seconds