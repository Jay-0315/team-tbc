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
import AuthModal from '@/components/AuthModal'
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-md bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              후기 작성
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              모임에 대한 솔직한 후기를 남겨주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 평점 선택 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">평점을 선택해주세요</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded transition-colors ${
                      star <= rating
                        ? 'text-yellow-400'
                        : 'text-zinc-400 hover:text-yellow-300'
                    }`}
                    aria-label={`${star}점 선택`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {rating}점
                </span>
              </div>
            </div>

            {/* 댓글 입력 */}
            <div className="space-y-2">
              <label 
                htmlFor="review-comment" 
                className="text-sm font-medium"
              >
                후기 내용
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="모임에 대한 솔직한 후기를 작성해주세요..."
                className="min-h-[120px] resize-none bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                maxLength={500}
                required
              />
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>최대 500자</span>
                <span className={comment.length > 450 ? 'text-orange-500' : ''}>
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
                className="border-zinc-300 dark:border-zinc-700"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createReview.isPending || !comment.trim()}
                aria-busy={createReview.isPending}
                className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {createReview.isPending ? '작성 중...' : '후기 작성'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* 로그인 모달 */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setAuthModalOpen(false)
          // 로그인 성공 후 리뷰 작성 모달 열기
          setOpen(true)
        }}
      />
    </>
  )
}
