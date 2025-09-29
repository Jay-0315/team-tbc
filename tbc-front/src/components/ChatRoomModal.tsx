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
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl md:max-w-4xl h-[80vh] md:h-[75vh] overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-zinc-200">
          <h2 className="text-base font-semibold text-zinc-900">
            {activeRoomId ? '채팅' : '내가 참가한 소셜링'}
          </h2>
          <div className="flex gap-2 items-center">
            {activeRoomId && (
              <Button variant="secondary" onClick={handleBackToList} className="px-3 h-8 text-zinc-700">
                목록으로
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" className="px-3 h-8 text-zinc-500 hover:text-zinc-900">
              ✕
            </Button>
          </div>
        </div>

        <div className="h-[calc(100%-40px)]">
          {activeRoomId && user ? (
            <div className="h-full">
              <ChatRoom roomId={activeRoomId} userId={user.id} embedded />
            </div>
          ) : (
            <div className="overflow-y-auto p-4 h-full bg-zinc-50">
              {isLoading ? (
                <div className="py-10 text-center text-zinc-500">로딩 중...</div>
              ) : error ? (
                <div className="py-10 text-center text-red-600">오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>
              ) : groups?.content.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mb-3 text-zinc-600">참가한 소셜링이 없습니다</div>
                  <div className="text-sm text-zinc-500">소셜링에 참가하면 여기서 채팅할 수 있습니다</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {groups?.content.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 bg-white rounded-xl border transition-shadow border-zinc-200 hover:shadow"
                    >
                      <h3 className="mb-1 text-sm font-semibold text-zinc-900 line-clamp-1">{group.title}</h3>
                      <p className="mb-2 text-xs text-zinc-600 line-clamp-2">{group.topic}</p>
                      <div className="mb-2 flex items-center gap-1 text-[10px] text-zinc-600">
                        <span className="rounded border border-zinc-300 px-1.5 py-0.5">{group.category}</span>
                        <span className="rounded border border-zinc-300 px-1.5 py-0.5">{group.mode}</span>
                        <span className="rounded border border-zinc-300 px-1.5 py-0.5">{group.feeType === 'FREE' ? '무료' : `${group.feeAmount}원`}</span>
                      </div>
                      <div className="mb-3 text-[10px] text-zinc-500">
                        {group.minParticipants}~{group.maxParticipants}명
                      </div>
                      <Button onClick={() => handleJoinChat(group.id)} className="w-full h-9 text-sm text-white bg-blue-600 hover:bg-blue-700">
                        채팅 참여하기
                      </Button>
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
