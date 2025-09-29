import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Calendar, Sparkles } from 'lucide-react'

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
    <section className="relative h-[70vh] overflow-hidden">
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
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-85`}></div>
          </div>
          <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
            <div className="max-w-5xl">
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-4 h-4" />
                  새로운 소셜링 플랫폼
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                {banner.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                {banner.desc}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {!isAuthenticated ? (
                  <>
                    <button 
                      className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-2xl transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-red-500/25"
                      onClick={onLoginClick}
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        로그인 후 참여하기
                      </span>
                    </button>
                    <button 
                      className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:bg-white/10 hover:border-white hover:scale-105"
                      onClick={onSignupClick}
                    >
                      무료 회원가입
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/groups/create">
                      <button className="group px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-2xl transition-all duration-300 transform hover:from-red-600 hover:to-red-700 hover:scale-110 hover:shadow-red-500/30">
                        <span className="flex items-center gap-3">
                          <Plus className="w-6 h-6" />
                          소셜링 만들기
                        </span>
                      </button>
                    </Link>
                    <Link to="/events">
                      <button className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:bg-white/10 hover:border-white hover:scale-105">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          이벤트 둘러보기
                        </span>
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
