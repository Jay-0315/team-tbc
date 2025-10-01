import { useEffect, useRef, useState } from 'react'
import { useJoinEvent } from '../../services/events'
import { toast } from 'sonner'

interface JoinDialogProps {
  eventId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function JoinDialog({ eventId, open, onOpenChange }: JoinDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstFocusable = useRef<HTMLButtonElement | null>(null)
  const [agree, setAgree] = useState<boolean>(false)
  const { mutateAsync, isPending } = useJoinEvent(eventId)

  useEffect(() => {
    if (open) {
      setTimeout(() => firstFocusable.current?.focus(), 0)
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange(false)
        if (e.key === 'Tab') trapFocus(e)
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  const trapFocus = (e: KeyboardEvent) => {
    const root = dialogRef.current
    if (!root) return
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const canSubmit = agree && !isPending

  const submit = async () => {
    if (!canSubmit) return
    try {
      await mutateAsync()
      toast.success('🎉 모임 참가가 완료되었습니다!', {
        description: '채팅방에서 다른 참가자들과 소통해보세요.',
        duration: 3000,
      })
      onOpenChange(false)
      // 페이지 리프레시
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '신청 중 오류가 발생했습니다.'
      toast.error('참가 신청 실패', {
        description: message,
        duration: 3000,
      })
    }
  }

  if (!open) return null

  return (
    <div
      className="flex fixed inset-0 z-50 justify-center items-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="join-title"
      aria-describedby="join-desc"
      aria-modal="true"
    >
      {/* 우측 상단 닫기 버튼 - 반투명 동그라미 */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 z-[60] flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg"
        aria-label="닫기"
      >
        ✕
      </button>
      
      <div className="absolute inset-0 bg-black/40" />
      <div ref={dialogRef} className="relative z-10 p-4 w-full max-w-md bg-white rounded-xl shadow-lg">
        <h2 id="join-title" className="text-lg font-semibold">참가 신청</h2>
        <p id="join-desc" className="mt-1 text-sm text-zinc-600">약관에 동의해주세요.</p>

        <div className="mt-4 space-y-3">
          <label className="inline-flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              aria-label="약관 동의"
            />
            참가 약관에 동의합니다.
          </label>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            type="button"
            className="px-4 h-10 rounded border border-zinc-300 hover:bg-zinc-50"
            onClick={() => onOpenChange(false)}
          >
            취소
          </button>
          <button
            type="button"
            className="px-4 h-10 text-white bg-black rounded disabled:opacity-50"
            disabled={!canSubmit}
            onClick={submit}
            aria-busy={isPending}
            aria-label="신청 제출"
          >
            {isPending ? '신청 중...' : '신청하기'}
          </button>
        </div>
      </div>
    </div>
  )
}



