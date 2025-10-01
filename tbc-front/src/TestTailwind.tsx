export default function TestTailwind() {
  return (
    <div className="p-8 bg-blue-500 text-white">
      <h1 className="text-4xl font-bold mb-4">Tailwind CSS 테스트</h1>
      <p className="text-lg">이 텍스트가 파란 배경에 흰색으로 보인다면 Tailwind가 작동하고 있습니다!</p>
      <button className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
        테스트 버튼
      </button>
    </div>
  )
}
