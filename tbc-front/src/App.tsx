import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import HomePage from '@/app/page'
import PostsPage from '@/app/posts/page'
import NewPostPage from '@/app/posts/new/page'
import PostDetailPage from '@/app/posts/[id]/page'
import PostChatPage from '@/app/posts/[id]/chat/page'

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
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onSignupSuccess={handleSignupSuccess}
        onLogout={handleLogout}
      />
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                user={user}
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
