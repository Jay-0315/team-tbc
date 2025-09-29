import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatHistory } from "@/hooks/useChatHistory"
import type { ChatMessage as HistoryMessage } from "@/hooks/useChatHistory"
import { Button } from '@/components/ui/button'
import { stompClient } from '@/lib/stompClient'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { ChatMessage, ConnectionState } from '@/types/chat'

interface ChatRoomProps {
  roomId: number
  userId: number
  roomName?: string
}

export function ChatRoom({ roomId, userId, roomName }: ChatRoomProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // 채팅 히스토리 불러오기
  const { data: chatHistory, isLoading: historyLoading } = useChatHistory(roomId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 채팅 히스토리 로드 시 메시지 상태 업데이트
  useEffect(() => {
    if (chatHistory) {
      // 서버 히스토리 스키마를 UI 스키마로 변환
      const normalized = chatHistory.map((m: HistoryMessage): ChatMessage => ({
        id: String(m.id ?? `${m.userId}-${m.createdAt}`),
        content: m.content,
        userId: m.userId,
        userNickname: m.type === 'SYSTEM' ? '시스템' : (m.userId === user?.id ? (user?.nickname ?? '나') : `사용자 ${m.userId}`),
        timestamp: m.createdAt,
        type: m.type === 'CHAT' ? 'MESSAGE' : 'SYSTEM',
      }))
      setMessages(normalized)
    }
  }, [chatHistory, user?.id, user?.nickname])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Connect to STOMP and subscribe to room (subscribe AFTER connected)
  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.')
      return
    }

    // Start connect
    stompClient.connect(token, roomId)

    let roomSubscription: any = null

    const unsubscribeState = stompClient.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'ERROR') {
        toast.error('채팅 연결에 실패했습니다.')
      } else if (state === 'CONNECTED') {
        // Subscribe once after connected
        if (!roomSubscription) {
          roomSubscription = stompClient.subscribeToRoom(roomId, (message: ChatMessage) => {
            // 들어오는 메시지 형태를 정규화 (서버가 createdAt을 보낼 수 있으므로 보정)
            const raw: Partial<ChatMessage> & { createdAt?: string } = message
            const normalized: ChatMessage = {
              id: String(raw.id ?? `${raw.userId}-${raw.timestamp ?? raw.createdAt ?? new Date().toISOString()}`),
              content: String(raw.content ?? ''),
              userId: Number(raw.userId ?? 0),
              userNickname: raw.userNickname ?? (Number(raw.userId ?? 0) === (user?.id ?? -1) ? (user?.nickname ?? '나') : `사용자 ${raw.userId}`),
              timestamp: String(raw.timestamp ?? raw.createdAt ?? new Date().toISOString()),
              type: (raw.type as ChatMessage['type']) ?? 'MESSAGE',
            }
            setMessages((prev) => [...prev, normalized])
          })
        }
        toast.success('채팅방에 연결되었습니다.')
      }
    })

    return () => {
      try { roomSubscription?.unsubscribe?.() } catch { /* ignore unsubscribe error */ }
      unsubscribeState()
      stompClient.disconnect()
    }
  }, [roomId, user])

  const handleSendMessage = () => {
    if (!newMessage.trim() || connectionState !== 'CONNECTED') return

    try {
      stompClient.sendMessage(roomId, newMessage.trim(), userId)
      setNewMessage('')
    } catch {
      toast.error('메시지 전송에 실패했습니다.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'CONNECTING':
        return '연결 중...'
      case 'CONNECTED':
        return '연결됨'
      case 'DISCONNECTED':
        return '연결 끊김'
      case 'ERROR':
        return '연결 오류'
      default:
        return '알 수 없음'
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'CONNECTING':
        return 'text-yellow-400'
      case 'CONNECTED':
        return 'text-green-400'
      case 'DISCONNECTED':
        return 'text-gray-400'
      case 'ERROR':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (historyLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <div className="text-white">채팅 기록을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 홈으로 가기
          </button>
          <h1 className="text-xl font-semibold text-white">
            {roomName || `채팅방 ${roomId}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-sm ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            아직 메시지가 없습니다. 첫 번째 메시지를 보내보세요!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userId === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`max-w-xs lg:max-w-md`}>
                {/* 닉네임 + 시간 */}
                <div className={`mb-1 text-xs text-gray-400 ${message.userId === userId ? 'text-right' : 'text-left'}`}>
                  <span className="font-medium">{message.userNickname}</span>
                  <span className="mx-1">•</span>
                  <time aria-label="보낸 시간">{new Date(message.timestamp).toLocaleString()}</time>
                </div>
                {/* 말풍선 */}
                <div
                  className={`px-4 py-2 rounded-lg ${
                  message.userId === userId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              connectionState === 'CONNECTED'
                ? '메시지를 입력하세요...'
                : '연결을 기다리는 중...'
            }
            disabled={connectionState !== 'CONNECTED'}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionState !== 'CONNECTED'}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            전송
          </Button>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          Enter로 전송, Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}
