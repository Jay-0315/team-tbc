// src/lib/api.ts
import axios from 'axios'

export const apiClient = axios.create({
    baseURL: '/api',            // Vite dev proxy가 /api 요청을 백엔드(8080)로 포워딩
    timeout: 15000,
    withCredentials: false,     // JWT 기반 인증: 쿠키 불필요
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

// JWT 토큰 자동 첨부를 위한 요청 인터셉터
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
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
                
                // 로그아웃 이벤트 발생
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('authLogout'))
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

// 세션 기반 인증: JWT 토큰 관련 함수들은 더 이상 사용하지 않음
// setAuthToken, getStoredToken 함수 제거

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

// 로그인 함수 (세션 기반)
export async function login(username: string, password: string) {
    try {
        const response = await apiClient.post('/auth/login', {
            username,
            password
        })
        
        if (response.data.success) {
            // 세션 기반 인증: 토큰 저장 불필요, 세션이 자동으로 생성됨
            return { success: true }
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
