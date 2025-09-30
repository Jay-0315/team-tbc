import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchEvents } from '../../../services/events'
import { eventKeys } from './keys'
import type { EventListParams } from '../../../types/event'

export function useInfiniteEvents(params: EventListParams = {}) {
  return useInfiniteQuery({
    queryKey: [...eventKeys.root, 'infinite', params],
    queryFn: ({ pageParam = 0 }) => 
      fetchEvents({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // last 필드가 없을 경우 totalPages로 판단
      if (lastPage.last !== undefined) {
        return lastPage.last ? undefined : lastPage.number + 1
      }
      // fallback: totalPages로 판단
      return lastPage.number + 1 >= lastPage.totalPages ? undefined : lastPage.number + 1
    },
    initialPageParam: 0,
    staleTime: 1 * 60 * 1000, // 1분 - 짧게 설정하여 최신 데이터 유지
    gcTime: 5 * 60 * 1000, // 5분
    refetchOnMount: true, // 마운트시 항상 갱신
    refetchOnWindowFocus: false,
  })
}
