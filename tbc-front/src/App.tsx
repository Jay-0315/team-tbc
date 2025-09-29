import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/layout/Header'
import HomePage from '@/pages/HomePage'
// import PostsPage from '@/pages/PostsPage'
import NewPostPage from '@/pages/NewPostPage'
// import PostDetailPage from '@/pages/PostDetailPage'
import PostChatPage from '@/pages/PostChatPage'
import CreateEventWizard from '@/pages/events/CreateEventWizard'
import GroupChatPage from '@/pages/groups/GroupChatPage'
import EventDetailPage from '@/pages/EventDetailPage'
// import GroupDetailPage from '@/pages/groups/GroupDetailPage'
import EventsPage from '@/pages/EventsPage'
import { FloatingChatButton } from '@/components/FloatingChatButton'
import { MyPage } from '@/pages/MyPage'

export default function App() {
  const { user, logoutAsync, isLoading } = useAuth()
  const navigate = useNavigate()

  // 앱 시작 시 토큰 복원은 useAuth 훅에서 처리됨
  
  const handleGroupCreated = (groupId: number, roomId: number) => {
    // 그룹 생성 완료 후 바로 채팅 페이지로 이동
    console.log('Group created:', { groupId, roomId })
    navigate(`/groups/${groupId}/chat`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-900">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors">
      <Header 
        user={user || null}
        onLogout={() => logoutAsync()}
      />
      <main className="bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
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
            element={<CreateEventWizard onCreated={handleGroupCreated} />} 
          />
          <Route path="/groups/:id/chat" element={<GroupChatPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </main>
      {user && <FloatingChatButton />}
    </div>
  )
}
