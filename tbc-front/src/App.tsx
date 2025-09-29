import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import HomePage from '@/pages/HomePage'
// import PostsPage from '@/pages/PostsPage'
import NewPostPage from '@/pages/NewPostPage'
// import PostDetailPage from '@/pages/PostDetailPage'
import PostChatPage from '@/pages/PostChatPage'
import CreateWizard from '@/pages/groups/CreateWizard'
import GroupChatPage from '@/pages/groups/GroupChatPage'
import EventDetailPage from '@/pages/EventDetailPage'
// import GroupDetailPage from '@/pages/groups/GroupDetailPage'
import EventsPage from '@/pages/EventsPage'

export default function App() {
  const { user, logoutAsync, isLoading } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  // 앱 시작 시 토큰 복원은 useAuth 훅에서 처리됨

  // 테마 변경 시 HTML 클래스 강제 업데이트
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  
  const handleGroupCreated = (groupId: number, roomId: number) => {
    // 그룹 생성 완료 후 바로 채팅 페이지로 이동
    console.log('Group created:', { groupId, roomId })
    navigate(`/groups/${groupId}/chat`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <div className="text-lg text-gray-900 dark:text-white">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Header 
        user={user || null}
        onLogout={() => logoutAsync()}
        onAuthSuccess={() => {
          // 인증 성공 시 추가 처리 (필요시)
          console.log('Authentication successful')
        }}
      />
      <main className="bg-white dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          {/* <Route path="/groups/:id" element={<GroupDetailPage />} /> */}
          <Route path="/events/:id" element={<EventDetailPage />} />
          {/* <Route path="/posts" element={<PostsPage />} /> */}
          <Route path="/posts/new" element={<NewPostPage />} />
          {/* <Route path="/posts/:id" element={<PostDetailPage />} /> */}
          <Route path="/posts/:id/chat" element={<PostChatPage />} />
          <Route 
            path="/groups/create" 
            element={<CreateWizard onCreated={handleGroupCreated} />} 
          />
          <Route path="/groups/:id/chat" element={<GroupChatPage />} />
        </Routes>
      </main>
    </div>
  )
}
