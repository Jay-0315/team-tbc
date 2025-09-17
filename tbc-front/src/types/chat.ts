export interface ChatMessage {
  id: string
  content: string
  userId: number
  userNickname: string
  timestamp: string
  type: 'MESSAGE' | 'JOIN' | 'LEAVE' | 'SYSTEM'
}

export interface ChatRoom {
  id: number
  name: string
  participantCount: number
  lastMessage?: ChatMessage
}

export interface SendMessageRequest {
  content: string
  userId: number
}

// STOMP connection states
export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface ChatState {
  messages: ChatMessage[]
  participants: string[]
  connectionState: ConnectionState
  isTyping: boolean
}
