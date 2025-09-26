"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { login, signup, isLoggingIn, isSigningUp } = useAuth()
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  
  // 로그인 폼 상태
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  
  // 회원가입 폼 상태
  const [signupData, setSignupData] = useState({
    email: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  })
  const [signupErrors, setSignupErrors] = useState({
    email: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  })
  const [signupError, setSignupError] = useState("")
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null)

  // 테마 변경 감지
  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }
    
    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: "", password: "" })
      setSignupData({ email: "", nickname: "", password: "", confirmPassword: "" })
      setLoginError("")
      setSignupError("")
      setSignupErrors({ email: "", nickname: "", password: "", confirmPassword: "" })
      setEmailAvailable(null)
      setNicknameAvailable(null)
    }
  }, [isOpen])

  // 로그인 입력 핸들러
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
    setLoginError("")
  }

  // 회원가입 입력 핸들러
  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData(prev => ({ ...prev, [name]: value }))
    
    // 실시간 유효성 검사
    if (name === "email") {
      setEmailAvailable(null)
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
      if (!emailRegex.test(value)) {
        setSignupErrors(prev => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }))
      } else {
        setSignupErrors(prev => ({ ...prev, email: "" }))
      }
    }
    
    if (name === "password") {
      const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/
      if (!pwRegex.test(value)) {
        setSignupErrors(prev => ({ ...prev, password: "영문/숫자/특수문자 포함 8자 이상이어야 합니다." }))
      } else {
        setSignupErrors(prev => ({ ...prev, password: "" }))
      }
    }
    
    if (name === "confirmPassword") {
      if (value !== signupData.password) {
        setSignupErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }))
      } else {
        setSignupErrors(prev => ({ ...prev, confirmPassword: "" }))
      }
    }
    
    if (name === "nickname") {
      setNicknameAvailable(null)
      if (value.length < 2) {
        setSignupErrors(prev => ({ ...prev, nickname: "닉네임은 2자 이상이어야 합니다." }))
      } else {
        setSignupErrors(prev => ({ ...prev, nickname: "" }))
      }
    }
    
    setSignupError("")
  }

  // 로그인 제출
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    login(
      {
        email: loginData.email,
        password: loginData.password,
      },
      {
        onSuccess: () => {
          toast.success("로그인 성공!")
          setLoginData({ email: "", password: "" })
          onAuthSuccess()
          onClose()
        },
        onError: (error: unknown) => {
          console.error('Login error:', error)
          const errorMessage = error && typeof error === 'object' && 'response' in error && 
            error.response && typeof error.response === 'object' && 'data' in error.response &&
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
            ? (error.response.data as { message: string }).message
            : "로그인에 실패했습니다."
          setLoginError(errorMessage)
        }
      }
    )
  }

  // 회원가입 제출
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")

    // 유효성 검사
    if (signupErrors.email || signupErrors.nickname || signupErrors.password || signupErrors.confirmPassword) {
      setSignupError("입력값을 다시 확인하세요.")
      return
    }
    
    if (emailAvailable === false || nicknameAvailable === false) {
      setSignupError("중복체크를 통과해야 합니다.")
      return
    }

    signup(
      {
        email: signupData.email,
        nickname: signupData.nickname,
        password: signupData.password,
        realName: "default", // 기본값 사용
      },
      {
        onSuccess: () => {
          toast.success("회원가입 성공!")
          setSignupData({ email: "", nickname: "", password: "", confirmPassword: "" })
          onAuthSuccess()
          onClose()
        },
        onError: (error: unknown) => {
          console.error('Signup error:', error)
          const errorMessage = error && typeof error === 'object' && 'response' in error && 
            error.response && typeof error.response === 'object' && 'data' in error.response &&
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
            ? (error.response.data as { message: string }).message
            : "회원가입에 실패했습니다."
          setSignupError(errorMessage)
        }
      }
    )
  }

  // 구글 OAuth 로그인
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
          color: isDark ? '#f9fafb' : '#111827'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-center text-2xl font-bold"
            style={{ color: isDark ? '#f9fafb' : '#111827' }}
          >
            TEAM-TBC
          </DialogTitle>
          <DialogDescription 
            className="text-center"
            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          >
            로그인 또는 회원가입을 진행해주세요
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
          <TabsList 
            className="grid w-full grid-cols-2"
            style={{
              backgroundColor: isDark ? '#374151' : '#f3f4f6'
            }}
          >
            <TabsTrigger 
              value="login"
              style={{
                backgroundColor: activeTab === 'login' ? (isDark ? '#1f2937' : '#ffffff') : 'transparent',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            >
              로그인
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              style={{
                backgroundColor: activeTab === 'signup' ? (isDark ? '#1f2937' : '#ffffff') : 'transparent',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            >
              회원가입
            </TabsTrigger>
          </TabsList>
          
          {/* 로그인 탭 */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="login-email"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  이메일
                </Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  placeholder="이메일을 입력하세요"
                  autoComplete="email"
                  required
                  style={{
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="login-password"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  비밀번호
                </Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  required
                  style={{
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </div>
              
              {loginError && (
                <div className="text-sm text-red-500 text-center">
                  {loginError}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
                style={{
                  backgroundColor: isDark ? '#000000' : '#ffffff',
                  color: isDark ? '#ffffff' : '#000000',
                  border: isDark ? '1px solid #000000' : '1px solid #ffffff'
                }}
              >
                {isLoggingIn ? "로그인 중..." : "로그인"}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  또는
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleLogin}
              style={{
                borderColor: isDark ? '#374151' : '#d1d5db',
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            >
              Google로 로그인
            </Button>
          </TabsContent>
          
          {/* 회원가입 탭 */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="signup-email"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  이메일
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupInputChange}
                    placeholder="이메일을 입력하세요"
                    autoComplete="email"
                    required
                    style={{
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      borderColor: isDark ? '#4b5563' : '#d1d5db',
                      color: isDark ? '#f9fafb' : '#111827'
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        // 실제 API 호출로 이메일 중복 체크
                        const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(signupData.email)}`)
                        if (response.ok) {
                          const isAvailable = await response.json()
                          // API는 true를 반환하면 사용 가능, false를 반환하면 중복
                          setEmailAvailable(isAvailable)
                        } else {
                          setEmailAvailable(false)
                        }
                      } catch (error) {
                        console.error('Email check failed:', error)
                        setEmailAvailable(false)
                      }
                    }}
                    disabled={!signupData.email || !!signupErrors.email}
                    style={{
                      borderColor: isDark ? '#374151' : '#d1d5db',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827'
                    }}
                  >
                    중복체크
                  </Button>
                </div>
                {signupErrors.email && (
                  <div className="text-sm text-red-500">{signupErrors.email}</div>
                )}
                {emailAvailable === true && (
                  <div className="text-sm text-green-500">사용 가능한 이메일입니다.</div>
                )}
                {emailAvailable === false && (
                  <div className="text-sm text-red-500">이미 사용 중인 이메일입니다.</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="signup-nickname"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  닉네임
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="signup-nickname"
                    name="nickname"
                    type="text"
                    value={signupData.nickname}
                    onChange={handleSignupInputChange}
                    placeholder="닉네임을 입력하세요"
                    required
                    style={{
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      borderColor: isDark ? '#4b5563' : '#d1d5db',
                      color: isDark ? '#f9fafb' : '#111827'
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        // 실제 API 호출로 닉네임 중복 체크
                        const response = await fetch(`/api/users/check-nickname?nickname=${encodeURIComponent(signupData.nickname)}`)
                        if (response.ok) {
                          const isAvailable = await response.json()
                          // API는 true를 반환하면 사용 가능, false를 반환하면 중복
                          setNicknameAvailable(isAvailable)
                        } else {
                          setNicknameAvailable(false)
                        }
                      } catch (error) {
                        console.error('Nickname check failed:', error)
                        setNicknameAvailable(false)
                      }
                    }}
                    disabled={!signupData.nickname || !!signupErrors.nickname}
                    style={{
                      borderColor: isDark ? '#374151' : '#d1d5db',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#111827'
                    }}
                  >
                    중복체크
                  </Button>
                </div>
                {signupErrors.nickname && (
                  <div className="text-sm text-red-500">{signupErrors.nickname}</div>
                )}
                {nicknameAvailable === true && (
                  <div className="text-sm text-green-500">사용 가능한 닉네임입니다.</div>
                )}
                {nicknameAvailable === false && (
                  <div className="text-sm text-red-500">이미 사용 중인 닉네임입니다.</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="signup-password"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  비밀번호
                </Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={signupData.password}
                  onChange={handleSignupInputChange}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                  required
                  style={{
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
                {signupErrors.password && (
                  <div className="text-sm text-red-500">{signupErrors.password}</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="signup-confirm-password"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  비밀번호 확인
                </Label>
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={handleSignupInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  required
                  style={{
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
                {signupErrors.confirmPassword && (
                  <div className="text-sm text-red-500">{signupErrors.confirmPassword}</div>
                )}
              </div>
              
              {signupError && (
                <div className="text-sm text-red-500 text-center">
                  {signupError}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSigningUp}
                style={{
                  backgroundColor: isDark ? '#000000' : '#ffffff',
                  color: isDark ? '#ffffff' : '#000000',
                  border: isDark ? '1px solid #000000' : '1px solid #ffffff'
                }}
              >
                {isSigningUp ? "회원가입 중..." : "회원가입"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
