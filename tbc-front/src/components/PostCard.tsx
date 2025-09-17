import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { EventCardDTO, Post } from '@/types/post'

interface PostCardProps {
  post: EventCardDTO | Post
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if it's an EventCardDTO or Post
  const isEvent = 'host' in post && 'startDate' in post

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.imageUrl && (
        <div className="aspect-video bg-gray-200">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {post.title}
          </h3>
          {isEvent && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              post.status === 'OPEN' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {post.status === 'OPEN' ? '모집중' : '마감'}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {isEvent ? post.description : post.content}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>
            {isEvent ? `주최: ${post.host.nickname}` : `작성자: ${post.author.nickname}`}
          </span>
          <span>
            {isEvent ? formatDate(post.startDate) : formatDate(post.createdAt)}
          </span>
        </div>
        
        {isEvent && (
          <>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>📍 {post.location}</span>
              <span>
                {post.currentParticipants}/{post.maxParticipants}명
              </span>
            </div>
            
            {post.reviewCount && post.reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm text-gray-600">
                  {post.averageRating?.toFixed(1)} ({post.reviewCount}개 리뷰)
                </span>
              </div>
            )}
          </>
        )}
        
        <div className="flex gap-2">
          <Link to={`/posts/${post.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              자세히 보기
            </Button>
          </Link>
          <Link to={`/posts/${post.id}/chat`} className="flex-1">
            <Button className="w-full">
              채팅 참여
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
