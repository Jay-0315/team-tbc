import { useState, useMemo, useCallback } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'
import { Calendar, AlertCircle, ChevronDown } from 'lucide-react'
import EventFilters from '../components/event/EventFilters'
import { EventCardSkeletonGrid } from '../components/skeletons/EventCardSkeleton'
import { useInfiniteEvents } from '@/features/events/api/useInfiniteEvents'
import { usePopularEvents } from '@/features/events/api/usePopularEvents'
import { useRecentEvents } from '@/features/events/api/useRecentEvents'
import type { EventStatus } from '@/features/events/types'
import EventBanner from '@/components/EventBanner'
import EventCard from '@/components/event/EventCard'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(8)

  // 로그인 필요 시 모달 열기
  const handleLoginRequired = () => {
    setIsAuthModalOpen(true)
  }

  // URL 파라미터에서 필터 값 추출
  const category = searchParams.get('category') || ''
  const status = (searchParams.get('status') as EventStatus) || undefined
  const sort = searchParams.get('sort') || 'NEW_DESC'

  // 이벤트 데이터 가져오기
  const { 
    data: eventsData, 
    isLoading, 
    isError, 
    error
  } = useInfiniteEvents({
    category: category || undefined,
    status: status || undefined,
    sort: sort as 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC' | 'CREATED_DESC',
    q: searchQuery || undefined,
  })

  // 최근 개설된 모임 데이터 가져오기 (4개만)
  const { 
    data: recentData, 
    isLoading: isRecentLoading 
  } = useRecentEvents()

  // 인기 모임 데이터 가져오기 (4개만)
  const { 
    data: popularData, 
    isLoading: isPopularLoading 
  } = usePopularEvents()

  // 모든 이벤트를 하나의 배열로 합치기
  const allEvents = useMemo(() => {
    return eventsData?.pages.flatMap(page => page.content) || []
  }, [eventsData])

  // 최근 개설된 모임 배열 (4개)
  const recentEvents = useMemo(() => {
    return recentData?.content || []
  }, [recentData])

  // 인기 모임 배열 (4개)
  const popularEvents = useMemo(() => {
    return popularData?.content || []
  }, [popularData])

  // URL 파라미터 업데이트 함수
  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })
      return newParams
    })
  }, [setSearchParams])

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    updateSearchParams({ search: searchQuery || null })
  }, [searchQuery, updateSearchParams])

  // 더보기 버튼 핸들러
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 헤더 높이만큼 여백 추가 */}
      <div className="pt-8">
        {/* 이벤트 배너 */}
        <div className="px-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <EventBanner />
          </div>
        </div>

        {/* 검색창과 태그 버튼 */}
        <div className="px-6 mb-4">
          <div className="max-w-7xl mx-auto">
            <EventFilters
              categories={[
                { key: 'ETC', name: '기타' },
                { key: 'GAME', name: '게임' },
                { key: 'FOOD', name: '음식' },
                { key: 'STUDY', name: '스터디' },
                { key: 'SPORTS', name: '스포츠' },
                { key: 'CULTURE', name: '문화' },
              ]}
              selectedCategory={category}
              onChangeCategory={(c) => updateSearchParams({ category: c || null })}
              status={status}
              onChangeStatus={(s) => updateSearchParams({ status: s || null })}
              sort={sort as 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC' | 'CREATED_DESC'}
              onChangeSort={(s) => updateSearchParams({ sort: s || null })}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* 최근 개설된 모임 - 4개 그리드 */}
        <section className="px-6 py-4 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🆕 최근 개설된 모임</h2>
            </div>

            {isRecentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EventCardSkeletonGrid count={4} />
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                최근 개설된 모임이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} onLoginRequired={handleLoginRequired} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 인기 모임 - 4개 그리드 */}
        <section className="px-6 py-4 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🔥 인기 모임</h2>
            </div>

            {isPopularLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EventCardSkeletonGrid count={4} />
              </div>
            ) : popularEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                인기 모임이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularEvents.map((event) => (
                  <EventCard key={event.id} event={event} onLoginRequired={handleLoginRequired} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 전체 모임 - 그리드 */}
        <section className="px-6 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">📋 전체 모임</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <EventCardSkeletonGrid count={12} />
              ) : isError ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-orange-400 bg-orange-50 rounded-full">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">데이터를 불러오는 중 오류가 발생했습니다</h3>
                  {error && <p className="text-red-600">{(error as Error).message}</p>}
                </div>
              ) : allEvents.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-orange-400 bg-orange-50 rounded-full">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">표시할 소셜링이 없습니다</h3>
                  <p className="text-gray-600 mb-8">새로운 소셜링을 만들어보세요!</p>
                  {isAuthenticated && (
                    <Link to="/groups/create">
                      <button className="px-8 py-4 font-semibold text-black bg-gradient-to-r from-[#FFA700] to-[#FFFFFF] rounded-2xl transition-all duration-300 transform hover:from-[#FFA700]/80 hover:to-[#FFFFFF]/80 hover:scale-105">
                        소셜링 만들기
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                allEvents.slice(0, displayCount).map((event) => (
                  <EventCard key={event.id} event={event} onLoginRequired={handleLoginRequired} />
                ))
              )}
            </div>

            {/* 더보기 버튼 */}
            {displayCount < allEvents.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <ChevronDown className="w-4 h-4" />
                  더보기 ({allEvents.length - displayCount}개 남음)
                </button>
              </div>
            )}

            {/* 모든 데이터를 확인했을 때 */}
            {displayCount >= allEvents.length && allEvents.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-gray-500">모든 소셜링을 확인했습니다</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 로그인 모달 */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  )
}
