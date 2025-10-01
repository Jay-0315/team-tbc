import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useEffect, useState } from 'react'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'
import { fetchMyWallet } from '@/features/payments/api/useBalance'

import type { User as TbcUser } from '@/types/auth'

interface HeaderProps {
  user: TbcUser | null
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  const { isAuthenticated } = useAuth()
  const { data: profile, refetch: refetchProfile } = useProfile()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  // 인증 상태가 변경되면 프로필 다시 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      refetchProfile()
    }
  }, [isAuthenticated, refetchProfile])

  // 지갑 잔액 불러오기
  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!isAuthenticated) {
        setWalletBalance(null)
        return
      }
      try {
        const res = await fetchMyWallet()
        if (!ignore) setWalletBalance(res.balance)
      } catch {
        if (!ignore) setWalletBalance(null)
      }
    }
    load()
    return () => { ignore = true }
  }, [isAuthenticated])

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

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/') {
      // 이미 홈페이지에 있으면 새로고침만
      window.location.reload()
    } else {
      // 다른 페이지에서는 홈페이지로 이동 (자동 새로고침됨)
      window.location.href = '/'
    }
  }

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white transition-colors duration-300">
      <div className="px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 text-xl font-bold transition-colors duration-300 hover:opacity-80 cursor-pointer"
              aria-label="홈으로 이동"
            >
              {/* HolaPop 로고 */}
              <img 
                src="/holapop-logo.png" 
                alt="HolaPop" 
                className="w-auto h-30"
              />
            </button>
          </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            /* 로그인된 상태: 프로필 아이콘 */
            <div className="relative dropdown-container">
              <button
                onClick={handleUserIconClick}
                className="flex overflow-hidden justify-center items-center w-10 h-10 bg-white rounded-full border-2 border-gray-300 transition-all duration-300 hover:bg-gray-100 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-haspopup="menu"
                aria-label="사용자 메뉴"
              >
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.nickname || profile.displayName || '프로필'}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nickname || profile?.displayName || 'User')}&background=orange&color=white&size=40`
                    }}
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nickname || profile?.displayName || 'User')}&background=orange&color=white&size=40`}
                    alt={profile?.nickname || profile?.displayName || '프로필'}
                    className="object-cover w-full h-full"
                  />
                )}
              </button>

              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-auto min-w-[10rem] max-w-[18rem] bg-white rounded-md border border-gray-200 shadow-lg transition-all duration-200"
                  role="menu"
                >
                  <div className="py-1">
                    <div className="px-4 pt-2 pb-1 text-sm text-gray-500 truncate">
                      {profile?.nickname || profile?.displayName || user?.realName || user?.nickname}님
                    </div>
                    {/* 잔액 표시 + 충전 버튼 */}
                    <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-900">
                      <span aria-label="지갑 잔액">
                        🍿 {walletBalance !== null ? `${Math.floor(walletBalance / 100)}개` : '잔액 조회'}
                      </span>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          window.location.href = '/payments/charge'
                        }}
                        className="px-2 py-1 text-xs font-medium text-white bg-black rounded hover:bg-black/90"
                        role="menuitem"
                        aria-label="충전하기"
                      >
                        충전
                      </button>
                    </div>
                    <div className="border-t border-gray-100" />
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
          ) : (
            /* 로그인되지 않은 상태: 로그인/회원가입 버튼 */
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setAuthModalMode('login')
                  setIsAuthModalOpen(true)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                로그인
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('register')
                  setIsAuthModalOpen(true)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-amber-400 border border-transparent rounded-lg hover:from-orange-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
              >
                회원가입
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <UnifiedAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  )
}
