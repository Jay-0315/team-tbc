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

      {/* 구글 계정 연동 섹션 */}
      <div className="px-4 py-3 mt-6 border rounded-xl bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">구글 계정 연동</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">구글 계정으로 간편하게 로그인하세요</div>
            </div>
          </div>
          <Button
            aria-label="구글 계정 연동하기"
            onClick={() => {
              // Spring Security OAuth2 표준 경로 사용
              // 현재 JWT 토큰이 있어도 OAuth2 플로우 진행
              window.location.href = '/oauth2/authorization/google'
            }}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          >
            연동하기
          </Button>
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
