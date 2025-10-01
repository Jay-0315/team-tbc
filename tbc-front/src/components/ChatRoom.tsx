import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatHistory } from "@/hooks/useChatHistory"
import type { ChatMessage as HistoryMessage } from "@/hooks/useChatHistory"
import { stompClient } from '@/lib/stompClient'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { ChatMessage, ConnectionState } from '@/types/chat'
import { apiClient } from '@/lib/api'
import { useGroupDetail } from '@/hooks/useGroups'
import { Check, CheckCheck, Loader2, Users } from 'lucide-react'
import { useParticipants } from '@/features/chat/api/useParticipants'
import { ParticipantsModal } from './ParticipantsModal'

interface ChatRoomProps {
  roomId: number
  userId: number
  roomName?: string
  embedded?: boolean
  onClose?: () => void
}

export function ChatRoom({ roomId, userId, roomName, embedded = false }: ChatRoomProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 그룹(소셜링) 타이틀 가져오기
  const { data: groupDetail } = useGroupDetail(roomId)
  const resolvedRoomName = useMemo(() => groupDetail?.title || roomName || `채팅방 ${roomId}`,[groupDetail?.title, roomName, roomId])
  
  // 닉네임 및 프로필 이미지 캐시
  const [nameCache, setNameCache] = useState<Record<number, string>>({})
  const [profileImageCache, setProfileImageCache] = useState<Record<number, string>>({})
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())
  const [showParticipants, setShowParticipants] = useState(false)
  
  // 참여자 목록 조회
  const { data: participantsData } = useParticipants(roomId)
  
  const ensureName = async (uid: number) => {
    if (!uid || uid === user?.id || nameCache[uid]) return
    try {
      const { data } = await apiClient.get<{ displayName: string; profileImageUrl?: string }>(`/profile/${uid}`)
      const display = data?.displayName || `사용자 ${uid}`
      setNameCache((prev) => ({ ...prev, [uid]: display }))
      if (data?.profileImageUrl) {
        setProfileImageCache((prev) => ({ ...prev, [uid]: data.profileImageUrl! }))
      }
    } catch {
      // 실패 시 캐시는 건너뜀
    }
  }

  // 브라우저 알림 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
  
  // 채팅 히스토리 불러오기
  const { data: chatHistory, isLoading: historyLoading } = useChatHistory(roomId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // ✅ 채팅방별 메시지 캐시 (roomId 변경 시에도 메시지 유지)
  const [messageCache, setMessageCache] = useState<Record<number, ChatMessage[]>>({})
  const isRestoringFromCache = useRef(false)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ✅ 채팅방 변경 시 메시지 초기화 및 캐시 복원
  useEffect(() => {
    console.log(`[ChatRoom] 채팅방 변경: ${roomId}`)
    
    // 채팅방 변경 시 메시지 초기화
    setMessages([])
    
    // 캐시된 메시지가 있으면 복원
    if (messageCache[roomId] && messageCache[roomId].length > 0) {
      console.log(`[ChatRoom] 채팅방 ${roomId} 캐시된 메시지 복원:`, messageCache[roomId].length)
      isRestoringFromCache.current = true
      setMessages(messageCache[roomId])
    }
  }, [roomId]) // messageCache 의존성 제거하여 무한 루프 방지

  // ✅ 메시지 변경 시 캐시 업데이트 (캐시에서 복원 중이 아닐 때만)
  useEffect(() => {
    if (messages.length > 0 && !isRestoringFromCache.current) {
      setMessageCache(prev => ({
        ...prev,
        [roomId]: messages
      }))
    }
    
    // 복원 완료 후 플래그 리셋
    if (isRestoringFromCache.current) {
      isRestoringFromCache.current = false
    }
  }, [messages, roomId])

  // 채팅 히스토리 로드 시 메시지 상태 업데이트 + 닉네임 보강 + 읽음 처리
  useEffect(() => {
    if (chatHistory && user?.id) {
      const normalized = chatHistory.map((m: HistoryMessage): ChatMessage => {
        const senderIsMe = m.userId === user?.id
        const cached = nameCache[m.userId]
        const display = m.type === 'SYSTEM' ? '시스템' : (senderIsMe ? (user?.nickname ?? '나') : (cached ?? `사용자 ${m.userId}`))
        
        // ✅ timestamp 안전 처리
        const timestamp = m.createdAt || new Date().toISOString()
        
        return {
          id: String(m.id ?? `${m.userId}-${timestamp}`),
          content: m.content,
          userId: m.userId,
          userNickname: display,
          userProfileImage: profileImageCache[m.userId],
          timestamp: timestamp,  // ✅ 안전한 timestamp
          type: m.type === 'CHAT' ? 'MESSAGE' : 'SYSTEM',
          status: 'SENT', // 히스토리 메시지는 모두 전송 완료 상태
        }
      })
      
      // ✅ 기존 메시지와 병합 (중복 제거)
      setMessages((prevMessages) => {
        const existingIds = new Set(prevMessages.map(m => m.id))
        const newMessages = normalized.filter(m => !existingIds.has(m.id))
        
        if (newMessages.length > 0) {
          console.log(`[ChatRoom] 히스토리에서 ${newMessages.length}개 새 메시지 로드`)
          return [...prevMessages, ...newMessages].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        }
        
        return prevMessages
      })

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

      // ✅ 채팅방 입장 시 모든 메시지 읽음 처리
      const markAllRead = async () => {
        try {
          const response = await apiClient.post(`/chat/rooms/${roomId}/mark-all-read`)
          console.log(`✅ 채팅방 ${roomId} 읽음 처리 완료:`, response.data)
        } catch (error) {
          console.error('❌ 읽음 처리 실패:', error)
        }
      }
      markAllRead()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory, user?.id, user?.nickname, roomId])

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

    console.log(`[ChatRoom] STOMP 연결 시작: roomId=${roomId}`)
    stompClient.connect(token, roomId)

    let subscribed = false
    let cleanup: (() => void) | null = null
    let typingCleanup: (() => void) | null = null
    let presenceCleanup: (() => void) | null = null
    let readCleanup: (() => void) | null = null

    const unsubscribeState = stompClient.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'ERROR') {
        toast.error('채팅 연결에 실패했습니다.')
      } else if (state === 'CONNECTED') {
        if (!subscribed) {
          console.log(`[ChatRoom] STOMP 구독 시작: roomId=${roomId}`)
          // 메시지 구독
          const unsub = stompClient.subscribeToRoom(roomId, async (message: ChatMessage) => {
            console.log(`[ChatRoom] STOMP 메시지 수신: roomId=${roomId}`, message)
            const raw: Partial<ChatMessage> & { createdAt?: string } = message
            const senderId = Number(raw.userId ?? 0)
            
            // ✅ timestamp 우선순위: timestamp > createdAt > 현재시간
            const messageTime = raw.timestamp || (raw as { createdAt?: string }).createdAt || new Date().toISOString()
            
            if (senderId && senderId !== user?.id && !nameCache[senderId]) {
              await ensureName(senderId)
            }
            const nickname = raw.userNickname
              ?? (senderId === (user?.id ?? -1)
                    ? (user?.nickname ?? '나')
                    : (nameCache[senderId] ?? `사용자 ${senderId}`))
            const profileImage = raw.userProfileImage ?? profileImageCache[senderId]
            
            const normalized: ChatMessage = {
              id: String(raw.id ?? `${senderId}-${messageTime}`),
              content: String(raw.content ?? ''),
              userId: senderId,
              userNickname: nickname,
              userProfileImage: profileImage,
              timestamp: messageTime,  // ✅ 안전한 timestamp
              type: (raw.type as ChatMessage['type']) ?? 'MESSAGE',
              status: 'SENT',
            }
            
            // ✅ 중복 메시지 방지 및 낙관적 업데이트 메시지 교체
            setMessages((prev) => {
              const exists = prev.some(m => m.id === normalized.id)
              if (exists) {
                console.log('[ChatRoom] 중복 메시지 무시:', normalized.id)
                return prev
              }
              
              console.log('[ChatRoom] 새 메시지 추가:', normalized)
              
              // 임시 메시지 제거: SENDING/SENT 상태이고 같은 내용의 메시지
              const filtered = prev.filter(m => {
                if (m.status === 'SENDING' || m.status === 'SENT') {
                  // 같은 사용자가 같은 내용을 보낸 임시 메시지는 제거
                  if (m.userId === normalized.userId && 
                      m.content.trim() === normalized.content.trim() &&
                      m.id.startsWith('temp-')) {
                    console.log('[ChatRoom] 임시 메시지 제거:', m.id)
                    return false
                  }
                }
                return true
              })
              
              const newMessages = [...filtered, normalized]
              console.log(`[ChatRoom] 메시지 업데이트: ${filtered.length} -> ${newMessages.length}`)
              return newMessages
            })
            
            // 브라우저 알림 (백그라운드일 때만)
            if (document.hidden && senderId !== user.id && Notification.permission === 'granted') {
              new Notification(`${nickname}님의 메시지`, {
                body: normalized.content,
                icon: profileImage || '/favicon.ico',
                tag: `chat-${roomId}`,
              })
            }
            
            // 읽음 상태 전송
            if (senderId !== user.id) {
              stompClient.sendReadReceipt(roomId, user.id, normalized.id)
            }
          })
          subscribed = true
          cleanup = () => { try { (unsub as { unsubscribe?: () => void })?.unsubscribe?.() } catch { /* ignore */ } }
          
          // 타이핑 구독
          const typingSub = stompClient.subscribeToTyping(roomId, (msg) => {
            if (msg.userId === user.id) return
            setTypingUsers(prev => {
              const next = new Set(prev)
              next.add(msg.userId)
              return next
            })
            
            // 3초 후 자동 제거
            setTimeout(() => {
              setTypingUsers(prev => {
                const next = new Set(prev)
                next.delete(msg.userId)
                return next
              })
            }, 3000)
          })
          typingCleanup = () => { try { (typingSub as { unsubscribe?: () => void })?.unsubscribe?.() } catch { /* ignore */ } }
          
          // 온라인 상태 구독
          const presenceSub = stompClient.subscribeToPresence(roomId, (msg) => {
            if (msg.status === 'ONLINE') {
              setOnlineUsers(prev => new Set([...prev, msg.userId]))
            } else {
              setOnlineUsers(prev => {
                const next = new Set(prev)
                next.delete(msg.userId)
                return next
              })
            }
          })
          presenceCleanup = () => { try { (presenceSub as { unsubscribe?: () => void })?.unsubscribe?.() } catch { /* ignore */ } }
          
          // 읽음 상태 구독
          const readSub = stompClient.subscribeToReadReceipts(roomId, (msg) => {
            setMessages(prev => prev.map(message => {
              if (message.id === msg.messageId) {
                const readBy = message.readBy || []
                if (!readBy.includes(msg.userId)) {
                  return { ...message, readBy: [...readBy, msg.userId] }
                }
              }
              return message
            }))
          })
          readCleanup = () => { try { (readSub as { unsubscribe?: () => void })?.unsubscribe?.() } catch { /* ignore */ } }
          
          // 온라인 상태 알림
          stompClient.sendPresence(roomId, user.id, user.nickname ?? '사용자', 'ONLINE')
        }
        toast.success('채팅방에 연결되었습니다.')
      }
    })

    return () => {
      // 오프라인 상태 전송
      if (user) {
        stompClient.sendPresence(roomId, user.id, user.nickname ?? '사용자', 'OFFLINE')
      }
      try { cleanup?.() } catch { /* ignore */ }
      try { typingCleanup?.() } catch { /* ignore */ }
      try { presenceCleanup?.() } catch { /* ignore */ }
      try { readCleanup?.() } catch { /* ignore */ }
      unsubscribeState()
      stompClient.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    if (connectionState !== 'CONNECTED') {
      toast.error('채팅 연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    try {
      const messageContent = newMessage.trim()
      console.log('[ChatRoom] 메시지 전송:', messageContent)
      
      // ✅ 낙관적 업데이트: 즉시 메시지 표시
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const optimisticMessage: ChatMessage = {
        id: tempId,
        content: messageContent,
        userId: userId,
        userNickname: user?.nickname ?? '나',
        userProfileImage: undefined, // TODO: 사용자 프로필 이미지 필드 확인 필요
        timestamp: new Date().toISOString(),
        type: 'MESSAGE',
        status: 'SENDING',
      }
      
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
      
      // 500ms 후 SENT 상태로 변경
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'SENT' as const } : msg
        ))
      }, 500)
      
      // 서버로 메시지 전송
      stompClient.sendMessage(roomId, messageContent, userId)
      
      console.log('[ChatRoom] 낙관적 업데이트 완료, 서버 응답 대기 중...')
    } catch (error) {
      console.error('[ChatRoom] 메시지 전송 실패:', error)
      toast.error('메시지 전송에 실패했습니다.')
      
      // 실패 시 낙관적 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 타이핑 알림
  const typingTimeoutRef = useRef<number | undefined>(undefined)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (connectionState === 'CONNECTED' && user) {
      // 타이핑 알림 전송
      stompClient.sendTyping(roomId, user.id, user.nickname ?? '사용자')
      
      // 기존 타이머 클리어
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // 3초 후 타이핑 상태 제거
      typingTimeoutRef.current = setTimeout(() => {
        // 타이핑 멈춤은 자동으로 처리됨
      }, 3000)
    }
  }, [connectionState, roomId, user])

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
    <div className={embedded ? "flex flex-col h-full bg-gradient-to-b from-orange-50/20 to-white" : "flex flex-col h-screen bg-white"}>
      {/* Header - 그룹 표시 헤더와 동일한 높이 (57px) */}
      <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-orange-400 to-amber-400 border-b border-orange-500 h-[57px]">
        <div className="flex gap-3 items-center flex-1 min-w-0">
          {!embedded && (
            <button
              onClick={() => navigate('/')}
              className="transition-colors text-white/90 hover:text-white flex-shrink-0"
            >
              ← 홈으로 가기
            </button>
          )}
          {/* 좌측 정렬: 채팅방 이름 → 인원수 → 연결 상태 */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base font-bold text-white truncate">
              {resolvedRoomName}
            </h1>
            
            {/* 인원수 표시 */}
            <button
              onClick={() => setShowParticipants(true)}
              className="flex items-center gap-1.5 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
              aria-label="참여자 목록"
            >
              <Users className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white">
                {participantsData?.onlineCount ?? 0}/{participantsData?.participants.length ?? 0}
              </span>
            </button>
            
            {/* 연결 상태 (배경 제거) */}
            <span className={`text-xs font-medium flex-shrink-0 ${
              connectionState === 'CONNECTED' ? 'text-green-100' :
              connectionState === 'CONNECTING' ? 'text-yellow-100' :
              connectionState === 'ERROR' ? 'text-red-200' :
              'text-white/70'
            }`}>
              {getConnectionStatusText()}
            </span>
          </div>
        </div>
      </div>
      
      {/* 참여자 목록 모달 */}
      <ParticipantsModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        roomId={roomId}
        participants={participantsData?.participants ?? []}
        onlineUsers={onlineUsers}
      />

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
            
            const readCount = message.readBy?.length || 0
            const isRead = readCount > 0
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md flex ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-2 items-start`}>
                  {/* 상대방 프로필 사진 - 상단 정렬 (카카오톡 스타일) */}
                  {!isMyMessage && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-300 mt-5">
                      {message.userProfileImage ? (
                        <img 
                          src={message.userProfileImage} 
                          alt={message.userNickname}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.userNickname)}&background=FF6B35&color=fff&size=40`
                          }}
                        />
                      ) : (
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.userNickname)}&background=FF6B35&color=fff&size=40`}
                          alt={message.userNickname}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  
                  {/* 메시지 컨테이너 */}
                  <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {/* 닉네임 (상대방만) */}
                    {!isMyMessage && (
                      <div className="mb-1 px-1 flex items-center gap-1.5">
                        <span className="font-bold text-gray-800 text-xs">{message.userNickname}</span>
                        {onlineUsers.has(message.userId) && (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="온라인" />
                        )}
                      </div>
                    )}
                    
                    {/* 말풍선과 시간을 같은 줄에 */}
                    <div className={`flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* 말풍선 */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isMyMessage
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
                      </div>
                      
                      {/* 시간 + 체크 (말풍선 하단에 맞춤) */}
                      <div className="flex flex-col items-center gap-0.5 pb-1">
                        {isMyMessage && (
                          <div className="flex items-center">
                            {message.status === 'SENDING' && (
                              <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                            )}
                            {message.status === 'SENT' && !isRead && (
                              <Check className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {message.status === 'SENT' && isRead && (
                              <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                            )}
                            {message.status === 'FAILED' && (
                              <span className="text-xs text-red-500">!</span>
                            )}
                          </div>
                        )}
                        <time className="text-[10px] text-gray-400 font-medium whitespace-nowrap" aria-label="보낸 시간">
                          {(() => {
                            try {
                              const date = new Date(message.timestamp)
                              if (isNaN(date.getTime())) return '--:--'
                              return date.toLocaleTimeString('ko-KR', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false
                              })
                            } catch {
                              return '--:--'
                            }
                          })()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* 타이핑 인디케이터 */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-gray-600">
                {Array.from(typingUsers).map(uid => nameCache[uid] || '사용자').join(', ')}님이 입력 중...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              connectionState === 'CONNECTED'
                ? '메시지를 입력하세요...'
                : '연결을 기다리는 중...'
            }
            disabled={connectionState !== 'CONNECTED'}
            className="flex-1 h-11 px-4 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            aria-label="메시지 입력"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionState !== 'CONNECTED'}
            className="h-11 px-6 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            전송
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 px-1">
          💡 Enter로 전송, Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}

