import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// DEV only: 편의용 임시 사용자 헤더 자동 주입 (배포 전 제거)
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use((config) => {
    if (!config.headers) config.headers = {}
    if (!('X-User-Id' in config.headers)) {
      config.headers['X-User-Id'] = '1'
    }
    return config
  })
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || '요청 처리 중 오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  },
)

export default apiClient