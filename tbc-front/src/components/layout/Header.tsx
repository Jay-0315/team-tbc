import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'

import type { User as TbcUser } from '@/types/auth'

interface HeaderProps {
  user: TbcUser | null
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  const { isAuthenticated } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

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
    onLogout()
    setIsDropdownOpen(false)
  }

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen)
    } else {
      setIsAuthModalOpen(true)
    }
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter] transition-colors duration-300">
      <div className="container flex justify-between items-center px-4 h-16">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 transition-colors duration-300 hover:opacity-80"
          >
            <span>HolaPoP</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 사용자 아이콘 */}
          <div className="relative dropdown-container">
            <button
              onClick={handleUserIconClick}
              className="flex justify-center items-center w-10 h-10 bg-gray-100 rounded-full transition-colors duration-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              aria-label={isAuthenticated ? "사용자 메뉴" : "로그인"}
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>

            {/* 로그인된 상태에서만 드롭다운 메뉴 표시 */}
            {isAuthenticated && isDropdownOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md border border-gray-200 shadow-lg transition-all duration-200"
                role="menu"
              >
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user?.nickname}님
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      window.location.href = '/mypage'
                    }}
                    className="flex items-center px-4 py-2 w-full text-sm text-gray-900 transition-colors duration-200 hover:bg-gray-50"
                    role="menuitem"
                  >
                    마이페이지
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 w-full text-sm text-gray-900 transition-colors duration-200 hover:bg-gray-50"
                    role="menuitem"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <UnifiedAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </header>
  )
}
