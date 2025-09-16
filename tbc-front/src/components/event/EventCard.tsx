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
      className="group rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-black transition-transform duration-200 will-change-transform hover:scale-[1.01]"
    >
      <div className="relative">
        <img
          src={event.coverUrl}
          alt={`${event.title} 표지 이미지`}
          className="w-full aspect-[16/9] object-cover"
          loading="lazy"
        />
        <span
          className={`absolute left-2 top-2 px-2 py-1 text-xs font-semibold text-white rounded ${badge.color}`}
          aria-label={`상태 배지: ${badge.label}`}
        >
          {badge.label}
        </span>
        <div className="absolute right-2 top-2">
          <FavoriteButton eventId={event.id} initialFavorited={false} size={20} />
        </div>
      </div>
      <button
        className="w-full text-left p-4"
        onClick={() => navigate(`/event/${event.id}`)}
        aria-label={`${event.title} 상세 보기`}
      >
        <div className="mb-1">
          <span className="inline-flex items-center rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-700 bg-white">
            {event.category}
          </span>
        </div>
        <h3 className="text-base font-semibold line-clamp-2">{event.title}</h3>
        <div className="mt-3 flex flex-col gap-1 text-sm text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{new Date(event.startAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="truncate" title={event.location}>{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4" aria-hidden="true" />
            <span>
              {event.remainingSeats}
              {typeof event.capacity === 'number' ? ` / ${event.capacity}` : ' 자리 남음'}
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
