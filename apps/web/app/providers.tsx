"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc, getTRPCUrl } from '@/lib/trpc'
import superjson from 'superjson'
import { ToastProvider } from '@packages/ui/src/toast'
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
        refetchOnWindowFocus: false,
      },
    },
  }))
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getTRPCUrl(),
          transformer: superjson,
          headers() {
            const headers: Record<string, string> = {}
            
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('accessToken')
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
              const refreshToken = localStorage.getItem('refreshToken')
              if (refreshToken) {
                try {
                  const refreshResponse = await fetch(`${getTRPCUrl()}/auth.refreshToken`, {
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
                      // Update localStorage
                      localStorage.setItem('accessToken', result.accessToken)
                      if (result.refreshToken) {
                        localStorage.setItem('refreshToken', result.refreshToken)
                      }
                      
                      // Update cookies
                      setCookie('access_token', result.accessToken, { 
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                        path: '/',
                        sameSite: 'lax'
                      })
                      if (result.refreshToken) {
                        setCookie('refresh_token', result.refreshToken, { 
                          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                          path: '/',
                          sameSite: 'lax'
                        })
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
                  localStorage.removeItem('accessToken')
                  localStorage.removeItem('refreshToken')
                  deleteCookie('access_token')
                  deleteCookie('refresh_token')
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