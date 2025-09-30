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
    <div className={embedded ? "flex flex-col h-full bg-gradient-to-b from-orange-50/20 to-white" : "flex flex-col h-screen bg-white"} style={embedded ? {height: '100%'} : undefined}>
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-600">
        <div className="flex gap-3 items-center flex-1 min-w-0">
          {!embedded && (
            <button
              onClick={() => navigate('/')}
              className="transition-colors text-white/90 hover:text-white flex-shrink-0"
            >
              ← 홈으로 가기
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base font-bold text-white truncate">
              {resolvedRoomName}
            </h1>
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
              connectionState === 'CONNECTED' ? 'bg-green-500/30 text-green-100' :
              connectionState === 'CONNECTING' ? 'bg-yellow-500/30 text-yellow-100' :
              connectionState === 'ERROR' ? 'bg-red-500/30 text-red-100' :
              'bg-white/20 text-white/70'
            }`}>
              {getConnectionStatusText()}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto flex-1 p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm text-gray-500">아직 메시지가 없습니다.<br/>첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.userId === userId
            const isSystemMessage = message.type === 'SYSTEM'
            
            if (isSystemMessage) {
              return (
                <div key={message.id} className="flex justify-center my-4">
                  <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {message.content}
                  </div>
                </div>
              )
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                  {/* 상대방 메시지만 닉네임 표시 */}
                  {!isMyMessage && (
                    <div className="mb-1 px-1 text-xs text-left">
                      <span className="font-semibold text-gray-700">{message.userNickname}</span>
                    </div>
                  )}
                  {/* 말풍선 + 시간 */}
                  <div className={`flex items-end gap-2 ${
                    isMyMessage ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isMyMessage
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
                    </div>
                    <time className="text-xs text-gray-500 flex-shrink-0 pb-0.5" aria-label="보낸 시간">
                      {new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </time>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
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
            className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            aria-label="메시지 입력"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionState !== 'CONNECTED'}
            className="px-6 py-2.5 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            전송
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500 px-1">
          💡 Enter로 전송, Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}
