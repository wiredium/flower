"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc, getTRPCUrl } from '@/lib/trpc'
import superjson from 'superjson'
import { ToastProvider } from '@packages/ui/src/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
      },
    },
  }))
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: getTRPCUrl(),
          headers() {
            const headers: Record<string, string> = {}
            
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('access_token')
              if (token) {
                headers.authorization = `Bearer ${token}`
              }
            }
            
            return headers
          },
          async fetch(url, options) {
            const response = await fetch(url, options)
            
            // Handle token refresh
            if (response.status === 401) {
              const refreshToken = localStorage.getItem('refresh_token')
              if (refreshToken) {
                try {
                  const refreshResponse = await fetch(`${getTRPCUrl()}/auth.refresh`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      json: { refreshToken }
                    }),
                  })
                  
                  if (refreshResponse.ok) {
                    const data = await refreshResponse.json()
                    const result = data.result?.data?.json
                    if (result?.accessToken) {
                      localStorage.setItem('access_token', result.accessToken)
                      if (result.refreshToken) {
                        localStorage.setItem('refresh_token', result.refreshToken)
                      }
                      
                      // Retry original request with new token
                      if (options?.headers) {
                        (options.headers as any).authorization = `Bearer ${result.accessToken}`
                      }
                      return fetch(url, options)
                    }
                  }
                } catch (error) {
                  console.error('Token refresh failed:', error)
                  // Clear tokens and redirect to login
                  localStorage.removeItem('access_token')
                  localStorage.removeItem('refresh_token')
                  window.location.href = '/login'
                }
              }
            }
            
            return response
          },
        }),
      ],
    })
  )
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </trpc.Provider>
  )
}