import { useEffect, useRef, useCallback } from 'react'
import { getBaseUrl } from '@/lib/trpc'
import type { SSEEvent } from '@/types'

interface UseSSEOptions {
  onMessage?: (event: SSEEvent) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useSSE(endpoint: string, options: UseSSEOptions = {}) {
  const {
    onMessage,
    onError,
    onOpen,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    
    const token = localStorage.getItem('access_token')
    const url = `${getBaseUrl()}${endpoint}${token ? `?token=${token}` : ''}`
    
    const eventSource = new EventSource(url, {
      withCredentials: true
    })
    
    eventSource.onopen = () => {
      console.log('SSE connection opened')
      reconnectAttemptsRef.current = 0
      onOpen?.()
    }
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent
        onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      onError?.(error)
      
      // Attempt to reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      } else {
        console.error('Max reconnect attempts reached')
        eventSource.close()
      }
    }
    
    // Handle specific event types
    eventSource.addEventListener('project:update', (event) => {
      const data = JSON.parse(event.data)
      onMessage?.({
        type: 'project:update',
        data,
        timestamp: new Date()
      })
    })
    
    eventSource.addEventListener('workflow:execution', (event) => {
      const data = JSON.parse(event.data)
      onMessage?.({
        type: 'workflow:execution',
        data,
        timestamp: new Date()
      })
    })
    
    eventSource.addEventListener('collaboration:invite', (event) => {
      const data = JSON.parse(event.data)
      onMessage?.({
        type: 'collaboration:invite',
        data,
        timestamp: new Date()
      })
    })
    
    eventSource.addEventListener('notification:new', (event) => {
      const data = JSON.parse(event.data)
      onMessage?.({
        type: 'notification:new',
        data,
        timestamp: new Date()
      })
    })
    
    eventSourceRef.current = eventSource
  }, [endpoint, onMessage, onError, onOpen, reconnectInterval, maxReconnectAttempts])
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])
  
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])
  
  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: connect,
    disconnect
  }
}