import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { stompClient } from '@/lib/stompClient'
import type { ChatMessage, ConnectionState } from '@/types/chat'

// Chat API functions
const chatApi = {
  getChatHistory: async (roomId: number, cursor?: number, limit = 50) => {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, {
      params: { cursor, limit }
    })
    return response.data
  }
}

// Chat query keys
export const chatKeys = {
  all: ['chat'] as const,
  history: (roomId: number) => [...chatKeys.all, 'history', roomId] as const,
}

// Custom hook for chat functionality
export function useChat(roomId: number, userId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED')

  // Get chat history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: chatKeys.history(roomId),
    queryFn: () => chatApi.getChatHistory(roomId),
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Connect to STOMP and subscribe to room
  const connect = useCallback((token: string) => {
    stompClient.connect(token)
  }, [])

  // Disconnect from STOMP
  const disconnect = useCallback(() => {
    stompClient.disconnect()
  }, [])

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (connectionState !== 'CONNECTED') {
      throw new Error('Not connected to chat')
    }
    stompClient.sendMessage(roomId, content, userId)
  }, [roomId, userId, connectionState])

  // Subscribe to room messages
  const subscribeToRoom = useCallback((onMessage: (message: ChatMessage) => void) => {
    return stompClient.subscribeToRoom(roomId, onMessage)
  }, [roomId])

  // Subscribe to connection state changes
  const subscribeToConnectionState = useCallback((onStateChange: (state: ConnectionState) => void) => {
    return stompClient.onConnectionStateChange(onStateChange)
  }, [])

  // Initialize chat connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setConnectionState('ERROR')
      return
    }

    // Subscribe to connection state changes
    const unsubscribeState = subscribeToConnectionState(setConnectionState)

    // Subscribe to room messages
    const subscription = subscribeToRoom((message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    // Connect to STOMP
    connect(token)

    return () => {
      subscription?.unsubscribe()
      unsubscribeState()
      disconnect()
    }
  }, [roomId, connect, disconnect, subscribeToRoom, subscribeToConnectionState])

  // Load chat history when available
  useEffect(() => {
    if (historyData?.items) {
      setMessages(historyData.items)
    }
  }, [historyData])

  return {
    messages,
    connectionState,
    isLoadingHistory,
    sendMessage,
    connect,
    disconnect,
    subscribeToRoom,
    subscribeToConnectionState,
  }
}

export default useChat
