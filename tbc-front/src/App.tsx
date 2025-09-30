import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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
import FloatingButton from '@/components/FloatingButton'
import { ChatRoomModal } from '@/components/ChatRoomModal'
import { MyPage } from '@/pages/MyPage'
import ChargePage from '@/pages/payments/ChargePage'
import ResultPage from '@/pages/payments/ResultPage'
import CreateSocialingModal from '@/components/event/CreateSocialingModal'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import NoticePage from '@/pages/NoticePage'
import FAQPage from '@/pages/FAQPage'
import { Pencil } from 'lucide-react'

export default function App() {
  const { user, logoutAsync, isLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)

  // 앱 시작 시 토큰 복원은 useAuth 훅에서 처리됨
  
  const handleGroupCreated = (groupId: number, roomId: number) => {
    // 그룹 생성 완료 후 홈으로 이동
    console.log('Group created:', { groupId, roomId })
    setIsCreateModalOpen(false)
    
    // 이벤트 목록 캐시 무효화 (새로 생성된 소셜링이 메인 화면에 표시되도록)
    queryClient.invalidateQueries({ queryKey: ['events'] })
    
    // 홈으로 이동
    navigate('/')
    
    // 성공 알림 Toast 표시
    toast.success('신청하신 소셜링의 그룹채팅이 시작되었습니다.', {
      description: '채팅방에서 다른 참가자들과 소통해보세요.',
      duration: 5000,
      action: {
        label: '채팅방 이동',
        onClick: () => {
          // 채팅 Modal 열기
          setIsChatModalOpen(true)
        }
      }
    })
  }

  const handleCreateSocialing = () => {
    setIsCreateModalOpen(true)
  }

  const handleOpenChat = () => {
    setIsChatModalOpen(true)
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
          <Route path="/" element={<HomePage onCreateSocialing={handleCreateSocialing} />} />
          <Route path="/home" element={<HomePage onCreateSocialing={handleCreateSocialing} />} />
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
          <Route path="/payments/charge" element={<ChargePage />} />
          <Route path="/payments/result" element={<ResultPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* 플로팅 버튼들 */}
      {user && (
        <>
          {/* 소셜링 만들기 버튼 (위쪽) */}
          <FloatingButton
            icon={<Pencil className="w-5 h-5" />}
            label="소셜링 만들기"
            position="bottom-right"
            variant="primary"
            size="md"
            onClick={handleCreateSocialing}
            showLabel={false}
            pulse={false}
            className="bottom-24"
          />
          
          {/* 채팅 버튼 (아래쪽) */}
          <FloatingChatButton onOpenChat={handleOpenChat} />
        </>
      )}
      
      {/* 채팅방 모달 */}
      {user && (
        <ChatRoomModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
      
      {/* 소셜링 만들기 모달 */}
      <CreateSocialingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleGroupCreated}
      />
    </div>
  )
}
