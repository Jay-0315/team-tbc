import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import SignupModal from '@/components/SignupModal'
import { FloatingChatButton } from "@/components/FloatingChatButton"
import { Heart, Plus, Users, Calendar, Sparkles, AlertCircle } from 'lucide-react'
import EventFilters from '../components/event/EventFilters'
import { EventCardSkeletonGrid } from '../components/skeletons/EventCardSkeleton'
import { useEvents } from '@/features/events/api/useEvents'
import type { EventCardDTO } from '@/features/events/types'
import type { EventStatus } from '@/features/events/types'

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  // Hero banners (UI 전용)
  const [banners] = useState([
    { 
      id: 1, 
      title: "이달의 추천 모임", 
      desc: "새로운 친구들과 함께하세요!", 
      imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-gray-900 to-black"
    },
    { 
      id: 2, 
      title: "가을맞이 캠핑 이벤트", 
      desc: "야외에서 즐기는 캠핑과 바베큐", 
      imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-gray-800 to-gray-900"
    },
    { 
      id: 3, 
      title: "스터디 그룹 모집", 
      desc: "같이 공부할 사람을 찾아보세요!", 
      imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-black to-gray-800"
    },
  ])
  const [bannerIndex, setBannerIndex] = useState(0)

  // 배너 자동 슬라이드
  useEffect(() => {
    const id = window.setInterval(() => {
      setBannerIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => window.clearInterval(id)
  }, [banners.length])

  // URL에서 초기값 복원
  const category = searchParams.get('category') || undefined
  const statusParam = searchParams.get('status')
  const sortParam = searchParams.get('sort')
  const allowedStatus: ReadonlyArray<EventStatus> = ['UPCOMING','OPEN','WAITLIST','CLOSED']
  const allowedSort = ['DEADLINE_ASC','REVIEWS_DESC','START_ASC','NEW_DESC'] as const
  const status: EventStatus | undefined = allowedStatus.includes((statusParam as EventStatus)) ? (statusParam as EventStatus) : 'OPEN'
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

  // 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    logout()
    // 로그아웃 후 상태 업데이트를 위해 페이지 새로고침
    window.location.reload()
  }, [logout])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* 고정 헤더 */}
      <div className="fixed top-0 right-0 left-0 z-50">
        <Header
          user={user || null}
          onLogout={handleLogout}
          onAuthSuccess={() => {
            setIsLoginModalOpen(false)
            setIsSignupModalOpen(false)
          }}
        />
      </div>

      {/* 헤더 높이만큼 여백 추가 */}
      <div className="pt-16">
        {/* Hero 배너 */}
        <section className="relative h-[70vh] overflow-hidden">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === bannerIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="object-cover w-full h-full"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-85`}></div>
              </div>
              <div className="flex relative z-10 justify-center items-center px-6 h-full text-center">
                <div className="max-w-5xl">
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                      <Sparkles className="w-4 h-4" />
                      새로운 소셜링 플랫폼
                    </span>
                  </div>
                  <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
                    {banner.title}
                  </h1>
                  <p className="mb-8 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                    {banner.desc}
                  </p>
                  <div className="flex flex-col gap-4 justify-center sm:flex-row">
                    {!isAuthenticated ? (
                      <>
                        <button 
                          className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-2xl transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-red-500/25"
                          onClick={() => setIsLoginModalOpen(true)}
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            로그인 후 참여하기
                          </span>
                        </button>
                        <button 
                          className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:bg-white/10 hover:border-white hover:scale-105"
                          onClick={() => setIsSignupModalOpen(true)}
                        >
                          무료 회원가입
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/groups/create">
                          <button className="group px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-2xl transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-110 hover:shadow-red-500/30">
                            <span className="flex items-center gap-3">
                              <Plus className="w-6 h-6" />
                              소셜링 만들기
                            </span>
                          </button>
                        </Link>
                        <Link to="/events">
                          <button className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:bg-white/10 hover:border-white hover:scale-105">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              이벤트 둘러보기
                            </span>
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 소셜링 만들기 CTA 섹션 (인증된 사용자용) */}
        {isAuthenticated && (
          <section className="px-6 py-8">
            <div className="mx-auto max-w-7xl">
              <div className="relative overflow-hidden bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-3xl border border-red-500/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5"></div>
                <div className="relative px-8 py-12 text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
                      <Plus className="w-8 h-8" />
                    </div>
                    <h2 className="mb-2 text-3xl font-bold text-white">새로운 소셜링을 만들어보세요</h2>
                    <p className="text-lg text-white/80">관심사가 같은 사람들과 함께하는 특별한 경험을 시작하세요</p>
                  </div>
                  <Link to="/groups/create">
                    <button className="group px-12 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-2xl transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-red-500/30">
                      <span className="flex items-center gap-3">
                        <Plus className="w-6 h-6" />
                        소셜링 만들기
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 필터 */}
        <section className="px-6 mt-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">인기 소셜링</h2>
              <p className="text-white/70">다양한 카테고리의 소셜링을 만나보세요</p>
            </div>
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
        </section>

        {/* 그룹 목록 (events 테이블 실제 데이터) */}
        <section className="px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <EventCardSkeletonGrid count={12} />
              ) : isError ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-red-500 bg-red-500/10 rounded-full">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">데이터를 불러오는 중 오류가 발생했습니다</h3>
                  {error && <p className="text-red-300">{(error as Error).message}</p>}
                </div>
              ) : allEvents.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-gray-400 bg-gray-400/10 rounded-full">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">표시할 소셜링이 없습니다</h3>
                  <p className="text-gray-400">새로운 소셜링을 만들어보세요!</p>
                  {isAuthenticated && (
                    <div className="mt-6">
                      <Link to="/groups/create">
                        <button className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-105">
                          소셜링 만들기
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                allEvents.map((event: EventCardDTO) => (
                  <div
                    key={event.id}
                    className="overflow-hidden bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 shadow-2xl transition-all duration-300 transform hover:shadow-red-500/10 hover:-translate-y-3 hover:border-red-500/30 group cursor-pointer"
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
                    <div className="overflow-hidden relative h-48">
                      <div className="flex justify-center items-center w-full h-full bg-gradient-to-br from-red-500/20 to-red-600/20">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{event.category.charAt(0)}</span>
                          </div>
                          <span className="text-lg font-semibold text-white">{event.category}</span>
                        </div>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-sm font-medium text-white rounded-full backdrop-blur-sm bg-black/80 border border-white/20">
                          {event.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="px-3 py-1 text-sm text-white rounded-full backdrop-blur-sm bg-white/20 border border-white/30">
                          <Users className="inline w-4 h-4 mr-1" />
                          {event.joined}/{event.capacity}명
                        </span>
                        {/* 좋아요 버튼 */}
                        <button
                          type="button"
                          className="inline-flex justify-center items-center w-9 h-9 text-red-500 rounded-full transition-all bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-red-500 hover:text-white hover:scale-110"
                          aria-label="좋아요"
                          onClick={(e) => { e.stopPropagation(); /* TODO: /api/groups/:id/favorite 호출 */ }}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-red-400">
                        {event.title}
                      </h3>
                      <p className="mb-4 text-gray-400 line-clamp-2">{event.location}</p>

                      <div className="flex gap-2 items-center mb-6">
                        <span className="px-3 py-1 text-xs font-medium text-white bg-gray-700/50 rounded-full border border-gray-600/50">
                          {event.status}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-white bg-gray-700/50 rounded-full border border-gray-600/50">
                          {event.remainingSeats}석 남음
                        </span>
                      </div>

                      <button
                        type="button"
                        className="py-3 w-full font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
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
            {/* 추가 로딩/마지막: groups API는 현재 무한스크롤 미사용 */}
          </div>
        </section>
      </div>

      {/* 로그인/회원가입 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsLoginModalOpen(false)}
        onOpenSignup={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={() => setIsSignupModalOpen(false)}
        onOpenLogin={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />

      <FloatingChatButton />
    </div>
  )
}
