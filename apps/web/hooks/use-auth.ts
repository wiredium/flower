import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { trpc } from '@/lib/trpc'
import type { LoginInput, RegisterInput } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setUser, setTokens, login: storeLogin, logout: storeLogout, setLoading } = useAuthStore()
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken }
      storeLogin(data.user, tokens)
      router.push('/projects')
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })
  
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken }
      storeLogin(data.user, tokens)
      router.push('/projects')
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    }
  })
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      storeLogout()
      router.push('/login')
    }
  })
  
  const { data: userData, isLoading: isLoadingUser } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated && !user,
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setUser(data)
      }
    },
    onError: () => {
      storeLogout()
    }
  })
  
  const login = async (data: LoginInput) => {
    setLoading(true)
    try {
      await loginMutation.mutateAsync(data)
    } finally {
      setLoading(false)
    }
  }
  
  const register = async (data: RegisterInput) => {
    setLoading(true)
    try {
      await registerMutation.mutateAsync(data)
    } finally {
      setLoading(false)
    }
  }
  
  const logout = async () => {
    await logoutMutation.mutateAsync()
  }
  
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      storeLogout()
      return false
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    
    storeLogout()
    return false
  }
  
  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('accessToken')
    if (token && !user) {
      // Token exists but no user data, fetch it
      setLoading(true)
    }
  }, [])
  
  return {
    user,
    isAuthenticated,
    isLoading: isLoadingUser || loginMutation.isLoading || registerMutation.isLoading,
    login,
    register,
    logout,
    refreshToken,
    error: loginMutation.error || registerMutation.error
  }
}