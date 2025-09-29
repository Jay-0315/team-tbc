import type { EventCardDTO } from '../../features/events/types'
import { useNavigate } from 'react-router-dom'

interface EventCardProps {
  event: EventCardDTO
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate()

  return (
    <div
      role="article"
      aria-label={`이벤트 카드: ${event.title}`}
      className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-2xl dark:hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1"
    >
      <button
        className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
        onClick={() => navigate(`/events/${event.id}`)}
        aria-label={`${event.title} 상세 보기`}
      >
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-600 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
            {event.category}
          </span>
        </div>
        <h3 className="text-lg font-bold line-clamp-2 text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{event.topic}</p>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            {event.mode}
          </span>
          <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            {event.feeType === 'FREE' ? '무료' : `${event.feeAmount ?? 0}원`}
          </span>
        </div>
      </button>
    </div>
  )
}


