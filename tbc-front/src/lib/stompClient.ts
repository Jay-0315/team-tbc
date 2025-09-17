import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ConnectionState, ChatMessage } from '@/types/chat'

class StompClientManager {
  private client: Client | null = null
  private connectionState: ConnectionState = 'DISCONNECTED'
  private listeners: Map<string, (message: ChatMessage) => void> = new Map()
  private stateListeners: ((state: ConnectionState) => void)[] = []

  constructor() {
    this.setupClient()
  }

  private setupClient() {
    // Create SockJS connection to backend WebSocket endpoint
    // TODO: confirm exact endpoint from backend - using /ws as detected from StompWebSocketConfig
    const socket = new SockJS('/ws')
    
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP Debug:', str)
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    this.client.onConnect = (frame) => {
      console.log('STOMP Connected:', frame)
      this.connectionState = 'CONNECTED'
      this.notifyStateListeners()
    }

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame)
      this.connectionState = 'ERROR'
      this.notifyStateListeners()
    }

    this.client.onWebSocketClose = () => {
      console.log('STOMP WebSocket closed')
      this.connectionState = 'DISCONNECTED'
      this.notifyStateListeners()
    }
  }

  connect(token: string) {
    if (!this.client) {
      this.setupClient()
    }

    if (this.connectionState === 'CONNECTING' || this.connectionState === 'CONNECTED') {
      return
    }

    this.connectionState = 'CONNECTING'
    this.notifyStateListeners()

    // Add JWT token to connection headers
    // TODO: confirm if backend expects Authorization header or token query param
    // Based on JwtRoomHandshakeInterceptor, it supports both Authorization header and ?token= query param
    this.client.connectHeaders = {
      'Authorization': `Bearer ${token}`
    }

    this.client.activate()
  }

  disconnect() {
    if (this.client && this.connectionState === 'CONNECTED') {
      this.client.deactivate()
      this.connectionState = 'DISCONNECTED'
      this.notifyStateListeners()
    }
  }

  subscribeToRoom(roomId: number, callback: (message: ChatMessage) => void) {
    if (!this.client || this.connectionState !== 'CONNECTED') {
      console.error('STOMP client not connected')
      return
    }

    const topic = `/topic/rooms/${roomId}`
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const chatMessage: ChatMessage = JSON.parse(message.body)
        callback(chatMessage)
      } catch (error) {
        console.error('Failed to parse chat message:', error)
      }
    })

    // Store listener for cleanup
    this.listeners.set(topic, callback)

    return subscription
  }

  sendMessage(roomId: number, content: string, userId: number) {
    if (!this.client || this.connectionState !== 'CONNECTED') {
      console.error('STOMP client not connected')
      return
    }

    const destination = `/app/rooms/${roomId}/send`
    const message = {
      content,
      userId,
      timestamp: new Date().toISOString(),
      type: 'MESSAGE'
    }

    this.client.publish({
      destination,
      body: JSON.stringify(message)
    })
  }

  // Subscribe to connection state changes
  onConnectionStateChange(callback: (state: ConnectionState) => void) {
    this.stateListeners.push(callback)
    return () => {
      const index = this.stateListeners.indexOf(callback)
      if (index > -1) {
        this.stateListeners.splice(index, 1)
      }
    }
  }

  private notifyStateListeners() {
    this.stateListeners.forEach(callback => callback(this.connectionState))
  }

  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  cleanup() {
    this.disconnect()
    this.listeners.clear()
    this.stateListeners = []
  }
}

// Singleton instance
export const stompClient = new StompClientManager()
export default stompClient
