<<<<<<< HEAD
import { useState } from 'react'
import { ChatRoomModal } from './ChatRoomModal'

export function FloatingChatButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center"
        aria-label="채팅방 목록 열기"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </button>
      
      <ChatRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
=======
import { MessageCircle } from 'lucide-react'

interface FloatingChatButtonProps {
  onOpenChat: () => void
}

export function FloatingChatButton({ onOpenChat }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onOpenChat}
      className="fixed bottom-6 right-6 w-14 h-14 bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:bg-gray-50 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 z-40 flex items-center justify-center"
      aria-label="채팅방 목록 열기"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
>>>>>>> origin/dev
  )
}
