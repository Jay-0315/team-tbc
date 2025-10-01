import { useQueries } from '@tanstack/react-query'
import api from '@/lib/api'

interface LatestMessage {
  id: number
  roomId: number
  userId: number
  userNickname: string
  userProfileImage?: string
  type: 'CHAT' | 'SYSTEM' | 'JOIN' | 'LEAVE'
  content: string
  createdAt: string
  readBy?: number[]
}

/**
 * 여러 채팅방의 최신 메시지를 동시에 조회
 */
export function useLatestMessages(roomIds: number[]) {
  const queries = useQueries({
    queries: roomIds.map((roomId) => ({
      queryKey: ['chat', 'latest-message', roomId],
      queryFn: async () => {
        try {
          const { data } = await api.get<LatestMessage>(
            `/chat/rooms/${roomId}/latest-message`
          )
          return data
        } catch (error) {
          // 메시지가 없는 경우 null 반환
          return null
        }
      },
      staleTime: 30 * 1000, // 30초
      gcTime: 5 * 60 * 1000, // 5분
      refetchInterval: 30 * 1000, // 30초마다 갱신
    })),
  })

  // Map<roomId, LatestMessage | null> 형태로 반환
  const latestMessagesMap = new Map<number, LatestMessage | null>()
  roomIds.forEach((roomId, index) => {
    const message = queries[index]?.data ?? null
    latestMessagesMap.set(roomId, message)
  })

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)

  return {
    latestMessagesMap,
    isLoading,
    isError,
  }
}

