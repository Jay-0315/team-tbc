import { Button } from '@/components/ui/button'
import type { Profile } from '@/hooks/useProfile'
import { useWalletBalance } from '@/features/payments/api/useBalance'

interface Props {
  profile?: Profile
  onEdit: () => void
}

export function ProfileCard({ profile, onEdit }: Props) {
  const { data: wallet, isLoading: walletLoading } = useWalletBalance()
  if (!profile) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-gray-600 dark:text-gray-300">프로필 정보가 없습니다. 프로필을 등록해주세요.</div>
          <Button onClick={onEdit} aria-label="프로필 등록">프로필 등록</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-6">
        <img
          src={profile.profileImageUrl || 'https://avatars.githubusercontent.com/u/1?v=4'}
          alt="프로필 이미지"
          className="h-20 w-20 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h2>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {profile.gender ?? '미설정'}
              </div>
            </div>
            <Button onClick={onEdit} aria-label="프로필 수정">프로필 수정</Button>
          </div>
          {profile.bio && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.interests?.map((it) => (
              <span key={it} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                #{it}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 팝콘 재화 섹션 */}
      <div className="px-4 py-3 mt-6 border rounded-xl bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
              <span className="text-lg">🍿</span>
            </div>
            <div>
              <div className="text-sm font-medium text-amber-900 dark:text-amber-100">팝콘</div>
              <div className="text-xs text-amber-700 dark:text-amber-300">모임 참가에 사용되는 재화</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              {walletLoading ? (
                <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">로딩...</div>
              ) : (
                <div className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  {Math.floor((wallet?.balance ?? 0) / 100).toLocaleString()} 개
                </div>
              )}
            </div>
            <Button
              aria-label="팝콘 충전하기"
              onClick={() => { window.location.href = '/payments/charge' }}
              className="px-3 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 whitespace-nowrap"
            >
              충전하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
