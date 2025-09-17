import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/PostCard'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function PostsPage() {
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated } = useAuth()
  const { data: postsData, isLoading, error } = usePosts(page, 12)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: implement search functionality with backend
    toast.info('검색 기능은 곧 구현될 예정입니다.')
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">
              게시글을 불러오는데 실패했습니다: {error.message}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">모든 게시글</h1>
            <p className="text-gray-600 mt-2">
              {postsData?.totalElements || 0}개의 게시글이 있습니다
            </p>
          </div>
          {isAuthenticated && (
            <Link to="/posts/new">
              <Button>새 게시글 작성</Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="게시글 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" variant="outline">
              검색
            </Button>
          </div>
        </form>

        {/* Posts Grid */}
        {postsData?.content && postsData.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {postsData.content.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {postsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  이전
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  {page + 1} / {postsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(postsData.totalPages - 1, page + 1))}
                  disabled={page >= postsData.totalPages - 1}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">게시글이 없습니다</div>
            {isAuthenticated && (
              <Link to="/posts/new">
                <Button>첫 게시글 작성하기</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
