import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, X, Mail, Lock, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// OAuth 기능 비활성화
// const GOOGLE_OAUTH_URL = '/api/oauth2/google/login'

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function UnifiedAuthModal({ isOpen, onClose, initialMode = 'login' }: UnifiedAuthModalProps) {
  const { loginAsync, signupAsync, isLoggingIn, isSigningUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    realName: '',
    nickname: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  // 모드 변경 시 애니메이션
  const switchMode = (newMode: 'login' | 'register') => {
    if (newMode === mode) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setMode(newMode)
      setError('')
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        realName: '',
        nickname: ''
      })
      setIsAnimating(false)
    }, 150)
  }

  // 모달이 열릴 때 초기 모드 설정
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError('')
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        realName: '',
        nickname: ''
      })
    }
  }, [isOpen, initialMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'login') {
      if (!formData.email || !formData.password) {
        setError('이메일과 비밀번호를 입력해주세요.')
        return
      }
      
      try {
        await loginAsync({ email: formData.email, password: formData.password })
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
      }
    } else {
      if (!formData.email || !formData.password || !formData.realName || !formData.nickname) {
        setError('모든 필드를 입력해주세요.')
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }
      
      if (formData.password.length < 8) {
        setError('비밀번호는 최소 8자 이상이어야 합니다.')
        return
      }
      
      try {
        await signupAsync({ email: formData.email, password: formData.password, realName: formData.realName, nickname: formData.nickname })
        // 회원가입 성공 후 자동 로그인
        try {
          await loginAsync({ email: formData.email, password: formData.password })
          onClose()
        } catch {
          // 자동 로그인 실패 시에도 회원가입은 성공했으므로 모달을 닫고 사용자에게 로그인하도록 안내
          setError('회원가입은 완료되었습니다. 다시 로그인해주세요.')
          setMode('login')
          setFormData({
            email: formData.email,
            password: '',
            confirmPassword: '',
            realName: '',
            nickname: ''
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  // OAuth 기능 비활성화
  // const handleGoogleLogin = () => {
  //   window.location.href = GOOGLE_OAUTH_URL
  // }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* 모달 컨테이너 - 반응형 스케일 조정 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md my-8 max-h-[calc(100vh-4rem)] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* 헤더 */}
            <div className="relative p-6 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
              <button
                onClick={onClose}
                aria-label="닫기"
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full shadow-lg">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {mode === 'login' ? '로그인' : '회원가입'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {mode === 'login' 
                    ? 'HolaPop에 오신 것을 환영합니다!' 
                    : '새로운 계정을 만들어보세요'
                  }
                </p>
              </div>
            </div>

            {/* 폼 */}
            <div className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 pt-4">
              {/* 이름 필드 (회원가입 시에만) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="name-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div>
                      <Label htmlFor="realName" className="text-xs sm:text-sm font-medium text-gray-700">
                        실명
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <Input
                          id="realName"
                          type="text"
                          value={formData.realName}
                          onChange={(e) => handleInputChange('realName', e.target.value)}
                          className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                          placeholder="실명을 입력하세요"
                          disabled={isLoggingIn || isSigningUp}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nickname" className="text-xs sm:text-sm font-medium text-gray-700">
                        닉네임
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <Input
                          id="nickname"
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => handleInputChange('nickname', e.target.value)}
                          className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                          placeholder="닉네임을 입력하세요"
                          disabled={isLoggingIn || isSigningUp}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 이메일 필드 */}
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                  이메일
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                    placeholder="이메일을 입력하세요"
                    disabled={isLoggingIn || isSigningUp}
                  />
                </div>
              </div>

              {/* 비밀번호 필드 */}
              <div>
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700">
                  비밀번호
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                    placeholder={mode === 'register' ? "비밀번호를 입력하세요 (최소 8자)" : "비밀번호를 입력하세요"}
                    disabled={isLoggingIn || isSigningUp}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoggingIn || isSigningUp}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 필드 (회원가입 시에만) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-700">
                      비밀번호 확인
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                        placeholder="비밀번호를 다시 입력하세요"
                        disabled={isLoggingIn || isSigningUp}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoggingIn || isSigningUp}
                        aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 에러 메시지 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 sm:p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                disabled={isLoggingIn || isSigningUp}
                className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoggingIn || isSigningUp ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    {mode === 'login' ? '로그인 중...' : '회원가입 중...'}
                  </div>
                ) : (
                  mode === 'login' ? '로그인' : '회원가입'
                )}
              </Button>

              {/* 구분선 */}
              {/* OAuth 기능 비활성화 */}
              {/* {mode === 'login' && (
                <div className="relative my-3 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-white text-gray-500">또는</span>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden sm:inline">Google로 로그인</span>
                  <span className="sm:hidden">Google 로그인</span>
                </Button>
              )} */}
            </form>

            {/* 모드 전환 */}
            <div className="mt-4 sm:mt-6 pb-2 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              </p>
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="mt-1.5 sm:mt-2 text-sm sm:text-base text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                disabled={isAnimating}
              >
                {mode === 'login' ? '회원가입하기' : '로그인하기'}
              </button>
            </div>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
