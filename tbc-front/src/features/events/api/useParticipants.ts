import { useQuery } from '@tanstack/react-query'
import { fetchParticipants } from '@/services/groups'
import type { ParticipantResponse } from '@/services/groups'
import { fetchProfile } from '@/services/profile'

export const participantKeys = {
  root: ['participants'] as const,
  byEvent: (eventId: number) => [...participantKeys.root, eventId] as const,
}

export interface EnrichedParticipant extends ParticipantResponse {
  profileImageUrl?: string | null
  displayName?: string | null
}

export function useParticipants(eventId?: number) {
  return useQuery<EnrichedParticipant[]>({
    queryKey: eventId ? participantKeys.byEvent(eventId) : participantKeys.root,
    queryFn: async () => {
      if (!eventId) return []
      const participants = await fetchParticipants(eventId)
      // fetch profiles in parallel (limit minimal for now)
      const profiles = await Promise.all(
        participants.map(async (p) => {
          try {
            const prof = await fetchProfile(p.userId)
            return [p.userId, prof] as const
          } catch {
            return [p.userId, null] as const
          }
        })
      )
      const map = new Map<number, { profileImageUrl?: string | null; displayName?: string | null }>()
      for (const [uid, prof] of profiles) {
        map.set(uid, {
          profileImageUrl: prof?.profileImageUrl ?? null,
          displayName: prof?.displayName ?? null,
        })
      }
      return participants.map<EnrichedParticipant>((p) => ({
        ...p,
        profileImageUrl: map.get(p.userId)?.profileImageUrl ?? null,
        displayName: map.get(p.userId)?.displayName ?? null,
      }))
    },
    enabled: Boolean(eventId),
    staleTime: 10_000, // 10초
    gcTime: 60_000, // 1분
    refetchInterval: 15_000, // ✅ 15초마다 자동 갱신 (채팅방과 동일)
  })
} 