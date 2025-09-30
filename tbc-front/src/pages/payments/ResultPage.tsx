import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const code = searchParams.get('code')
    const message = searchParams.get('message')

    const handlePaymentResult = async () => {
      const processedKey = `payment_processed_${orderId}`
      if (sessionStorage.getItem(processedKey)) {
        console.log('Payment already processed, redirecting to MyPage.')
        navigate('/mypage', { replace: true })
        return
      }

      if (code || message) {
        setStatus('failure')
        setMessage(`결제 실패: ${message || '알 수 없는 오류'}`)
        sessionStorage.setItem(processedKey, 'true')
        return
      }

      if (paymentKey && orderId && amount) {
        try {
          let confirmRes;
          try {
            confirmRes = await confirmPayment({
              paymentKey,
              orderId,
              amount: Number(amount),
            });
          } catch (retryErr) {
            console.warn('Confirm failed on first attempt, retrying...', retryErr);
            await new Promise(resolve => setTimeout(resolve, 300));
            confirmRes = await confirmPayment({
              paymentKey,
              orderId,
              amount: Number(amount),
            });
          }

          setStatus('success')
          setMessage('팝콘 충전 완료!')
          toast.success('팝콘 충전 완료!')
          sessionStorage.setItem(processedKey, 'true')
          navigate('/mypage', { replace: true })
        } catch (err) {
          console.error('Confirm error:', err)
          setStatus('failure')
          setMessage('결제 승인 실패. 다시 시도해주세요.')
          sessionStorage.setItem(processedKey, 'true')
        }
      } else {
        setStatus('failure')
        setMessage('잘못된 접근입니다.')
        sessionStorage.setItem(processedKey, 'true')
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

  if (status === 'failure') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
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
