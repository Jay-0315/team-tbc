import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, setAuthToken } from '@/lib/api'
import type { User, LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth'

// Auth API functions
const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data.data // Backend returns { data: { token, refreshToken } }
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', userData)
    return response.data.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me')
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  }
}

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

// Custom hook for authentication state
export function useAuth() {
  const queryClient = useQueryClient()

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuthToken(data.token)
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      // After successful signup, user needs to login
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: (error) => {
      console.error('Signup failed:', error)
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAuthToken(null)
      queryClient.setQueryData(authKeys.user(), null)
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Even if logout fails on server, clear local state
      setAuthToken(null)
      queryClient.setQueryData(authKeys.user(), null)
    }
  })

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  }
}
