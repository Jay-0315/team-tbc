import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/LoginModal'
import { SignupModal } from '@/components/SignupModal'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  user?: { nickname?: string; realName?: string } | null
  onLogout: () => void
  onLoginSuccess: () => void
  onSignupSuccess: () => void
}

export default function Header({ user, onLogout, onLoginSuccess, onSignupSuccess }: HeaderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const { logout, isLoggingOut } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      onLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    onLoginSuccess()
  }

  const handleSignupSuccess = () => {
    setIsSignupModalOpen(false)
    onSignupSuccess()
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-dot" />
            <span>TBC</span>
          </div>
          <nav className="nav">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  안녕하세요, {user.nickname || user.realName}님!
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  로그인
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsSignupModalOpen(true)}
                >
                  회원가입
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </>
  )
}
