// 이벤트 API 사용 예시
import { fetchEvents } from '../services/events'
import { SORT_OPTIONS, EVENT_STATUS, EVENT_CATEGORIES } from '../types/event'

// 기본 사용법
export async function basicUsage() {
  // 기본 목록 조회 (첫 페이지, 12개)
  const events = await fetchEvents()
  console.log('총 이벤트 수:', events.totalElements)
  console.log('현재 페이지:', events.number)
  console.log('이벤트 목록:', events.content)
}

// 검색 및 필터링
export async function searchAndFilter() {
  // 영화 관련 이벤트 검색, 시작일 순 정렬
  const movieEvents = await fetchEvents({
    q: '영화',
    sort: SORT_OPTIONS.START_ASC,
    page: 0,
    size: 12
  })
  
  // 워크샵 카테고리, 오픈 상태 이벤트
  const workshopEvents = await fetchEvents({
    category: EVENT_CATEGORIES.WORKSHOP,
    status: EVENT_STATUS.OPEN,
    page: 0,
    size: 20
  })
  
  // 리뷰 많은 순 정렬
  const popularEvents = await fetchEvents({
    sort: SORT_OPTIONS.REVIEWS_DESC,
    page: 0,
    size: 10
  })
}

// 무한 스크롤 구현 예시
export async function infiniteScrollExample() {
  const pageSize = 12
  let currentPage = 0
  let hasMore = true
  const allEvents = []
  
  while (hasMore) {
    const result = await fetchEvents({
      q: '샘플',
      sort: SORT_OPTIONS.CREATED_DESC,
      page: currentPage,
      size: pageSize
    })
    
    allEvents.push(...result.content)
    hasMore = !result.last
    currentPage++
    
    console.log(`페이지 ${currentPage} 로드 완료. 총 ${allEvents.length}개 이벤트`)
  }
  
  return allEvents
}

// React Query와 함께 사용하는 예시
export function useEventsQuery() {
  // 이 함수는 실제로는 React Query 훅에서 사용됩니다
  return {
    // 기본 목록
    basic: () => fetchEvents(),
    
    // 검색
    search: (query: string) => fetchEvents({ q: query }),
    
    // 필터링
    filter: (category: string, status: string) => 
      fetchEvents({ category, status }),
    
    // 정렬
    sort: (sort: string) => fetchEvents({ sort }),
    
    // 페이지네이션
    page: (page: number, size: number) => 
      fetchEvents({ page, size })
  }
}

// 타입 안전성 검증 예시
export function typeSafetyExample() {
  // ✅ 올바른 사용법
  fetchEvents({
    q: '영화',
    category: EVENT_CATEGORIES.WORKSHOP,
    status: EVENT_STATUS.OPEN,
    sort: SORT_OPTIONS.START_ASC,
    page: 0,
    size: 12
  })
  
  // ✅ 부분적 파라미터
  fetchEvents({ q: '검색어' })
  fetchEvents({ page: 1, size: 20 })
  
  // ✅ 빈 파라미터 (기본값 사용)
  fetchEvents()
  
  // ❌ 잘못된 타입 (TypeScript가 컴파일 에러 발생)
  // fetchEvents({ q: 123 }) // string이어야 함
  // fetchEvents({ status: 'INVALID' }) // 유효하지 않은 상태
  // fetchEvents({ sort: 'INVALID_SORT' }) // 유효하지 않은 정렬
}
