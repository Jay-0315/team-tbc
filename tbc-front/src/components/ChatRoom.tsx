import { useEffect, useRef, useState } from 'react'
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
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Connect to STOMP and subscribe to room
  useEffect(() => {
    if (!user) return

    // Get auth token from localStorage
    const token = localStorage.getItem('authToken')
    if (!token) {
      toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.')
      return
    }

    // Connect to STOMP
    stompClient.connect(token)

    // Subscribe to connection state changes
    const unsubscribeState = stompClient.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'ERROR') {
        toast.error('채팅 연결에 실패했습니다.')
      } else if (state === 'CONNECTED') {
        toast.success('채팅방에 연결되었습니다.')
      }
    })

    // Subscribe to room messages
    const subscription = stompClient.subscribeToRoom(roomId, (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      subscription?.unsubscribe()
      unsubscribeState()
      stompClient.disconnect()
    }
  }, [roomId, user])

  const handleSendMessage = () => {
    if (!newMessage.trim() || connectionState !== 'CONNECTED') return

    try {
      stompClient.sendMessage(roomId, newMessage.trim(), userId)
      setNewMessage('')
    } catch (error) {
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
        return 'text-yellow-600'
      case 'CONNECTED':
        return 'text-green-600'
      case 'DISCONNECTED':
        return 'text-gray-500'
      case 'ERROR':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {roomName || `채팅방 #${roomId}`}
          </h2>
          <p className="text-sm text-gray-600">
            참여자: {user?.nickname} (ID: {userId})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {message.type === 'SYSTEM' ? (
                  <div className="text-sm italic text-center">
                    {message.content}
                  </div>
                ) : (
                  <div>
                    {message.userId !== userId && (
                      <div className="text-xs font-medium mb-1 opacity-75">
                        {message.userNickname || `사용자 ${message.userId}`}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionState !== 'CONNECTED'}
            className="px-6"
          >
            전송
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Enter로 전송, Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
