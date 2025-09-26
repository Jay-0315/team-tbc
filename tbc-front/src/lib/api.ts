// src/lib/api.ts
import axios from 'axios'

export const apiClient = axios.create({
    baseURL: '/api',            // Vite dev proxy가 /api 요청을 백엔드(8080)로 포워딩
    timeout: 15000,
    withCredentials: false,     // JWT Authorization header 방식이면 false로 유지
    headers: {
        "X-User-Id": "1",
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

/**
 * setAuthToken - 로그인 성공 시 토큰을 여기에 설정
 * - token이 null이면 헤더 제거
 */
export function setAuthToken(token: string | null) {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // localStorage에도 저장
        localStorage.setItem('authToken', token)
    } else {
        delete apiClient.defaults.headers.common['Authorization']
        // localStorage에서도 제거
        localStorage.removeItem('authToken')
    }
}

export default apiClient
