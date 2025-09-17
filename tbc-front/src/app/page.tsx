import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/PostCard'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/auth'

type PageProps = {
  user: User | null
  onOpenLogin?: () => void
  onOpenSignup?: () => void
}

// 배너 타입
type Banner = {
  id: number
  title: string
  desc: string
  imageUrl: string
}

export default function Page({ user, onOpenLogin, onOpenSignup }: PageProps) {
  const { isAuthenticated } = useAuth()
  const { data: postsData, isLoading: isLoadingPosts } = usePosts(0, 6) // Show first 6 posts on homepage
  
  // 더미 배너 데이터 (무료 이미지 예시: unsplash)
  const [banners] = useState<Banner[]>([
    { id: 1, title: "이달의 추천 모임", desc: "새로운 친구들과 함께하세요!", imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 2, title: "가을맞이 캠핑 이벤트", desc: "야외에서 즐기는 캠핑과 바베큐", imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 3, title: "스터디 그룹 모집", desc: "같이 공부할 사람을 찾아보세요!", imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ])

  const [bannerIndex, setBannerIndex] = useState(0)

  const handlePrevBanner = () => {
    setBannerIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const handleNextBanner = () => {
    setBannerIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* ✅ 이벤트 배너 슬라이드 */}
      <section className="event-banner">
        <div className="slider-wrapper">
          <button className="slider-btn prev" onClick={handlePrevBanner}>&lt;</button>

          <div className="slider">
            <div
              className="slider-track"
              style={{
                transform: `translateX(-${bannerIndex * 100}%)`,
                width: `${banners.length * 100}%`,
              }}
            >
              {banners.map(banner => (
                <div key={banner.id} className="banner-slide">
                  <img src={banner.imageUrl} alt={banner.title} />
                  <div className="banner-overlay">
                    <h1 className="banner-title">{banner.title}</h1>
                    <p className="banner-desc">{banner.desc}</p>
                    {!isAuthenticated ? (
                      <div className="banner-actions">
                        <button className="btn-primary btn-large" onClick={onOpenLogin}>
                          로그인 후 참여하기
                        </button>
                        <button className="btn-ghost btn-large" onClick={onOpenSignup}>
                          무료 회원가입
                        </button>
                      </div>
                    ) : (
                      <div className="banner-actions">
                        <span className="welcome-msg">
                          환영합니다, {user?.nickname || user?.realName}님 🎉
                        </span>
                        <Link to="/posts/new">
                          <button className="btn-primary btn-large">
                            새 게시글 작성하기
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="slider-btn next" onClick={handleNextBanner}>&gt;</button>
        </div>
      </section>

      {/* ✅ 게시글 카드 섹션 */}
      <section className="post-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">최신 게시글</h2>
            <Link to="/posts">
              <Button variant="outline">모든 게시글 보기</Button>
            </Link>
          </div>

          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg">게시글을 불러오는 중...</div>
            </div>
          ) : postsData?.content && postsData.content.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postsData.content.slice(0, 6).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">아직 게시글이 없습니다</div>
              {isAuthenticated && (
                <Link to="/posts/new">
                  <Button>첫 게시글 작성하기</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
