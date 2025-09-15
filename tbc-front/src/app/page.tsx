import { useState } from "react"

type PageProps = {
  user: { nickname?: string; realName?: string } | null
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

// 게시글 타입
type Post = {
  id: number
  title: string
  author: string
  imageUrl: string
}

export default function Page({ user, onOpenLogin, onOpenSignup }: PageProps) {
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

  // 게시글 더미 데이터
  const [posts] = useState<Post[]>([
    { id: 1, title: "첫 번째 모임", author: "최재훈", imageUrl: "https://plus.unsplash.com/premium_photo-1722593856418-05d6d47eec59?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 2, title: "맛있는 요리모임", author: "안두홍", imageUrl: "https://images.unsplash.com/photo-1533050487297-09b450131914?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 3, title: "등산 같이 가요", author: "이성준", imageUrl: "https://images.unsplash.com/photo-1564284369929-026ba231f89b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 4, title: "스터디 그룹", author: "이상현", imageUrl: "https://plus.unsplash.com/premium_photo-1722944969837-25bf2385056a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 5, title: "캠핑 동호회", author: "반예진", imageUrl: "https://images.unsplash.com/photo-1501560379-05951a742668?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 6, title: "독서모임", author: "스페이스씨엘", imageUrl: "https://plus.unsplash.com/premium_photo-1690957591806-95a2b81b1075?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ])

  const [postIndex, setPostIndex] = useState(0)
  const cardsPerPage = 4

  const handlePrevPosts = () => {
    setPostIndex(prev => Math.max(prev - cardsPerPage, 0))
  }

  const handleNextPosts = () => {
    setPostIndex(prev =>
      Math.min(prev + cardsPerPage, posts.length - cardsPerPage)
    )
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
                    {!user ? (
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
                          환영합니다, {user.nickname || user.realName}님 🎉
                        </span>
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
            <h2 className="section-title"></h2>
          </div>

          <div className="slider-wrapper">
            <button className="slider-btn prev" onClick={handlePrevPosts}>&lt;</button>
            <div className="slider">
              <div
                className="slider-track"
                style={{
                  transform: `translateX(-${(postIndex / cardsPerPage) * 100}%)`,
                  width: `${(posts.length / cardsPerPage) * 100}%`,
                }}
              >
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-image">
                      <img src={post.imageUrl} alt={post.title} />
                    </div>
                    <div className="post-content">
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-author">작성자: {post.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="slider-btn next" onClick={handleNextPosts}>&gt;</button>
          </div>
        </div>
      </section>
    </>
  )
}
