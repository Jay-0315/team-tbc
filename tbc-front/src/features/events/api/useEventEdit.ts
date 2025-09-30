import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { eventKeys } from './keys'

export interface EventUpdateRequest {
  title: string
  category: string
  capacity: number
  eventDate: string
  eventTime: string
  location: string
  description?: string
  feeType?: string
  feeAmount?: number
  feeInfo?: string
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: number; data: EventUpdateRequest }) => {
      const { data: response } = await apiClient.put(`/events/${eventId}`, data)
      return response
    },
    onSuccess: (_, { eventId }) => {
      // 이벤트 상세 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      // 이벤트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.root })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventId: number) => {
      await apiClient.delete(`/events/${eventId}`)
    },
    onSuccess: (_, eventId) => {
      // 이벤트 상세 정보 캐시 제거
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) })
      // 이벤트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.root })
    },
  })
}
