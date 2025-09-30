<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query'
=======
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
>>>>>>> origin/dev
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

<<<<<<< HEAD
export function useGroupDetail(id: number | undefined) {
  return useQuery({
    queryKey: ['groups', 'detail', id],
    queryFn: async (): Promise<GroupCard> => {
      if (!id) throw new Error('invalid id')
      const res = await apiClient.get(`/groups/${id}`)
      return (res.data && res.data.data) ? res.data.data : res.data
    },
    enabled: typeof id === 'number' && !Number.isNaN(id),
=======
export interface GroupDetail {
  id: number
  title: string
  category: string
  topic: string
  minParticipants: number
  maxParticipants: number
  mode: string
  feeType: string
  feeAmount?: number
}

export function useGroupDetail(id?: number) {
  return useQuery<GroupDetail | undefined>({
    queryKey: ['group', 'detail', id],
    queryFn: async () => {
      if (!id) return undefined
      const { data } = await apiClient.get<GroupDetail>(`/groups/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useJoinGroup(groupId?: number) {
  const qc = useQueryClient()
  return useMutation<{ ok: true }, Error, void>({
    mutationFn: async () => {
      if (!groupId) throw new Error('groupId가 없습니다')
      const { status } = await apiClient.post(`/groups/${groupId}/join`)
      if (status !== 200) throw new Error('신청에 실패했습니다')
      return { ok: true as const }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', 'detail', groupId] })
      qc.invalidateQueries({ queryKey: ['profile', 'groups'] })
    },
>>>>>>> origin/dev
  })
}
