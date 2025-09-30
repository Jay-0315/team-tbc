import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Star, Edit, Trash2, MapPin } from 'lucide-react'
import { useEventDetail } from '../features/events/api/useEventDetail'
import FavoriteButton from '../components/event/FavoriteButton'
import JoinDialog from '../components/event/JoinDialog'
import HostBadge from '../components/event/HostBadge'
import { EventReviews } from '../components/review/EventReviews'
import { ReviewFormDialog } from '../components/review/ReviewFormDialog'
import { EditEventDialog } from '../components/event/EditEventDialog'
import { DeleteEventDialog } from '../components/event/DeleteEventDialog'
import { Button } from '../components/ui/button'
import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../lib/api'
import Map from '../components/Map'
import { useParticipants } from '@/features/events/api/useParticipants'
import { fetchProfile } from '@/services/profile'

export default function EventDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const numericId = useMemo(() => (id ? Number(id) : undefined), [id])
  const { data, isLoading, isError, refetch } = useEventDetail(numericId)
  const { isAuthenticated, user } = useAuth()
  const { data: participants = [] } = useParticipants(numericId)
  const [copied, setCopied] = useState(false)
  const [openJoin, setOpenJoin] = useState(false)
  const [hostNickname, setHostNickname] = useState<string>('')
  const [hostImageUrl, setHostImageUrl] = useState<string | null>(null)

  // derive fields with broad fallbacks
  const feePopcorn = (data as unknown as { fee_amount?: number })?.fee_amount ?? (data as unknown as { feeAmount?: number })?.feeAmount ?? 0
  const hostId = (data as unknown as { host_id?: number })?.host_id
    ?? (data as unknown as { hostId?: number })?.hostId
    ?? (data as unknown as { host?: { id?: number } })?.host?.id
  const contentHtml = (data as unknown as { content_html?: string })?.content_html
    ?? (data as unknown as { contentHtml?: string })?.contentHtml
  
  // 위도/경도 가져오기 (타입에 정의됨)
  const latitude = data?.latitude ?? null
  const longitude = data?.longitude ?? null
  const location = data?.location || ''
  const imagePath = data?.imagePath ?? null

  // 호스트 여부 확인
  const isHost = user && hostId && user.id === hostId

  useEffect(() => {
    let cancelled = false
    const fetchNickname = async () => {
      if (!hostId) return
      try {
        const res = await apiClient.get<{ displayName?: string }>(`/profile/${hostId}`)
        if (!cancelled) setHostNickname(res.data?.displayName || `사용자 ${hostId}`)
      } catch {
        if (!cancelled) setHostNickname(`사용자 ${hostId}`)
      }
    }
    fetchNickname()
    return () => { cancelled = true }
  }, [hostId])

  useEffect(() => {
    let cancelled = false
    const fetchHostProfile = async () => {
      if (!hostId) return
      try {
        const prof = await fetchProfile(hostId)
        if (!cancelled) {
          setHostNickname(prof.displayName || `사용자 ${hostId}`)
          setHostImageUrl(prof.profileImageUrl ?? null)
        }
      } catch {
        // ignore
      }
    }
    fetchHostProfile()
    return () => { cancelled = true }
  }, [hostId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error('링크 복사 실패', e)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8 pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
              <div className="w-12 h-12 rounded-full border-b-2 border-black animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8 pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center items-center h-64">
              <div className="text-center" role="alert" aria-live="assertive">
                <div className="mb-4 text-red-600">오류가 발생했습니다</div>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 text-white bg-black rounded-lg hover:bg-black/90"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8 pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="mb-4 text-gray-500">표시할 상세 정보가 없습니다</div>
                <button
                  onClick={() => navigate('/events')}
                  className="px-4 py-2 text-gray-900 bg-[#F5E6B3] rounded-lg hover:bg-[#E8D89C]"
                >
                  이벤트 목록으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-xl backdrop-blur-sm bg-white/80">
                {/* 커버 이미지 또는 카테고리 그라디언트 */}
                {imagePath ? (
                  <div className="overflow-hidden relative w-full aspect-[16/9]">
                    <img
                      src={`http://localhost:8080${imagePath}`}
                      alt={data.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="w-full aspect-[16/9] bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"><span class="text-2xl font-bold text-white">' + data.category + '</span></div>'
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{data.category}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] text-white bg-black">
                      {data.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-700">
                    <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">{data.mode || 'OFFLINE'}</span>
                    <span className="px-2 py-1 bg-gray-50 rounded border border-gray-100">
                      {data.feeType === 'FREE' ? '무료' : `${feePopcorn} 팝콘`}
                    </span>
                  </div>
                  <div className="mt-4">
                    <HostBadge host={{ name: hostNickname || data.hostName }} />
                  </div>
                </div>
              </div>

              {/* 소개 (content_html 우선) */}
              {(() => {
                const html = contentHtml
                if (html) {
                  return (
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md">
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">상세 정보</h3>
                      <div 
                        className="max-w-none prose prose-sm"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </div>
                  )
                }
                return data.description ? (
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">상세 정보</h3>
                    <ExpandableText text={data.description} />
                  </div>
                ) : null
              })()}

              {/* 장소 및 지도 */}
              {location && (
                <div className="p-4 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-md">
                  <div className="flex gap-2 items-center">
                    <MapPin className="w-5 h-5 text-gray-800" />
                    <h3 className="text-lg font-semibold text-gray-900">모임 장소</h3>
                  </div>
                  <p className="text-gray-700">{location}</p>
                  {latitude !== null && longitude !== null && latitude !== undefined && longitude !== undefined ? (
                    <div className="mt-4">
                      <Map
                        lat={latitude}
                        lng={longitude}
                        locationName={location}
                        zoom={15}
                        height="300px"
                      />
                    </div>
                  ) : (
                    <div className="p-4 mt-4 text-sm text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                      <MapPin className="inline-block mr-2 w-4 h-4" />
                      지도 정보가 없습니다
                    </div>
                  )}
                </div>
              )}

              {/* 후기 섹션 */}
              {isAuthenticated ? (
                <section className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md" aria-label="이벤트 후기">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">후기</h3>
                    {numericId && (
                      <ReviewFormDialog eventId={numericId}>
                        <Button size="sm" className="gap-2 text-gray-900 bg-[#F5E6B3] hover:bg-[#E8D89C] border-0">
                          <Star className="w-4 h-4" />
                          후기 작성
                        </Button>
                      </ReviewFormDialog>
                    )}
                  </div>
                  {numericId ? (
                    <EventReviews eventId={numericId} />
                  ) : (
                    <div className="py-8 text-sm text-center text-gray-500">
                      이벤트 정보를 불러올 수 없습니다.
                    </div>
                  )}
                </section>
              ) : (
                <section className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md" aria-label="이벤트 후기">
                  <div className="py-8 text-center">
                    <div className="inline-flex justify-center items-center mb-4 w-16 h-16 text-gray-800 bg-gray-100 rounded-full">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">후기를 보려면 로그인이 필요합니다</h3>
                    <p className="mb-6 text-gray-600">로그인 후 다른 참가자들의 후기를 확인하고 후기를 작성해보세요</p>
                    <button 
                      className="px-6 py-3 font-semibold text-gray-900 bg-[#F5E6B3] rounded-2xl transition-all duration-300 hover:bg-[#E8D89C]"
                      onClick={() => navigate('/login')}
                    >
                      로그인하기
                    </button>
                  </div>
                </section>
              )}
            </section>

            <aside className="space-y-3 lg:col-span-1" aria-label="행동 영역">
              {/* 호스트/참여자 정보 */}
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md">
                {/* HOST (항상 표시) */}
                {hostId && (
                  <div className="flex gap-3 items-center mb-3">
                    <img
                      src={hostImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(hostNickname || `사용자 ${hostId}`)}&background=000000&color=ffffff&size=48`}
                      alt={`${hostNickname || `사용자 ${hostId}`} 프로필`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{hostNickname || `사용자 ${hostId}`}</div>
                      <div className="text-xs text-gray-600">호스트</div>
                    </div>
                  </div>
                )}
                {/* MEMBERS */}
                <div>
                  <div className="mb-2 text-sm font-semibold text-gray-900">참여자</div>
                  {participants.filter(p => p.role !== 'HOST').length === 0 ? (
                    <div className="text-xs text-gray-500">참여자가 아직 없습니다</div>
                  ) : (
                    <div className="flex -space-x-2 overflow-hidden">
                      {participants.filter(p => p.role !== 'HOST').slice(0, 10).map(m => {
                        const mName = m.displayName || `사용자 ${m.userId}`
                        const mAvatar = m.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mName)}&background=F5E6B3&color=111111&size=32`
                        return (
                          <img
                            key={m.userId}
                            src={mAvatar}
                            alt={`${mName} 프로필`}
                            className="inline-block w-8 h-8 rounded-full ring-2 ring-white object-cover"
                          />
                        )
                      })}
                    </div>
                  )}
                  {participants.filter(p => p.role !== 'HOST').length > 10 && (
                    <div className="mt-2 text-xs text-gray-600">+
                      {participants.filter(p => p.role !== 'HOST').length - 10}명 더보기
                    </div>
                  )}
                </div>
              </div>

              {/* 호스트인 경우 수정/삭제 버튼 */}
              {isHost && (
                <div className="flex gap-2">
                  <EditEventDialog event={data}>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-gray-200"
                      aria-label="모임 수정"
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </Button>
                  </EditEventDialog>
                  <DeleteEventDialog event={data}>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-red-600 border-gray-200 hover:text-red-700 hover:border-red-300"
                      aria-label="모임 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </Button>
                  </DeleteEventDialog>
                </div>
              )}

              {/* 일반 사용자인 경우 참가하기 버튼 */}
              {!isHost && (
                <button
                  type="button"
                  className="w-full h-11 font-semibold text-gray-900 bg-[#F5E6B3] rounded-2xl transition-colors duration-200 hover:bg-[#E8D89C] focus-visible:ring-2 focus-visible:ring-black/20"
                  aria-label="참가하기"
                  onClick={() => setOpenJoin(true)}
                >
                  참가하기
                </button>
              )}

              <div className="flex gap-2 items-center">
                <div className="inline-flex flex-1 justify-center items-center h-11 rounded-2xl border border-gray-100 hover:bg-gray-50">
                  {numericId ? <FavoriteButton eventId={numericId} initialFavorited={false} size={20} /> : null}
                </div>
                <button
                  type="button"
                  className="w-11 h-11 rounded-2xl border border-gray-100 hover:bg-gray-50"
                  onClick={handleCopy}
                  aria-label="링크 복사"
                >
                  <Copy className="mx-auto w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div role="status" aria-live="polite" className="h-4 text-xs text-gray-500">
                {copied ? '링크를 복사했어요.' : ''}
              </div>
            </aside>
          </div>
          {numericId ? (
            <JoinDialog eventId={numericId} open={openJoin} onOpenChange={setOpenJoin} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const short = text.length > 220 ? `${text.slice(0, 220)}…` : text
  return (
    <div className="text-sm text-gray-700">
      <p>{expanded ? text : short}</p>
      {text.length > 220 && (
        <button
          type="button"
          className="mt-2 text-sm text-gray-700 underline underline-offset-2 hover:text-gray-900"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? '내용 접기' : '내용 더보기'}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  )
}