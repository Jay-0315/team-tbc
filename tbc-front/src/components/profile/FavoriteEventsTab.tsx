import { useQuery } from '@tanstack/react-query'
import { eventKeys } from '@/features/events/api/keys'
import { fetchFavoriteEvents } from '@/services/events'
import EventCard from '@/components/event/EventCard'

export function FavoriteEventsTab() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: eventKeys.favorites(),
    queryFn: () => fetchFavoriteEvents(0, 12),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        찜한 모임을 불러오는 데 실패했습니다: {error?.message}
      </div>
    )
  }

  const favoriteEvents = data?.content || []

  return (
    <div className="space-y-8">
      {favoriteEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          찜한 모임이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favoriteEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
