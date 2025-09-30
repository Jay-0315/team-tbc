import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, Calendar, Clock } from 'lucide-react'
import { useState } from 'react'
import type { EventCardDTO } from '../../features/events/types'
import { useAuth } from '../../hooks/useAuth'
import { useToggleFavorite } from '../../services/events'

interface EventCardProps {
  event: EventCardDTO
  onLoginRequired?: () => void
}

export default function EventCard({ event, onLoginRequired }: EventCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isFavorited, setIsFavorited] = useState(event.favorited || false)
  const { mutateAsync: toggleFavorite, isPending } = useToggleFavorite(event.id)
  
  // 디버깅: 호스트 정보 확인
  console.log('EventCard - event.id:', event.id)
  console.log('EventCard - event:', event)
  console.log('EventCard - hostNickname:', event.hostNickname)
  console.log('EventCard - hostProfileImage:', event.hostProfileImage)

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

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired()
      }
      return
    }

    try {
      const result = await toggleFavorite()
      setIsFavorited(result.favorited)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  return (
    <div
      role="article"
      aria-label={`이벤트 카드: ${event.title}`}
<<<<<<< HEAD
      className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-2xl dark:hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={event.coverUrl}
          alt={`${event.title} 표지 이미지`}
          className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-300"
=======
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
>>>>>>> origin/dev
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-gray-100"><span class="text-gray-400">No Image</span></div>'
            }
          }}
        />
<<<<<<< HEAD
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
=======
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <span className="text-gray-400">No Image</span>
        </div>
      )}

        {/* 좌측 상단: 태그 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="inline-block px-3 py-1 bg-black/80 text-white text-xs font-medium rounded-full">
            {event.category}
          </span>
          {event.feeType === 'PAID' && event.feeAmount && (
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
              🍿 {event.feeAmount}P
>>>>>>> origin/dev
            </span>
          )}
        </div>

        {/* 우측 상단: 참가인원수 */}
        <div className="absolute top-3 right-3">
          <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            {event.joined}/{event.capacity}명
          </div>
        </div>

        {/* 우측 하단: 좋아요 */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            aria-label={isFavorited ? '찜 해제' : '찜하기'}
            className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-400'}`}
            />
          </button>
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