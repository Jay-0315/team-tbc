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
      gradient: "from-purple-900/80 to-pink-900/80"
    },
    { 
      id: 2, 
      title: "가을맞이 캠핑 이벤트", 
      desc: "야외에서 즐기는 캠핑과 바베큐", 
      imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-pink-900/80 to-blue-900/80"
    },
    { 
      id: 3, 
      title: "스터디 그룹 모집", 
      desc: "같이 공부할 사람을 찾아보세요!", 
      imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1740&auto=format&fit=crop",
      gradient: "from-blue-900/80 to-purple-900/80"
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
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/60 to-pink-100/60"></div>
          </div>
          
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #a78bfa 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #f472b6 0%, transparent 50%)`,
            }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
            <div className="max-w-6xl">
              {/* 상단 배지 */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-purple-700 bg-white/80 rounded-full backdrop-blur-sm border border-purple-200 shadow-lg">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  새로운 소셜링 플랫폼
                </span>
              </div>
              
              {/* 메인 타이틀 */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {banner.title}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                {banner.desc}
              </p>
              
              {/* CTA 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {!isAuthenticated ? (
                  <>
                    <button 
                      className="group px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-2xl transition-all duration-300 transform hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-purple-300/30"
                      onClick={onLoginClick}
                    >
                      <span className="flex items-center gap-3">
                        <Users className="w-6 h-6" />
                        로그인 후 참여하기
                      </span>
                    </button>
                    <button 
                      className="px-8 py-4 text-lg font-semibold text-purple-500 rounded-2xl border-2 border-purple-200 backdrop-blur-sm transition-all duration-300 transform hover:bg-purple-25 hover:border-purple-300 hover:scale-105"
                      onClick={onSignupClick}
                    >
                      무료 회원가입
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/groups/create">
                      <button className="group px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-2xl transition-all duration-300 transform hover:from-purple-500 hover:to-pink-500 hover:scale-110 hover:shadow-purple-300/40">
                        <span className="flex items-center gap-4">
                          <Plus className="w-7 h-7" />
                          소셜링 만들기
                        </span>
                      </button>
                    </Link>
                    <Link to="/events">
                      <button className="px-8 py-4 text-lg font-semibold text-purple-500 rounded-2xl border-2 border-purple-200 backdrop-blur-sm transition-all duration-300 transform hover:bg-purple-25 hover:border-purple-300 hover:scale-105">
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
