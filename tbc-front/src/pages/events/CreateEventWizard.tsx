import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Users, Tag, X, Plus, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

type Mode = "ONLINE" | "OFFLINE"
type FeeType = "FREE" | "PAID"

type Props = {
  onCreated: (groupId: number, roomId: number) => void
}

type Form = {
  title: string
  category: string
  topic: string
  minParticipants: number
  maxParticipants: number
  mode: Mode
  feeType: FeeType
  feeAmount: number | null
  feeInfo: string | null
  tags: string[]
  contentHtml: string
  eventDate: Date | undefined
  eventTime: string
  location: string
  capacity: number
  joined: number
  coverUrl: string
  status: string
}

const CATEGORIES = [
  { value: "SPORTS", label: "스포츠" },
  { value: "MUSIC", label: "음악" },
  { value: "STUDY", label: "스터디" },
  { value: "FOOD", label: "음식" },
  { value: "TRAVEL", label: "여행" },
  { value: "GAME", label: "게임" },
  { value: "CULTURE", label: "문화" },
  { value: "ETC", label: "기타" }
] as const

const TIME_OPTIONS = [
  { value: "09:00", label: "오전 9:00" },
  { value: "09:30", label: "오전 9:30" },
  { value: "10:00", label: "오전 10:00" },
  { value: "10:30", label: "오전 10:30" },
  { value: "11:00", label: "오전 11:00" },
  { value: "11:30", label: "오전 11:30" },
  { value: "12:00", label: "오후 12:00" },
  { value: "12:30", label: "오후 12:30" },
  { value: "13:00", label: "오후 1:00" },
  { value: "13:30", label: "오후 1:30" },
  { value: "14:00", label: "오후 2:00" },
  { value: "14:30", label: "오후 2:30" },
  { value: "15:00", label: "오후 3:00" },
  { value: "15:30", label: "오후 3:30" },
  { value: "16:00", label: "오후 4:00" },
  { value: "16:30", label: "오후 4:30" },
  { value: "17:00", label: "오후 5:00" },
  { value: "17:30", label: "오후 5:30" },
  { value: "18:00", label: "오후 6:00" },
  { value: "18:30", label: "오후 6:30" },
  { value: "19:00", label: "오후 7:00" },
  { value: "19:30", label: "오후 7:30" },
  { value: "20:00", label: "오후 8:00" },
  { value: "20:30", label: "오후 8:30" },
  { value: "21:00", label: "오후 9:00" },
  { value: "21:30", label: "오후 9:30" },
  { value: "22:00", label: "오후 10:00" },
  { value: "22:30", label: "오후 10:30" }
]

export default function CreateEventWizard({ onCreated }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<Form>({
    title: "",
    category: "ETC",
    topic: "",
    minParticipants: 1,
    maxParticipants: 10,
    mode: "OFFLINE",
    feeType: "FREE",
    feeAmount: null,
    feeInfo: null,
    tags: [],
    contentHtml: "",
    eventDate: undefined,
    eventTime: "19:00",
    location: "",
    capacity: 10,
    joined: 0,
    coverUrl: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Event+Cover",
    status: "OPEN",
  })

  const updateForm = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // 에러 메시지 제거
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!form.title.trim()) {
        newErrors.title = "제목을 입력해주세요"
      } else if (form.title.length < 2) {
        newErrors.title = "제목은 2글자 이상 입력해주세요"
      } else if (form.title.length > 50) {
        newErrors.title = "제목은 50글자 이하로 입력해주세요"
      }

      if (!form.topic.trim()) {
        newErrors.topic = "주제를 입력해주세요"
      } else if (form.topic.length < 2) {
        newErrors.topic = "주제는 2글자 이상 입력해주세요"
      }

      if (form.minParticipants < 1) {
        newErrors.minParticipants = "최소 인원은 1명 이상이어야 합니다"
      }

      if (form.maxParticipants > 30) {
        newErrors.maxParticipants = "최대 인원은 30명을 초과할 수 없습니다"
      }

      if (form.minParticipants > form.maxParticipants) {
        newErrors.maxParticipants = "최대 인원은 최소 인원보다 많아야 합니다"
      }
    }

    if (stepNumber === 2) {
      if (!form.eventDate) {
        newErrors.eventDate = "이벤트 날짜를 선택해주세요"
      } else if (form.eventDate < new Date()) {
        newErrors.eventDate = "과거 날짜는 선택할 수 없습니다"
      }

      if (!form.eventTime) {
        newErrors.eventTime = "이벤트 시간을 선택해주세요"
      }

      if (!form.location.trim()) {
        newErrors.location = "장소를 입력해주세요"
      }

      if (form.feeType === "PAID") {
        if (!form.feeAmount || form.feeAmount <= 0) {
          newErrors.feeAmount = "참가비를 입력해주세요"
        }
        if (!form.feeInfo?.trim()) {
          newErrors.feeInfo = "참가비 안내를 입력해주세요"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => {
    if (validateStep(step)) {
      setStep(s => (s === 3 ? 3 : ((s + 1) as 2 | 3)))
    }
  }

  const prev = () => {
    setStep(s => (s === 1 ? 1 : ((s - 1) as 1 | 2)))
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim()) && form.tags.length < 10) {
      updateForm("tags", [...form.tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    updateForm("tags", form.tags.filter(t => t !== tag))
  }

  const onSubmit = async () => {
    if (loading || !validateStep(3)) return
    setLoading(true)

    try {
      const resolvedUserId = user?.id ?? (user as unknown as { userId?: number })?.userId
      if (!resolvedUserId) {
        throw new Error("로그인이 필요합니다")
      }

      if (!form.eventDate) {
        throw new Error("이벤트 날짜가 선택되지 않았습니다")
      }

      // 이벤트 날짜와 시간을 결합
      const eventDateTime = new Date(form.eventDate)
      const [hours, minutes] = form.eventTime.split(':')
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const payload = {
        title: form.title,
        category: form.category,
        topic: form.topic,
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        mode: form.mode,
        feeType: form.feeType,
        feeAmount: form.feeAmount,
        feeInfo: form.feeInfo,
        tags: form.tags,
        contentHtml: form.contentHtml,
        eventDate: form.eventDate.toISOString().split('T')[0],
        eventTime: form.eventTime,
        location: form.location
      }

      console.log("Creating event with payload:", payload)
      const { data } = await apiClient.post("/groups", payload, {
        headers: {
          "X-User-Id": String(resolvedUserId)
        }
      })

      const groupId = data.groupId
      if (!groupId) {
        throw new Error("이벤트 생성 후 ID를 받지 못했습니다")
      }

      // 채팅방 ID 조회
      const r = await apiClient.get(`/groups/${groupId}/chat-room`, {
        headers: { "X-User-Id": String(resolvedUserId) }
      })
      const roomId = r.data.roomId

      onCreated(groupId, roomId)
    } catch (error) {
      console.error("Event creation error:", error)
      console.error("Error response data:", JSON.stringify(error.response?.data, null, 2))
      console.error("Error status:", error.response?.status)
      console.error("Error status text:", error.response?.statusText)
      console.error("Error config:", error.config)
      console.error("Full error object:", JSON.stringify(error, null, 2))
      setErrors({ submit: "이벤트 생성에 실패했습니다. 다시 시도해주세요." })
    } finally {
      setLoading(false)
    }
  }

  const progressValue = (step / 3) * 100

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(239, 68, 68, 0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="relative w-full px-4 py-8 min-h-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-4">
            소셜링 만들기
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            새로운 사람들과 만나고 싶은 활동을 만들어보세요. 
            <span className="font-semibold text-gray-800 dark:text-gray-200">단 3단계</span>로 쉽고 빠르게!
          </p>
        </div>

        {/* 진행 바 */}
        <div className="mb-12">
          <div className="flex justify-center items-center mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-lg",
                    stepNumber <= step
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110"
                      : "bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-600"
                  )}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={cn(
                      "w-20 h-1 mx-4 transition-all duration-500 rounded-full",
                      stepNumber < step
                        ? "bg-gradient-to-r from-red-500 to-pink-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* 단계별 제목 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 1 && "기본 정보 입력"}
              {step === 2 && "상세 정보 설정"}
              {step === 3 && "내용 작성 및 완료"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {step === 1 && "소셜링의 기본 정보를 입력해주세요"}
              {step === 2 && "모임 방식과 일정을 설정해주세요"}
              {step === 3 && "참가자들이 알아야 할 내용을 작성해주세요"}
            </p>
          </div>
          
          <Progress value={progressValue} className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500 ease-out" 
                 style={{ width: `${progressValue}%` }} />
          </Progress>
        </div>

        {/* 에러 메시지 */}
        {errors.submit && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 shadow-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">오류가 발생했습니다</p>
              <p className="text-sm opacity-90">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* 1단계: 기본 정보 */}
        {step === 1 && (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                기본 정보
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                소셜링의 기본 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* 제목 */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold text-gray-900 dark:text-white">
                  제목 *
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="예: 서울 맛집 투어 모임"
                  className={cn(
                    "h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-red-500/20",
                    errors.title 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 dark:border-gray-600 focus:border-red-500"
                  )}
                  aria-label="소셜링 제목"
                  maxLength={50}
                />
                {errors.title && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    참가자들이 쉽게 이해할 수 있는 제목을 작성해주세요
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {form.title.length}/50
                  </p>
                </div>
              </div>

              {/* 카테고리 */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-base font-semibold text-gray-900 dark:text-white">
                  카테고리 *
                </Label>
                <Select value={form.category} onValueChange={(value) => updateForm("category", value)}>
                  <SelectTrigger className={cn(
                    "h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-red-500/20",
                    errors.category 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 dark:border-gray-600 focus:border-red-500"
                  )}>
                    <SelectValue placeholder="카테고리를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                  </div>
                )}
              </div>

              {/* 주제 */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">
                  주제 *
                </Label>
                <Input
                  id="topic"
                  value={form.topic}
                  onChange={(e) => updateForm("topic", e.target.value)}
                  placeholder="예: 새로운 맛집을 찾아 떠나는 여행"
                  className={cn(errors.topic && "border-red-500")}
                  aria-label="소셜링 주제"
                />
                {errors.topic && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.topic}
                  </p>
                )}
              </div>

              {/* 인원 수 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minParticipants" className="text-sm font-medium">
                    최소 인원 *
                  </Label>
                  <Input
                    id="minParticipants"
                    type="number"
                    min="1"
                    max="30"
                    value={form.minParticipants}
                    onChange={(e) => updateForm("minParticipants", parseInt(e.target.value) || 1)}
                    className={cn(errors.minParticipants && "border-red-500")}
                    aria-label="최소 참가 인원"
                  />
                  {errors.minParticipants && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.minParticipants}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="text-sm font-medium">
                    최대 인원 * (최대 30명)
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    max="30"
                    value={form.maxParticipants}
                    onChange={(e) => updateForm("maxParticipants", parseInt(e.target.value) || 1)}
                    className={cn(errors.maxParticipants && "border-red-500")}
                    aria-label="최대 참가 인원"
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.maxParticipants}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  onClick={next} 
                  size="lg" 
                  className="h-12 px-8 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  다음 단계
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2단계: 상세 정보 */}
        {step === 2 && (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                상세 정보
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                모임 방식, 참가비, 일정, 장소 등을 설정해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* 모임 방식 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900 dark:text-white">모임 방식 *</Label>
                <RadioGroup
                  value={form.mode}
                  onValueChange={(value: Mode) => updateForm("mode", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="OFFLINE" id="offline" className="sr-only" />
                    <Label 
                      htmlFor="offline" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        form.mode === "OFFLINE"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      <MapPin className="w-8 h-8 mb-2" />
                      <span className="font-semibold">오프라인</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">직접 만나서 진행</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="ONLINE" id="online" className="sr-only" />
                    <Label 
                      htmlFor="online" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        form.mode === "ONLINE"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold">온라인</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">화상으로 진행</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 참가비 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900 dark:text-white">참가비 *</Label>
                <RadioGroup
                  value={form.feeType}
                  onValueChange={(value: FeeType) => updateForm("feeType", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="FREE" id="free" className="sr-only" />
                    <Label 
                      htmlFor="free" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        form.feeType === "FREE"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="font-semibold">무료</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">참가비 없음</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="PAID" id="paid" className="sr-only" />
                    <Label 
                      htmlFor="paid" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        form.feeType === "PAID"
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold">유료</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">참가비 있음</span>
                    </Label>
                  </div>
                </RadioGroup>

                {form.feeType === "PAID" && (
                  <div className="space-y-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <div className="space-y-3">
                      <Label htmlFor="feeAmount" className="text-base font-semibold text-gray-900 dark:text-white">
                        참가비 (원) *
                      </Label>
                      <Input
                        id="feeAmount"
                        type="number"
                        min="0"
                        value={form.feeAmount || ""}
                        onChange={(e) => updateForm("feeAmount", parseInt(e.target.value) || null)}
                        placeholder="예: 15000"
                        className={cn(
                          "h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-orange-500/20",
                          errors.feeAmount 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-orange-200 dark:border-orange-700 focus:border-orange-500"
                        )}
                        aria-label="참가비 금액"
                      />
                      {errors.feeAmount && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.feeAmount}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="feeInfo" className="text-base font-semibold text-gray-900 dark:text-white">
                        참가비 안내 *
                      </Label>
                      <Textarea
                        id="feeInfo"
                        value={form.feeInfo || ""}
                        onChange={(e) => updateForm("feeInfo", e.target.value)}
                        placeholder="참가비 사용처나 환불 정책 등을 안내해주세요"
                        className={cn(
                          "border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-orange-500/20",
                          errors.feeInfo 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-orange-200 dark:border-orange-700 focus:border-orange-500"
                        )}
                        aria-label="참가비 안내 사항"
                        rows={3}
                      />
                      {errors.feeInfo && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600 dark:text-red-400">{errors.feeInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 날짜와 시간 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">이벤트 날짜 *</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-red-500/20",
                          !form.eventDate && "text-gray-500 dark:text-gray-400",
                          errors.eventDate 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 dark:border-gray-600 focus:border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.eventDate ? (
                          format(form.eventDate, "yyyy년 M월 d일 (E)", { locale: ko })
                        ) : (
                          <span>날짜를 선택해주세요</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.eventDate}
                        onSelect={(date) => {
                          if (date) {
                            updateForm("eventDate", date)
                            setDatePickerOpen(false)
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        fromDate={new Date()}
                        initialFocus
                        locale={ko}
                        className="p-3"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: cn(
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                          ),
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell:
                            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: cn(
                            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                          ),
                          day_range_end: "day-range-end",
                          day_selected:
                            "bg-red-500 text-white hover:bg-red-600 hover:text-white focus:bg-red-500 focus:text-white",
                          day_today: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
                          day_outside:
                            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle:
                            "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.eventDate && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">이벤트 시간 *</Label>
                  <Select value={form.eventTime} onValueChange={(value) => updateForm("eventTime", value)}>
                    <SelectTrigger className={cn(
                      "h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-red-500/20",
                      errors.eventTime 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-gray-200 dark:border-gray-600 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="시간을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.eventTime && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventTime}
                    </p>
                  )}
                </div>
              </div>

              {/* 장소 */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  장소 *
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder={form.mode === "ONLINE" ? "예: Zoom, Google Meet 링크" : "예: 강남역 2번 출구"}
                  className={cn(errors.location && "border-red-500")}
                  aria-label="모임 장소"
                />
                {errors.location && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* 태그 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  태그 (선택사항)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="태그를 입력하고 Enter를 누르세요"
                    className="flex-1"
                    aria-label="태그 입력"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={!tagInput.trim() || form.tags.length >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                          aria-label={`${tag} 태그 제거`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  최대 10개까지 추가 가능합니다
                </p>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={prev}
                  className="h-12 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전 단계
                </Button>
                <Button 
                  onClick={next} 
                  size="lg" 
                  className="h-12 px-8 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  다음 단계
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3단계: 내용 작성 */}
        {step === 3 && (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                내용 작성
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                소셜링에 대한 상세한 내용을 작성해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  상세 내용 *
                </Label>
                <Textarea
                  id="content"
                  value={form.contentHtml}
                  onChange={(e) => updateForm("contentHtml", e.target.value)}
                  placeholder="모임에 대한 상세한 내용을 작성해주세요.&#10;&#10;예시:&#10;- 모임 목적과 기대효과&#10;- 준비물이나 주의사항&#10;- 일정 및 진행 방식&#10;- 연락처 및 문의사항"
                  className="min-h-[200px]"
                  aria-label="소셜링 상세 내용"
                  rows={10}
                />
                <p className="text-xs text-gray-500">
                  참가자들이 모임에 대해 잘 이해할 수 있도록 자세히 작성해주세요
                </p>
              </div>

              {/* 미리보기 */}
              {form.contentHtml && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">미리보기</Label>
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[100px]">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {form.contentHtml}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={prev}
                  className="h-12 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전 단계
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={loading}
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      소셜링 생성 중...
                    </>
                  ) : (
                    <>
                      소셜링 만들기
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
