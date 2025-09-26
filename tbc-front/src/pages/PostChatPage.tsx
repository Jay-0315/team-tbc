import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChatRoom } from '@/components/ChatRoom'
import { usePost } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'

export default function PostChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const postId = id ? parseInt(id, 10) : 0
  
  const { data: post, isLoading, error } = usePost(postId)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">게시글을 불러오는 중...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">
              게시글을 찾을 수 없습니다: {error?.message}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {post.title} - 채팅
            </h1>
            <p className="text-sm text-gray-600">
              게시글 ID: {postId} | 사용자: {user.nickname}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/posts/${postId}`)}
          >
            게시글 보기
          </Button>
        </div>

        {/* Chat Room */}
        <div className="h-[calc(100vh-200px)]">
          <ChatRoom 
            roomId={postId} 
            userId={user.id}
            roomName={post.title}
          />
        </div>
      </div>
    </div>
  )
}
