import type { EventStatus } from '../features/events/types'

// 페이지네이션 응답 타입
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// 이벤트 목록 조회 파라미터
export interface EventListParams {
  q?: string
  category?: string
  status?: EventStatus
  sort?: 'START_ASC' | 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'NEW_DESC'
  page?: number
  size?: number
}

// 정렬 옵션 상수
export const SORT_OPTIONS = {
  NEW_DESC: 'NEW_DESC',
  START_ASC: 'START_ASC', 
  DEADLINE_ASC: 'DEADLINE_ASC',
  REVIEWS_DESC: 'REVIEWS_DESC'
} as const

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS]

// 이벤트 상태 상수
export const EVENT_STATUS = {
  OPEN: 'OPEN',
  UPCOMING: 'UPCOMING',
  WAITLIST: 'WAITLIST',
  CLOSED: 'CLOSED'
} as const

export type EventStatusType = typeof EVENT_STATUS[keyof typeof EVENT_STATUS]

// 이벤트 카테고리 상수 (백엔드에서 사용하는 카테고리들)
export const EVENT_CATEGORIES = {
  WORKSHOP: 'workshop',
  MEETUP: 'meetup', 
  WEBINAR: 'webinar',
  CONFERENCE: 'conference'
} as const

export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES]

// 타입 재export
export type { EventCardDTO, EventDetailDTO, EventHost } from '../features/events/types'
