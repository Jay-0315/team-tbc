const ENV_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined
const BASE: string =
    ENV_BASE && ENV_BASE.trim().length > 0 ? ENV_BASE : '' // 프록시 사용 시 빈 문자열

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
        ...options,
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `HTTP ${res.status}`)
    }
    try {
        return (await res.json()) as T
    } catch {
        // 비어있는 응답 등
        return undefined as unknown as T
    }
}

export const api = {
    signup: (body: {
        email: string
        phone: string
        username: string
        password: string
        nickname: string
    }) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { username: string; password: string }) =>
        request<{ accessToken: string; refreshToken: string }>(
            '/api/auth/login',
            { method: 'POST', body: JSON.stringify(body) }
        ),

    checkEmail: (email: string) =>
        request<boolean>(`/api/users/check-email?email=${encodeURIComponent(email)}`),

    checkPhone: (phone: string) =>
        request<boolean>(`/api/users/check-phone?phone=${encodeURIComponent(phone)}`),

    checkUsername: (username: string) =>
        request<boolean>(`/api/users/check-username?username=${encodeURIComponent(username)}`),

    findId: (emailOrPhone: string) =>
        request<string>(`/api/auth/find-id?emailOrPhone=${encodeURIComponent(emailOrPhone)}`),

    resetPassword: (username: string) =>
        request<string>(`/api/auth/reset-password?username=${encodeURIComponent(username)}`),
}

export const BACKEND_ORIGIN =
    (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined) ??
    'http://192.168.219.70:8080'
