import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, setAuthToken } from '@/lib/api'
import type { User, LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth'

// Auth API functions
const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials) // /api 경로 추가
    return response.data.data // Backend returns { data: { accessToken, refreshToken } }
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', userData) // /api 경로 추가
    return response.data.data
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me') // /api 경로 추가
      return response.data.data ?? null
    } catch (err: any) {
      // 인증 실패는 '비로그인'으로 간주하고 null 반환
      if (err?.response?.status === 401) {
        return null
      }
      // 그 외 에러는 상위로 던져서 react-query가 처리하게 함
      throw err
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout') // /api 경로 추가
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
    initialData: null,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log('Login success data:', data) // 디버깅용
      setAuthToken(data.accessToken) // accessToken 사용
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
