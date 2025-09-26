import { MapPin, Clock, Ticket } from 'lucide-react'
import type { EventCardDTO, EventStatus } from '../../features/events/types'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'

interface EventCardProps {
  event: EventCardDTO
}

function statusBadge(status: EventStatus, remainingSeats: number): { label: string; color: string } {
  if (status === 'CLOSED') return { label: '마감 완료', color: 'bg-gray-700' }
  if (status === 'OPEN') {
    if (remainingSeats <= 0) return { label: '대기 가능', color: 'bg-yellow-600' }
    if (remainingSeats === 1) return { label: '1자리 남음', color: 'bg-red-600' }
    if (remainingSeats <= 5) return { label: '마감 임박', color: 'bg-orange-600' }
    return { label: '신청 가능', color: 'bg-emerald-600' }
  }
  if (status === 'WAITLIST') return { label: '대기 가능', color: 'bg-yellow-600' }
  return { label: '오픈 예정', color: 'bg-blue-600' }
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate()
  const badge = useMemo(() => statusBadge(event.status, event.remainingSeats), [event])

  return (
    <div
      role="article"
      aria-label={`이벤트 카드: ${event.title}`}
      className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-2xl dark:hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={event.coverUrl}
          alt={`${event.title} 표지 이미지`}
          className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <span
          className={`absolute left-3 top-3 px-3 py-1.5 text-xs font-bold text-white rounded-full shadow-lg backdrop-blur-sm ${badge.color}`}
          aria-label={`상태 배지: ${badge.label}`}
        >
          {badge.label}
        </span>
        <div className="absolute right-3 top-3">
          <FavoriteButton eventId={event.id} initialFavorited={false} size={24} />
        </div>
      </div>
      <button
        className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
        onClick={() => navigate(`/event/${event.id}`)}
        aria-label={`${event.title} 상세 보기`}
      >
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-600 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
            {event.category}
          </span>
        </div>
        <h3 className="text-lg font-bold line-clamp-2 text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <span className="font-medium">{new Date(event.startAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <span className="truncate font-medium" title={event.location}>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <span className="font-medium">
              {event.remainingSeats}
              {typeof event.capacity === 'number' ? ` / ${event.capacity}` : ' 자리 남음'}
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}


