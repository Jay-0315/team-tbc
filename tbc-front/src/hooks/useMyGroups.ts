import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from './useAuth'

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

export function useMyGroups(page = 0, size = 20) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['my-groups', page, size, user?.id],
    queryFn: async (): Promise<GroupsResponse> => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })
      
      const response = await apiClient.get(`/groups/my-groups?${params.toString()}`)
      return response.data
    },
    enabled: !!user?.id, // 사용자가 로그인했을 때만 실행
  })
}
