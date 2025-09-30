import { useQuery } from '@tanstack/react-query'
import { eventKeys } from './keys'
import { fetchPopularEvents } from '@/services/events'

export function usePopularEvents() {
  return useQuery({
    queryKey: eventKeys.popular(),
    queryFn: () => fetchPopularEvents(0, 4),
    staleTime: 0, // 항상 fresh하게 유지하여 F5시 갱신
    gcTime: 1000 * 60 * 5, // 5분
    refetchOnMount: true, // 마운트시 항상 갱신
    refetchOnWindowFocus: false,
  })
}
