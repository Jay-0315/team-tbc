import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ConnectionState, ChatMessage } from '@/types/chat'

class StompClientManager {
  private client: Client | null = null
  private connectionState: ConnectionState = 'DISCONNECTED'
  private listeners: Map<string, (message: ChatMessage) => void> = new Map()
  private stateListeners: ((state: ConnectionState) => void)[] = []
  private pending: Array<() => void> = []
  private currentRoomId: number | null = null

  constructor() {
    this.setupClient()
  }

  private setupClient() {
    // SockJS 연결은 항상 상대경로 '/ws' 사용 (vite proxy가 백엔드로 포워딩)
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
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
      const toRun = [...this.pending]
      this.pending = []
      toRun.forEach(fn => { try { fn() } catch (e) { console.error(e) } })
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

  /**
   * Connect to STOMP server with a JWT token and room ID.
   * Note: SockJS's initial /ws/info XHR cannot include Authorization headers,
   * so backend must permit /ws/info (handled in SecurityConfig). Actual auth
   * should be performed on CONNECT frame using the header below.
   */
  connect(token: string, roomId: number) {
    if (!this.client) {
      this.setupClient()
    }

    if (this.connectionState === 'CONNECTING' || this.connectionState === 'CONNECTED') {
      return
    }

    this.currentRoomId = roomId
    this.connectionState = 'CONNECTING'
    this.notifyStateListeners()

    if (this.client) {
      // Put token into STOMP CONNECT headers
      // Backend should validate token from CONNECT headers (or query param if implemented)
      this.client.connectHeaders = {
        Authorization: `Bearer ${token}`,
      }

      // Activate (will trigger SockJS /ws/info XHR first; that endpoint must be permitted by server)
      this.client.activate()
    }
  }

  disconnect() {
    if (this.client && this.connectionState === 'CONNECTED') {
      this.client.deactivate()
      this.connectionState = 'DISCONNECTED'
      this.currentRoomId = null
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
    const publish = () => {
      if (!this.client) return
      const destination = `/app/rooms/${roomId}/send`
      const message = { content, userId, timestamp: new Date().toISOString(), type: 'CHAT' }
      this.client.publish({ destination, body: JSON.stringify(message) })
    }

    if (!this.client || this.connectionState !== 'CONNECTED') {
      console.warn('STOMP client not connected yet; queuing message')
      this.pending.push(publish)
      return
    }
    publish()
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
    this.stateListeners.forEach((callback) => callback(this.connectionState))
  }

  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  getCurrentRoomId(): number | null {
    return this.currentRoomId
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
