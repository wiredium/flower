import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'
import { setCookie, deleteCookie } from '@/lib/cookies'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (tokens) => {
        if (tokens) {
          localStorage.setItem('accessToken', tokens.accessToken)
          localStorage.setItem('refreshToken', tokens.refreshToken)
          setCookie('access_token', tokens.accessToken, { 
            expires: new Date(Date.now() + 15 * 60 * 1000),
            path: '/',
            sameSite: 'lax'
          })
          setCookie('refresh_token', tokens.refreshToken, { 
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            path: '/',
            sameSite: 'lax'
          })
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          deleteCookie('access_token')
          deleteCookie('refresh_token')
        }
        set({ tokens })
      },
      
      login: (user, tokens) => {
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        setCookie('access_token', tokens.accessToken, { 
          expires: new Date(Date.now() + 15 * 60 * 1000),
          path: '/',
          sameSite: 'lax'
        })
        setCookie('refresh_token', tokens.refreshToken, { 
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          path: '/',
          sameSite: 'lax'
        })
        set({ user, tokens, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        deleteCookie('access_token')
        deleteCookie('refresh_token')
        set({ user: null, tokens: null, isAuthenticated: false })
      },
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
      
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)