import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'crypto'
import { realtimeService } from '../services/realtime.service.js'
import { authService } from '../services/auth.service.js'

interface SSEQuerystring {
  projectId?: string
}

export async function sseRoutes(fastify: FastifyInstance) {
  // SSE endpoint for real-time updates
  fastify.get<{
    Querystring: SSEQuerystring
  }>('/api/sse/events', async (request: FastifyRequest<{ Querystring: SSEQuerystring }>, reply: FastifyReply) => {
    // Verify authentication
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    try {
      const user = await authService.getUserFromToken(token)
      const clientId = randomUUID()
      const { projectId } = request.query

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      })

      // Add client to realtime service
      realtimeService.addClient(clientId, user.id, reply, projectId)

      // Handle client disconnect
      request.raw.on('close', () => {
        realtimeService.removeClient(clientId)
      })

      // Keep connection alive
      const keepAlive = setInterval(() => {
        reply.raw.write(':keep-alive\n\n')
      }, 15000)

      // Clean up on disconnect
      request.raw.on('close', () => {
        clearInterval(keepAlive)
      })

    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' })
    }
  })

  // Subscribe to a project
  fastify.post('/api/sse/subscribe', async (request: FastifyRequest<{
    Body: { clientId: string; projectId: string }
  }>, reply: FastifyReply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    try {
      await authService.getUserFromToken(token)
      const { clientId, projectId } = request.body as any

      realtimeService.subscribeToProject(clientId, projectId)
      return reply.send({ success: true })
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' })
    }
  })

  // Unsubscribe from a project
  fastify.post('/api/sse/unsubscribe', async (request: FastifyRequest<{
    Body: { clientId: string; projectId: string }
  }>, reply: FastifyReply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    try {
      await authService.getUserFromToken(token)
      const { clientId, projectId } = request.body as any

      realtimeService.unsubscribeFromProject(clientId, projectId)
      return reply.send({ success: true })
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' })
    }
  })

  // Get SSE statistics (admin only)
  fastify.get('/api/sse/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    try {
      const user = await authService.getUserFromToken(token)
      
      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' })
      }

      const stats = realtimeService.getStats()
      return reply.send(stats)
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' })
    }
  })
}