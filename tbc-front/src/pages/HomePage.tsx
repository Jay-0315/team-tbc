import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'
import { FloatingChatButton } from "@/components/FloatingChatButton"
import { Heart, Plus, Users, Calendar, Sparkles, AlertCircle } from 'lucide-react'
import EventFilters from '../components/event/EventFilters'
import { EventCardSkeletonGrid } from '../components/skeletons/EventCardSkeleton'
import { useEvents } from '@/features/events/api/useEvents'
import type { EventCardDTO } from '@/features/events/types'
import type { EventStatus } from '@/features/events/types'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  // URL에서 초기값 복원
  const category = searchParams.get('category') || undefined
  const statusParam = searchParams.get('status')
  const sortParam = searchParams.get('sort')
  const allowedStatus: ReadonlyArray<EventStatus> = ['UPCOMING','OPEN','WAITLIST','CLOSED']
  const allowedSort = ['DEADLINE_ASC','REVIEWS_DESC','START_ASC','NEW_DESC','CREATED_DESC'] as const
  const status: EventStatus | undefined = allowedStatus.includes((statusParam as EventStatus)) ? (statusParam as EventStatus) : undefined
  const sort: typeof allowedSort[number] = allowedSort.includes((sortParam as typeof allowedSort[number])) ? (sortParam as typeof allowedSort[number]) : 'NEW_DESC'

  // 실제 이벤트 데이터 사용 (events 테이블)
  const { data: eventsPage, isLoading, error } = useEvents({
    category,
    status,
    sort,
    page: 0,
    size: 12
  })
  const isError = !!error
  const fetchNextPage = () => {}
  const isFetchingNextPage = false
  const hasNextPage = false

  // 모든 페이지의 이벤트를 평면화
  const allEvents = useMemo(() => eventsPage?.content ?? [], [eventsPage])

  // URL 업데이트 함수
  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) newParams.set(key, value)
        else newParams.delete(key)
      })
      return newParams
    }, { replace: true })
  }, [setSearchParams])

  // 검색 실행 함수
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    updateSearchParams({ q: query || undefined })
  }, [updateSearchParams])


  // Intersection Observer 설정 (무한 스크롤)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '600px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="min-h-screen text-gray-900 bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 헤더 높이만큼 여백 추가 */}
      <div className="pt-16">
        {/* Hero 섹션 */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-pink-100/40"></div>
          
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #a855f7 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #ec4899 0%, transparent 50%),
                               radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 50%)`,
            }}></div>
          </div>

          <div className="relative z-10 px-6 mx-auto max-w-6xl text-center">
            {/* 상단 배지 */}
            <div className="mb-8">
              <span className="inline-flex gap-2 items-center px-6 py-3 text-sm font-semibold text-purple-500 rounded-full border border-purple-100 shadow-lg backdrop-blur-sm bg-white/80">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                새로운 소셜링 플랫폼
              </span>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="mb-6 text-6xl font-bold leading-tight md:text-8xl lg:text-9xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                HolaPoP
              </span>
            </h1>
            
            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-700 md:text-2xl">
              관심사가 같은 사람들과 함께하는 특별한 경험을 시작하세요
            </p>

            {/* CTA 버튼들 */}
            <div className="flex flex-col gap-6 justify-center items-center sm:flex-row">
              {!isAuthenticated ? (
                <>
                  <button 
                    className="px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-2xl transition-all duration-300 transform group hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-purple-300/30"
                    onClick={() => {
                      setAuthModalMode('login')
                      setIsAuthModalOpen(true)
                    }}
                  >
                    <span className="flex gap-3 items-center">
                      <Users className="w-6 h-6" />
                      로그인 후 참여하기
                    </span>
                  </button>
                  <button 
                    className="px-8 py-4 text-lg font-semibold text-purple-500 rounded-2xl border-2 border-purple-200 backdrop-blur-sm transition-all duration-300 transform hover:bg-purple-25 hover:border-purple-300 hover:scale-105"
                    onClick={() => {
                      setAuthModalMode('register')
                      setIsAuthModalOpen(true)
                    }}
                  >
                    무료 회원가입
                  </button>
                </>
              ) : (
                <>
                  <Link to="/groups/create">
                    <button className="px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-2xl transition-all duration-300 transform group hover:from-purple-500 hover:to-pink-500 hover:scale-110 hover:shadow-purple-300/40">
                      <span className="flex gap-4 items-center">
                        <Plus className="w-7 h-7" />
                        소셜링 만들기
                      </span>
                    </button>
                  </Link>
                  <Link to="/events">
                    <button className="px-8 py-4 text-lg font-semibold text-purple-500 rounded-2xl border-2 border-purple-200 backdrop-blur-sm transition-all duration-300 transform hover:bg-purple-25 hover:border-purple-300 hover:scale-105">
                      <span className="flex gap-2 items-center">
                        <Calendar className="w-5 h-5" />
                        이벤트 둘러보기
                      </span>
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>


        {/* 인기 소셜링 섹션 */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-800">인기 소셜링</h2>
              <p className="text-xl text-gray-600">다양한 카테고리의 소셜링을 만나보세요</p>
            </div>

            {/* 필터 */}
            <div className="mb-12">
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
                onChangeCategory={(c) => updateSearchParams({ category: c })}
                status={status}
                onChangeStatus={(s) => updateSearchParams({ status: s })}
                sort={sort}
                onChangeSort={(s) => updateSearchParams({ sort: s })}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>

            {/* 이벤트 카드 그리드 */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <EventCardSkeletonGrid count={12} />
              ) : isError ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex justify-center items-center mb-4 w-16 h-16 text-red-500 bg-red-100 rounded-full">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">데이터를 불러오는 중 오류가 발생했습니다</h3>
                  {error && <p className="text-red-600">{(error as Error).message}</p>}
                </div>
              ) : allEvents.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex justify-center items-center mb-4 w-16 h-16 text-purple-400 bg-purple-50 rounded-full">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">표시할 소셜링이 없습니다</h3>
                  <p className="mb-8 text-gray-600">새로운 소셜링을 만들어보세요!</p>
                  {isAuthenticated && (
                    <Link to="/groups/create">
                      <button className="px-8 py-4 font-semibold text-white bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl transition-all duration-300 transform hover:from-purple-500 hover:to-pink-500 hover:scale-105">
                        소셜링 만들기
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                allEvents.map((event: EventCardDTO) => (
                  <div
                    key={event.id}
                    className="overflow-hidden rounded-3xl border border-gray-200 shadow-xl backdrop-blur-sm transition-all duration-300 transform cursor-pointer group bg-white/80 hover:shadow-purple-200/50 hover:-translate-y-3 hover:border-purple-300"
                    role="link"
                    aria-label={`${event.title} 상세로 이동`}
                    tabIndex={0}
                    onClick={() => navigate(`/events/${event.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/events/${event.id}`)
                      }
                    }}
                  >
                    {/* 카드 헤더 */}
                    <div className="overflow-hidden relative h-48">
                      <div className="flex justify-center items-center w-full h-full bg-gradient-to-br from-purple-100 to-pink-100">
                        <div className="text-center">
                          <div className="flex justify-center items-center mx-auto mb-3 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-2xl">
                            <span className="text-3xl font-bold text-white">{event.category.charAt(0)}</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-700">{event.category}</span>
                        </div>
                      </div>
                      
                      {/* 카테고리 배지 */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-sm font-medium text-gray-700 rounded-full border border-gray-200 backdrop-blur-sm bg-white/80">
                          {event.category}
                        </span>
                      </div>
                      
                      {/* 인원수 및 좋아요 */}
                      <div className="flex absolute top-4 right-4 gap-2 items-center">
                        <span className="px-3 py-1 text-sm text-gray-700 rounded-full border border-gray-200 backdrop-blur-sm bg-white/80">
                          <Users className="inline mr-1 w-4 h-4" />
                          {event.joined}/{event.capacity}명
                        </span>
                        <button
                          type="button"
                          className="inline-flex justify-center items-center w-9 h-9 text-pink-500 rounded-full border border-gray-200 backdrop-blur-sm transition-all bg-white/80 hover:bg-pink-500 hover:text-white hover:scale-110"
                          aria-label="좋아요"
                          onClick={(e) => { e.stopPropagation(); /* TODO: /api/groups/:id/favorite 호출 */ }}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* 카드 내용 */}
                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-purple-600">
                        {event.title}
                      </h3>
                      <p className="mb-4 text-gray-600 line-clamp-2">{event.location}</p>

                      <div className="flex gap-2 items-center mb-6">
                        <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                          {event.status}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                          {event.remainingSeats}석 남음
                        </span>
                      </div>

                      <button
                        type="button"
                        className="py-3 w-full font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl transition-all duration-300 transform hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/25"
                        onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`) }}
                      >
                        참가하기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* 무한 스크롤 센티넬 */}
            <div ref={sentinelRef} aria-hidden="true" className="h-4" />
          </div>
        </section>
      </div>

      {/* 로그인/회원가입 모달 */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <FloatingChatButton />
    </div>
  )
}