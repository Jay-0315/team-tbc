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
