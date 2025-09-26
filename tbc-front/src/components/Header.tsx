"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import AuthModal from "@/components/AuthModal"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

type User = {
  id: number
  email: string
  realName: string
  nickname: string
}

type HeaderProps = {
  user: User | null
  onLogout: () => void
  onAuthSuccess: () => void
}

export default function Header({ user, onLogout, onAuthSuccess }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  // 테마 변경 감지
  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  return (
    <>
      <header 
        className="header sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter] transition-colors duration-300"
        style={{
          borderColor: isDark ? '#374151' : '#e5e7eb',
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="container header-content">
          <div 
            className="logo text-xl font-bold transition-colors duration-300 hover:opacity-80"
            style={{ 
              color: isDark ? '#f9fafb' : '#111827'
            }}
          >
            TEAM-TBC
          </div>

          <div className="header-actions flex items-center gap-4">
            {user ? (
              <div className="user-menu flex items-center gap-4">
                <span 
                  className="user-greeting text-sm font-semibold transition-colors duration-300"
                  style={{ 
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                >
                  환영합니다, {user.nickname}님!
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLogout}
                  style={{
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                >
                  로그아웃
                </Button>
                <Button 
                  size="sm"
                  style={{
                    backgroundColor: isDark ? '#000000' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    border: isDark ? '1px solid #000000' : '1px solid #ffffff'
                  }}
                >
                  마이페이지
                </Button>
              </div>
            ) : (
              <div className="auth-buttons flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                >
                  로그인
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                >
                  회원가입
                </Button>
              </div>
            )}
            
            {/* 테마 토글 버튼 */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => { 
          setIsAuthModalOpen(false)
          onAuthSuccess() 
        }}
      />
    </>
  )
}
