import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'
import { Calendar, AlertCircle } from 'lucide-react'
import EventFilters from '../components/event/EventFilters'
import { EventCardSkeletonGrid } from '../components/skeletons/EventCardSkeleton'
import { useInfiniteEvents } from '@/features/events/api/useInfiniteEvents'
import type { EventStatus } from '@/features/events/types'
import EventBanner from '@/components/EventBanner'
import { Badge } from '@/components/ui/badge'

interface HomePageProps {
  onCreateSocialing?: () => void
}

export default function HomePage({ onCreateSocialing }: HomePageProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const [searchQuery, setSearchQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(6)

  // URL 파라미터에서 필터 값 추출
  const category = searchParams.get('category') || ''
  const status = (searchParams.get('status') as EventStatus) || undefined
  const sort = searchParams.get('sort') || 'NEW_DESC'

  // 이벤트 데이터 가져오기
  const { 
    data: eventsData, 
    isLoading, 
    isError, 
    error
  } = useInfiniteEvents({
    category: category || undefined,
    status: status || undefined,
    sort: sort as any,
    q: searchQuery || undefined,
  })

  // 모든 이벤트를 하나의 배열로 합치기
  const allEvents = useMemo(() => {
    const events = eventsData?.pages.flatMap(page => page.content) || []
    console.log('HomePage - Total events loaded:', events.length)
    console.log('HomePage - Events:', events)
    return events
  }, [eventsData])

  // OAuth 성공/실패 후 처리
  useEffect(() => {
    const oauthParam = searchParams.get('oauth')
    const oauthMessage = searchParams.get('message')

    if (oauthParam === 'success') {
      // OAuth 성공 시 URL 파라미터 정리
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('oauth')
        newParams.delete('message')
        return newParams
      }, { replace: true })
    } else if (oauthParam === 'error') {
      console.error('OAuth login failed:', oauthMessage)
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('oauth')
        newParams.delete('message')
        return newParams
      }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // URL 파라미터 업데이트 함수
  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })
      return newParams
    })
  }, [setSearchParams])

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    updateSearchParams({ search: searchQuery || null })
  }, [searchQuery, updateSearchParams])

  // 더보기 버튼 핸들러
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  return (
    <div className="min-h-screen bg-#fffffftext-gray-900">
      {/* 헤더 높이만큼 여백 추가 */}
      <div className="pt-8">
        {/* 이벤트 배너 */}
        <div className="mx-6 mb-8">
          <EventBanner />
          </div>

        {/* 검색창과 태그 버튼 */}
        <div className="px-6 mb-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
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
                onChangeCategory={(c) => updateSearchParams({ category: c || null })}
                status={status || null}
                onChangeStatus={(s) => updateSearchParams({ status: s || null })}
                sort={sort || null}
                onChangeSort={(s) => updateSearchParams({ sort: s || null })}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* 최근 개설된 모임 */}
        <section className="px-6 py-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">🆕 최근 개설된 모임</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <EventCardSkeletonGrid count={6} />
              ) : allEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="cursor-pointer group" onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="overflow-hidden relative bg-white rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    {/* 썸네일 */}
                    <div className="overflow-hidden relative h-48 bg-white">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          style={{ 
                            objectFit: 'cover',
                            objectPosition: 'center center',
                            width: '100%',
                            height: '100%'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="flex justify-center items-center w-full h-full bg-white"><span class="text-xl font-medium text-gray-400">NoImage</span></div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full bg-white">
                          <span className="text-xl font-medium text-gray-400">NoImage</span>
                        </div>
                      )}
                      {/* 태그 */}
                      <div className="absolute top-3 left-3">
                        <Badge className="text-xs text-white bg-black">
                          {event.category}
                        </Badge>
                      </div>
                      {/* 참가인원수 */}
                      <div className="absolute top-3 right-3">
                        <div className="px-2 py-1 text-xs text-white rounded-full bg-black/50">
                          {event.currentParticipants}/{event.maxParticipants}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {/* 제목 */}
                      <h3 className="mb-1 text-base font-bold text-gray-800 transition-colors line-clamp-2 group-hover:text-orange-500">
                        {event.title}
                      </h3>
                      
                      {/* 소제목 */}
                      <p className="mb-3 text-sm text-gray-600 line-clamp-1">
                        {event.description}
                      </p>
                      
                      {/* 하단 정보 (마감일 + 작성자) */}
                      <div className="flex justify-between items-center mb-3">
                        {/* 마감날짜 (좌측하단) */}
                        <div className="text-xs text-gray-500">
                          마감: {event.endDate ? new Date(event.endDate).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric'
                          }) : '미정'}
                        </div>
                        
                        {/* 작성자 (우측하단) */}
                        <div className="flex items-center text-sm text-gray-600">
                          <img
                            src={event.hostProfileImage || `https://ui-avatars.com/api/?name=${event.hostNickname}&background=orange&color=white&size=24`}
                            alt={event.hostNickname}
                            className="object-cover mr-2 w-6 h-6 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${event.hostNickname}&background=orange&color=white&size=24`
                            }}
                          />
                          <span>{event.hostNickname}</span>
                        </div>
                      </div>
                      
                      {/* 참가하기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isAuthenticated) {
                            setAuthModalMode('login')
                            setIsAuthModalOpen(true)
                          } else {
                            navigate(`/events/${event.id}`)
                          }
                        }}
                        className="w-full py-2 px-4 bg-[#F5E6B3] text-gray-800 text-sm font-medium rounded-lg hover:bg-[#E8D89C] transition-colors duration-200"
                      >
                        참가하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 인기 모임 */}
        <section className="px-6 py-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">🔥 인기 모임</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <EventCardSkeletonGrid count={6} />
              ) : allEvents.slice(6, 12).map((event) => (
                <div key={event.id} className="cursor-pointer group" onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="overflow-hidden relative bg-white rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    {/* 썸네일 */}
                    <div className="overflow-hidden relative h-48 bg-white">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          style={{ 
                            objectFit: 'cover',
                            objectPosition: 'center center',
                            width: '100%',
                            height: '100%'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="flex justify-center items-center w-full h-full bg-white"><span class="text-xl font-medium text-gray-400">NoImage</span></div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full bg-white">
                          <span className="text-xl font-medium text-gray-400">NoImage</span>
                        </div>
                      )}
                      {/* 태그 */}
                      <div className="absolute top-3 left-3">
                        <Badge className="text-xs text-white bg-black">
                          {event.category}
                        </Badge>
                      </div>
                      {/* 참가인원수 */}
                      <div className="absolute top-3 right-3">
                        <div className="px-2 py-1 text-xs text-white rounded-full bg-black/50">
                          {event.currentParticipants}/{event.maxParticipants}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {/* 제목 */}
                      <h3 className="mb-1 text-base font-bold text-gray-800 transition-colors line-clamp-2 group-hover:text-orange-500">
                        {event.title}
                      </h3>
                      
                      {/* 소제목 */}
                      <p className="mb-3 text-sm text-gray-600 line-clamp-1">
                        {event.description}
                      </p>
                      
                      {/* 하단 정보 (마감일 + 작성자) */}
                      <div className="flex justify-between items-center mb-3">
                        {/* 마감날짜 (좌측하단) */}
                        <div className="text-xs text-gray-500">
                          마감: {event.endDate ? new Date(event.endDate).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric'
                          }) : '미정'}
                        </div>
                        
                        {/* 작성자 (우측하단) */}
                        <div className="flex items-center text-sm text-gray-600">
                          <img
                            src={event.hostProfileImage || `https://ui-avatars.com/api/?name=${event.hostNickname}&background=orange&color=white&size=24`}
                            alt={event.hostNickname}
                            className="object-cover mr-2 w-6 h-6 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${event.hostNickname}&background=orange&color=white&size=24`
                            }}
                          />
                          <span>{event.hostNickname}</span>
                        </div>
                      </div>
                      
                      {/* 참가하기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isAuthenticated) {
                            setAuthModalMode('login')
                            setIsAuthModalOpen(true)
                          } else {
                            navigate(`/events/${event.id}`)
                          }
                        }}
                        className="w-full py-2 px-4 bg-[#F5E6B3] text-gray-800 text-sm font-medium rounded-lg hover:bg-[#E8D89C] transition-colors duration-200"
                      >
                        참가하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 전체 모임 */}
        <section className="px-6 py-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">📋 전체 모임</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <EventCardSkeletonGrid count={12} />
              ) : isError ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex justify-center items-center mb-4 w-16 h-16 text-orange-400 bg-orange-50 rounded-full">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">데이터를 불러오는 중 오류가 발생했습니다</h3>
                  {error && <p className="text-red-600">{(error as Error).message}</p>}
                </div>
              ) : allEvents.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex justify-center items-center mb-4 w-16 h-16 text-orange-400 bg-orange-50 rounded-full">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">표시할 소셜링이 없습니다</h3>
                  <p className="mb-8 text-gray-600">새로운 소셜링을 만들어보세요!</p>
                  {isAuthenticated && (
                    <button 
                      onClick={onCreateSocialing}
                      className="px-8 py-4 font-semibold text-black bg-gradient-to-r from-[#FFA700] to-[#FFFFFF] rounded-2xl transition-all duration-300 transform hover:from-[#FFA700]/80 hover:to-[#FFFFFF]/80 hover:scale-105"
                    >
                        소셜링 만들기
                      </button>
                  )}
                </div>
              ) : (
                allEvents.slice(0, displayCount).map((event) => (
                  <div
                    key={event.id}
                    className="group"
                  >
                    <div className="overflow-hidden relative bg-white rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* 썸네일 */}
                      <div className="overflow-hidden relative h-48 bg-white">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            style={{ 
                              objectFit: 'cover',
                              objectPosition: 'center center',
                              width: '100%',
                              height: '100%'
                            }}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                parent.innerHTML = '<div class="flex justify-center items-center w-full h-full bg-white"><span class="text-xl font-medium text-gray-400">NoImage</span></div>'
                              }
                            }}
                          />
                        ) : (
                          <div className="flex justify-center items-center w-full h-full bg-white">
                            <span className="text-xl font-medium text-gray-400">NoImage</span>
                          </div>
                        )}
                        {/* 태그 */}
                        <div className="absolute top-3 left-3">
                          <Badge className="text-xs text-white bg-black">
                            {event.category}
                          </Badge>
                        </div>
                        {/* 참가인원수 */}
                        <div className="absolute top-3 right-3">
                          <div className="px-2 py-1 text-xs text-white rounded-full bg-black/50">
                            {event.currentParticipants}/{event.maxParticipants}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* 제목 */}
                        <h3 className="mb-1 text-base font-bold text-gray-800 transition-colors line-clamp-2 group-hover:text-orange-500">
                          {event.title}
                        </h3>
                        
                        {/* 소제목 */}
                        <p className="mb-3 text-sm text-gray-600 line-clamp-1">
                          {event.description}
                        </p>
                        
                        {/* 하단 정보 (마감일 + 작성자) */}
                        <div className="flex justify-between items-center mb-3">
                          {/* 마감날짜 (좌측하단) */}
                          <div className="text-xs text-gray-500">
                            마감: {event.endDate ? new Date(event.endDate).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric'
                            }) : '미정'}
                          </div>
                          
                          {/* 작성자 (우측하단) */}
                          <div className="flex items-center text-sm text-gray-600">
                            <img
                              src={event.hostProfileImage || `https://ui-avatars.com/api/?name=${event.hostNickname}&background=orange&color=white&size=24`}
                              alt={event.hostNickname}
                              className="object-cover mr-2 w-6 h-6 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${event.hostNickname}&background=orange&color=white&size=24`
                              }}
                            />
                            <span>{event.hostNickname}</span>
                          </div>
                      </div>
                      
                        {/* 참가하기 버튼 */}
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              setAuthModalMode('login')
                              setIsAuthModalOpen(true)
                            } else {
                              navigate(`/events/${event.id}`)
                            }
                          }}
                          className="w-full py-2 px-4 bg-[#F5E6B3] text-gray-800 text-sm font-medium rounded-lg hover:bg-[#E8D89C] transition-colors duration-200"
                        >
                          참가하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* 더보기 버튼 */}
            {displayCount < allEvents.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 text-base font-medium text-gray-800 bg-[#F5E6B3] rounded-lg hover:bg-[#E8D89C] transition-colors duration-200"
                >
                  더보기 ({allEvents.length - displayCount}개 남음)
                </button>
              </div>
            )}

            {/* 모든 데이터를 확인했을 때 */}
            {displayCount >= allEvents.length && allEvents.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-gray-500">모든 소셜링을 확인했습니다</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 로그인 모달 */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

    </div>
  )
}