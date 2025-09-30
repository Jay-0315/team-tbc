import { useQuery } from '@tanstack/react-query'
import { eventKeys } from './keys'
import { fetchPopularEvents } from '@/services/events'

export function usePopularEvents() {
  return useQuery({
    queryKey: eventKeys.popular(),
    queryFn: () => fetchPopularEvents(0, 12),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
  })
}
