import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useUpdateReview } from '@/features/events/api/useReviewEdit'
import { toast } from 'sonner'
import { Edit, Star, Loader2 } from 'lucide-react'
import type { ReviewDTO } from '@/types/review'

const editReviewSchema = z.object({
  rating: z.number().min(1, '평점을 선택해주세요').max(5, '평점은 5점까지'),
  comment: z.string().min(1, '댓글을 입력해주세요').max(500, '댓글은 500자 이하로 입력해주세요'),
})

type EditReviewFormData = z.infer<typeof editReviewSchema>

interface EditReviewDialogProps {
  eventId: number
  review: ReviewDTO
  children: React.ReactNode
}

export function EditReviewDialog({ eventId, review, children }: EditReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const updateReview = useUpdateReview()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditReviewFormData>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: review.rating,
      comment: review.comment,
    },
  })

  const rating = watch('rating')

  const onSubmit = (data: EditReviewFormData) => {
    updateReview.mutate(
      { eventId, reviewId: review.id, data },
      {
        onSuccess: () => {
          toast.success('댓글이 성공적으로 수정되었습니다!')
          setOpen(false)
          reset()
        },
        onError: (error) => {
          toast.error(`댓글 수정에 실패했습니다: ${error.message}`)
        },
      }
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!updateReview.isPending) {
      setOpen(newOpen)
      if (!newOpen) {
        reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <Edit className="w-5 h-5" />
            댓글 수정
          </DialogTitle>
          <DialogDescription>
            댓글을 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 평점 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">평점을 선택해주세요</Label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
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
              <span className="ml-2 text-sm text-zinc-600">
                {rating}점
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600" role="alert">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* 댓글 입력 */}
          <div className="space-y-2">
            <Label htmlFor="comment">댓글 *</Label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="솔직한 후기를 남겨주세요"
              rows={4}
              aria-invalid={!!errors.comment}
            />
            {errors.comment && (
              <p className="text-sm text-red-600" role="alert">
                {errors.comment.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateReview.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={updateReview.isPending}>
              {updateReview.isPending && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              수정하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
