import { useMemo } from 'react'
import { Search } from 'lucide-react'

interface EventFiltersProps {
  categories: { key: string; name: string; thumbnailUrl?: string }[]
  selectedCategory?: string
  onChangeCategory: (category?: string) => void

  status: string | null
  onChangeStatus: (status: string | null) => void

  sort: string | null
  onChangeSort: (sort: string | null) => void

  searchQuery?: string
  onSearchChange: (query: string) => void
  onSearch: (query: string) => void
}

const EMOJI_MAP: Record<string, string> = {
  '': '✨', // For '전체' (All)
  ETC: '🎸',
  GAME: '🎮',
  FOOD: '🍔',
  STUDY: '📚',
  SPORTS: '⚽️',
  CULTURE: '🎨',
};

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
      
      
      
    ] as const,
    [],
  )

  const sortOptions = useMemo(
    () => [
      
      
      
      
    ] as const,
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* 검색 입력 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
<<<<<<< HEAD
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
=======
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
>>>>>>> origin/dev
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
<<<<<<< HEAD
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
=======
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#DCD494] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
>>>>>>> origin/dev
            aria-label="이벤트 검색"
          />
        </div>
        <button
          type="button"
          onClick={() => onSearch(searchQuery)}
<<<<<<< HEAD
          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
=======
          className="px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md bg-white border border-[#CCCCCC] hover:border-orange-500 cursor-pointer transition-all duration-200"
>>>>>>> origin/dev
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
<<<<<<< HEAD
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
=======
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer ${((selectedCategory || '') === (c.key || '')) ? 'bg-white border border-orange-500 text-black shadow-md' : 'bg-white border border-[#CCCCCC] hover:border-orange-500 text-black hover:shadow-sm'}`}
              onClick={() => {
                // 전체 버튼인 경우 null을 전달하여 URL 파라미터를 삭제하고 모든 카테고리를 표시
                if (c.key === '') {
                  onChangeCategory(null as any)
                } else {
                  onChangeCategory(c.key)
                }
              }}
            >
              <span className="text-lg">{EMOJI_MAP[c.key || '']}</span>
>>>>>>> origin/dev
              <span className="text-sm font-medium whitespace-nowrap">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

<<<<<<< HEAD
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
=======
      

      
>>>>>>> origin/dev
    </div>
  )
}
