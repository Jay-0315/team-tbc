import { useEffect, useRef, useState } from 'react'
import { useJoinEvent } from '../../services/events'

interface JoinDialogProps {
  eventId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function JoinDialog({ eventId, open, onOpenChange }: JoinDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstFocusable = useRef<HTMLButtonElement | null>(null)
  const [qty, setQty] = useState<number>(1)
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

  const canSubmit = qty >= 1 && agree && !isPending

  const submit = async () => {
    if (!canSubmit) return
    try {
      await mutateAsync({ qty })
      showToast('신청 완료')
      onOpenChange(false)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '신청 중 오류가 발생했습니다.'
      showToast(message, true)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-labelledby="join-title"
      aria-describedby="join-desc"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div ref={dialogRef} className="relative z-10 w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <h2 id="join-title" className="text-lg font-semibold">참가 신청</h2>
        <p id="join-desc" className="text-sm text-zinc-600 mt-1">수량을 선택하고 약관에 동의해주세요.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">수량</label>
            <div className="mt-1 inline-flex items-center rounded border border-zinc-300 overflow-hidden">
              <button
                ref={firstFocusable}
                type="button"
                className="px-3 py-2 hover:bg-zinc-50"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="수량 감소"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-16 text-center py-2 outline-none"
                aria-label="수량"
              />
              <button
                type="button"
                className="px-3 py-2 hover:bg-zinc-50"
                onClick={() => setQty((q) => q + 1)}
                aria-label="수량 증가"
              >
                +
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              aria-label="약관 동의"
            />
            참가 약관에 동의합니다.
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 h-10 rounded border border-zinc-300 hover:bg-zinc-50"
            onClick={() => onOpenChange(false)}
          >
            취소
          </button>
          <button
            type="button"
            className="px-4 h-10 rounded bg-black text-white disabled:opacity-50"
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

function showToast(message: string, isError = false) {
  const id = 'toast-area'
  let area = document.getElementById(id)
  if (!area) {
    area = document.createElement('div')
    area.id = id
    area.setAttribute('role', 'status')
    area.setAttribute('aria-live', 'polite')
    area.style.position = 'fixed'
    area.style.bottom = '16px'
    area.style.left = '50%'
    area.style.transform = 'translateX(-50%)'
    document.body.appendChild(area)
  }
  const el = document.createElement('div')
  el.textContent = message
  el.className = `mt-1 px-3 py-2 rounded text-sm ${isError ? 'bg-red-600 text-white' : 'bg-black text-white'}`
  area.appendChild(el)
  setTimeout(() => {
    area?.removeChild(el)
  }, 1500)
}


