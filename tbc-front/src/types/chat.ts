export interface ChatMessage {
  id: string
  content: string
  userId: number
  userNickname: string
  userProfileImage?: string
  timestamp: string
  type: 'MESSAGE' | 'JOIN' | 'LEAVE' | 'SYSTEM'
  readBy?: number[]
  status?: 'SENDING' | 'SENT' | 'FAILED'
}

export interface ChatRoom {
  id: number
  name: string
  participantCount: number
  lastMessage?: ChatMessage
  unreadCount?: number
}

export interface SendMessageRequest {
  content: string
  userId: number
}

export interface TypingMessage {
  roomId: number
  userId: number
  userNickname: string
  isTyping: boolean
}

export interface PresenceMessage {
  roomId: number
  userId: number
  userNickname: string
  status: 'ONLINE' | 'OFFLINE'
}

export interface ReadReceiptMessage {
  roomId: number
  userId: number
  messageId: string
}

// STOMP connection states
export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface ChatState {
  messages: ChatMessage[]
  participants: string[]
  connectionState: ConnectionState
  isTyping: boolean
  typingUsers: Set<number>
  onlineUsers: Set<number>
}
