export function EventCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden animate-pulse">
      {/* 이미지 스켈레톤 */}
      <div className="aspect-[16/9] bg-zinc-200" />
      
      {/* 콘텐츠 스켈레톤 */}
      <div className="p-4 space-y-3">
        {/* 카테고리 뱃지 */}
        <div className="h-5 w-16 bg-zinc-200 rounded-full" />
        
        {/* 제목 */}
        <div className="space-y-2">
          <div className="h-5 bg-zinc-200 rounded w-3/4" />
          <div className="h-4 bg-zinc-200 rounded w-1/2" />
        </div>
        
        {/* 메타 정보 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-zinc-200 rounded" />
            <div className="h-4 bg-zinc-200 rounded w-24" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-zinc-200 rounded" />
            <div className="h-4 bg-zinc-200 rounded w-20" />
          </div>
        </div>
        
        {/* 상태 및 참가자 수 */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-12 bg-zinc-200 rounded" />
          <div className="h-4 bg-zinc-200 rounded w-16" />
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-zinc-200 rounded" />
          <div className="w-10 h-10 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export function EventCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}
