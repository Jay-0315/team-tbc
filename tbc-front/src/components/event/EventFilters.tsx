import { useMemo } from 'react'
import { Search } from 'lucide-react'

interface EventFiltersProps {
  categories: { key: string; name: string; thumbnailUrl?: string }[]
  selectedCategory?: string
  onChangeCategory: (category?: string) => void

  status: 'UPCOMING' | 'OPEN' | 'WAITLIST' | 'CLOSED'
  onChangeStatus: (status: 'UPCOMING' | 'OPEN' | 'WAITLIST' | 'CLOSED') => void

  sort: 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC'
  onChangeSort: (sort: 'DEADLINE_ASC' | 'REVIEWS_DESC' | 'START_ASC' | 'NEW_DESC') => void

  searchQuery?: string
  onSearchChange: (query: string) => void
  onSearch: (query: string) => void
}

export default function EventFilters({
  categories,
  selectedCategory,
  onChangeCategory,
  status,
  onChangeStatus,
  sort,
  onChangeSort,
  searchQuery = '',
  onSearchChange,
  onSearch,
}: EventFiltersProps) {
  const statusTabs = useMemo(
    () => [
      { key: 'UPCOMING', label: '오픈 예정 이벤트' },
      { key: 'OPEN', label: '신청 가능 이벤트' },
      { key: 'WAITLIST', label: '대기 가능 이벤트' },
    ] as const,
    [],
  )

  const sortOptions = useMemo(
    () => [
      { key: 'DEADLINE_ASC', label: '마감 임박 순' },
      { key: 'REVIEWS_DESC', label: '후기 많은 순' },
      { key: 'START_ASC', label: '빠른 시작 순' },
      { key: 'NEW_DESC', label: '새로 열린 순' },
    ] as const,
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* 검색 입력 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="이벤트 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(searchQuery)
              }
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="이벤트 검색"
          />
        </div>
        <button
          type="button"
          onClick={() => onSearch(searchQuery)}
          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          aria-label="검색 실행"
        >
          검색
        </button>
      </div>

      <div className="-mx-4 px-4">
        <div
          className="flex gap-3 overflow-x-auto pb-3 no-scrollbar"
          aria-label="카테고리 스크롤 영역"
          role="tablist"
        >
          {[{ key: '', name: '전체' }, ...categories].map((c) => (
            <button
              key={c.key || 'all'}
              role="tab"
              aria-selected={(selectedCategory || '') === (c.key || '')}
              className={`flex-shrink-0 inline-flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-200 ${
                (selectedCategory || '') === (c.key || '')
                  ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700 shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
              }`}
              onClick={() => onChangeCategory(c.key || undefined)}
            >
              <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden inline-flex items-center justify-center">
                {c.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{c.name.slice(0, 2)}</span>
                )}
              </span>
              <span className="text-sm font-medium whitespace-nowrap">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3" role="tablist" aria-label="이벤트 상태 탭">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={status === t.key}
            className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
              status === t.key 
                ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700 shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
            }`}
            onClick={() => onChangeStatus(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="정렬 옵션">
        {sortOptions.map((o) => (
          <button
            key={o.key}
            role="radio"
            aria-checked={sort === o.key}
            className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
              sort === o.key 
                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
            }`}
            onClick={() => onChangeSort(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}


