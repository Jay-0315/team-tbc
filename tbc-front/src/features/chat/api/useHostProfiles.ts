import { useQueries } from '@tanstack/react-query'
import api from '@/lib/api'

interface HostProfile {
  userId: number
  displayName: string
  profileImageUrl?: string
  isOnline: boolean
}

/**
 * 여러 호스트의 프로필과 온라인 상태를 동시에 조회
 */
export function useHostProfiles(hostIds: number[]) {
  // 중복 제거
  const uniqueHostIds = Array.from(new Set(hostIds))
  
  const queries = useQueries({
    queries: uniqueHostIds.map((hostId) => ({
      queryKey: ['host-profile', hostId],
      queryFn: async (): Promise<HostProfile> => {
        try {
          // 프로필 정보 조회
          const profilePromise = api.get<{
            displayName: string
            profileImageUrl?: string
          }>(`/profile/${hostId}`)
          
          // 온라인 상태 조회
          const onlineStatusPromise = api.get<{
            userId: number
            isOnline: boolean
          }>(`/chat/users/${hostId}/online-status`)
          
          // 병렬 요청
          const [profileRes, onlineRes] = await Promise.all([
            profilePromise,
            onlineStatusPromise,
          ])
          
          return {
            userId: hostId,
            displayName: profileRes.data.displayName || `사용자 ${hostId}`,
            profileImageUrl: profileRes.data.profileImageUrl,
            isOnline: onlineRes.data.isOnline,
          }
        } catch (error) {
          console.error(`호스트 ${hostId} 프로필 조회 실패:`, error)
          // 프로필 조회 실패 시 기본값 반환
          return {
            userId: hostId,
            displayName: `사용자 ${hostId}`,
            profileImageUrl: undefined,
            isOnline: false,
          }
        }
      },
      staleTime: 10 * 1000, // 10초
      gcTime: 5 * 60 * 1000, // 5분
      refetchInterval: 15 * 1000, // 15초마다 자동 갱신 (실시간성)
    })),
  })

  // Map<hostId, HostProfile> 형태로 반환
  const hostProfilesMap = new Map<number, HostProfile>()
  uniqueHostIds.forEach((hostId, index) => {
    const profile = queries[index]?.data
    if (profile) {
      hostProfilesMap.set(hostId, profile)
    }
  })

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)

  return {
    hostProfilesMap,
    isLoading,
    isError,
  }
}

