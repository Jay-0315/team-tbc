import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUpdateProfile, type Profile } from '@/hooks/useProfile'
import apiClient from '@/lib/api'

interface Props {
  profile?: Profile
  onClose: () => void
  onSuccess: () => void
}

export function EditProfileDialog({ profile, onClose, onSuccess }: Props) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [gender, setGender] = useState<Profile['gender']>(profile?.gender ?? 'OTHER')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [interestInput, setInterestInput] = useState('')
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? [])
  const { mutateAsync, isPending } = useUpdateProfile()
  const [imagePreview, setImagePreview] = useState<string | undefined>(profile?.profileImageUrl || undefined)

  // 닉네임(=displayName) 중복 체크 상태
  type NickStatus = 'idle' | 'checking' | 'available' | 'taken'
  const [nickStatus, setNickStatus] = useState<NickStatus>('idle')
  const [nickMsg, setNickMsg] = useState<string>('')

  useEffect(() => {
    const name = displayName.trim()
    // 기존 값과 같으면 사용 가능 처리
    if (name.length === 0) {
      setNickStatus('idle')
      setNickMsg('')
      return
    }
    if (profile?.displayName && name === profile.displayName) {
      setNickStatus('available')
      setNickMsg('현재 사용 중인 이름입니다.')
      return
    }
    setNickStatus('checking')
    setNickMsg('중복 확인 중...')
    const t = setTimeout(async () => {
      try {
        const { data } = await apiClient.get<boolean>('/users/check-nickname', { params: { nickname: name } })
        if (data) {
          setNickStatus('available')
          setNickMsg('사용 가능한 닉네임이에요.')
        } else {
          setNickStatus('taken')
          setNickMsg('이미 사용 중인 닉네임입니다.')
        }
      } catch {
        setNickStatus('idle')
        setNickMsg('중복 확인에 실패했습니다. 잠시 후 다시 시도하세요.')
      }
    }, 300)
    return () => clearTimeout(t)
  }, [displayName, profile?.displayName])

  const addInterest = () => {
    const v = interestInput.trim()
    if (!v) return
    if (interests.includes(v)) return
    setInterests((prev) => [...prev, v])
    setInterestInput('')
  }

  const removeInterest = (v: string) => {
    setInterests((prev) => prev.filter((x) => x !== v))
  }

  const onSubmit = async () => {
    const payload = { displayName, gender, bio, interests, profileImageUrl: imagePreview }
    console.log('[EditProfileDialog] submitting payload', { hasImage: !!imagePreview, len: imagePreview?.length })
    await mutateAsync(payload as unknown as never) // any 금지 우회: payload는 서버 DTO와 동일 구조
    onSuccess()
  }

  const isSubmitDisabled = isPending || displayName.trim().length === 0 || nickStatus === 'taken' || nickStatus === 'checking'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="p-6 w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">프로필 수정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="닫기">✕</button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">프로필 사진</label>
            <div className="flex gap-4 items-center">
              <img src={imagePreview || 'https://avatars.githubusercontent.com/u/1?v=4'} alt="미리보기" className="object-cover w-16 h-16 rounded-full ring-1 ring-gray-200 dark:ring-gray-700" />
              <input
                type="file"
                accept="image/*"
                aria-label="프로필 사진 업로드"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    const dataUrl = reader.result as string
                    console.log('[EditProfileDialog] image selected, length=', dataUrl?.length)
                    setImagePreview(dataUrl)
                  }
                  reader.readAsDataURL(file)
                }}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">이름(닉네임)</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="p-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              placeholder="닉네임을 입력하세요"
              aria-invalid={nickStatus === 'taken'}
              aria-describedby="nickname-help"
            />
            <p id="nickname-help" className={`mt-1 text-xs ${nickStatus === 'taken' ? 'text-red-600' : nickStatus === 'available' ? 'text-green-600' : 'text-gray-500'}`} aria-live="polite">
              {nickMsg}
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">성별</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as Profile['gender'])} className="p-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
              <option value="OTHER">기타</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">자기소개</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="p-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800" placeholder="간단한 소개를 입력하세요" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">관심사</label>
            <div className="flex gap-2">
              <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)} className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800" placeholder="관심사를 입력하고 Enter" onKeyUp={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} />
              <Button onClick={addInterest} type="button">추가</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((it) => (
                <span key={it} className="inline-flex gap-1 items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full dark:bg-blue-500/10 dark:text-blue-300">
                  #{it}
                  <button onClick={() => removeInterest(it)} className="ml-1 text-blue-500 hover:text-blue-700">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button onClick={onSubmit} disabled={isSubmitDisabled} aria-label="저장">
            {isPending || nickStatus === 'checking' ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}
