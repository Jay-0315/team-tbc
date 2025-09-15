// 무한 스크롤 이벤트 페이지 사용 예시

// 1. 기본 사용법
// 브라우저에서 http://localhost:3001/events 접속
// - 페이지 로드 시 자동으로 첫 번째 페이지 로드
// - 스크롤 다운 시 자동으로 다음 페이지 로드
// - 검색어 입력 시 350ms 디바운스 후 결과 갱신

// 2. URL 쿼리 파라미터 동기화
// - 검색: /events?q=영화
// - 카테고리: /events?category=workshop
// - 상태: /events?status=OPEN
// - 정렬: /events?sort=START_ASC
// - 복합: /events?q=샘플&category=meetup&status=OPEN&sort=REVIEWS_DESC

// 3. 접근성 기능
// - aria-live="polite"로 로딩 상태 알림
// - "다음 페이지 로딩 중..." / "마지막입니다" 메시지
// - 모든 버튼과 입력에 aria-label 제공

// 4. 성능 최적화
// - IntersectionObserver rootMargin: "600px"로 미리 로드
// - 이미지 lazy loading (EventCard에서 처리)
// - React.memo로 카드 컴포넌트 최적화 가능

// 5. 상태 관리
// - 로딩: 스켈레톤 12개 표시
// - 에러: role="alert" + 재시도 버튼
// - 빈 상태: "조건에 맞는 이벤트가 없어요" + 초기화 버튼

// 6. 스크롤 위치 유지
// - 페이지 이동 시 스크롤 위치 sessionStorage에 저장
// - 돌아올 때 저장된 위치로 복원

export const infiniteScrollFeatures = {
  // 검색 기능
  search: {
    debounce: '350ms',
    placeholder: '이벤트 검색...',
    icon: 'Search (lucide-react)'
  },
  
  // 필터링
  filters: {
    categories: ['music', 'movie', 'book', 'game', 'workshop', 'networking'],
    status: ['UPCOMING', 'OPEN', 'WAITLIST', 'CLOSED'],
    sort: ['CREATED_DESC', 'START_ASC', 'DEADLINE_ASC', 'REVIEWS_DESC']
  },
  
  // 무한 스크롤
  infiniteScroll: {
    pageSize: 12,
    rootMargin: '600px',
    sentinelHeight: '16px'
  },
  
  // 접근성
  accessibility: {
    ariaLive: 'polite',
    loadingMessage: '다음 페이지 로딩 중...',
    endMessage: '마지막입니다',
    emptyMessage: '조건에 맞는 이벤트가 없어요'
  },
  
  // URL 동기화
  urlSync: {
    searchParam: 'q',
    categoryParam: 'category', 
    statusParam: 'status',
    sortParam: 'sort',
    replace: true // history.replaceState 사용
  }
}

// 7. 개발자 도구에서 확인할 수 있는 것들
export const devTools = {
  // React Query DevTools에서 확인 가능
  queryKeys: [
    'events',
    'infinite', 
    { q: '검색어', category: 'workshop', status: 'OPEN', sort: 'CREATED_DESC' }
  ],
  
  // Network 탭에서 확인 가능
  apiCalls: [
    'GET /api/events?page=0&size=12',
    'GET /api/events?q=영화&page=0&size=12',
    'GET /api/events?q=영화&page=1&size=12',
    'GET /api/events?q=영화&page=2&size=12'
  ],
  
  // Console에서 확인 가능
  consoleLogs: [
    'IntersectionObserver: 센티넬 감지됨',
    'fetchNextPage 호출됨',
    'URL 업데이트됨: ?q=샘플&category=meetup'
  ]
}
