import { useState, useMemo } from 'react'
import { useMyGroups } from '@/hooks/useMyGroups'
import { ChatRoom } from '@/components/ChatRoom'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadCounts } from '@/features/chat/api/useUnreadCounts'
import { useLatestMessages } from '@/features/chat/api/useLatestMessages'
import { useHostProfiles } from '@/features/chat/api/useHostProfiles'
import { MessageCircle } from 'lucide-react'

interface ChatRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatRoomModal({ isOpen, onClose }: ChatRoomModalProps) {
  const { user } = useAuth()
  const { data: groups, isLoading, error } = useMyGroups(0, 20)
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null)
  
  // ✅ 모든 그룹의 안읽은 메시지 수 조회
  const roomIds = useMemo(() => groups?.content.map(g => g.id) ?? [], [groups])
  const { unreadCountsMap } = useUnreadCounts(roomIds)
  
  // ✅ 모든 그룹의 최신 메시지 조회
  const { latestMessagesMap } = useLatestMessages(roomIds)
  
  // ✅ 모든 그룹 호스트의 프로필 조회
  const hostIds = useMemo(() => groups?.content.map(g => g.hostId) ?? [], [groups])
  const { hostProfilesMap } = useHostProfiles(hostIds)

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
      {/* 닫기 버튼 - 반투명 동그라미 */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg"
        aria-label="닫기"
      >
        ✕
      </button>
      
      <div className="w-full max-w-6xl h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row">
        {/* 좌측: 모임 목록 */}
        <div className="w-full md:w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gradient-to-b from-orange-50/50 to-white">
          {/* 목록 헤더 */}
          <div className="px-5 py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white border-b border-orange-500 h-[57px] flex items-center">
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
              groups?.content.map((group) => {
                // ✅ 모임 상태 판단
                const isActive = (() => {
                  if (group.status === 'CLOSED') return false
                  if (group.eventDate) {
                    const eventDate = new Date(group.eventDate)
                    const now = new Date()
                    return eventDate >= now
                  }
                  if (group.startAt) {
                    const startDate = new Date(group.startAt)
                    const now = new Date()
                    return startDate >= now
                  }
                  return true // 날짜 정보 없으면 기본적으로 활성
                })()
                
                const unreadCount = unreadCountsMap.get(group.id) ?? 0
                
                return (
                  <button
                    key={group.id}
                    onClick={() => handleJoinChat(group.id)}
                    className={`relative w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      activeRoomId === group.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-600 text-white shadow-md'
                        : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm hover:bg-orange-50/50'
                    }`}
                  >
                    {/* 제목과 태그를 같은 줄에 */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-bold line-clamp-1 flex-1 min-w-0 ${
                        activeRoomId === group.id ? 'text-white' : 'text-gray-800'
                      }`}>
                        {group.title}
                      </h3>
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                        activeRoomId === group.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isActive ? '개설중' : '종료됨'}
                      </span>
                    </div>
                    
                    {/* 최신 메시지와 안읽은 메시지 배지를 같은 줄에 */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {(() => {
                        const latestMessage = latestMessagesMap.get(group.id)
                        const messageText = latestMessage 
                          ? latestMessage.content 
                          : '메시지가 없습니다'
                        
                        return (
                          <p className={`text-xs line-clamp-1 flex-1 ${
                            activeRoomId === group.id ? 'text-orange-50' : 'text-gray-600'
                          }`}>
                            {messageText}
                          </p>
                        )
                      })()}
                      
                      {/* 안읽은 메시지 배지 (주황색) */}
                      {unreadCount > 0 && activeRoomId !== group.id && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md flex-shrink-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* 호스트 프로필 정보 */}
                    {(() => {
                      const hostProfile = hostProfilesMap.get(group.hostId)
                      if (!hostProfile) return null
                      
                      return (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                          {/* 프로필 사진 */}
                          <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                            {hostProfile.profileImageUrl ? (
                              <img 
                                src={hostProfile.profileImageUrl} 
                                alt={hostProfile.displayName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(hostProfile.displayName)}&background=FF6B35&color=fff&size=24`
                                }}
                              />
                            ) : (
                              <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(hostProfile.displayName)}&background=FF6B35&color=fff&size=24`}
                                alt={hostProfile.displayName}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          {/* 호스트 이름 */}
                          <span className={`text-[11px] font-medium flex-1 truncate ${
                            activeRoomId === group.id ? 'text-orange-100' : 'text-gray-700'
                          }`}>
                            호스트: {hostProfile.displayName}
                          </span>
                          
                          {/* 온라인 상태 */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${
                              hostProfile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className={`text-[10px] font-medium ${
                              activeRoomId === group.id 
                                ? 'text-orange-100' 
                                : hostProfile.isOnline ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {hostProfile.isOnline ? '온라인' : '오프라인'}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* 우측: 채팅 영역 */}
        <div className="flex-1 flex flex-col bg-white relative">
          {activeRoomId && user ? (
            <div className="h-full">
              <ChatRoom roomId={activeRoomId} userId={user.id} embedded onClose={onClose} />
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
