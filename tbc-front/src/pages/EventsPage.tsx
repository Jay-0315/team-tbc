import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import EventFilters from '../components/event/EventFilters'
import EventCard from '../components/event/EventCard'
import { EventCardSkeletonGrid } from '../components/skeletons/EventCardSkeleton'
import { useInfiniteEvents } from '../features/events/api/useInfiniteEvents'

const CATEGORIES = [
  { key: 'music', name: '음악' },
  { key: 'movie', name: '영화' },
  { key: 'book', name: '독서' },
  { key: 'game', name: '게임' },
  { key: 'workshop', name: '워크숍' },
  { key: 'networking', name: '네트워킹' },
]


export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // URL에서 초기값 복원
  const category = searchParams.get('category') || undefined
  const status = (searchParams.get('status') as any) || 'OPEN'
  const sort = (searchParams.get('sort') as any) || 'CREATED_DESC'

  const params = useMemo(
    () => {
      const queryParams = { 
        q: searchParams.get('q') || undefined, // URL에서 직접 가져오기
        category, 
        status, 
        sort, 
        size: 12 
      }
      return queryParams
    },
    [searchParams, category, status, sort],
  )

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteEvents(params)

  // 모든 페이지의 이벤트를 평면화
  const allEvents = useMemo(() => {
    const events = data?.pages.flatMap(page => page.content) ?? []
    return events
  }, [data, hasNextPage, isFetchingNextPage])

  // URL 업데이트 함수
  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      return newParams
    }, { replace: true })
  }, [setSearchParams])

  // 검색 실행 함수
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query) // 즉시 상태 업데이트
    updateSearchParams({ q: query || undefined })
  }, [updateSearchParams])


  // Intersection Observer 설정
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

  // 스크롤 위치 복원
  useEffect(() => {
    const savedScrollY = sessionStorage.getItem('events-scroll-y')
    if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY))
      sessionStorage.removeItem('events-scroll-y')
    }
  }, [])

  // 스크롤 위치 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('events-scroll-y', window.scrollY.toString())
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {/* 홈페이지 헤더 */}
      <header className="text-center py-8 mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          TEAM-TBC 이벤트
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          다양한 카테고리의 이벤트를 찾아보고 참여해보세요. 
          음악, 영화, 독서, 게임, 워크숍, 네트워킹 등 다양한 활동을 만나보실 수 있습니다.
        </p>
      </header>
      
      <EventFilters
        categories={CATEGORIES}
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

      <section className="mt-6" aria-live="polite" aria-busy={isLoading || isFetchingNextPage}>
        {/* 로딩 상태 */}
        {isLoading && <EventCardSkeletonGrid count={12} />}

        {/* 에러 상태 */}
        {isError && (
          <div role="alert" className="text-center py-12">
            <p className="text-red-600 mb-4">
              데이터를 불러오지 못했습니다.
              {error && <span className="block text-sm mt-1">{error.message}</span>}
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => refetch()}
              aria-label="다시 시도"
            >
              재시도
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && allEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 mb-4">조건에 맞는 이벤트가 없어요</p>
            <button
              type="button"
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200"
              onClick={() => {
                setSearchQuery('')
                updateSearchParams({ q: undefined, category: undefined, status: 'OPEN', sort: 'CREATED_DESC' })
              }}
              aria-label="검색 및 필터 초기화"
            >
              검색/필터 초기화
            </button>
          </div>
        )}

        {/* 이벤트 목록 */}
        {!isLoading && !isError && allEvents.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            role="list"
            aria-label="이벤트 카드 목록"
          >
            {allEvents.map((event) => (
              <div role="listitem" key={event.id}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}

        {/* 무한 스크롤 센티넬 */}
        <div ref={sentinelRef} aria-hidden="true" className="h-4" />

        {/* 로딩 상태 메시지 */}
        {isFetchingNextPage && (
          <div role="status" className="text-center py-4" aria-live="polite">
            <p className="text-zinc-500">다음 페이지 로딩 중...</p>
          </div>
        )}

        {/* 마지막 페이지 메시지 */}
        {!hasNextPage && allEvents.length > 0 && (
          <div role="status" className="text-center py-4" aria-live="polite">
            <p className="text-zinc-500">마지막입니다</p>
            <p className="text-xs text-zinc-400 mt-1">
              총 {allEvents.length}개 이벤트 로드됨
            </p>
          </div>
        )}

      </section>
    </main>
  )
}


