import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    realName: '',
    nickname: ''
  })
  const { signup, isSigningUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.realName || !formData.nickname) {
      toast.error('모든 필드를 입력해주세요.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    signup(
      {
        email: formData.email,
        password: formData.password,
        realName: formData.realName,
        nickname: formData.nickname
      },
      {
        onSuccess: () => {
          toast.success('회원가입이 완료되었습니다! 로그인해주세요.')
          onClose()
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            realName: '',
            nickname: ''
          })
          onSwitchToLogin()
        },
        onError: (error) => {
          toast.error(error.message || '회원가입에 실패했습니다.')
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="realName" className="text-sm font-medium">
              실명
            </label>
            <input
              id="realName"
              name="realName"
              type="text"
              value={formData.realName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="실명을 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSigningUp}
              className="flex-1"
            >
              {isSigningUp ? '가입 중...' : '회원가입'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToLogin}
              className="flex-1"
            >
              로그인
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
