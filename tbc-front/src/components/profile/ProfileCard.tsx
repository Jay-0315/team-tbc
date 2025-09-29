import { Button } from '@/components/ui/button'
import type { Profile } from '@/hooks/useProfile'

interface Props {
  profile?: Profile
  onEdit: () => void
}

export function ProfileCard({ profile, onEdit }: Props) {
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

      {/* 팝콘 재화 섹션 (하드코딩) */}
      <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">팝콘</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">앱 내에서 사용할 수 있는 재화입니다.</div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">1,234 개</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">임시 표시(하드코딩)</div>
            </div>
            <Button
              aria-label="팝콘 충전하기"
              onClick={() => { window.location.href = '/payments/charge' }}
              className="whitespace-nowrap"
            >
              충전하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
