import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { trpc } from '@/lib/trpc'
import type { LoginInput, RegisterInput } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setUser, setTokens, login: storeLogin, logout: storeLogout, setLoading } = useAuthStore()
  
  const loginMutation = trpc.auth.login.useMutation()
  
  const registerMutation = trpc.auth.register.useMutation()
  
  const { data: userData, isPending: isLoadingUser } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated && !user,
    retry: false
  })
  
  // Handle success/error effects for mutations
  useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      const tokens = { accessToken: loginMutation.data.accessToken, refreshToken: loginMutation.data.refreshToken }
      const user = {
        ...loginMutation.data.user,
        username: loginMutation.data.user.email?.split('@')[0] || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
      storeLogin(user, tokens)
      router.push('/projects')
    }
  }, [loginMutation.isSuccess, loginMutation.data])
  
  useEffect(() => {
    if (registerMutation.isSuccess && registerMutation.data) {
      const tokens = { accessToken: registerMutation.data.accessToken, refreshToken: registerMutation.data.refreshToken }
      const user = {
        ...registerMutation.data.user,
        username: registerMutation.data.user.email?.split('@')[0] || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
      storeLogin(user, tokens)
      router.push('/projects')
    }
  }, [registerMutation.isSuccess, registerMutation.data])
  
  useEffect(() => {
    if (userData) {
      const user = {
        ...userData,
        username: userData.email?.split('@')[0] || 'user',
        updatedAt: new Date()
      } as any
      setUser(user)
    }
  }, [userData])
  
  useEffect(() => {
    if (loginMutation.isError) {
      console.error('Login failed:', loginMutation.error)
    }
  }, [loginMutation.isError])
  
  useEffect(() => {
    if (registerMutation.isError) {
      console.error('Registration failed:', registerMutation.error)
    }
  }, [registerMutation.isError])
  
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
    storeLogout()
    router.push('/login')
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
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    refreshToken,
    error: loginMutation.error || registerMutation.error
  }
}