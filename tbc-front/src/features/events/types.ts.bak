export type EventStatus = 'OPEN' | 'UPCOMING' | 'WAITLIST' | 'CLOSED'

// GroupCardDTO를 EventCardDTO로 사용
export interface EventCardDTO {
  id: number
  title: string
  category: string
  topic: string
  minParticipants: number
  maxParticipants: number
  mode: string
  feeType: string
  feeAmount: number | null
  tags: string[]
  hostId: number
  createdAt: string
}

export interface EventHost {
  name: string
  avatarUrl?: string
}

export interface EventDetailDTO extends EventCardDTO {
  description: string
  hostName: string
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
