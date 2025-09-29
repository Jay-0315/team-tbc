import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api'
import type { EventCardDTO, EventListParams, PageResponse } from '../types'
import { eventKeys } from './keys'

export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      // /api/groups 엔드포인트 사용 (varigroups 테이블)
      const { data } = await apiClient.get<PageResponse<EventCardDTO>>('/groups', { 
        params: {
          page: params.page || 0,
          size: params.size || 12
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
