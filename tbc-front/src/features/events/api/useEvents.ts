import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api'
import type { EventCardDTO, EventListParams, PageResponse } from '../types'
import { eventKeys } from './keys'

export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      // /api/events 엔드포인트 사용 (올바른 이벤트 엔드포인트)
      const { data } = await apiClient.get<PageResponse<EventCardDTO>>('/events', { 
        params: {
          page: params.page || 0,
          size: params.size || 12,
          category: params.category,
          status: params.status,
          sort: params.sort || 'CREATED_DESC'
        }
      })
      return data
    },
    placeholderData: (prev) => prev, // keepPreviousData-like behavior
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}
