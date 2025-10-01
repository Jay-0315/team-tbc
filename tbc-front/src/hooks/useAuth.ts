import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type { User, LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth'

// Auth API functions
const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials)
    // 백엔드 응답 구조에 따라 수정
    return response.data.data || response.data
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', userData)
    return response.data.data || response.data
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data.data || response.data || null
    } catch (err: unknown) {
      // 인증 실패는 '비로그인'으로 간주하고 null 반환
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 'status' in err.response && 
          err.response.status === 401) {
        return null
      }
      // 그 외 에러는 상위로 던져서 react-query가 처리하게 함
      throw err
    }
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
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasToken, setHasToken] = useState(false) // 토큰 존재 여부 상태 추가

  // Initialize auth token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // 수정: accessToken 키로 변경하여 api.ts의 인터셉터와 일치시킴
      const storedToken = localStorage.getItem('accessToken')
      if (storedToken) {
        // setAuthToken 호출 제거. 이제 apiClient 인터셉터가 localStorage에서 직접 토큰을 읽음.
        setHasToken(true) // 토큰이 있으면 상태 업데이트
      }
      setIsInitialized(true)
    }
    
    initializeAuth()
  }, [])

  // 401 에러로 인한 토큰 제거 이벤트 리스너
  useEffect(() => {
    const handleTokenRemoved = () => {
      console.log('🔔 토큰 제거 이벤트 수신')
      setHasToken(false)
      queryClient.setQueryData(authKeys.user(), null)
    }

    window.addEventListener('authTokenRemoved', handleTokenRemoved)
    return () => {
      window.removeEventListener('authTokenRemoved', handleTokenRemoved)
    }
  }, [queryClient])

  const { data: user, isLoading, error } = useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled: isInitialized && hasToken, // 토큰 상태를 React 상태로 관리
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      console.log('Login success data:', data) // 디버깅용
      
      // 로그인 성공 시 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', data.accessToken)
      setHasToken(true) // 토큰 상태 업데이트
      
      // 즉시 사용자 데이터 가져오기 시도
      try {
        const userData = await authApi.getCurrentUser()
        queryClient.setQueryData(authKeys.user(), userData)
        console.log('User data cached:', userData)
        
        // 프로필 쿼리도 무효화하여 자동 갱신
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      } catch (error) {
        console.error('Failed to fetch user data after login:', error)
        // 401 에러인 경우 토큰이 유효하지 않을 수 있으므로 토큰 제거
        if (error && typeof error === 'object' && 'response' in error && 
            (error as { response?: { status?: number } }).response?.status === 401) {
          console.log('🚫 토큰이 유효하지 않습니다. 토큰을 제거합니다.')
          localStorage.removeItem('accessToken')
          setHasToken(false)
        } else {
          // 다른 에러인 경우 재시도
          queryClient.invalidateQueries({ queryKey: authKeys.user() })
          queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
        }
      }
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
      console.error('Signup failed:', error)
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // setAuthToken 호출 제거. 이제 apiClient 인터셉터가 localStorage에서 직접 토큰을 읽음.
      localStorage.removeItem('accessToken')
      setHasToken(false) // 토큰 상태 업데이트
      queryClient.setQueryData(authKeys.user(), null)
    },
    onError: (error: any) => {
      console.error('Logout failed:', error)
      // Even if logout fails on server, clear local state
      // setAuthToken 호출 제거. 이제 apiClient 인터셉터가 localStorage에서 직접 토큰을 읽음.
      localStorage.removeItem('accessToken')
      setHasToken(false) // 토큰 상태 업데이트
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
