import { useState } from 'react'
import { useMyGroups } from '@/hooks/useMyGroups'
import { Button } from '@/components/ui/button'
import { ChatRoom } from '@/components/ChatRoom'
import { useAuth } from '@/hooks/useAuth'

interface ChatRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatRoomModal({ isOpen, onClose }: ChatRoomModalProps) {
  const { user } = useAuth()
  const { data: groups, isLoading, error } = useMyGroups(0, 20)
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null)

  if (!isOpen) return null

  const handleJoinChat = (groupId: number) => {
    setActiveRoomId(groupId)
  }

  const handleBackToList = () => {
    setActiveRoomId(null)
  }

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl md:max-w-4xl h-[80vh] md:h-[75vh] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            {activeRoomId ? '💬 채팅' : '💬 내가 참가한 소셜링'}
          </h2>
          <div className="flex gap-2 items-center">
            {activeRoomId && (
              <button 
                onClick={handleBackToList} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                목록으로
              </button>
            )}
            <button 
              onClick={onClose} 
              className="px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-40px)]">
          {activeRoomId && user ? (
            <div className="h-full">
              <ChatRoom roomId={activeRoomId} userId={user.id} embedded />
            </div>
          ) : (
            <div className="overflow-y-auto p-6 h-full bg-gray-50">
              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center gap-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    로딩 중...
                  </div>
                </div>
              ) : error ? (
                <div className="py-16 text-center text-red-600">
                  <p className="mb-2 font-semibold">오류가 발생했습니다</p>
                  <p className="text-sm">잠시 후 다시 시도해주세요.</p>
                </div>
              ) : groups?.content.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mb-3 text-gray-600 font-medium">참가한 소셜링이 없습니다</div>
                  <div className="text-sm text-gray-500">소셜링에 참가하면 여기서 채팅할 수 있습니다</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {groups?.content.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                    >
                      <h3 className="mb-2 text-base font-bold text-gray-800 line-clamp-1">{group.title}</h3>
                      <p className="mb-3 text-sm text-gray-600 line-clamp-2">{group.topic}</p>
                      <div className="mb-3 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">{group.category}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">{group.mode}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">{group.feeType === 'FREE' ? '무료' : `${group.feeAmount}원`}</span>
                      </div>
                      <div className="mb-3 text-xs text-gray-500">
                        👥 {group.minParticipants}~{group.maxParticipants}명
                      </div>
                      <button 
                        onClick={() => handleJoinChat(group.id)} 
                        className="w-full py-2 px-4 text-sm font-medium text-gray-800 bg-[#F5E6B3] rounded-lg hover:bg-[#E8D89C] transition-colors"
                      >
                        채팅 참여하기
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
