"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/useAuth'

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: () => void
  onOpenSignup: () => void
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenSignup,
}: LoginModalProps) {
  const { login, isLoggingIn } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")

  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  // 입력값 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 로그인 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    login(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: () => {
          console.log('Login successful!')
          setFormData({ email: "", password: "" })
          onLoginSuccess()
          onClose()
        },
        onError: (error: any) => {
          console.error('Login error:', error)
          setError(error?.response?.data?.message || "로그인에 실패했습니다.")
        }
      }
    )
  }

  // 구글 OAuth 로그인
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google"
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>로그인</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* 일반 로그인 */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="example@company.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="영문/숫자/특수문자 포함 8자 이상"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            className="btn-black btn-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* OAuth 로그인 */}
        <div className="modal-footer">
          <button
            onClick={handleGoogleLogin}
            className="btn-white btn-full"
          >
            Google 계정으로 로그인
          </button>
        </div>

        <div className="modal-footer">
          <p>
            아직 계정이 없으신가요?{" "}
            <button className="link-btn" onClick={onOpenSignup}>
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
