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
    <div className="flex flex-col gap-4">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
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
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            aria-label="이벤트 검색"
          />
        </div>
        <button
          type="button"
          onClick={() => onSearch(searchQuery)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 focus:ring-2 focus:ring-black focus:ring-offset-2"
          aria-label="검색 실행"
        >
          검색
        </button>
      </div>

      <div className="-mx-4 px-4">
        <div
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar"
          aria-label="카테고리 스크롤 영역"
          role="tablist"
        >
          {[{ key: '', name: '전체' }, ...categories].map((c) => (
            <button
              key={c.key || 'all'}
              role="tab"
              aria-selected={(selectedCategory || '') === (c.key || '')}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                (selectedCategory || '') === (c.key || '')
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-zinc-800 border-zinc-200'
              }`}
              onClick={() => onChangeCategory(c.key || undefined)}
            >
              <span className="w-7 h-7 rounded-full bg-zinc-200 overflow-hidden inline-flex items-center justify-center">
                {c.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{c.name.slice(0, 2)}</span>
                )}
              </span>
              <span className="text-sm whitespace-nowrap">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="이벤트 상태 탭">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={status === t.key}
            className={`px-3 py-1.5 rounded-full border text-sm ${
              status === t.key ? 'bg-black text-white border-black' : 'bg-white text-zinc-800 border-zinc-200'
            }`}
            onClick={() => onChangeStatus(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="정렬 옵션">
        {sortOptions.map((o) => (
          <button
            key={o.key}
            role="radio"
            aria-checked={sort === o.key}
            className={`px-3 py-1.5 rounded-full border text-sm ${
              sort === o.key ? 'border-black bg-zinc-100' : 'border-zinc-200'
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


