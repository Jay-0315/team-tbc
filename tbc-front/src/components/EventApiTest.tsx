import { useState, useEffect } from 'react'
import { fetchEvents } from '../services/events'
import { SORT_OPTIONS, EVENT_STATUS, EVENT_CATEGORIES } from '../types/event'
import type { Page, EventCardDTO } from '../types/event'

export function EventApiTest() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])
    addResult('🚀 이벤트 API 래퍼 테스트 시작...')

    try {
      // 1. 기본 목록 조회
      addResult('1️⃣ 기본 목록 조회 테스트')
      const basicEvents = await fetchEvents()
      addResult(`✅ 성공: 총 ${basicEvents.totalElements}개, 현재 페이지 ${basicEvents.number}, 이벤트 ${basicEvents.content.length}개`)
      addResult(`첫 번째 이벤트: ${basicEvents.content[0]?.title}`)

      // 2. 검색 기능
      addResult('2️⃣ 검색 기능 테스트')
      const searchEvents = await fetchEvents({ q: 'test', page: 0, size: 5 })
      addResult(`✅ 성공: 'test' 검색 결과 ${searchEvents.content.length}개 (총 ${searchEvents.totalElements}개)`)

      // 3. 정렬 기능
      addResult('3️⃣ 정렬 기능 테스트 (시작일 순)')
      const sortedEvents = await fetchEvents({ 
        sort: SORT_OPTIONS.START_ASC, 
        page: 0, 
        size: 3 
      })
      addResult(`✅ 성공: START_ASC 정렬, ${sortedEvents.content.length}개 이벤트`)
      addResult(`첫 번째 이벤트 시작일: ${new Date(sortedEvents.content[0]?.startAt || '').toLocaleString()}`)

      // 4. 필터링 기능
      addResult('4️⃣ 필터링 기능 테스트 (카테고리 + 상태)')
      const filteredEvents = await fetchEvents({
        category: EVENT_CATEGORIES.WORKSHOP,
        status: EVENT_STATUS.OPEN,
        page: 0,
        size: 5
      })
      addResult(`✅ 성공: workshop + OPEN 필터, ${filteredEvents.content.length}개 (총 ${filteredEvents.totalElements}개)`)

      // 5. 리뷰 많은 순 정렬
      addResult('5️⃣ 리뷰 많은 순 정렬 테스트')
      const popularEvents = await fetchEvents({
        sort: SORT_OPTIONS.REVIEWS_DESC,
        page: 0,
        size: 3
      })
      addResult(`✅ 성공: REVIEWS_DESC 정렬, ${popularEvents.content.length}개 이벤트`)

      // 6. 페이지네이션
      addResult('6️⃣ 페이지네이션 테스트')
      const page1 = await fetchEvents({ page: 0, size: 2 })
      const page2 = await fetchEvents({ page: 1, size: 2 })
      addResult(`✅ 성공: 페이지1 ${page1.content.length}개, 페이지2 ${page2.content.length}개`)
      addResult(`페이지1: first=${page1.first}, last=${page1.last}`)
      addResult(`페이지2: first=${page2.first}, last=${page2.last}`)

      // 7. 복합 검색
      addResult('7️⃣ 복합 검색 테스트')
      const complexSearch = await fetchEvents({
        q: '샘플',
        category: EVENT_CATEGORIES.MEETUP,
        status: EVENT_STATUS.OPEN,
        sort: SORT_OPTIONS.CREATED_DESC,
        page: 0,
        size: 3
      })
      addResult(`✅ 성공: 복합 검색 결과 ${complexSearch.content.length}개 (총 ${complexSearch.totalElements}개)`)

      addResult('🎉 모든 테스트 통과! 이벤트 API 래퍼가 정상 작동합니다.')

    } catch (error: any) {
      addResult(`❌ 테스트 실패: ${error.message}`)
      console.error('테스트 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">이벤트 API 래퍼 테스트</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '테스트 실행 중...' : '테스트 실행'}
        </button>
        <button
          onClick={() => setTestResults([])}
          className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          결과 지우기
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">테스트 결과:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">테스트를 실행해주세요.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">테스트 항목:</h3>
        <ul className="text-sm space-y-1">
          <li>• 기본 목록 조회 (fetchEvents())</li>
          <li>• 검색 기능 (q 파라미터)</li>
          <li>• 정렬 기능 (sort 파라미터)</li>
          <li>• 필터링 기능 (category, status)</li>
          <li>• 리뷰 많은 순 정렬 (REVIEWS_DESC)</li>
          <li>• 페이지네이션 (page, size)</li>
          <li>• 복합 검색 (여러 파라미터 조합)</li>
        </ul>
      </div>
    </div>
  )
}
