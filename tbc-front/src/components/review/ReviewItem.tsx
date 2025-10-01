import { Star, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { EditReviewDialog } from './EditReviewDialog'
import { DeleteReviewDialog } from './DeleteReviewDialog'
import type { ReviewDTO } from '@/types/review'

interface ReviewItemProps {
  eventId: number
  review: ReviewDTO
}

export function ReviewItem({ eventId, review }: ReviewItemProps) {
  const { user } = useAuth()
  const isOwner = user && user.id === review.userId
  
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
    <div className="p-4 space-y-3 rounded-lg border">
      {/* 헤더: 평점, 작성자, 날짜, 액션 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {/* 별점 시각화 */}
          <div className="flex gap-1 items-center" role="img" aria-label={`별점 ${review.rating}점`}>
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
        
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-center text-sm text-gray-500">
            <span>
              {user && user.id === review.userId ? user.nickname : `익명#${review.userId}`}
            </span>
            <span>•</span>
            <time dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
          </div>
          
          {/* 본인 댓글인 경우 수정/삭제 버튼 */}
          {isOwner && (
            <div className="flex gap-1 ml-4">
              <EditReviewDialog eventId={eventId} review={review}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                  aria-label="댓글 수정"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </EditReviewDialog>
              
              <DeleteReviewDialog eventId={eventId} review={review}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                  aria-label="댓글 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DeleteReviewDialog>
            </div>
          )}
        </div>
      </div>

      {/* 댓글 내용 */}
      <div className="leading-relaxed text-gray-800">
        {review.comment}
      </div>
    </div>
  )
}
