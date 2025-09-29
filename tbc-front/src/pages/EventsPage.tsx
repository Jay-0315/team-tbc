import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTheme } from 'next-themes'
import EventFilters from '../components/event/EventFilters'
import EventCard from '../components/event/EventCard'
import { EventCardSkeletonGrid } from '../components/skeletons/EventCardSkeleton'
import { useInfiniteEvents } from '../features/events/api/useInfiniteEvents'
import type { EventCardDTO, EventStatus } from '../features/events/types'

const CATEGORIES = [
  { key: "ETC", name: "기타" },
  { key: "GAME", name: "게임" },
  { key: "FOOD", name: "음식" },
  { key: "STUDY", name: "스터디" },
  { key: "SPORTS", name: "스포츠" },
  { key: "CULTURE", name: "문화" },
]

// Legacy → Backend category normalization map
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  music: 'ETC',
  movie: 'CULTURE',
  book: 'CULTURE',
  game: 'GAME',
  workshop: 'STUDY',
  networking: 'ETC',
}

const ALLOWED_CATEGORY_SET = new Set(CATEGORIES.map(c => c.key))

type SortKey = 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC' | 'CREATED_DESC'

type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  last?: boolean
}

export default function EventsPage() {
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isDark, setIsDark] = useState(false)

  // 테마 변경 감지
  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  // URL에서 초기값 복원 + 카테고리 정규화
  const rawCategory = searchParams.get('category') || undefined
  const normalizedCategory = useMemo(() => {
    if (!rawCategory) return undefined
    const upper = rawCategory.toUpperCase()
    if (ALLOWED_CATEGORY_SET.has(upper)) return upper
    const mapped = LEGACY_CATEGORY_MAP[rawCategory]
    return mapped && ALLOWED_CATEGORY_SET.has(mapped) ? mapped : undefined
  }, [rawCategory])

  const allowedStatus: ReadonlyArray<EventStatus> = ['UPCOMING','OPEN','WAITLIST','CLOSED']
  const statusParam = searchParams.get('status')
  const status: EventStatus = allowedStatus.includes(statusParam as EventStatus) ? (statusParam as EventStatus) : 'OPEN'

  const allowedSort: ReadonlyArray<SortKey> = ['DEADLINE_ASC','REVIEWS_DESC','START_ASC','NEW_DESC','CREATED_DESC']
  const sortParam = searchParams.get('sort')
  const sort: SortKey = allowedSort.includes(sortParam as SortKey) ? (sortParam as SortKey) : 'CREATED_DESC'

  const params = useMemo(
    () => {
      const queryParams = { 
        q: searchParams.get('q') || undefined, // URL에서 직접 가져오기
        category: normalizedCategory, 
        status, 
        sort, 
        size: 12 
      }
      return queryParams
    },
    [searchParams, normalizedCategory, status, sort],
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
    const pages = (data?.pages as Array<Page<EventCardDTO>> | undefined) ?? []
    return pages.flatMap((page) => page.content)
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
    <main 
      className="min-h-screen transition-colors duration-300" 
      style={{ 
        backgroundColor: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#f9fafb' : '#111827'
      }}
    >
        {/* 넷플릭스 스타일 히어로 섹션 */}
        <div 
          className="relative transition-colors duration-300"
          style={{
            background: isDark 
              ? 'linear-gradient(to bottom, #111827, #1f2937)' 
              : 'linear-gradient(to bottom, #f9fafb, #ffffff)'
          }}
        >
          <div className="px-4 py-12 mx-auto max-w-7xl">
            <header className="mb-12 text-center">
              <h1 
                className="mb-6 text-5xl font-bold tracking-tight"
                style={{ color: isDark ? '#f9fafb' : '#111827' }}
              >
                TEAM-TBC 이벤트
              </h1>
              <p 
                className="mx-auto max-w-3xl text-xl leading-relaxed"
                style={{ color: isDark ? '#d1d5db' : '#6b7280' }}
              >
                다양한 카테고리의 이벤트를 찾아보고 참여해보세요. 
                음악, 영화, 독서, 게임, 워크숍, 네트워킹 등 다양한 활동을 만나보실 수 있습니다.
              </p>
            </header>
          </div>
        </div>

        {/* 컨텐츠 섹션 */}
        <div className="px-4 py-8 mx-auto max-w-7xl">
      
      <EventFilters
        categories={CATEGORIES}
        selectedCategory={normalizedCategory}
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
          <div role="alert" className="py-16 text-center">
            <div className="p-8 mx-auto max-w-md bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="mb-6 text-lg font-medium text-red-700 dark:text-red-300">
                데이터를 불러오지 못했습니다.
                {error && <span className="block mt-2 text-sm text-red-600 dark:text-red-400">{error.message}</span>}
              </p>
              <button
                type="button"
                className="px-6 py-3 font-medium text-white bg-red-600 rounded-lg transition-all duration-200 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                onClick={() => refetch()}
                aria-label="다시 시도"
              >
                재시도
              </button>
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && allEvents.length === 0 && (
          <div className="py-16 text-center">
            <div className="p-8 mx-auto max-w-md bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">조건에 맞는 이벤트가 없어요</p>
              <button
                type="button"
                className="px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                onClick={() => {
                  setSearchQuery('')
                  updateSearchParams({ q: undefined, category: undefined, status: 'OPEN', sort: 'CREATED_DESC' })
                }}
                aria-label="검색 및 필터 초기화"
              >
                검색/필터 초기화
              </button>
            </div>
          </div>
        )}

        {/* 이벤트 목록 */}
        {!isLoading && !isError && allEvents.length > 0 && (
          <div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            role="list"
            aria-label="이벤트 카드 목록"
          >
            {allEvents.map((event: EventCardDTO) => (
              <div role="listitem" key={event.id}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}

        {/* 무한 스크롤 센티넬 */}
        <div ref={sentinelRef} aria-hidden="true" className="h-8" />

        {/* 로딩 상태 메시지 */}
        {isFetchingNextPage && (
          <div role="status" className="py-8 text-center" aria-live="polite">
            <div className="inline-flex gap-3 items-center px-6 py-3 bg-gray-100 rounded-full dark:bg-gray-800">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 animate-spin dark:border-blue-400 border-t-transparent"></div>
              <p className="font-medium text-gray-600 dark:text-gray-300">다음 페이지 로딩 중...</p>
            </div>
          </div>
        )}

        {/* 마지막 페이지 메시지 */}
        {!hasNextPage && allEvents.length > 0 && (
          <div role="status" className="py-8 text-center" aria-live="polite">
            <div className="inline-flex gap-2 items-center px-4 py-2 bg-gray-50 rounded-lg dark:bg-gray-800/50">
              <p className="font-medium text-gray-500 dark:text-gray-400">마지막입니다</p>
              <span className="px-2 py-1 text-xs text-gray-400 bg-gray-200 rounded dark:text-gray-500 dark:bg-gray-700">
                총 {allEvents.length}개
              </span>
            </div>
          </div>
        )}

      </section>
        </div>
    </main>
  )
}


