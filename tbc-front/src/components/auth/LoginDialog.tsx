import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface LoginDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpenRegister: () => void
}

export function LoginDialog({ isOpen, onClose, onOpenRegister }: LoginDialogProps) {
  const { theme } = useTheme()
  const { login, isLoggingIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const isDark = theme === 'dark'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      await login(formData)
      onClose()
      setFormData({ email: '', password: '' })
    } catch (err: any) {
      setError(err?.response?.data?.message || '로그인에 실패했습니다.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleOpenRegister = () => {
    onClose()
    onOpenRegister()
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
            로그인
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
              disabled={isLoggingIn}
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
                placeholder="비밀번호를 입력하세요"
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                disabled={isLoggingIn}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoggingIn}
            style={{
              backgroundColor: isLoggingIn ? (isDark ? '#4b5563' : '#9ca3af') : '#3b82f6',
              color: '#ffffff'
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p 
            className="text-sm"
            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          >
            계정이 없으신가요?{' '}
            <button
              type="button"
              onClick={handleOpenRegister}
              className="font-medium hover:underline"
              style={{ color: '#3b82f6' }}
            >
              회원가입
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
