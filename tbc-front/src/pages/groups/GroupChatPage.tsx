import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChatRoom } from '@/components/ChatRoom'
import { useAuth } from '@/hooks/useAuth'

export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const groupId = id ? parseInt(id, 10) : 0

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen text-white bg-black">
      <div className="container px-4 py-4 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-semibold text-white">
              그룹 채팅
            </h1>
            <p className="text-sm text-gray-300">
              그룹 ID: {groupId} | 사용자: {user.nickname}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-gray-300 border-gray-600 hover:bg-gray-800"
          >
            홈으로
          </Button>
        </div>

        {/* Chat Room */}
        <div className="h-[calc(100vh-200px)]">
          <ChatRoom 
            roomId={groupId} 
            userId={user.id}
            roomName={`그룹 ${groupId}`}
          />
        </div>
      </div>
    </div>
  )
}
