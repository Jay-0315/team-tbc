import { useState } from 'react'
import { EventReviews } from './review/EventReviews'

export function ReviewTest() {
  const [eventId, setEventId] = useState(1)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">리뷰 UI 컴포넌트 테스트</h1>
      
      {/* 이벤트 ID 선택 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium mb-2">테스트할 이벤트 ID:</label>
        <select 
          value={eventId} 
          onChange={(e) => setEventId(Number(e.target.value))}
          className="border rounded px-3 py-2 bg-white"
        >
          {[1, 2, 3, 4, 5, 25].map(id => (
            <option key={id} value={id}>이벤트 {id}</option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-2">
          이벤트 {eventId}의 리뷰를 확인하고 새 리뷰를 작성해보세요.
        </p>
      </div>

      {/* 리뷰 컴포넌트 */}
      <EventReviews eventId={eventId} />
    </div>
  )
}
