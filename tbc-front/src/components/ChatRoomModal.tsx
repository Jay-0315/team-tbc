<<<<<<< HEAD
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroups } from '@/hooks/useGroups'
import { Button } from '@/components/ui/button'

interface ChatRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatRoomModal({ isOpen, onClose }: ChatRoomModalProps) {
  const navigate = useNavigate()
  const { data: groups, isLoading, error } = useGroups(0, 20)

  if (!isOpen) return null

  const handleJoinChat = (groupId: number) => {
    navigate(`/groups/${groupId}/chat`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">채팅방 목록</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">로딩 중...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">
              오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </div>
          ) : groups?.content.length === 0 ? (
            <div className="text-center text-gray-400 py-8">채팅방이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups?.content.map((group) => (
                <div
                  key={group.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{group.title}</h3>
                  <p className="text-sm text-gray-300 mb-2">{group.topic}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {group.category}
                    </span>
                    <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                      {group.mode}
                    </span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      {group.feeType === 'FREE' ? '무료' : `${group.feeAmount}원`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    {group.minParticipants}~{group.maxParticipants}명
                  </div>
                  <Button
                    onClick={() => handleJoinChat(group.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    채팅 참여하기
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
=======
import { useState } from 'react'
import { useMyGroups } from '@/hooks/useMyGroups'
import { ChatRoom } from '@/components/ChatRoom'
import { useAuth } from '@/hooks/useAuth'
import { MessageCircle } from 'lucide-react'

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

  return (
    <div 
      className="flex fixed inset-0 z-50 justify-center items-center bg-black/60 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-6xl h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row">
        {/* 좌측: 모임 목록 */}
        <div className="w-full md:w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gradient-to-b from-orange-50/50 to-white">
          {/* 목록 헤더 */}
          <div className="px-5 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b border-orange-600 h-[57px] flex items-center">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h2 className="text-base font-bold">내 소셜링</h2>
              </div>
              <button 
                onClick={onClose}
                className="md:hidden px-2 py-1 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors text-sm"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 목록 내용 */}
          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center gap-2 text-orange-600">
                  <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">로딩 중...</span>
                </div>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="mb-2 font-semibold text-red-600 text-sm">오류가 발생했습니다</p>
                <p className="text-xs text-red-500">잠시 후 다시 시도해주세요.</p>
              </div>
            ) : groups?.content.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-2 text-gray-600 font-medium text-sm">참가한 소셜링이 없습니다</div>
                <div className="text-xs text-gray-500">소셜링에 참가하면<br/>여기서 채팅할 수 있습니다</div>
              </div>
            ) : (
              groups?.content.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleJoinChat(group.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    activeRoomId === group.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-600 text-white shadow-md'
                      : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm hover:bg-orange-50/50'
                  }`}
                >
                  <h3 className={`text-sm font-bold mb-1 line-clamp-1 ${
                    activeRoomId === group.id ? 'text-white' : 'text-gray-800'
                  }`}>
                    {group.title}
                  </h3>
                  <p className={`text-xs mb-2 line-clamp-1 ${
                    activeRoomId === group.id ? 'text-orange-50' : 'text-gray-600'
                  }`}>
                    {group.topic}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md ${
                      activeRoomId === group.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {group.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md ${
                      activeRoomId === group.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      👥 {group.minParticipants}~{group.maxParticipants}명
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 우측: 채팅 영역 */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* 데스크톱 닫기 버튼 */}
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 z-10 px-3 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            aria-label="닫기"
          >
            ✕ 닫기
          </button>

          {activeRoomId && user ? (
            <div className="h-full">
              <ChatRoom roomId={activeRoomId} userId={user.id} embedded />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-50/30 to-white">
              <div className="text-center px-8">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
                  <MessageCircle className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">소셜링을 선택해주세요</h3>
                <p className="text-sm text-gray-600">좌측 목록에서 채팅하고 싶은 소셜링을 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
>>>>>>> origin/dev
