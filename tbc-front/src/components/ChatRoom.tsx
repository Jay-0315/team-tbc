import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatHistory } from "@/hooks/useChatHistory"
import type { ChatMessage as HistoryMessage } from "@/hooks/useChatHistory"
import { Button } from '@/components/ui/button'
import { stompClient } from '@/lib/stompClient'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { ChatMessage, ConnectionState } from '@/types/chat'
import { apiClient } from '@/lib/api'
import { useGroupDetail } from '@/hooks/useGroups'

interface ChatRoomProps {
  roomId: number
  userId: number
  roomName?: string
  embedded?: boolean
}

export function ChatRoom({ roomId, userId, roomName, embedded = false }: ChatRoomProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 그룹(소셜링) 타이틀 가져오기
  const { data: groupDetail } = useGroupDetail(roomId)
  const resolvedRoomName = useMemo(() => groupDetail?.title || roomName || `채팅방 ${roomId}`,[groupDetail?.title, roomName, roomId])
  
  // 닉네임 캐시 (userId -> displayName)
  const [nameCache, setNameCache] = useState<Record<number, string>>({})
  const ensureName = async (uid: number) => {
    if (!uid || uid === user?.id || nameCache[uid]) return
    try {
      const { data } = await apiClient.get<{ displayName: string }>(`/profile/${uid}`)
      const display = data?.displayName || `사용자 ${uid}`
      setNameCache((prev) => ({ ...prev, [uid]: display }))
    } catch {
      // 실패 시 캐시는 건너뜀
    }
  }
  
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

  // 채팅 히스토리 로드 시 메시지 상태 업데이트 + 닉네임 보강
  useEffect(() => {
    if (chatHistory) {
      const normalized = chatHistory.map((m: HistoryMessage): ChatMessage => {
        const senderIsMe = m.userId === user?.id
        const cached = nameCache[m.userId]
        const display = m.type === 'SYSTEM' ? '시스템' : (senderIsMe ? (user?.nickname ?? '나') : (cached ?? `사용자 ${m.userId}`))
        return {
          id: String(m.id ?? `${m.userId}-${m.createdAt}`),
          content: m.content,
          userId: m.userId,
          userNickname: display,
          timestamp: m.createdAt,
          type: m.type === 'CHAT' ? 'MESSAGE' : 'SYSTEM',
        }
      })
      setMessages(normalized)

      // 캐시에 없는 상대 닉네임 비동기 조회
      Promise.allSettled(
        chatHistory
          .filter((m) => m.type !== 'SYSTEM' && m.userId !== user?.id && !nameCache[m.userId])
          .map((m) => ensureName(m.userId))
      ).then(() => {
        // 캐시가 채워졌다면 화면에 반영
        setMessages((prev) => prev.map((msg) => (
          msg.type === 'SYSTEM' || msg.userId === user?.id ? msg : {
            ...msg,
            userNickname: nameCache[msg.userId] || msg.userNickname,
          }
        )))
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory, user?.id, user?.nickname])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // STOMP 연결 및 수신
  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.')
      return
    }

    stompClient.connect(token, roomId)

    let subscribed = false
    let cleanup: (() => void) | null = null

    const unsubscribeState = stompClient.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'ERROR') {
        toast.error('채팅 연결에 실패했습니다.')
      } else if (state === 'CONNECTED') {
        if (!subscribed) {
          const unsub = stompClient.subscribeToRoom(roomId, async (message: ChatMessage) => {
            const raw: Partial<ChatMessage> & { createdAt?: string } = message
            const senderId = Number(raw.userId ?? 0)
            if (senderId && senderId !== user?.id && !nameCache[senderId]) {
              await ensureName(senderId)
            }
            const nickname = raw.userNickname
              ?? (senderId === (user?.id ?? -1)
                    ? (user?.nickname ?? '나')
                    : (nameCache[senderId] ?? `사용자 ${senderId}`))
            const normalized: ChatMessage = {
              id: String(raw.id ?? `${senderId}-${raw.timestamp ?? raw.createdAt ?? new Date().toISOString()}`),
              content: String(raw.content ?? ''),
              userId: senderId,
              userNickname: nickname,
              timestamp: String(raw.timestamp ?? raw.createdAt ?? new Date().toISOString()),
              type: (raw.type as ChatMessage['type']) ?? 'MESSAGE',
            }
            setMessages((prev) => [...prev, normalized])
          })
          subscribed = true
          cleanup = () => { try { (unsub as { unsubscribe?: () => void })?.unsubscribe?.() } catch { /* ignore */ } }
        }
        toast.success('채팅방에 연결되었습니다.')
      }
    })

    return () => {
      try { cleanup?.() } catch { /* ignore */ }
      unsubscribeState()
      stompClient.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return 'text-yellow-500'
      case 'CONNECTED':
        return 'text-emerald-600'
      case 'DISCONNECTED':
        return 'text-gray-400'
      case 'ERROR':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  if (historyLoading) {
    return (
      <div className={embedded ? "flex justify-center items-center h-full bg-white" : "flex justify-center items-center h-96 bg-white"}>
        <div className="text-center">
          <div className="mx-auto mb-2 w-8 h-8 rounded-full border-b-2 animate-spin border-zinc-900"></div>
          <div className="text-zinc-800">채팅 기록을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={embedded ? "flex flex-col h-full bg-white" : "flex flex-col h-screen bg-white"} style={embedded ? {height: '100%'} : undefined}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-zinc-200">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate('/')}
            className="transition-colors text-zinc-600 hover:text-black"
          >
            ← 홈으로 가기
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">
            {resolvedRoomName}
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`text-xs ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={embedded ? "overflow-y-auto flex-1 p-4 space-y-4 bg-zinc-50" : "overflow-y-auto flex-1 p-4 space-y-4 bg-zinc-50"}>
        {messages.length === 0 ? (
          <div className="py-8 text-center text-zinc-500">
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
                <div className={`mb-1 text-xs text-zinc-500 ${message.userId === userId ? 'text-right' : 'text-left'}`}>
                  <span className="font-medium text-zinc-700">{message.userNickname}</span>
                  <span className="mx-1">•</span>
                  <time aria-label="보낸 시간">{new Date(message.timestamp).toLocaleString()}</time>
                </div>
                {/* 말풍선 */}
                <div
                  className={`px-4 py-2 rounded-lg ${
                  message.userId === userId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-zinc-900 border border-zinc-200'
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
      <div className="p-4 bg-white border-t border-zinc-200">
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
            className="flex-1 px-3 py-2 bg-white rounded-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder-zinc-400 disabled:bg-zinc-100 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionState !== 'CONNECTED'}
            className="px-6 text-white bg-blue-600 hover:bg-blue-700"
          >
            전송
          </Button>
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Enter로 전송, Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}
