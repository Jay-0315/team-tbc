import { useQuery, useQueries } from '@tanstack/react-query'
import api from '@/lib/api'

/**
 * 특정 채팅방의 안읽은 메시지 수 조회
 */
export function useUnreadCount(roomId: number | undefined) {
  return useQuery({
    queryKey: ['chat', 'unread-count', roomId],
    queryFn: async () => {
      if (!roomId) return 0
      const { data } = await api.get<{ unreadCount: number }>(
        `/chat/rooms/${roomId}/unread-count`
      )
      return data.unreadCount
    },
    enabled: !!roomId,
    staleTime: 10 * 1000, // 10초
    gcTime: 5 * 60 * 1000, // 5분
    refetchInterval: 15 * 1000, // 15초마다 갱신 (실시간성)
  })
}

/**
 * 여러 채팅방의 안읽은 메시지 수를 동시에 조회
 * useQueries를 사용하여 React Hook 규칙 준수
 */
export function useUnreadCounts(roomIds: number[]) {
  // ✅ useQueries 사용 - React Hook 규칙 위반 방지
  const queries = useQueries({
    queries: roomIds.map((roomId) => ({
      queryKey: ['chat', 'unread-count', roomId],
      queryFn: async () => {
        const { data } = await api.get<{ unreadCount: number }>(
          `/chat/rooms/${roomId}/unread-count`
        )
        return data.unreadCount
      },
      staleTime: 10 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: 15 * 1000,
    })),
  })

  // Map<roomId, unreadCount> 형태로 반환
  const unreadCountsMap = new Map<number, number>()
  roomIds.forEach((roomId, index) => {
    const count = queries[index]?.data ?? 0
    unreadCountsMap.set(roomId, count)
  })

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)

  return {
    unreadCountsMap,
    isLoading,
    isError,
  }
}

