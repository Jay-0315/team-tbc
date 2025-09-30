import { useState } from 'react'
import { ChatRoomModal } from './ChatRoomModal'
import { MessageCircle } from 'lucide-react'

export function FloatingChatButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:bg-gray-50 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 z-40 flex items-center justify-center"
        aria-label="채팅방 목록 열기"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      <ChatRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
