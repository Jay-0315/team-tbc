import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface RegisterDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogin: () => void
}

export function RegisterDialog({ isOpen, onClose, onOpenLogin }: RegisterDialogProps) {
  const { theme } = useTheme()
  const { signup, isSigningUp } = useAuth()
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

  const isDark = theme === 'dark'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.realName || !formData.nickname) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        realName: formData.realName,
        nickname: formData.nickname
      })
      onClose()
      setFormData({ email: '', password: '', confirmPassword: '', realName: '', nickname: '' })
      // 회원가입 성공 후 로그인 다이얼로그 열기
      onOpenLogin()
    } catch (err: any) {
      setError(err?.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleOpenLogin = () => {
    onClose()
    onOpenLogin()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-center text-2xl font-bold"
            style={{ color: isDark ? '#f9fafb' : '#111827' }}
          >
            회원가입
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div 
              role="alert"
              className="p-3 rounded-md text-sm"
              style={{
                backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                color: isDark ? '#fca5a5' : '#dc2626',
                border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label 
              htmlFor="realName"
              className="text-sm font-medium"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              실명
            </label>
            <input
              id="realName"
              name="realName"
              type="text"
              value={formData.realName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                color: isDark ? '#f9fafb' : '#111827'
              }}
              placeholder="실명을 입력하세요"
              disabled={isSigningUp}
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="nickname"
              className="text-sm font-medium"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                color: isDark ? '#f9fafb' : '#111827'
              }}
              placeholder="닉네임을 입력하세요"
              disabled={isSigningUp}
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                color: isDark ? '#f9fafb' : '#111827'
              }}
              placeholder="이메일을 입력하세요"
              disabled={isSigningUp}
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: isDark ? '#374151' : '#ffffff',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                disabled={isSigningUp}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                disabled={isSigningUp}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword"
              className="text-sm font-medium"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: isDark ? '#374151' : '#ffffff',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isSigningUp}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                disabled={isSigningUp}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSigningUp}
            style={{
              backgroundColor: isSigningUp ? (isDark ? '#4b5563' : '#9ca3af') : '#3b82f6',
              color: '#ffffff'
            }}
          >
            {isSigningUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                회원가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p 
            className="text-sm"
            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          >
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={handleOpenLogin}
              className="font-medium hover:underline"
              style={{ color: '#3b82f6' }}
            >
              로그인
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
