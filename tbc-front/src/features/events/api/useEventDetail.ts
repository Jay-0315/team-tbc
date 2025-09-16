import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api'
import type { EventDetailDTO } from '../types'

const detailKey = (id: number) => ['events', 'detail', id] as const

export function useEventDetail(id: number | undefined) {
  return useQuery({
    queryKey: id ? detailKey(id) : ['events', 'detail', 'empty'],
    queryFn: async () => {
      if (!id) throw new Error('invalid id')
      const { data } = await apiClient.get<EventDetailDTO>(`/events/${id}`)
      return data
    },
    enabled: typeof id === 'number' && !Number.isNaN(id),
    staleTime: 1000 * 30,
  })
}


