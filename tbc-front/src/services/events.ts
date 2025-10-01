import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/api'
import axios from 'axios'
import { eventKeys } from '../features/events/api/keys'
import type { ReviewDTO } from '../types/review'
import type { Page, EventListParams, EventCardDTO } from '../types/event'
export type WalletBalanceResponse = { userId: number; balance: number }

type ToggleFavoriteResponse = { favorited: boolean }

async function toggleFavoriteRequest(eventId: number): Promise<ToggleFavoriteResponse> {
  const { data } = await apiClient.post<ToggleFavoriteResponse>(`/events/${eventId}/favorite`, {
    toggle: true,
  })
  return data
}

export function useToggleFavorite(eventId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleFavoriteRequest(eventId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: eventKeys.root }),
        qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
        qc.invalidateQueries({ queryKey: eventKeys.favorites() }), // 찜한 모임 목록도 업데이트
      ])
    },
  })
}

// Join (switch to groups join endpoint, self-only)
export type JoinRequest = { qty?: number }
export type JoinResponse = { ok: true }

async function joinEventRequest(eventId: number): Promise<JoinResponse> {
  try {
    await apiClient.post(`/groups/${eventId}/join`)
    return { ok: true }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const message = err.response?.data?.message || err.message
      
      // 402: 잔액 부족
      if (status === 402) {
        throw new Error('INSUFFICIENT_BALANCE')
      }
      
      // 409: 중복 참가 등
      if (status === 409) {
        if (message?.includes('ALREADY_JOINED')) {
          throw new Error('이미 참가한 소셜링입니다.')
        }
        if (message?.includes('GROUP_FULL')) {
          throw new Error('정원이 마감되었습니다.')
        }
        if (message?.includes('GROUP_ALREADY_STARTED')) {
          throw new Error('이미 시작된 소셜링입니다.')
        }
        if (message?.includes('GROUP_NOT_OPEN')) {
          throw new Error('참가할 수 없는 상태입니다.')
        }
        throw new Error('참가할 수 없습니다.')
      }
      
      // 404: 그룹을 찾을 수 없음
      if (status === 404) {
        throw new Error('소셜링을 찾을 수 없습니다.')
      }
      
      // 401: 인증 필요
      if (status === 401) {
        throw new Error('로그인이 필요합니다.')
      }
    }
    
    throw err instanceof Error ? err : new Error('신청 중 오류가 발생했습니다.')
  }
}

export function useJoinEvent(eventId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => joinEventRequest(eventId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: eventKeys.root }),
        qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
      ])
    },
  })
}

// Wallet
export async function fetchMyWallet(): Promise<WalletBalanceResponse> {
  const { data } = await apiClient.get<WalletBalanceResponse>('/payments/wallet/me')
  return data
}

// Events - /api/groups 엔드포인트 사용 (events 테이블)
export async function fetchEvents(params: EventListParams = {}): Promise<Page<EventCardDTO>> {
  const { data } = await apiClient.get<Page<EventCardDTO>>('/groups', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 12,
      // 검색 및 필터링 파라미터 추가
      ...(params.q && { q: params.q }),
      ...(params.search && { search: params.search }),
      ...(params.category && { category: params.category }),
      ...(params.status && { status: params.status }),
      ...(params.sort && { sort: params.sort }),
    }
  })
  return data
}

// 찜한 모임 조회
export async function fetchFavoriteEvents(page: number = 0, size: number = 12): Promise<Page<EventCardDTO>> {
  const { data } = await apiClient.get<Page<EventCardDTO>>('/events/favorites', {
    params: { page, size }
  })
  return data
}

// 인기 모임 조회 (리뷰 많은 순)
export async function fetchPopularEvents(page: number = 0, size: number = 4): Promise<Page<EventCardDTO>> {
  const { data } = await apiClient.get<Page<EventCardDTO>>('/groups', {
    params: { 
      page, 
      size,
      sort: 'REVIEWS_DESC' // 리뷰 많은 순으로 정렬
    }
  })
  return data
}

// 최근 개설된 모임 조회 (작성시간순)
export async function fetchRecentEvents(page: number = 0, size: number = 4): Promise<Page<EventCardDTO>> {
  const { data } = await apiClient.get<Page<EventCardDTO>>('/groups', {
    params: { 
      page, 
      size,
      sort: 'CREATED_DESC' // 작성시간순으로 정렬
    }
  })
  return data
}

// Reviews
export type CreateReviewRequest = {
  rating: number;
  comment: string;
}

export async function fetchReviews(eventId: number, page: number, size: number): Promise<Page<ReviewDTO>> {
  const { data } = await apiClient.get<Page<ReviewDTO>>(`/events/${eventId}/reviews`, {
    params: { page, size }
  })
  return data
}

export async function createReview(eventId: number, body: CreateReviewRequest): Promise<ReviewDTO> {
  const { data } = await apiClient.post<ReviewDTO>(`/events/${eventId}/reviews`, body)
  return data
}
