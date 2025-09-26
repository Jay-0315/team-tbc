import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createReview } from '../../../services/events'
import { eventKeys } from './keys'
import { useAuth } from '../../../hooks/useAuth'
import type { ReviewDTO } from '../../../types/review'

type CreateReviewRequest = {
  rating: number;
  comment: string;
}

export function useCreateReview(eventId: number) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => createReview(eventId, body),
    onMutate: async (newReview) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: eventKeys.reviews(eventId) })
      
      // 이전 데이터 백업
      const previousReviews = queryClient.getQueryData(eventKeys.reviews(eventId))
      
      // 낙관적 업데이트: 임시 리뷰를 리스트 앞에 추가
      const tempReview: ReviewDTO = {
        id: Date.now(), // 임시 ID
        userId: user?.id || 0, // 실제 로그인한 사용자 ID 사용
        rating: newReview.rating as 1 | 2 | 3 | 4 | 5,
        comment: newReview.comment,
        createdAt: new Date().toISOString(),
      }
      
      queryClient.setQueryData(eventKeys.reviews(eventId), (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                content: [tempReview, ...page.content],
                totalElements: page.totalElements + 1,
              }
            }
            return page
          }),
        }
      })
      
      return { previousReviews }
    },
    // onError: (err, newReview, context) => {
    //   // 실패 시 이전 데이터로 롤백
    //   if (context?.previousReviews) {
    //     queryClient.setQueryData(eventKeys.reviews(eventId), context.previousReviews)
    //   }
    // },
    onSettled: () => {
      // 성공/실패 관계없이 쿼리 무효화하여 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: eventKeys.reviews(eventId) })
    },
  })
}
