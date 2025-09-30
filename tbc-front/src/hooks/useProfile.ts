import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface Profile {
  id: number
  userId: number
  profileImageUrl?: string | null
  displayName: string
  nickname?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  bio?: string
  interests: string[]
  createdAt: string
  updatedAt: string
}

export interface ProfileUpdateRequest {
  displayName: string
  gender?: string
  bio?: string
  interests: string[]
  profileImageUrl?: string | null
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<Profile>('/profile/me')
      return data
    },
    retry: false,
    staleTime: 0, // 항상 최신 데이터 가져오기
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation<Profile, Error, ProfileUpdateRequest>({
    mutationFn: async (profileData) => {
      const { data } = await apiClient.put<Profile>('/profile/me', profileData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
  })
}
