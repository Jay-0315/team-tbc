import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useToggleFavorite } from '../../services/events'

interface FavoriteButtonProps {
  eventId: number
  initialFavorited?: boolean
  size?: number
}

export default function FavoriteButton({ eventId, initialFavorited = false, size = 20 }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState<boolean>(initialFavorited)
  const { mutateAsync, isPending } = useToggleFavorite(eventId)

  const label = favorited ? '찜 해제' : '찜하기'

  const onToggle = async () => {
    const prev = favorited
    setFavorited(!prev)
    try {
      const res = await mutateAsync()
      setFavorited(res.favorited)
      showToast(res.favorited ? '찜했어요' : '찜 해제했어요')
    } catch (e: unknown) {
      setFavorited(prev)
      const message = e instanceof Error ? e.message : '요청 중 오류가 발생했습니다.'
      showToast(message, true)
    }
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={favorited}
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className="inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow"
      style={{ width: 36, height: 36 }}
    >
      <Heart
        className={`transition w-[${size}px] h-[${size}px] ${favorited ? 'fill-red-500 text-red-500' : ''}`}
        aria-hidden="true"
      />
    </button>
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


