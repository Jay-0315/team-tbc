import { useEffect, useMemo, useState } from 'react'
import { useCharge } from '@/features/payments/api/useCharge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export default function ChargePage() {
  const presets = useMemo(() => [1000, 2000, 3000, 4000, 5000, 10000] as const, [])
  const [amount, setAmount] = useState<number>(1000)
  const { user, isLoading: authLoading } = useAuth()
  const { mutateAsync, isPending, isError, error } = useCharge()

  const popcorn = Math.floor(amount / 100)

  useEffect(() => {
    const key = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined
    if (!key) return
    if ((window as any).TossPayments) return
    const s = document.createElement('script')
    s.src = 'https://js.tosspayments.com/v1'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.id
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    try {
      const orderId = `ORD-${userId}-${Date.now()}`
      const res = await mutateAsync({ orderId, userId, amount, orderName: 'Popcorn Charge' })

      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined
      if (!clientKey) {
        toast.error('결제 설정이 누락되었습니다(VITE_TOSS_CLIENT_KEY).')
        return
      }
      const tpFactory = (window as any).TossPayments
      if (!tpFactory) {
        toast.error('결제 위젯 로드에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      const tossPayments = tpFactory(clientKey)
      const successUrl = `${window.location.origin}/payments/result`
      const failUrl = `${window.location.origin}/payments/result`

      await tossPayments.requestPayment('카드', {
        amount,
        orderId: res.orderId,
        orderName: `팝콘 ${popcorn}개 충전`,
        successUrl,
        failUrl,
        customerEmail: user?.email,
        customerName: user?.nickname || `user-${userId}`,
      })
    } catch (err) {
      console.error('INIT error:', err)
      toast.error('결제 초기화 실패')
    }
  }

  return (
    <div className="max-w-xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-semibold">팝콘 충전</h1>
      <form onSubmit={onSubmit} className="space-y-4" aria-label="팝콘 충전 폼">
        {!authLoading && !user && (
          <div role="alert" className="p-3 text-sm text-red-700 border border-red-200 rounded bg-red-50">
            로그인 후 이용 가능합니다.
          </div>
        )}
        <div>
          <Label>빠른 선택</Label>
          <div className="grid grid-cols-3 gap-2 mt-2" role="group" aria-label="충전 금액 빠른 선택">
            {presets.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`border rounded p-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${amount === v ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'}`}
                aria-pressed={amount === v}
                aria-label={`${v.toLocaleString()}원, 팝콘 ${(v / 100)}개`}
              >
                <div className="font-medium">{v.toLocaleString()}원</div>
                <div className="text-xs text-gray-600">팝콘 {(v / 100)}개</div>
              </button>
            ))}
            <div className={`border rounded p-3 ${presets.includes(amount as any) ? 'border-gray-300' : 'border-blue-600 ring-1 ring-blue-600'}`}>
              <div className="mb-1 text-xs text-gray-600">직접 입력</div>
              <Input
                type="number"
                min={100}
                max={1000000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                aria-label="직접 입력 금액"
              />
              <div className="mt-1 text-xs text-gray-500" aria-live="polite">100원 ~ 1,000,000원</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-700" aria-live="polite">
          선택 금액: <span className="font-medium">{amount.toLocaleString()}원</span> / 예상 팝콘: <span className="font-medium">{popcorn}개</span>
        </div>

        <Button type="submit" disabled={isPending || amount < 100 || amount > 1000000} aria-busy={isPending} aria-live="polite">
          {isPending ? '진행 중...' : '충전 시작'}
        </Button>

        {isError && (
          <div role="alert" className="text-sm text-red-600">{(error as Error)?.message ?? '오류 발생'}</div>
        )}
      </form>
    </div>
  )
}