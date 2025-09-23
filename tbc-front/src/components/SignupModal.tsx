"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/useAuth'

type SignupModalProps = {
  isOpen: boolean
  onClose: () => void
  onSignupSuccess: () => void
  onOpenLogin: () => void
}

export default function SignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
  onOpenLogin,
}: SignupModalProps) {
  const { signup, isSigningUp } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  })

  const [emailError, setEmailError] = useState("")
  const [nicknameError, setNicknameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)

  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null)

  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto"
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "email") {
      setEmailAvailable(null)
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
      if (!emailRegex.test(value)) {
        setEmailError("올바른 이메일 형식이 아닙니다.")
      } else {
        setEmailError("")
      }
    }

    if (name === "confirmPassword") {
      setPasswordMatch(value === formData.password)
    }

    if (name === "password") {
      const pwRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/
      if (!pwRegex.test(value)) {
        setPasswordError("영문/숫자/특수문자 포함 8자 이상이어야 합니다.")
      } else {
        setPasswordError("")
      }
    }

    if (name === "nickname") {
      setNicknameAvailable(null)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checkEmail = async () => {
    if (!formData.email) {
      setEmailError("이메일을 입력하세요.")
      return
    }
    try {
      const res = await fetch(`/api/users/check-email?email=${formData.email}`)
      if (res.ok) {
        const available = await res.json()
        setEmailAvailable(available)
        if (!available) setEmailError("이미 사용 중인 이메일입니다.")
        else setEmailError("")
      } else {
        setEmailError("이메일 확인 중 오류 발생")
      }
    } catch {
      setEmailError("서버와 연결할 수 없습니다.")
    }
  }

  const checkNickname = async () => {
    if (!formData.nickname) {
      setNicknameError("닉네임을 입력하세요.")
      return
    }
    try {
      const res = await fetch(
        `/api/users/check-nickname?nickname=${formData.nickname}`
      )
      if (res.ok) {
        const available = await res.json()
        setNicknameAvailable(available)
        if (!available) setNicknameError("이미 사용 중인 닉네임입니다.")
        else setEmailError("")
      } else {
        setNicknameError("닉네임 확인 중 오류 발생")
      }
    } catch {
      setNicknameError("서버와 연결할 수 없습니다.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (emailError || nicknameError || passwordError || passwordMatch === false) {
      setSubmitError("입력값을 다시 확인하세요.")
      return
    }
    if (emailAvailable === false || nicknameAvailable === false) {
      setSubmitError("중복체크를 통과해야 합니다.")
      return
    }

    signup(
      {
        email: formData.email,
        nickname: formData.nickname,
        password: formData.password,
        realName: "default",
      },
      {
        onSuccess: () => {
          console.log('Signup successful!')
          onSignupSuccess()
          onClose()
        },
        onError: (error: any) => {
          console.error('Signup error:', error)
          setSubmitError(error?.response?.data?.message || "회원가입에 실패했습니다.")
        }
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">회원가입</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* 이메일 */}
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div className="form-row">
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
              <button type="button" className="btn-black" onClick={checkEmail}>
                중복체크
              </button>
            </div>
            {emailError && <p className="error-message">{emailError}</p>}
            {emailAvailable && (
              <p className="success-message">사용 가능한 이메일입니다.</p>
            )}
          </div>

          {/* 닉네임 */}
          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <div className="form-row">
              <input
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className="form-input"
                placeholder="닉네임을 입력하세요"
                required
              />
              <button
                type="button"
                className="btn-black"
                onClick={checkNickname}
              >
                중복체크
              </button>
            </div>
            {nicknameError && <p className="error-message">{nicknameError}</p>}
            {nicknameAvailable && (
              <p className="success-message">사용 가능한 닉네임입니다.</p>
            )}
          </div>

          {/* 비밀번호 */}
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
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {passwordMatch !== null && (
              <p className={passwordMatch ? "success-message" : "error-message"}>
                {passwordMatch ? "비밀번호 일치" : "비밀번호 불일치"}
              </p>
            )}
          </div>

          {submitError && <p className="error-message">{submitError}</p>}

          <button
            type="submit"
            className="btn-black btn-full"
            disabled={isSigningUp}
          >
            {isSigningUp ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            이미 계정이 있으신가요?{" "}
            <button className="link-btn" onClick={onOpenLogin}>
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
