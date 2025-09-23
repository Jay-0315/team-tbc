import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface GroupCard {
  id: number
  title: string
  category: string
  topic: string
  minParticipants: number
  maxParticipants: number
  mode: 'ONLINE' | 'OFFLINE' | string
  feeType: 'FREE' | 'PAID' | string
  feeAmount: number | null
  tags?: string[]
  hostId: number
  createdAt?: string
}

export interface GroupsResponse {
  content: GroupCard[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export function useGroups(page = 0, size = 12, category?: string) {
  return useQuery({
    queryKey: ['groups', page, size, category],
    queryFn: async (): Promise<GroupsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })
      if (category) {
        params.append('category', category)
      }
      const response = await apiClient.get(`/groups?${params.toString()}`)
      return response.data
    },
  })
}

export function useGroupDetail(id: number | undefined) {
  return useQuery({
    queryKey: ['groups', 'detail', id],
    queryFn: async (): Promise<GroupCard> => {
      if (!id) throw new Error('invalid id')
      const res = await apiClient.get(`/groups/${id}`)
      return (res.data && res.data.data) ? res.data.data : res.data
    },
    enabled: typeof id === 'number' && !Number.isNaN(id),
  })
}
