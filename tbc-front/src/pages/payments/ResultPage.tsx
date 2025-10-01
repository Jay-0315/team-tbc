import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useConfirm } from '@/features/payments/api/useConfirm'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function ResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutateAsync: confirmPayment, isPending: isConfirming } = useConfirm()
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading')
  const [message, setMessage] = useState<string>('결제 처리 중...')
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double invocation in React Strict Mode
    if (hasProcessed.current) return

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const code = searchParams.get('code')
    const message = searchParams.get('message')

    const handlePaymentResult = async () => {
      const processedKey = `payment_processed_${orderId}`
      const processingKey = `payment_processing_${orderId}`
      
      // 이미 처리 완료되었으면 마이페이지로 이동
      if (sessionStorage.getItem(processedKey)) {
        navigate('/mypage', { replace: true })
        return
      }

      // 현재 처리 중이면 중복 호출 방지
      if (sessionStorage.getItem(processingKey)) {
        return
      }

      // 처리 시작 마크
      sessionStorage.setItem(processingKey, 'true')
      hasProcessed.current = true

      if (code || message) {
        setStatus('failure')
        setMessage(`결제 실패: ${message || '알 수 없는 오류'}`)
        sessionStorage.setItem(processedKey, 'true')
        sessionStorage.removeItem(processingKey)
        return
      }

      if (paymentKey && orderId && amount) {
        try {
          await confirmPayment({
            paymentKey,
            orderId,
            amount: Number(amount),
          })

          // 성공 시에만 이 코드 실행
          sessionStorage.setItem(processedKey, 'true')
          sessionStorage.removeItem(processingKey)
          setStatus('success')
          setMessage('팝콘 충전 완료!')
          toast.success('팝콘 충전 완료!')
          setTimeout(() => navigate('/mypage', { replace: true }), 1000)
        } catch (err: any) {
          console.error('Confirm error:', err)
          
          // 토스 API에서 "기존 요청 처리중" 에러는 성공으로 간주
          const errorMessage = err?.response?.data?.message || err?.message || ''
          if (errorMessage.includes('기존 요청을 처리중') || errorMessage.includes('FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING')) {
            // 이미 처리 중이므로 잠시 대기 후 성공 처리
            setTimeout(async () => {
              sessionStorage.setItem(processedKey, 'true')
              sessionStorage.removeItem(processingKey)
              setStatus('success')
              setMessage('팝콘 충전 완료!')
              toast.success('팝콘 충전 완료!')
              setTimeout(() => navigate('/mypage', { replace: true }), 1000)
            }, 2000)
            return
          }
          
          sessionStorage.setItem(processedKey, 'true')
          sessionStorage.removeItem(processingKey)
          setStatus('failure')
          setMessage('결제 승인 실패. 다시 시도해주세요.')
          toast.error('결제 승인 실패')
        }
      } else {
        sessionStorage.setItem(processedKey, 'true')
        sessionStorage.removeItem(processingKey)
        setStatus('failure')
        setMessage('잘못된 접근입니다.')
        toast.error('잘못된 접근입니다')
      }
    }

    handlePaymentResult()
  }, [searchParams, navigate, confirmPayment])

  if (status === 'loading' || isConfirming) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-900">{message}</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="mb-4 text-2xl font-semibold text-green-600">결제 성공</h1>
        <p className="mb-6 text-gray-700">{message}</p>
        <p className="text-sm text-gray-500">잠시 후 마이페이지로 이동합니다...</p>
      </div>
    )
  }

  if (status === 'failure') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="mb-6 text-6xl">❌</div>
        <h1 className="mb-4 text-2xl font-semibold text-red-600">결제 실패</h1>
        <p className="mb-6 text-gray-700">{message}</p>
        <Button onClick={() => navigate('/payments/charge', { replace: true })}>
          다시 충전하기
        </Button>
      </div>
    )
  }

  return null
}
