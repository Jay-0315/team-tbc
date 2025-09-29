import { Button } from '@/components/ui/button'
import { CalendarIcon, MapPin, MessageSquare, Pencil } from 'lucide-react'
import type { GroupHistory as GroupHistoryItem } from '@/hooks/useGroupHistory'

export function GroupHistoryCard({ group }: { group: GroupHistoryItem }) {
  const isEnded = group.status === 'ENDED'
  const isOngoing = group.status === 'ONGOING'
  const isClosingSoon = group.status === 'CLOSING_SOON'
  const isFull = group.status === 'FULL'

  const date = group.startAt ? new Date(group.startAt) : null
  const dateStr = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
      ).padStart(2, '0')}`
    : '일정 미정'
  const timeStr = date
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : ''

  const capacityStr = `${group.joined}/${group.capacity}`

  const onOpenChat = () => {
    window.location.href = `/groups/chat?groupId=${group.id}`
  }

  const onWriteReview = () => {
    window.location.href = `/events/${group.id}`
  }

  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 flex flex-col gap-3"
      aria-label={`모임 카드 ${group.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{group.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {group.category && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs">
                {group.category}
              </span>
            )}
            {group.role === 'HOST' && (
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 text-xs">
                주최자
              </span>
            )}
            {isClosingSoon && (
              <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 text-xs">
                모집 마감 임박
              </span>
            )}
            {isFull && (
              <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 text-xs">
                정원 마감
              </span>
            )}
            {isEnded && (
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 text-xs">
                종료됨
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{capacityStr}</div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" aria-hidden="true" />
          <span aria-label="일시">{dateStr}{timeStr ? ` · ${timeStr}` : ''}</span>
        </div>
        {group.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span aria-label="장소">{group.location}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        {isOngoing && (
          <Button
            aria-label="채팅방 열기"
            onClick={onOpenChat}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" /> 채팅방 열기
          </Button>
        )}
        {isEnded && (
          <Button
            variant="secondary"
            aria-label="후기 작성"
            onClick={onWriteReview}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" /> 후기 작성
          </Button>
        )}
        {!isOngoing && !isEnded && (
          <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
            모집중
          </span>
        )}
      </div>
    </div>
  )
}
