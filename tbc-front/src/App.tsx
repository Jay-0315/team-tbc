import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { setAuthToken } from '@/lib/api'
import HomePage from '@/pages/HomePage'
import PostsPage from '@/pages/PostsPage'
import NewPostPage from '@/pages/NewPostPage'
import PostDetailPage from '@/pages/PostDetailPage'
import PostChatPage from '@/pages/PostChatPage'
import CreateWizard from '@/pages/groups/CreateWizard'
import GroupChatPage from '@/pages/groups/GroupChatPage'
import EventDetailPage from '@/pages/EventDetailPage'
import GroupDetailPage from '@/pages/groups/GroupDetailPage'

export default function App() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  // 앱 시작 시 localStorage에서 토큰 복원
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setAuthToken(token)
    }
  }, [])
  
  const handleGroupCreated = (groupId: number, roomId: number) => {
    // 그룹 생성 완료 후 바로 채팅 페이지로 이동
    console.log('Group created:', { groupId, roomId })
    navigate(`/groups/${groupId}/chat`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg text-white">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<NewPostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
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
