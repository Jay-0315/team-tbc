import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface ParticipantInfo {
  userId: number
  displayName: string
  profileImageUrl?: string
  role: string  // "HOST" | "MEMBER"
  presenceStatus: string  // "ONLINE" | "AWAY" | "OFFLINE"
  lastSeenAt?: string
  joinedAt: string
}

interface ParticipantsResponse {
  participants: ParticipantInfo[]
  onlineCount: number
}

export function useParticipants(roomId: number) {
  return useQuery({
    queryKey: ['chat', 'participants', roomId],
    queryFn: async () => {
      const { data } = await apiClient.get<ParticipantsResponse>(
        `/chat/rooms/${roomId}/participants`
      )
      return data
    },
    refetchInterval: 30000, // 30초마다 갱신 (10초 → 30초)
    staleTime: 20000,       // 20초간 캐시 유지
    gcTime: 5 * 60 * 1000   // 5분간 캐시 보관
  })
}

