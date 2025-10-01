import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
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

export default function App() {
  const { user, logoutAsync, isLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)

  // OAuth2 로그인 성공 후 처리
  useEffect(() => {
    const handleOAuth2LoginSuccess = async () => {
      const loginSuccess = searchParams.get('login')
      const googleLinked = searchParams.get('google_linked')
      const error = searchParams.get('error')
      
      if (googleLinked === 'true') {
        // Google 계정 연동 성공
        console.log('Google account linked successfully')
        
        // 토큰 확인 (기존 토큰이 갱신되었을 수 있음)
        const token = localStorage.getItem('accessToken')
        console.log('Token in localStorage:', token ? 'exists' : 'not found')
        
        if (token) {
          toast.success('Google 계정이 연동되었습니다!', {
            description: '이제 Google 계정으로도 로그인할 수 있습니다.',
            duration: 5000,
          })
          
          // URL에서 파라미터 제거
          setSearchParams({})
          
          // JWT 기반 인증: 토큰 갱신 이벤트 발생
          console.log('Dispatching authLoginSuccess event for token refresh')
          window.dispatchEvent(new CustomEvent('authLoginSuccess'))
          
          // 사용자 데이터 새로고침
          queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
          queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
        } else {
          toast.error('토큰을 찾을 수 없습니다. 다시 로그인해주세요.')
          setSearchParams({})
        }
        
      } else if (loginSuccess === 'success') {
        // OAuth2 로그인 성공
        console.log('OAuth2 login success detected')
        
        // 토큰 확인
        const token = localStorage.getItem('accessToken')
        console.log('Token in localStorage:', token ? 'exists' : 'not found')
        
        if (token) {
          toast.success('구글 로그인이 완료되었습니다!')
          
          // URL에서 파라미터 제거
          setSearchParams({})
          
          // JWT 기반 인증: 로그인 성공 이벤트 발생
          console.log('Dispatching authLoginSuccess event')
          window.dispatchEvent(new CustomEvent('authLoginSuccess'))
          
          // 사용자 데이터 새로고침
          queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
          queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
        } else {
          toast.error('토큰을 찾을 수 없습니다. 다시 로그인해주세요.')
          setSearchParams({})
        }
        
      } else if (error === 'signup_required') {
        // 계정이 없음 - 회원가입 필요
        const email = searchParams.get('email')
        toast.error('등록되지 않은 계정입니다.', {
          description: email 
            ? `${email}로 먼저 회원가입을 진행해주세요.`
            : '먼저 회원가입을 진행해주세요.',
          duration: 5000,
        })
        setSearchParams({})
      } else if (error === 'google_link_failed') {
        // Google 계정 연동 실패
        toast.error('Google 계정 연동에 실패했습니다.', {
          description: '이미 다른 계정에 연동된 Google 계정일 수 있습니다.',
          duration: 5000,
        })
        setSearchParams({})
      } else if (error === 'oauth2_email_not_found') {
        // Google에서 이메일 정보를 가져오지 못함
        toast.error('Google 계정 정보를 가져올 수 없습니다.', {
          description: 'Google 계정에서 이메일 권한을 허용해주세요.',
          duration: 5000,
        })
        setSearchParams({})
      } else if (error === 'oauth2_id_not_found') {
        // Google ID를 가져오지 못함
        toast.error('Google 인증에 실패했습니다. 다시 시도해주세요.')
        setSearchParams({})
      } else if (error === 'oauth2_failed') {
        // 기타 OAuth2 로그인 실패
        toast.error('구글 로그인에 실패했습니다. 다시 시도해주세요.')
        setSearchParams({})
      } else if (error === 'token_storage_failed') {
        // 토큰 저장 실패
        toast.error('로그인 토큰 저장에 실패했습니다. 다시 시도해주세요.')
        setSearchParams({})
      }
    }
    
    handleOAuth2LoginSuccess()
  }, [searchParams, setSearchParams, queryClient])

  // 앱 시작 시 토큰 복원은 useAuth 훅에서 처리됨
  
  const handleGroupCreated = (groupId: number, roomId: number) => {
    // 그룹 생성 완료 후 홈으로 이동
    console.log('Group created:', { groupId, roomId })
    setIsCreateModalOpen(false)
    
    // 이벤트 목록 캐시 무효화 (새로 생성된 소셜링이 메인 화면에 표시되도록)
    queryClient.invalidateQueries({ queryKey: ['events'] })
    queryClient.invalidateQueries({ queryKey: ['groups'] })
    
    // 홈으로 이동
    navigate('/')
    
    // 성공 알림 Toast 표시
    toast.success('소셜링이 성공적으로 생성되었습니다! 🎉', {
      description: '새로운 소셜링이 메인 화면에 표시됩니다.',
      duration: 4000,
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
