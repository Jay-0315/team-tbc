export interface User {
  id: number
  email: string
  realName: string
  nickname: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
}

export interface SignupRequest {
  email: string
  password: string
  realName: string
  nickname: string
}

export interface SignupResponse {
  id: number
  email: string
  realName: string
  nickname: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
