import { useEffect, useMemo, useState } from 'react'
import { useCharge } from '@/features/payments/api/useCharge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export default function ChargePage() {
  // Use number[] for presets to avoid any-cast when checking includes
  const presets = useMemo<number[]>(() => [1000, 2000, 3000, 4000, 5000, 10000], [])
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
      toast.error('결제를 취소하셨습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 pt-16">
        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden border-gray-200 shadow-xl rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-amber-50 to-yellow-50">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F5E6B3] text-gray-900">
                  <Coins className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">팝콘 충전</CardTitle>
                  <CardDescription>100원 = 팝콘 1개 · 결제 완료 시 즉시 반영</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 my-auto mt-2 lg:grid-cols-3" aria-label="팝콘 충전 폼">
                <div className="space-y-4 lg:col-span-2">
                  {!authLoading && !user && (
                    <div role="alert" className="p-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                      로그인 후 이용 가능합니다.
                    </div>
                  )}

                  <div>
                    <Label className="text-gray-800">빠른 선택</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2" role="group" aria-label="충전 금액 빠른 선택">
                      {presets.map((presetAmount) => (
                        <button
                          key={presetAmount}
                          type="button"
                          onClick={() => setAmount(presetAmount)}
                          className={`border rounded-xl p-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20 ${amount === presetAmount ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200'}`}
                          aria-pressed={amount === presetAmount}
                          aria-label={`${presetAmount.toLocaleString()}원, 팝콘 ${(presetAmount / 100)}개`}
                        >
                          <div className="font-medium text-gray-900">{presetAmount.toLocaleString()}원</div>
                          <div className="text-xs text-gray-600">팝콘 {(presetAmount / 100)}개</div>
                        </button>
                      ))}
                      <div className={`rounded-xl p-3 border ${presets.includes(amount) ? 'border-gray-200' : 'border-gray-900 ring-1 ring-gray-900'}`}>
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

                  {isError && (
                    <div role="alert" className="text-sm text-red-600">{(error as Error)?.message ?? '오류 발생'}</div>
                  )}
                </div>

                <aside className="p-4 space-y-3 border border-gray-100 rounded-2xl bg-gray-50/60" aria-label="충전 요약">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-800" aria-hidden="true" />
                    <div className="text-sm font-semibold text-gray-900">요약</div>
                  </div>
                  <div className="text-sm text-gray-700" aria-live="polite">
                    선택 금액: <span className="font-medium">{amount.toLocaleString()}원</span>
                  </div>
                  <div className="text-sm text-gray-700" aria-live="polite">
                    예상 팝콘: <span className="font-medium">{popcorn}개</span>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full font-semibold text-gray-900 bg-[#F5E6B3] hover:bg-[#E8D89C]"
                      disabled={isPending || amount < 100 || amount > 1000000}
                      aria-busy={isPending}
                      aria-live="polite"
                    >
                      {isPending ? '진행 중…' : '충전 시작'}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    결제 진행 시 외부 결제창으로 이동합니다.
                  </div>
                </aside>
              </form>
            </CardContent>
            <CardFooter>
              <div className="w-full text-xs text-gray-500" role="status" aria-live="polite">
                {isPending && (
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-gray-900 rounded-full border-b-transparent animate-spin" aria-hidden="true"></span>
                    결제 위젯 준비 중…
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}