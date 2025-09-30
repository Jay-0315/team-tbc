export type EventStatus = 'OPEN' | 'UPCOMING' | 'WAITLIST' | 'CLOSED'

// 백엔드 EventCardDTO와 일치하는 타입
export interface EventCardDTO {
  id: number
  title: string
  coverUrl?: string  // 선택적으로 변경 (기존 호환성 유지)
  imageUrl?: string
  imagePath?: string  // 업로드된 이미지 경로 (우선 사용)
  category: string
  status: EventStatus
  remainingSeats: number
  startAt: string // UTC ISO string
  location: string
  eventDate?: string // YYYY-MM-DD 형식
  eventTime?: string // HH:MM 형식
  capacity: number
  joined: number
  currentParticipants?: number
  maxParticipants?: number
  favorited?: boolean
  mode?: string
  feeType?: string
  feeAmount?: number
  description?: string
  endDate?: string
  hostNickname?: string
  hostProfileImage?: string
}

export interface EventHost {
  name: string
  avatarUrl?: string
}

export interface EventDetailDTO extends EventCardDTO {
  hostId?: number
  feeInfo?: string
  description?: string
  hostName: string
  hostNickname?: string
  hostProfileImage?: string
  tags: string[]
  latitude?: number
  longitude?: number
  imagePath?: string  // 이미지 경로
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface EventListParams {
  q?: string
  search?: string
  category?: string
  status?: EventStatus
  sort?: 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC' | 'CREATED_DESC'
  page?: number
  size?: number
}
