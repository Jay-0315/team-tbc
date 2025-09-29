import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, X, Mail, Lock, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function UnifiedAuthModal({ isOpen, onClose, initialMode = 'login' }: UnifiedAuthModalProps) {
  const { loginAsync, signupAsync, isLoggingIn, isRegistering } = useAuth()
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
      
      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
        return
      }
      
      try {
        await signupAsync({ email: formData.email, password: formData.password, realName: formData.realName, nickname: formData.nickname })
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen"
        onClick={onClose}
      >
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* 모달 컨테이너 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {mode === 'login' ? '로그인' : '회원가입'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login' 
                  ? 'TEAM-TBC에 오신 것을 환영합니다!' 
                  : '새로운 계정을 만들어보세요'
                }
              </p>
            </div>
          </div>

          {/* 폼 */}
          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 필드 (회원가입 시에만) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="name-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="realName" className="text-sm font-medium text-gray-700">
                        실명
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="realName"
                          type="text"
                          value={formData.realName}
                          onChange={(e) => handleInputChange('realName', e.target.value)}
                          className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                          placeholder="실명을 입력하세요"
                          disabled={isLoggingIn || isRegistering}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">
                        닉네임
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="nickname"
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => handleInputChange('nickname', e.target.value)}
                          className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                          placeholder="닉네임을 입력하세요"
                          disabled={isLoggingIn || isRegistering}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 이메일 필드 */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  이메일
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                    placeholder="이메일을 입력하세요"
                    disabled={isLoggingIn || isRegistering}
                  />
                </div>
              </div>

              {/* 비밀번호 필드 */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                    placeholder="비밀번호를 입력하세요"
                    disabled={isLoggingIn || isRegistering}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoggingIn || isRegistering}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      비밀번호 확인
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                        placeholder="비밀번호를 다시 입력하세요"
                        disabled={isLoggingIn || isRegistering}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoggingIn || isRegistering}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                disabled={isLoggingIn || isRegistering}
                className="w-full h-12 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoggingIn || isRegistering ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? '로그인 중...' : '회원가입 중...'}
                  </div>
                ) : (
                  mode === 'login' ? '로그인' : '회원가입'
                )}
              </Button>
            </form>

            {/* 모드 전환 */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              </p>
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="mt-2 text-purple-500 hover:text-purple-600 font-medium transition-colors duration-200"
                disabled={isAnimating}
              >
                {mode === 'login' ? '회원가입하기' : '로그인하기'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
