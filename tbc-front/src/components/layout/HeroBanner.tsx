import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Banner {
  id: number
  title: string
  desc: string
  imageUrl: string
  gradient: string
}

interface HeroBannerProps {
  isAuthenticated: boolean
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function HeroBanner({ isAuthenticated, onLoginClick, onSignupClick }: HeroBannerProps) {
  const [banners] = useState<Banner[]>([
    { 
      id: 1, 
      title: "이달의 추천 이벤트", 
      desc: "새로운 친구들과 함께하세요!", 
      imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-gray-900 to-black"
    },
    { 
      id: 2, 
      title: "가을맞이 캠핑 이벤트", 
      desc: "야외에서 즐기는 캠핑과 바베큐", 
      imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-gray-800 to-gray-900"
    },
    { 
      id: 3, 
      title: "스터디 그룹 모집", 
      desc: "같이 공부할 사람을 찾아보세요!", 
      imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-black to-gray-800"
    },
  ])
  const [bannerIndex, setBannerIndex] = useState(0)

  // 배너 자동 슬라이드
  useEffect(() => {
    const id = window.setInterval(() => {
      setBannerIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => window.clearInterval(id)
  }, [banners.length])

  return (
    <section className="relative h-[60vh] overflow-hidden">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === bannerIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0">
            <img 
              src={banner.imageUrl} 
              alt={banner.title} 
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} dark:opacity-90 opacity-80`}></div>
          </div>
          <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">{banner.title}</h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">{banner.desc}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {!isAuthenticated ? (
                  <>
                    <button 
                      className="px-8 py-4 text-lg font-semibold text-black bg-white rounded-full shadow-xl transition-all duration-300 transform hover:bg-gray-100 hover:scale-105"
                      onClick={onLoginClick}
                    >
                      로그인 후 참여하기
                    </button>
                    <button 
                      className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white transition-all duration-300 transform hover:bg-white hover:text-black hover:scale-105"
                      onClick={onSignupClick}
                    >
                      무료 회원가입
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/groups/create">
                      <button className="px-8 py-4 text-lg font-semibold text-black bg-white rounded-full shadow-xl transition-all duration-300 transform hover:bg-gray-100 hover:scale-105">
                        소셜링 만들기
                      </button>
                    </Link>
                    <Link to="/events">
                      <button className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white transition-all duration-300 transform hover:bg-white hover:text-black hover:scale-105">
                        이벤트 둘러보기
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
