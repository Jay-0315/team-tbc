import type { EventHost } from '../../features/events/types'

interface HostBadgeProps {
  host: EventHost
}

export default function HostBadge({ host }: HostBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1">
      <span className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden inline-flex items-center justify-center">
        {host.avatarUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={host.avatarUrl} className="w-full h-full object-cover" alt="호스트 아바타" />
        ) : (
          <span className="text-xs" aria-hidden="true">
            {host?.name?.slice(0, 1) || "?"}
          </span>
        )}
      </span>
      <span className="text-sm text-zinc-700">{host?.name || "호스트"}</span>
    </div>
  )
}


