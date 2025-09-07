export type TokenPair = {
    accessToken: string
    refreshToken: string
}

export type SignupRequest = {
    email: string
    phone: string
    username: string
    password: string
    nickname: string
}

export type LoginRequest = {
    username: string
    password: string
}

export type RefreshRequest = {
    refreshToken: string
}
