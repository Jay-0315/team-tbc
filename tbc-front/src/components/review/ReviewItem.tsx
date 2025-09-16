import { Star } from 'lucide-react'
import type { ReviewDTO } from '@/types/review'

interface ReviewItemProps {
  review: ReviewDTO
}

export function ReviewItem({ review }: ReviewItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return '오늘'
    } else if (diffInDays === 1) {
      return '어제'
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* 헤더: 평점, 작성자, 날짜 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 별점 시각화 */}
          <div className="flex items-center gap-1" role="img" aria-label={`별점 ${review.rating}점`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                aria-hidden="true"
              />
            ))}
            <span className="ml-1 text-sm font-medium text-gray-700">
              {review.rating}점
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>익명#{review.userId}</span>
          <span>•</span>
          <time dateTime={review.createdAt}>
            {formatDate(review.createdAt)}
          </time>
        </div>
      </div>

      {/* 댓글 내용 */}
      <div className="text-gray-800 leading-relaxed">
        {review.comment}
      </div>
    </div>
  )
}
