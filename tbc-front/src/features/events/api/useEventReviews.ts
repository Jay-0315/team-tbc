import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchReviews } from '../../../services/events'
import { eventKeys } from './keys'
import type { ReviewDTO } from '../../../types/review'

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export function useEventReviews(eventId: number, size: number = 10) {
  return useInfiniteQuery({
    queryKey: [...eventKeys.reviews(eventId), { size }],
    queryFn: ({ pageParam = 0 }) => fetchReviews(eventId, pageParam, size),
    getNextPageParam: (lastPage: Page<ReviewDTO>) => {
      if (lastPage.last) return undefined
      return lastPage.number + 1
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5분
  })
}
