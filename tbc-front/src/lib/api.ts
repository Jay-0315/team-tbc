// src/lib/api.ts
import axios from 'axios'

export const apiClient = axios.create({
    baseURL: '/api',            // Vite dev proxy가 /api 요청을 백엔드(8080)로 포워딩
    timeout: 15000,
    withCredentials: false,     // JWT Authorization header 방식이면 false로 유지
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

// JWT 토큰 자동 첨부를 위한 요청 인터셉터 추가
// 문제: 기존에는 수동으로 setAuthToken을 호출해야 했지만, 이제 모든 요청에 자동으로 토큰이 붙음
apiClient.interceptors.request.use((config) => {
    // 기존 authToken을 accessToken으로 마이그레이션
    const oldToken = localStorage.getItem('authToken')
    if (oldToken && !localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', oldToken)
        localStorage.removeItem('authToken')
    }
    
    const token = localStorage.getItem('accessToken') // accessToken 키로 변경 (요구사항에 맞춤)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 응답 인터셉터 추가 - 401 에러 시 자동 로그아웃 처리
let isHandling401 = false; // 401 에러 처리 중복 방지

apiClient.interceptors.response.use(
    (response) => {
        // 성공 응답은 그대로 반환
        return response
    },
    (error) => {
        // 401 Unauthorized 에러 처리
        if (error.response?.status === 401 && !isHandling401) {
            isHandling401 = true;
            console.log('🚫 401 Unauthorized - 토큰이 만료되었거나 유효하지 않습니다.')
            
            // 로그인 요청이 아닌 경우에만 토큰 제거
            if (!error.config?.url?.includes('/auth/login')) {
                // 토큰 제거
                localStorage.removeItem('accessToken')
                localStorage.removeItem('authToken')
                
                // 커스텀 이벤트 발생으로 useAuth 훅에 토큰 제거 알림
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('authTokenRemoved'))
                }
            }
            
            // 3초 후 플래그 리셋
            setTimeout(() => {
                isHandling401 = false;
            }, 3000);
        }
        
        return Promise.reject(error)
    }
)

/**
 * setAuthToken - 로그인 성공 시 토큰을 여기에 설정
 * - token이 null이면 헤더 제거
 * - 수정: accessToken 키로 localStorage에 저장하도록 변경
 */
export function setAuthToken(token: string | null) {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // localStorage에 accessToken 키로 저장 (요구사항에 맞춤)
        localStorage.setItem('accessToken', token)
    } else {
        delete apiClient.defaults.headers.common['Authorization']
        // localStorage에서도 제거
        localStorage.removeItem('accessToken')
    }
}

/**
 * getStoredToken - localStorage에서 저장된 토큰을 가져옴
 * - 수정: accessToken 키로 변경
 */
export function getStoredToken(): string | null {
    return localStorage.getItem('accessToken')
}

// 개발 환경에서 디버깅을 위해 window 객체에 노출
if (typeof window !== 'undefined') {
  (window as unknown as { apiClient: typeof apiClient }).apiClient = apiClient
}

export default apiClient

// Google OAuth 로그인 URL 생성
export function getOAuth2GoogleLoginUrl(): string {
    // Google OAuth 2.0 인증 URL 생성
    const clientId = 'your-google-client-id' // 실제 Google Client ID로 교체 필요
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`)
    const scope = encodeURIComponent('openid email profile')
    const state = Math.random().toString(36).substring(7) // CSRF 방지를 위한 랜덤 상태값
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`
    
    return googleAuthUrl
}

// 로그인 함수
export async function login(username: string, password: string) {
    try {
        const response = await apiClient.post('/auth/login', {
            username,
            password
        })
        
        if (response.data.success) {
            setAuthToken(response.data.token)
            return { success: true, token: response.data.token }
        } else {
            return { success: false, message: response.data.message }
        }
    } catch (error: any) {
        console.error('Login error:', error)
        return { 
            success: false, 
            message: error.response?.data?.message || '로그인 중 오류가 발생했습니다.' 
        }
    }
}
