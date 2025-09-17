import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import HomePage from '@/pages/HomePage'
import PostsPage from '@/pages/PostsPage'
import NewPostPage from '@/pages/NewPostPage'
import PostDetailPage from '@/pages/PostDetailPage'
import PostChatPage from '@/pages/PostChatPage'

export default function App() {
  const { user, isLoading } = useAuth()

  const handleLoginSuccess = () => {
    // Auth state will be updated automatically via React Query
  }

  const handleSignupSuccess = () => {
    // Auth state will be updated automatically via React Query
  }

  const handleLogout = () => {
    // Auth state will be updated automatically via React Query
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user || null}
        onLogout={handleLogout}
      />
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                user={user || null}
                onOpenLogin={() => {}}
                onOpenSignup={() => {}}
              />
            } 
          />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<NewPostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/posts/:id/chat" element={<PostChatPage />} />
        </Routes>
      </main>
    </div>
  )
}
