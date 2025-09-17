import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePost } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const postId = id ? parseInt(id, 10) : 0
  
  const { data: post, isLoading, error } = usePost(postId)

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

  const handleEnterChat = () => {
    if (!isAuthenticated) {
      toast.error('채팅에 참여하려면 로그인이 필요합니다.')
      return
    }
    navigate(`/posts/${postId}/chat`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link to="/posts">
              <Button variant="outline" size="sm">
                ← 게시글 목록으로
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Post Image */}
            {post.imageUrl && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              {/* Post Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-4">
                    <span>작성자: {post.author.nickname}</span>
                    <span>작성일: {formatDate(post.createdAt)}</span>
                  </div>
                  {post.updatedAt !== post.createdAt && (
                    <span>수정일: {formatDate(post.updatedAt)}</span>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="prose max-w-none mb-8">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleEnterChat}
                  className="flex-1"
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? '채팅 참여하기' : '로그인 후 채팅 참여'}
                </Button>
                
                {/* TODO: Add edit/delete buttons for post author */}
                {isAuthenticated && (
                  <Button variant="outline">
                    즐겨찾기
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section - TODO: Implement comments */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">댓글</h2>
            <div className="text-center text-gray-500 py-8">
              댓글 기능은 곧 구현될 예정입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
