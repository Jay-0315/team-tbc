import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EventBanner {
  id: number
  title: string
  description: string
  imageUrl: string
  gradient: string
  ctaText: string
  ctaLink: string
}

const eventBanners: EventBanner[] = [
  {
    id: 1,
    title: "신규 회원 50% 할인",
    description: "첫 이벤트 참여 시 모든 참가비 50% 할인!",
    imageUrl: "/event1.png",
    gradient: "from-purple-600/80 to-pink-600/80",
    ctaText: "지금 참여하기",
    ctaLink: "/"
  },
  {
    id: 2,
    title: "가을 캠핑 이벤트",
    description: "야외에서 즐기는 캠핑과 바베큐 파티",
    imageUrl: "/event2.png",
    gradient: "from-green-600/80 to-blue-600/80",
    ctaText: "캠핑 참여하기",
    ctaLink: "/?category=camping"
  },
  {
    id: 3,
    title: "스터디 그룹 모집",
    description: "같이 공부할 사람을 찾아보세요!",
    imageUrl: "/event3.png",
    gradient: "from-blue-600/80 to-purple-600/80",
    ctaText: "스터디 참여하기",
    ctaLink: "/?category=study"
  },
  {
    id: 4,
    title: "창작 워크샵",
    description: "함께 만들어가는 예술의 세계",
    imageUrl: "/eventg4.png",
    gradient: "from-pink-600/80 to-orange-600/80",
    ctaText: "워크샵 참여하기",
    ctaLink: "/?category=art"
  }
]

export default function EventBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // 5초마다 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === eventBanners.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? eventBanners.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === eventBanners.length - 1 ? 0 : currentIndex + 1)
  }

  const currentBanner = eventBanners[currentIndex]

  return (
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <img 
          src={currentBanner.imageUrl} 
          alt={currentBanner.title} 
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {/* 검은색 반투명 오버레이 */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* 콘텐츠 - 좌측 상단 */}
      <div className="absolute top-6 left-4 z-10 max-w-md">
        <h2 className="mb-3 text-2xl md:text-3xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {currentBanner.title}
        </h2>
        <p className="mb-6 text-base md:text-lg font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {currentBanner.description}
        </p>
      </div>

      {/* 좌측 하단 선택 버튼들 */}
      <div className="absolute bottom-6 left-4 z-20">
        <div className="flex space-x-2">
          {eventBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`이벤트 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>

      {/* 네비게이션 화살표 (선택사항) */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
        aria-label="이전 이벤트"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
        aria-label="다음 이벤트"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </section>
  )
}
