import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { eventKeys } from './keys'

export interface ReviewUpdateRequest {
  rating: number
  comment: string
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      eventId, 
      reviewId, 
      data 
    }: { 
      eventId: number
      reviewId: number
      data: ReviewUpdateRequest 
    }) => {
      const { data: response } = await apiClient.put(`/events/${eventId}/reviews/${reviewId}`, data)
      return response
    },
    onSuccess: (_, { eventId }) => {
      // 이벤트 후기 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.reviews(eventId) })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ eventId, reviewId }: { eventId: number; reviewId: number }) => {
      await apiClient.delete(`/events/${eventId}/reviews/${reviewId}`)
    },
    onSuccess: (_, { eventId }) => {
      // 이벤트 후기 캐시 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.reviews(eventId) })
    },
  })
}
