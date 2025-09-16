import { useParams } from 'react-router-dom'
import { Clock, Copy, MapPin, Star } from 'lucide-react'
import { useEventDetail } from '../features/events/api/useEventDetail'
import FavoriteButton from '../components/event/FavoriteButton'
import JoinDialog from '../components/event/JoinDialog'
import HostBadge from '../components/event/HostBadge'
import { EventReviews } from '../components/review/EventReviews'
import { ReviewFormDialog } from '../components/review/ReviewFormDialog'
import { Button } from '../components/ui/button'
import { useMemo, useState } from 'react'

export default function EventDetailPage() {
  const { id } = useParams()
  const numericId = useMemo(() => (id ? Number(id) : undefined), [id])
  const { data, isLoading, isError, refetch } = useEventDetail(numericId)
  const [copied, setCopied] = useState(false)
  const [openJoin, setOpenJoin] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <main role="main" aria-labelledby="page-title" className="mx-auto max-w-5xl px-4 py-6">
      <h1 id="page-title" className="sr-only">
        이벤트 상세 페이지
      </h1>

      {isLoading && (
        <div role="status" className="space-y-4" aria-live="polite" aria-busy>
          <div className="aspect-[16/9] rounded-xl bg-zinc-200 animate-pulse" />
          <div className="h-6 w-2/3 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
        </div>
      )}

      {isError && (
        <div role="alert" className="text-sm text-red-600 flex items-center justify-between">
          상세 정보를 불러오지 못했습니다.
          <button
            type="button"
            className="ml-4 px-3 py-1.5 rounded border border-zinc-300 hover:bg-zinc-50"
            onClick={() => refetch()}
            aria-label="다시 시도"
          >
            재시도
          </button>
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="text-sm text-zinc-600">표시할 상세 정보가 없습니다.</div>
      )}

      {!isLoading && !isError && data && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-4">
            <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white">
              <img
                src={data.coverUrl}
                alt={`${data.title} 커버 이미지`}
                className="w-full aspect-[16/9] object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-flex items-center rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-700 bg-white">
                    {data.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{data.title}</h2>
                <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{new Date(data.startAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span>{data.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <HostBadge host={{ name: data.hostName }} />
                </div>
              </div>
            </div>

            <article className="rounded-xl border border-zinc-200 bg-white p-4" aria-label="이벤트 소개">
              <h3 className="text-lg font-semibold mb-2">소개</h3>
              <ExpandableText text={data.description} />
            </article>

            {/* 리뷰 섹션 */}
            <section className="rounded-xl border border-zinc-200 bg-white p-4" aria-label="이벤트 후기">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">후기</h3>
                {numericId && (
                  <ReviewFormDialog eventId={numericId}>
                    <Button size="sm" className="gap-2">
                      <Star className="h-4 w-4" />
                      후기 작성
                    </Button>
                  </ReviewFormDialog>
                )}
              </div>
              {numericId ? (
                <EventReviews eventId={numericId} />
              ) : (
                <div className="text-sm text-zinc-500 py-8 text-center">
                  이벤트 정보를 불러올 수 없습니다.
                </div>
              )}
            </section>
          </section>

          <aside className="lg:col-span-1 space-y-3" aria-label="행동 영역">
            <button
              type="button"
              className="w-full h-11 rounded-lg bg-black text-white font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black"
              aria-label="참가하기"
              onClick={() => setOpenJoin(true)}
            >
              참가하기
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-11 rounded-lg border border-zinc-300 hover:bg-zinc-50 inline-flex items-center justify-center">
                {numericId ? <FavoriteButton eventId={numericId} initialFavorited={false} size={20} /> : null}
              </div>
              <button
                type="button"
                className="w-11 h-11 rounded-lg border border-zinc-300 hover:bg-zinc-50"
                onClick={handleCopy}
                aria-label="링크 복사"
              >
                <Copy className="w-4 h-4 mx-auto" aria-hidden="true" />
              </button>
            </div>

            <div role="status" aria-live="polite" className="text-xs text-emerald-600 h-4">
              {copied ? '링크를 복사했어요.' : ''}
            </div>
          </aside>
        </div>
        {numericId ? (
          <JoinDialog eventId={numericId} open={openJoin} onOpenChange={setOpenJoin} />
        ) : null}
        </>
      )}
    </main>
  )
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const short = text.length > 220 ? `${text.slice(0, 220)}…` : text
  return (
    <div className="text-sm text-zinc-700">
      <p>{expanded ? text : short}</p>
      {text.length > 220 && (
        <button
          type="button"
          className="mt-2 text-sm underline underline-offset-2"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? '내용 접기' : '내용 더보기'}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  )
}