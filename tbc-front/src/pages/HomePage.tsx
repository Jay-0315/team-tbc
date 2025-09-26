import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import SignupModal from '@/components/SignupModal'
import { FloatingChatButton } from "@/components/FloatingChatButton"
import { Heart } from 'lucide-react'
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
    <div className="min-h-screen text-white bg-black">
      {/* 고정 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          user={user || null}
          onLogout={handleLogout}
          onLoginSuccess={() => setIsLoginModalOpen(false)}
          onSignupSuccess={() => setIsSignupModalOpen(false)}
        />
      </div>

      {/* 헤더 높이만큼 여백 추가 */}
      <div className="pt-16">
        {/* Hero 배너 */}
        <section className="relative h-[60vh] overflow-hidden">
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
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-80`}></div>
              </div>
              <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
                <div className="max-w-4xl">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">{banner.title}</h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8">{banner.desc}</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {!isAuthenticated ? (
                      <>
                        <button 
                          className="px-8 py-4 text-lg font-semibold text-black bg-white rounded-full shadow-xl transition-all duration-300 transform hover:bg-gray-100 hover:scale-105"
                          onClick={() => setIsLoginModalOpen(true)}
                        >
                          로그인 후 참여하기
                        </button>
                        <button 
                          className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white transition-all duration-300 transform hover:bg-white hover:text-black hover:scale-105"
                          onClick={() => setIsSignupModalOpen(true)}
                        >
                          무료 회원가입
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/groups/create">
                          <button className="px-8 py-4 text-lg font-semibold text-black bg-white rounded-full shadow-xl transition-all duration-300 transform hover:bg-gray-100 hover:scale-105">
                            그룹 만들기
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

        {/* 필터 */}
        <section className="px-6 mt-6">
          <div className="mx-auto max-w-7xl">
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
        <section className="px-6 py-10 bg-black">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <EventCardSkeletonGrid count={12} />
              ) : isError ? (
                <div className="col-span-full py-8 text-center text-red-400">
                  데이터를 불러오는 중 오류가 발생했습니다.
                  {error && <div className="mt-2 text-sm text-red-300">{(error as Error).message}</div>}
                </div>
              ) : allEvents.length === 0 ? (
                <div className="col-span-full py-8 text-center text-gray-400">
                  표시할 그룹이 없습니다.
                </div>
              ) : (
                allEvents.map((event: EventCardDTO) => (
                  <div
                    key={event.id}
                    className="overflow-hidden bg-gray-900 rounded-2xl border border-gray-800 shadow-lg transition-all duration-300 transform hover:shadow-xl hover:-translate-y-2 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-purple-600">
                        <span className="text-4xl font-bold text-white">{event.category}</span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-sm font-medium text-white rounded-full backdrop-blur-sm bg-black/90">
                          {event.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 text-sm text-black rounded-full backdrop-blur-sm bg-white/90 mr-2">
                          {event.minParticipants}~{event.maxParticipants}명
                        </span>
                        {/* 좋아요 버튼 */}
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-red-500 hover:bg-white transition"
                          aria-label="좋아요"
                          onClick={(e) => { e.stopPropagation(); /* TODO: /api/groups/:id/favorite 호출 */ }}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-gray-300">
                        {event.title}
                      </h3>
                      <p className="mb-2 text-gray-400">{event.topic}</p>

                      <div className="flex gap-2 items-center mb-4">
                        <span className="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded">
                          {event.mode}
                        </span>
                        <span className="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded">
                          {event.feeType === 'FREE' ? '무료' : `${event.feeAmount ?? 0}원`}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="py-3 w-full font-semibold text-black bg-white rounded-xl transition-all duration-300 transform hover:bg-gray-100 hover:scale-105"
                        onClick={() => navigate(`/groups/${event.id}`)}
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
