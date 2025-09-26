import { Link } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LoginDialog } from '../auth/LoginDialog'
import { RegisterDialog } from '../auth/RegisterDialog'
import { useEffect, useState } from 'react'
import { ChevronDown, User, LogOut, Settings } from 'lucide-react'

export default function Header() {
  const { theme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)

  // 테마 변경 감지
  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
  }

  const handleOpenLogin = () => {
    setIsLoginDialogOpen(true)
    setIsDropdownOpen(false)
  }

  const handleOpenRegister = () => {
    setIsRegisterDialogOpen(true)
    setIsDropdownOpen(false)
  }

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter] transition-colors duration-300"
      style={{
        borderColor: isDark ? '#374151' : '#e5e7eb',
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold transition-colors duration-300 hover:opacity-80"
            style={{ 
              color: isDark ? '#f9fafb' : '#111827'
            }}
          >
            <span>TEAM-TBC</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 로그인/사용자 메뉴 */}
          <div className="relative dropdown-container">
            {isAuthenticated ? (
              // 로그인된 상태: 사용자 메뉴
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-300 hover:opacity-80"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    환영합니다, {user?.nickname}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg border transition-all duration-200"
                    style={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb'
                    }}
                    role="menu"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          // 마이페이지로 이동 (추후 구현)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 hover:opacity-80"
                        style={{ color: isDark ? '#f9fafb' : '#111827' }}
                        role="menuitem"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        마이페이지
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 hover:opacity-80"
                        style={{ color: isDark ? '#f9fafb' : '#111827' }}
                        role="menuitem"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 미로그인 상태: 로그인 버튼
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-300 hover:opacity-80"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">로그인</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-32 rounded-md shadow-lg border transition-all duration-200"
                    style={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb'
                    }}
                    role="menu"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleOpenLogin}
                        className="w-full px-4 py-2 text-sm text-left transition-colors duration-200 hover:opacity-80"
                        style={{ color: isDark ? '#f9fafb' : '#111827' }}
                        role="menuitem"
                      >
                        로그인
                      </button>
                      <button
                        onClick={handleOpenRegister}
                        className="w-full px-4 py-2 text-sm text-left transition-colors duration-200 hover:opacity-80"
                        style={{ color: isDark ? '#f9fafb' : '#111827' }}
                        role="menuitem"
                      >
                        회원가입
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* 다이얼로그들 */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onOpenRegister={() => setIsRegisterDialogOpen(true)}
      />
      <RegisterDialog
        isOpen={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
        onOpenLogin={() => setIsLoginDialogOpen(true)}
      />
    </header>
  )
}
