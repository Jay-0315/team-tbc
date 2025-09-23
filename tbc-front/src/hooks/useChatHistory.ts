import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface ChatMessage {
  id: number
  roomId: number
  userId: number
  type: 'CHAT' | 'SYSTEM'
  content: string
  createdAt: string
}

export function useChatHistory(roomId: number, limit = 50) {
  return useQuery({
    queryKey: ['chatHistory', roomId, limit],
    queryFn: async (): Promise<ChatMessage[]> => {
      // Backend: GET /api/chat/rooms/{roomId}/messages?cursor&limit
      const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params: { limit } })
      const items = response.data?.items as Array<{ id: number; roomId: number; userId: number; type: 'CHAT' | 'SYSTEM'; content: string; sentAt: string }>
      return (items ?? []).map((m) => ({
        id: m.id,
        roomId: m.roomId,
        userId: m.userId,
        type: m.type,
        content: m.content,
        createdAt: m.sentAt,
      }))
    },
    enabled: !!roomId,
  })
}
