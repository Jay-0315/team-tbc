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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateEvent } from '@/features/events/api/useEventEdit'
import { toast } from 'sonner'
import { Edit, Loader2 } from 'lucide-react'
import type { EventDetailDTO } from '@/features/events/types'

const editEventSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  capacity: z.number().min(1, '최소 1명 이상').max(100, '최대 100명까지'),
  eventDate: z.string().min(1, '날짜를 선택해주세요'),
  eventTime: z.string().min(1, '시간을 선택해주세요'),
  location: z.string().min(1, '장소를 입력해주세요').max(200, '장소는 200자 이하로 입력해주세요'),
  description: z.string().max(2000, '설명은 2000자 이하로 입력해주세요').optional(),
  feeType: z.string().optional(),
  feeAmount: z.number().min(0).optional(),
  feeInfo: z.string().max(200, '참가비 정보는 200자 이하로 입력해주세요').optional(),
})

type EditEventFormData = z.infer<typeof editEventSchema>

interface EditEventDialogProps {
  event: EventDetailDTO
  children: React.ReactNode
}

export function EditEventDialog({ event, children }: EditEventDialogProps) {
  const [open, setOpen] = useState(false)
  const updateEvent = useUpdateEvent()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event.title,
      category: event.category,
      capacity: event.capacity,
      eventDate: event.eventDate || '',
      eventTime: event.eventTime || '',
      location: event.location,
      description: event.description || '',
      feeType: event.feeType || 'FREE',
      feeAmount: event.feeAmount || 0,
      feeInfo: event.feeInfo || '',
    },
  })

  const feeType = watch('feeType')

  const onSubmit = (data: EditEventFormData) => {
    updateEvent.mutate(
      { eventId: event.id, data },
      {
        onSuccess: () => {
          toast.success('모임이 성공적으로 수정되었습니다!')
          setOpen(false)
          reset()
        },
        onError: (error) => {
          toast.error(`모임 수정에 실패했습니다: ${error.message}`)
        },
      }
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!updateEvent.isPending) {
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            모임 수정
          </DialogTitle>
          <DialogDescription>
            모임 정보를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="모임 제목을 입력하세요"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-red-600" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETC">기타</SelectItem>
                <SelectItem value="GAME">게임</SelectItem>
                <SelectItem value="FOOD">음식</SelectItem>
                <SelectItem value="STUDY">스터디</SelectItem>
                <SelectItem value="SPORTS">스포츠</SelectItem>
                <SelectItem value="CULTURE">문화</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600" role="alert">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* 최대 참가자 수 */}
          <div className="space-y-2">
            <Label htmlFor="capacity">최대 참가자 수 *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="100"
              {...register('capacity', { valueAsNumber: true })}
              placeholder="최대 참가자 수를 입력하세요"
              aria-invalid={!!errors.capacity}
            />
            {errors.capacity && (
              <p className="text-sm text-red-600" role="alert">
                {errors.capacity.message}
              </p>
            )}
          </div>

          {/* 날짜와 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">날짜 *</Label>
              <Input
                id="eventDate"
                type="date"
                {...register('eventDate')}
                aria-invalid={!!errors.eventDate}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.eventDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">시간 *</Label>
              <Input
                id="eventTime"
                type="time"
                {...register('eventTime')}
                aria-invalid={!!errors.eventTime}
              />
              {errors.eventTime && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.eventTime.message}
                </p>
              )}
            </div>
          </div>

          {/* 장소 */}
          <div className="space-y-2">
            <Label htmlFor="location">장소 *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="모임 장소를 입력하세요"
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="text-sm text-red-600" role="alert">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="모임에 대한 자세한 설명을 입력하세요"
              rows={4}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 참가비 타입 */}
          <div className="space-y-2">
            <Label htmlFor="feeType">참가비 타입</Label>
            <Select
              value={feeType}
              onValueChange={(value) => setValue('feeType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="참가비 타입을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">무료</SelectItem>
                <SelectItem value="PAID">유료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 참가비 금액 (유료인 경우만) */}
          {feeType === 'PAID' && (
            <div className="space-y-2">
              <Label htmlFor="feeAmount">참가비 금액 (팝콘)</Label>
              <Input
                id="feeAmount"
                type="number"
                min="0"
                {...register('feeAmount', { valueAsNumber: true })}
                placeholder="참가비 금액을 입력하세요"
                aria-invalid={!!errors.feeAmount}
              />
              {errors.feeAmount && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.feeAmount.message}
                </p>
              )}
            </div>
          )}

          {/* 참가비 정보 */}
          <div className="space-y-2">
            <Label htmlFor="feeInfo">참가비 정보</Label>
            <Input
              id="feeInfo"
              {...register('feeInfo')}
              placeholder="참가비에 대한 추가 정보를 입력하세요"
              aria-invalid={!!errors.feeInfo}
            />
            {errors.feeInfo && (
              <p className="text-sm text-red-600" role="alert">
                {errors.feeInfo.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateEvent.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={updateEvent.isPending}>
              {updateEvent.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              수정하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
