export type EventStatus = 'OPEN' | 'UPCOMING' | 'WAITLIST' | 'CLOSED'

export interface EventCardDTO {
  id: number
  title: string
  coverUrl: string
  category: string
  status: EventStatus
  remainingSeats: number
  /** 총 정원. 백엔드 미제공일 수 있어 optional */
  capacity?: number
  startAt: string
  location: string
}

export interface EventHost {
  name: string
  avatarUrl?: string
}

export interface EventDetailDTO extends EventCardDTO {
  description: string
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
  category?: string
  status?: 'UPCOMING' | 'OPEN' | 'WAITLIST' | 'CLOSED'
  sort?: 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC'
  page?: number
  size?: number
}