import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api'
import type { EventCardDTO, EventListParams, PageResponse } from '../types'
import { eventKeys } from './keys'

export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PageResponse<EventCardDTO>>('/events', { params })
      return data
    },
    placeholderData: (prev) => prev, // keepPreviousData-like behavior
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}