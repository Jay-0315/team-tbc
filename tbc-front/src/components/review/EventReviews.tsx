import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEventReviews } from '@/features/events/api/useEventReviews'
import { ReviewItem } from './ReviewItem'

interface EventReviewsProps {
  eventId: number
}

export function EventReviews({ eventId }: EventReviewsProps) {
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useEventReviews(eventId, 10)

  const reviews = reviewsData?.pages.flatMap(page => page.content) ?? []
  
  // 평균 평점 계산
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">후기</h3>
        </div>
        <div 
          role="status" 
          aria-busy="true"
          className="flex items-center justify-center py-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">후기를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">후기</h3>
        </div>
        <div 
          role="alert"
          className="text-center py-8 border border-red-200 rounded-lg bg-red-50"
        >
          <p className="text-red-600 mb-4">후기를 불러올 수 없습니다.</p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 평균 평점, 개수 요약 */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span>•</span>
          <span>{reviews.length}개</span>
        </div>
      )}

      {/* 빈 상태 */}
      {reviews.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-gray-400">
              <Star className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-600">아직 후기가 없습니다</p>
              <p className="text-sm text-gray-500">
                첫 번째 후기를 작성해보세요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 후기 목록 */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}

          {/* 더 보기 버튼 */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                aria-busy={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    로딩 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
