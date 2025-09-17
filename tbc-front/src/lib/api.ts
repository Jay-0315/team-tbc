import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// JWT token management
let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // Store in localStorage for persistence
    localStorage.setItem('authToken', token)
  } else {
    delete apiClient.defaults.headers.common['Authorization']
    localStorage.removeItem('authToken')
  }
}

// Initialize token from localStorage on app start
const storedToken = localStorage.getItem('authToken')
if (storedToken) {
  setAuthToken(storedToken)
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (authToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth state
      setAuthToken(null)
      // Redirect to login or show login modal
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    
    const message =
      error?.response?.data?.message || error?.message || '요청 처리 중 오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  }
)

export default apiClient
