export default function NoticePage() {
  const notices = [
    {
      id: 1,
      title: 'HolaPop 서비스 정식 오픈!',
      date: '2025.01.15',
      content: '안녕하세요! HolaPop 서비스가 정식으로 오픈했습니다. 다양한 소셜링을 만들고 참여해보세요!'
    },
    {
      id: 2,
      title: '신규 카테고리 추가 안내',
      date: '2025.01.10',
      content: '운동, 스터디, 취미 등 다양한 카테고리가 추가되었습니다. 원하는 모임을 더 쉽게 찾아보세요.'
    },
    {
      id: 3,
      title: '결제 시스템 개선 안내',
      date: '2025.01.05',
      content: '더욱 안전하고 편리한 결제 시스템으로 업그레이드되었습니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">공지사항</h1>
        
        <div className="space-y-4">
          {notices.map((notice) => (
            <div 
              key={notice.id} 
              className="border border-gray-200 rounded-lg p-6 hover:border-yellow-400 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{notice.title}</h2>
                <span className="text-sm text-gray-500">{notice.date}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{notice.content}</p>
            </div>
          ))}
        </div>

        {notices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 