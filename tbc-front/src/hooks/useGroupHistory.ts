import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export interface GroupHistory {
  id: number
  title: string
  category: string
  location: string
  startAt: string | null
  capacity: number
  joined: number
  status: 'ONGOING' | 'FULL' | 'CLOSING_SOON' | 'ENDED' | 'UNKNOWN'
  role: 'HOST' | 'MEMBER'
  joinedAt: string
}

export function useGroupHistory() {
  const { isAuthenticated, user } = useAuth()
  const enabled = !!user?.id && isAuthenticated

  const currentGroupsQuery = useQuery<GroupHistory[]>({
    queryKey: ['profile', 'groups', 'current', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<GroupHistory[]>('/profile/me/groups/current')
      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  const pastGroupsQuery = useQuery<GroupHistory[]>({
    queryKey: ['profile', 'groups', 'past', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<GroupHistory[]>('/profile/me/groups/past')
      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  const createdGroupsQuery = useQuery<GroupHistory[]>({
    queryKey: ['profile', 'groups', 'created', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<GroupHistory[]>('/profile/me/groups/created')
      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  return {
    currentGroups: currentGroupsQuery.data,
    pastGroups: pastGroupsQuery.data,
    createdGroups: createdGroupsQuery.data,
    isLoading:
      currentGroupsQuery.isLoading || pastGroupsQuery.isLoading || createdGroupsQuery.isLoading,
    error: currentGroupsQuery.error || pastGroupsQuery.error || createdGroupsQuery.error,
  }
}
