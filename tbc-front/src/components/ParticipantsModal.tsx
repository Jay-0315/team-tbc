import { X } from 'lucide-react'
import type { ParticipantInfo } from '@/features/chat/api/useParticipants'

interface ParticipantsModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
  participants: ParticipantInfo[]
  onlineUsers: Set<number>
}

export function ParticipantsModal({
  isOpen,
  onClose,
  participants,
  onlineUsers
}: ParticipantsModalProps) {
  if (!isOpen) return null

  // 온라인 상태별 정렬: ONLINE > AWAY > OFFLINE
  const sortedParticipants = [...participants].sort((a, b) => {
    const statusOrder = { ONLINE: 0, AWAY: 1, OFFLINE: 2 }
    const aOrder = statusOrder[a.presenceStatus as keyof typeof statusOrder] ?? 3
    const bOrder = statusOrder[b.presenceStatus as keyof typeof statusOrder] ?? 3
    if (aOrder !== bOrder) return aOrder - bOrder
    
    // 같은 상태면 HOST 우선
    if (a.role === 'HOST' && b.role !== 'HOST') return -1
    if (a.role !== 'HOST' && b.role === 'HOST') return 1
    return 0
  })

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500'
      case 'AWAY':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getPresenceText = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return '온라인'
      case 'AWAY':
        return '자리 비움'
      default:
        return '오프라인'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            참여자 목록 ({participants.length}명)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 참여자 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedParticipants.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              참여자가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {sortedParticipants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {/* 프로필 이미지 */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={participant.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.displayName)}&background=FF6B35&color=fff&size=40`}
                      alt={participant.displayName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.displayName)}&background=FF6B35&color=fff&size=40`
                      }}
                    />
                    {/* 온라인 상태 표시 */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getPresenceColor(participant.presenceStatus)}`}
                      title={getPresenceText(participant.presenceStatus)}
                    />
                  </div>

                  {/* 사용자 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">
                        {participant.displayName}
                      </span>
                      {participant.role === 'HOST' && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          호스트
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs font-medium ${
                        participant.presenceStatus === 'ONLINE' ? 'text-green-600' :
                        participant.presenceStatus === 'AWAY' ? 'text-yellow-600' :
                        'text-gray-500'
                      }`}>
                        {getPresenceText(participant.presenceStatus)}
                      </span>
                      {participant.lastSeenAt && participant.presenceStatus !== 'ONLINE' && (
                        <span className="text-xs text-gray-400">
                          · {new Date(participant.lastSeenAt).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">
                  온라인 {participants.filter(p => p.presenceStatus === 'ONLINE').length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-gray-600">
                  자리비움 {participants.filter(p => p.presenceStatus === 'AWAY').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

