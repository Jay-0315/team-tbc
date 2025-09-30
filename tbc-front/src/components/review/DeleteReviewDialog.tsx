import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDeleteReview } from '@/features/events/api/useReviewEdit'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import type { ReviewDTO } from '@/types/review'

interface DeleteReviewDialogProps {
  eventId: number
  review: ReviewDTO
  children: React.ReactNode
}

export function DeleteReviewDialog({ eventId, review, children }: DeleteReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteReview = useDeleteReview()

  const handleDelete = () => {
    deleteReview.mutate(
      { eventId, reviewId: review.id },
      {
        onSuccess: () => {
          toast.success('댓글이 성공적으로 삭제되었습니다.')
          setOpen(false)
        },
        onError: (error) => {
          toast.error(`댓글 삭제에 실패했습니다: ${error.message}`)
        },
      }
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white border-2 border-gray-300 shadow-2xl backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            댓글 삭제
          </AlertDialogTitle>
          <AlertDialogDescription>
            정말로 이 댓글을 삭제하시겠습니까?
            <br />
            <span className="text-red-600 font-medium">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteReview.isPending}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteReview.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteReview.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            삭제하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
