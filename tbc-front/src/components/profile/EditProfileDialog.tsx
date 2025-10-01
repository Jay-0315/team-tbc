import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateProfile, type Profile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { User, Camera, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import apiClient from '@/lib/api'

interface Props {
  profile?: Profile
  onClose: () => void
  onSuccess: () => void
}

export function EditProfileDialog({ profile, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  // 프로필이 없을 때(처음 생성) user의 nickname을 기본값으로 사용
  const [displayName, setDisplayName] = useState(profile?.displayName ?? user?.nickname ?? '')
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-center p-4"
        role="dialog"
        aria-modal="true"
      >
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/50"
        />
        
        {/* 우측 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] flex items-center justify-center w-10 h-10 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg"
          aria-label="닫기"
        >
          ✕
        </button>
        
        {/* 모달 컨테이너 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl my-8 max-h-[calc(100vh-4rem)] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* 헤더 */}
            <div className="relative sticky top-0 z-10 p-6 pb-4 bg-white border-b border-gray-100">
              <div className="text-center">
                <div className="inline-flex justify-center items-center mb-3 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full shadow-lg sm:w-16 sm:h-16 sm:mb-4">
                  <Sparkles className="w-6 h-6 text-white sm:w-8 sm:h-8" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                  프로필 수정
                </h2>
                <p className="text-sm text-gray-600 sm:text-base">
                  프로필 정보를 수정해보세요
                </p>
              </div>
            </div>

            {/* 폼 */}
            <div className="px-4 pb-6 sm:px-6">
              <form className="pt-4 space-y-4 sm:space-y-6">
                {/* 프로필 사진 */}
                <div>
                  <Label className="block mb-3 text-xs font-medium text-gray-700 sm:text-sm">
                    프로필 사진
                  </Label>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <img 
                        src={imagePreview || 'https://avatars.githubusercontent.com/u/1?v=4'} 
                        alt="프로필 미리보기" 
                        className="object-cover w-20 h-20 rounded-full ring-4 ring-orange-100 sm:w-24 sm:h-24" 
                      />
                      <div className="flex absolute -right-1 -bottom-1 justify-center items-center w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full shadow-md">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
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
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                    </div>
                  </div>
                </div>

                {/* 이름(닉네임) */}
                <div>
                  <Label htmlFor="displayName" className="text-xs font-medium text-gray-700 sm:text-sm">
                    이름(닉네임)
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 w-3 h-3 text-gray-400 transform -translate-y-1/2 sm:w-4 sm:h-4" />
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-9 h-10 text-sm rounded-xl border-gray-300 sm:pl-10 sm:h-12 sm:text-base focus:border-orange-500 focus:ring-orange-500"
                      placeholder="닉네임을 입력하세요"
                      aria-invalid={nickStatus === 'taken'}
                      aria-describedby="nickname-help"
                    />
                  </div>
                  {nickMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      id="nickname-help"
                      className={`mt-2 text-xs sm:text-sm ${nickStatus === 'taken' ? 'text-red-600' : nickStatus === 'available' ? 'text-green-600' : 'text-gray-500'}`}
                      aria-live="polite"
                    >
                      {nickStatus === 'checking' && <Loader2 className="inline mr-1 w-3 h-3 animate-spin" />}
                      {nickMsg}
                    </motion.p>
                  )}
                </div>

                {/* 성별 */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 sm:text-sm">
                    성별
                  </Label>
                  <div className="mt-1">
                    <Select value={gender} onValueChange={(value) => setGender(value as Profile['gender'])}>
                      <SelectTrigger className={cn(
                        "h-10 text-sm rounded-xl border-2 border-gray-200 transition-all duration-200 sm:h-12 sm:text-base focus:ring-4 focus:ring-orange-500/20 dark:border-gray-600 focus:border-orange-500"
                      )}>
                        <SelectValue placeholder="성별을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">남성</SelectItem>
                        <SelectItem value="FEMALE">여성</SelectItem>
                        <SelectItem value="OTHER">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 자기소개 */}
                <div>
                  <Label htmlFor="bio" className="text-xs font-medium text-gray-700 sm:text-sm">
                    자기소개
                  </Label>
                  <div className="relative mt-1">
                    <textarea 
                      id="bio"
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      rows={4} 
                      className="p-3 w-full text-sm rounded-xl border-2 border-gray-200 transition-all duration-200 resize-none sm:p-4 sm:text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" 
                      placeholder="간단한 소개를 입력하세요"
                    />
                  </div>
                </div>

                {/* 관심사 */}
                <div>
                  <Label htmlFor="interests" className="text-xs font-medium text-gray-700 sm:text-sm">
                    관심사
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="interests"
                      value={interestInput} 
                      onChange={(e) => setInterestInput(e.target.value)} 
                      className="flex-1 h-10 text-sm rounded-xl border-gray-300 sm:h-12 sm:text-base focus:border-orange-500 focus:ring-orange-500" 
                      placeholder="관심사를 입력하고 Enter" 
                      onKeyUp={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} 
                    />
                    <Button 
                      onClick={addInterest} 
                      type="button"
                      className="px-4 h-10 text-white bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl sm:h-12 hover:from-orange-500 hover:to-amber-500"
                    >
                      추가
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {interests.map((it) => (
                      <motion.span 
                        key={it}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex gap-1 items-center px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded-full border border-orange-200 sm:text-sm"
                      >
                        #{it}
                        <button 
                          onClick={() => removeInterest(it)} 
                          className="ml-1 text-orange-500 transition-colors hover:text-orange-700"
                          aria-label={`${it} 관심사 제거`}
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* 버튼 영역 */}
            <div className="px-4 pb-6 sm:px-6">
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="flex-1 h-10 text-sm text-gray-700 rounded-xl border border-gray-300 sm:h-12 sm:text-base hover:bg-gray-50"
                >
                  취소
                </Button>
                <Button 
                  onClick={onSubmit} 
                  disabled={isSubmitDisabled}
                  className="flex-1 h-10 text-sm font-semibold text-white bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl transition-all duration-300 transform sm:h-12 sm:text-base hover:from-orange-500 hover:to-amber-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label="저장"
                >
                  {isPending || nickStatus === 'checking' ? (
                    <div className="flex gap-2 items-center">
                      <Loader2 className="w-3 h-3 animate-spin sm:w-4 sm:h-4" />
                      저장 중...
                    </div>
                  ) : (
                    '저장'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
