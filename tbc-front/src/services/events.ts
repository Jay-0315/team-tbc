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
    if (axios.isAxiosError(err) && err.response?.status === 402) {
      // 백엔드: 잔액 부족 시 402 반환 → 프런트 표준 에러 메시지로 변환
      throw new Error('INSUFFICIENT_BALANCE')
    }
    throw err instanceof Error ? err : new Error('JOIN_FAILED')
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
  console.log('fetchEvents called with params:', params)
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
  console.log('fetchEvents response:', data)
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
