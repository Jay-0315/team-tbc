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
import { useDeleteEvent } from '@/features/events/api/useEventEdit'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { EventDetailDTO } from '@/features/events/types'

interface DeleteEventDialogProps {
  event: EventDetailDTO
  children: React.ReactNode
}

export function DeleteEventDialog({ event, children }: DeleteEventDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteEvent = useDeleteEvent()
  const navigate = useNavigate()

  const handleDelete = () => {
    deleteEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success('모임이 성공적으로 삭제되었습니다.')
        setOpen(false)
        navigate('/') // 홈페이지로 이동
      },
      onError: (error) => {
        toast.error(`모임 삭제에 실패했습니다: ${error.message}`)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent 
        className="bg-white border-2 border-gray-300 shadow-2xl backdrop-blur-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* 우측 상단 닫기 버튼 - 반투명 동그라미 */}
        <button
          onClick={() => setOpen(false)}
          disabled={deleteEvent.isPending}
          className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="닫기"
        >
          ✕
        </button>
        
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            모임 삭제
          </AlertDialogTitle>
          <AlertDialogDescription>
            정말로 "{event.title}" 모임을 삭제하시겠습니까?
            <br />
            <span className="text-red-600 font-medium">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteEvent.isPending}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteEvent.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteEvent.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            삭제하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
