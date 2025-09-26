import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Star, Home } from 'lucide-react'
import { useEventDetail } from '../features/events/api/useEventDetail'
import FavoriteButton from '../components/event/FavoriteButton'
import JoinDialog from '../components/event/JoinDialog'
import HostBadge from '../components/event/HostBadge'
import { EventReviews } from '../components/review/EventReviews'
import { ReviewFormDialog } from '../components/review/ReviewFormDialog'
import { Button } from '../components/ui/button'
import { useMemo, useState } from 'react'

export default function EventDetailPage() {
  const navigate = useNavigate()
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
    } catch (e) {
      console.error('링크 복사 실패', e)
    }
  }

  return (
    <main role="main" aria-labelledby="page-title" className="px-4 py-6 mx-auto max-w-5xl">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="홈으로 돌아가기"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          홈으로 돌아가기
        </button>
      </div>
      <h1 id="page-title" className="sr-only">
        이벤트 상세 페이지
      </h1>

      {isLoading && (
        <div role="status" className="space-y-4" aria-live="polite" aria-busy>
          <div className="aspect-[16/9] rounded-xl bg-zinc-200 animate-pulse" />
          <div className="w-2/3 h-6 rounded animate-pulse bg-zinc-200" />
          <div className="w-1/2 h-4 rounded animate-pulse bg-zinc-200" />
        </div>
      )}

      {isError && (
        <div role="alert" className="flex justify-between items-center text-sm text-red-600">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden bg-white rounded-xl border border-zinc-200">
              {/* 커버 대체: 카테고리 그라디언트 */}
              <div className="w-full aspect-[16/9] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{data.category}</span>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-flex items-center rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-700 bg-white">
                    {data.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{data.title}</h2>
                <div className="flex gap-2 mt-3 text-xs text-zinc-700">
                  <span className="px-2 py-1 rounded border border-zinc-300">{data.mode}</span>
                  <span className="px-2 py-1 rounded border border-zinc-300">
                    {data.feeType === 'FREE' ? '무료' : `유료${data.feeAmount ? ` · ${data.feeAmount}원` : ''}`}
                  </span>
                </div>
                <div className="mt-4">
                  <HostBadge host={{ name: data.hostName }} />
                </div>
              </div>
            </div>

            <article className="p-4 bg-white rounded-xl border border-zinc-200" aria-label="이벤트 소개">
              <h3 className="mb-2 text-lg font-semibold">소개</h3>
              <ExpandableText text={data.description || data.topic} />
            </article>

            {/* 리뷰 섹션 */}
            <section className="p-4 bg-white rounded-xl border border-zinc-200" aria-label="이벤트 후기">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">후기</h3>
                {numericId && (
                  <ReviewFormDialog eventId={numericId}>
                    <Button size="sm" className="gap-2">
                      <Star className="w-4 h-4" />
                      후기 작성
                    </Button>
                  </ReviewFormDialog>
                )}
              </div>
              {numericId ? (
                <EventReviews eventId={numericId} />
              ) : (
                <div className="py-8 text-sm text-center text-zinc-500">
                  이벤트 정보를 불러올 수 없습니다.
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-3 lg:col-span-1" aria-label="행동 영역">
            <button
              type="button"
              className="w-full h-11 font-semibold text-white bg-black rounded-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black"
              aria-label="참가하기"
              onClick={() => setOpenJoin(true)}
            >
              참가하기
            </button>

            <div className="flex gap-2 items-center">
              <div className="inline-flex flex-1 justify-center items-center h-11 rounded-lg border border-zinc-300 hover:bg-zinc-50">
                {numericId ? <FavoriteButton eventId={numericId} initialFavorited={false} size={20} /> : null}
              </div>
              <button
                type="button"
                className="w-11 h-11 rounded-lg border border-zinc-300 hover:bg-zinc-50"
                onClick={handleCopy}
                aria-label="링크 복사"
              >
                <Copy className="mx-auto w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div role="status" aria-live="polite" className="h-4 text-xs text-emerald-600">
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


