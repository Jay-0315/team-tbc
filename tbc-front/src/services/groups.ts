import apiClient from '@/lib/api'

export type ParticipantRole = 'HOST' | 'MEMBER' | (string & {})

export interface ParticipantResponse {
  userId: number
  role: ParticipantRole
  status: string
  joinedAt: string
}

export async function fetchParticipants(groupId: number, excludeCancelled: boolean = true): Promise<ParticipantResponse[]> {
  const { data } = await apiClient.get<ParticipantResponse[]>(`/meetups/${groupId}/participants`, {
    params: { excludeCancelled },
  })
  return data
} 