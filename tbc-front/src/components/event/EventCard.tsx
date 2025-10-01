import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock } from 'lucide-react'
import type { EventCardDTO } from '../../features/events/types'
import { useAuth } from '../../hooks/useAuth'
import { useParticipants } from '../../features/events/api/useParticipants'

// 카테고리 한글 이름 매핑
const CATEGORY_NAME_MAP: Record<string, string> = {
  ETC: '기타',
  GAME: '게임',
  FOOD: '음식',
  STUDY: '스터디',
  SPORTS: '스포츠',
  CULTURE: '문화',
}

interface EventCardProps {
  event: EventCardDTO
  onLoginRequired?: () => void
}

export default function EventCard({ event, onLoginRequired }: EventCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  // ✅ 실시간 참가인원 수 조회
  const { data: participants = [] } = useParticipants(event.id)
  const currentJoined = participants.length || event.joined || 0

  // 날짜와 시간 포맷팅
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return ''
    return timeStr
  }

  const handleCardClick = () => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired()
      }
      return
    }
    navigate(`/events/${event.id}`)
  }

  return (
    <div
      role="article"
      aria-label={`이벤트 카드: ${event.title}`}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 썸네일 */}
    <div className="relative h-48 overflow-hidden bg-gray-100">
      {event.imagePath ? (
        <img
          src={`http://localhost:8080/img/${event.imagePath.split('/').pop()}`}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-gray-100"><span class="text-gray-400">No Image</span></div>'
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <span className="text-gray-400">No Image</span>
        </div>
      )}

        {/* 좌측 상단: 카테고리 태그 */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-black/80 text-white text-xs font-medium rounded-full text-center min-w-[50px]">
            {CATEGORY_NAME_MAP[event.category] || event.category}
          </span>
        </div>

        {/* 좌측 하단: 팝콘 태그 */}
        {event.feeType === 'PAID' && event.feeAmount && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center justify-center px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full text-center min-w-[50px]">
              🍿 {event.feeAmount}P
            </span>
          </div>
        )}

        {/* 우측 상단: 참가인원수 (실시간) */}
        <div className="absolute top-3 right-3">
          <div className="inline-flex items-center justify-center bg-black/80 text-white px-2.5 py-1 rounded-full text-xs font-medium text-center min-w-[50px]">
            {currentJoined}/{event.capacity}명
          </div>
        </div>

      </div>

      {/* 카드 내용 */}
      <div className="p-4">
        {/* 제목 */}
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-orange-500 transition-colors">
          {event.title}
        </h3>

        {/* 모임 장소 + 모임 일시 */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{formatDate(event.eventDate || event.startAt)}</span>
            {event.eventTime && (
              <>
                <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 ml-1" />
                <span>{formatTime(event.eventTime)}</span>
              </>
            )}
          </div>
        </div>

        {/* 우측 하단: 작성자 */}
        <div className="flex items-center justify-end gap-2">
          <img
            src={event.hostProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.hostNickname || 'Host')}&background=orange&color=white&size=24`}
            alt={event.hostNickname || 'Host'}
            className="w-6 h-6 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=Host&background=orange&color=white&size=24`
            }}
          />
          <span className="text-xs text-gray-600 font-medium">
            {event.hostNickname || '익명'}
          </span>
        </div>
      </div>
    </div>
  )
}