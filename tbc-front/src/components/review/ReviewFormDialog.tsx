import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCreateReview } from '@/features/events/api/useCreateReview'
import { useAuth } from '@/hooks/useAuth'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'
import { toast } from 'sonner'

interface ReviewFormDialogProps {
  eventId: number
  children: React.ReactNode
}

export function ReviewFormDialog({ eventId, children }: ReviewFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  
  const { user } = useAuth()
  const createReview = useCreateReview(eventId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error('댓글을 입력해주세요.')
      return
    }
    if (comment.length > 500) {
      toast.error('댓글은 500자 이하로 작성해주세요.')
      return
    }
    createReview.mutate(
      { rating, comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success('리뷰가 성공적으로 작성되었습니다!')
          setComment('')
          setRating(5)
          setOpen(false)
        },
        onError: (error) => {
          toast.error(`리뷰 작성에 실패했습니다: ${error.message}`)
        }
      }
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!createReview.isPending) {
      // 로그인하지 않은 사용자가 리뷰 작성 버튼을 클릭한 경우
      if (newOpen && !user) {
        setAuthModalOpen(true)
        toast.info('리뷰를 작성하려면 로그인이 필요합니다.')
        return
      }
      
      setOpen(newOpen)
      if (!newOpen) {
        setComment('')
        setRating(5)
      }
    }
  }

  const handleClose = () => {
    if (!createReview.isPending) {
      setOpen(false)
      setComment('')
      setRating(5)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-md bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border-2 border-zinc-300 dark:border-zinc-600 shadow-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* 우측 상단 닫기 버튼 - 반투명 동그라미 */}
          <button
            onClick={handleClose}
            disabled={createReview.isPending}
            className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="닫기"
          >
            ✕
          </button>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              후기 작성
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-300">
              모임에 대한 솔직한 후기를 남겨주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 평점 선택 */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">평점을 선택해주세요</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded transition-colors ${
                      star <= rating
                        ? 'text-yellow-500'
                        : 'text-zinc-400 hover:text-yellow-400'
                    }`}
                    aria-label={`${star}점 선택`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= rating ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {rating}점
                </span>
              </div>
            </div>

            {/* 댓글 입력 */}
            <div className="space-y-2">
              <label 
                htmlFor="review-comment" 
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                후기 내용
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="모임에 대한 솔직한 후기를 작성해주세요..."
                className="min-h-[120px] resize-none bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400"
                maxLength={500}
                required
              />
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>최대 500자</span>
                <span className={comment.length > 450 ? 'text-orange-500 font-medium' : ''}>
                  {comment.length}/500
                </span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createReview.isPending}
                className="border-2 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createReview.isPending || !comment.trim()}
                aria-busy={createReview.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold shadow-lg"
              >
                {createReview.isPending ? '작성 중...' : '후기 작성'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* 로그인 모달 */}
      <UnifiedAuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  )
}
