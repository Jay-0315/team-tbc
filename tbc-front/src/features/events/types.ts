export type EventStatus = 'OPEN' | 'UPCOMING' | 'WAITLIST' | 'CLOSED'

// 백엔드 EventCardDTO와 일치하는 타입
export interface EventCardDTO {
  id: number
  title: string
  coverUrl: string
  category: string
  status: EventStatus
  remainingSeats: number
  startAt: string // UTC ISO string
  location: string
  eventDate?: string // YYYY-MM-DD 형식
  eventTime?: string // HH:MM 형식
  capacity: number
  joined: number
  favorited?: boolean
  mode?: string
  feeType?: string
  feeAmount?: number
}

export interface EventHost {
  name: string
  avatarUrl?: string
}

export interface EventDetailDTO extends EventCardDTO {
  description?: string
  hostName: string
  tags: string[]
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
  category?: string
  status?: EventStatus
  sort?: 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC' | 'CREATED_DESC'
  page?: number
  size?: number
}
