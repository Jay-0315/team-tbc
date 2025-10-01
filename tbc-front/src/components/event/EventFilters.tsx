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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#DCD494] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="이벤트 검색"
          />
        </div>
        <button
          type="button"
          onClick={() => onSearch(searchQuery)}
          className="px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md bg-white border border-[#CCCCCC] hover:border-orange-500 cursor-pointer transition-all duration-200"
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
              <span className="text-sm font-medium whitespace-nowrap">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      

      
    </div>
  )
}
