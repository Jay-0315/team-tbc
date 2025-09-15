import { useState } from 'react'
import { Link } from 'react-router-dom'

export function InfiniteScrollTest() {
  const [testUrl, setTestUrl] = useState('/events')

  const testCases = [
    { label: '기본 페이지', url: '/events' },
    { label: '검색 테스트', url: '/events?q=샘플' },
    { label: '카테고리 필터', url: '/events?category=workshop' },
    { label: '상태 필터', url: '/events?status=OPEN' },
    { label: '정렬 테스트', url: '/events?sort=START_ASC' },
    { label: '복합 검색', url: '/events?q=샘플&category=meetup&status=OPEN&sort=REVIEWS_DESC' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">무한 스크롤 이벤트 페이지 테스트</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">테스트 케이스</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testCases.map((testCase) => (
            <Link
              key={testCase.url}
              to={testCase.url}
              className="p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              onClick={() => setTestUrl(testCase.url)}
            >
              <div className="font-medium">{testCase.label}</div>
              <div className="text-sm text-gray-600">{testCase.url}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">기능 확인 사항</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ <strong>무한 스크롤:</strong> 스크롤 다운 시 자동으로 다음 페이지 로드</li>
          <li>✅ <strong>검색 디바운스:</strong> 검색어 입력 후 350ms 후 결과 갱신</li>
          <li>✅ <strong>URL 동기화:</strong> 필터 변경 시 URL 쿼리 파라미터 업데이트</li>
          <li>✅ <strong>접근성:</strong> aria-live 메시지와 스크린리더 지원</li>
          <li>✅ <strong>로딩 상태:</strong> 스켈레톤 카드와 로딩 메시지</li>
          <li>✅ <strong>에러 처리:</strong> 재시도 버튼과 에러 메시지</li>
          <li>✅ <strong>빈 상태:</strong> 검색 결과 없을 때 초기화 버튼</li>
          <li>✅ <strong>스크롤 복원:</strong> 페이지 이동 후 스크롤 위치 유지</li>
        </ul>
      </div>

      <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">성능 최적화</h2>
        <ul className="space-y-2 text-sm">
          <li>🚀 <strong>IntersectionObserver:</strong> rootMargin 600px로 미리 로드</li>
          <li>🚀 <strong>React Query:</strong> 5분 staleTime, 10분 gcTime</li>
          <li>🚀 <strong>이미지 지연 로딩:</strong> EventCard에서 lazy loading</li>
          <li>🚀 <strong>디바운싱:</strong> 검색 입력 350ms 디바운스</li>
        </ul>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">현재 테스트 URL</h2>
        <code className="text-sm bg-white p-2 rounded border block">
          {testUrl}
        </code>
        <p className="text-sm text-gray-600 mt-2">
          위 링크를 클릭하여 무한 스크롤 기능을 테스트해보세요.
        </p>
      </div>
    </div>
  )
}
