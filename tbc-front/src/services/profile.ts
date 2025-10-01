import apiClient from '@/lib/api'

export interface ProfileResponse {
  id: number
  userId: number
  profileImageUrl?: string | null
  displayName?: string | null
}

export async function fetchProfile(userId: number): Promise<ProfileResponse> {
  const { data } = await apiClient.get<ProfileResponse>(`/profile/${userId}`)
  return data
} 