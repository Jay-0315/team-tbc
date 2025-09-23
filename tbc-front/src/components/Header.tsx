"use client"

import { useState } from "react"
import LoginModal from "@/components/LoginModal"
import SignupModal from "@/components/SignupModal"

type User = {
  nickname?: string
}

type HeaderProps = {
  user: User | null
  onLogout: () => void
  onLoginSuccess: () => void
  onSignupSuccess: () => void
}

export default function Header({ user, onLogout, onLoginSuccess, onSignupSuccess }: HeaderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <div className="logo">TBC</div>

          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                <span className="user-greeting">환영합니다 {user.nickname}님!</span>
                <button className="btn-white" onClick={onLogout}>로그아웃</button>
                <button className="btn-black">마이페이지</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-white" onClick={() => setIsLoginModalOpen(true)}>로그인</button>
                <button className="btn-black" onClick={() => setIsSignupModalOpen(true)}>회원가입</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => { setIsLoginModalOpen(false); onLoginSuccess() }}
        onOpenSignup={() => { setIsLoginModalOpen(false); setIsSignupModalOpen(true) }}
      />

      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={() => { setIsSignupModalOpen(false); onSignupSuccess() }}
        onOpenLogin={() => { setIsSignupModalOpen(false); setIsLoginModalOpen(true) }}
      />
    </>
  )
}
