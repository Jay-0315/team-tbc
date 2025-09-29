import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

type Mode = "ONLINE" | "OFFLINE";
type FeeType = "FREE" | "PAID";

type Props = {
    onCreated: (groupId: number, roomId: number) => void;
};

type Form = {
    title: string;
    category: string;
    topic: string;
    minParticipants: number;
    maxParticipants: number;
    mode: Mode;
    feeType: FeeType;
    feeAmount: number | null;
    feeInfo: string | null;
    tags: string[];
    contentHtml: string;
    // events 테이블을 위한 추가 필드들
    eventDate: string; // YYYY-MM-DD 형식
    eventTime: string; // HH:MM 형식
    location: string;
    capacity: number; // maxParticipants와 동일하게 설정
    joined: number; // 기본값 0
    coverUrl: string; // 기본 커버 이미지 URL
    status: string; // 기본값 "OPEN"
};

const CATEGORIES = ["SPORTS", "MUSIC", "STUDY", "FOOD", "TRAVEL", "GAME", "ETC"] as const;

export default function CreateWizard({ onCreated }: Props) {
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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
        contentHtml: "<p style='color: #374151;'>모임에 대한 상세 내용을 작성해주세요.</p>",
        // 추가 필드들 초기값
        eventDate: "",
        eventTime: "",
        location: "",
        capacity: 10,
        joined: 0,
        coverUrl: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Event+Cover",
        status: "OPEN",
    });

    const next = () => setStep((s) => (s === 3 ? 3 : ((s + 1) as 2 | 3)));
    const prev = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2)));
    const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            update("tags", [...form.tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        update("tags", form.tags.filter((t) => t !== tag));
    };

    const onSubmit = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // Resolve user id for header
            const resolvedUserId = user?.id ?? (user as unknown as { userId?: number })?.userId;
            if (!resolvedUserId) {
                alert("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
                return;
            }

            // events 테이블을 위한 데이터 준비
            const eventDate = new Date(form.eventDate);
            const eventTime = form.eventTime.split(':');
            const startAt = new Date(eventDate);
            startAt.setHours(parseInt(eventTime[0]), parseInt(eventTime[1]), 0, 0);

            // 1) 그룹 생성 (events 테이블에 저장)
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
                // events 테이블 필드들 추가
                eventDate: form.eventDate,
                eventTime: form.eventTime,
                location: form.location,
                capacity: form.maxParticipants, // maxParticipants와 동일
                joined: 0,
                coverUrl: form.coverUrl,
                status: form.status,
                startAt: startAt.toISOString(),
                description: form.contentHtml,
            };

            console.log("Creating group with payload:", payload);
            const { data } = await apiClient.post("/groups", payload, {
                headers: {
                    "X-User-Id": String(resolvedUserId)
                }
            });

            // 백엔드 응답 구조에 맞게 수정: { groupId: number }
            const groupId = data.groupId;
            console.log("Group created with ID:", groupId);

            if (!groupId) {
                throw new Error("그룹 생성 후 ID를 받지 못했습니다.");
            }

            // 2) 채팅방 ID 조회 (간단 재시도)
            const r = await apiClient.get(`/groups/${groupId}/chat-room`, {
                headers: { "X-User-Id": String(resolvedUserId) }
            });
            const roomId = r.data.roomId;
            console.log("Chat room ID:", roomId);

            onCreated(groupId, roomId);
        } catch (error) {
            console.error("Group creation error:", error);
            alert("그룹 생성에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const onNext = () => {
        if (step === 1) {
            if (!form.title.trim()) {
                alert("제목을 입력해주세요.");
                return;
            }
            if (!form.topic.trim()) {
                alert("주제를 입력해주세요.");
                return;
            }
        }
        if (step === 2) {
            if (!form.eventDate) {
                alert("이벤트 날짜를 선택해주세요.");
                return;
            }
            if (!form.eventTime) {
                alert("이벤트 시간을 선택해주세요.");
                return;
            }
            if (!form.location.trim()) {
                alert("장소를 입력해주세요.");
                return;
            }
        }
        next();
    };

    const onPrev = () => {
        prev();
    };

    const onChange = (key: keyof Form, value: Form[keyof Form]) => {
        update(key, value);
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
        if (!dateString) return "날짜 선택";
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    // 시간 포맷팅 함수
    const formatTime = (timeString: string) => {
        if (!timeString) return "시간 선택";
        const [hours, minutes] = timeString.split(':');
        return `${hours}시 ${minutes}분`;
    };

    return (
        <div className="p-6 min-h-screen text-white bg-black">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold">소셜링 만들기</h1>

                {/* Step indicator */}
                <div className="flex justify-center items-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                        s <= step ? "bg-white text-black" : "bg-gray-600 text-gray-300"
                                    }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`w-16 h-1 mx-2 ${
                                            s < step ? "bg-white" : "bg-gray-600"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">제목 *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => onChange("title", e.target.value)}
                                placeholder="모임 제목을 입력하세요"
                                className="px-3 py-2 w-full placeholder-gray-400 text-white bg-black rounded-xl border border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">카테고리 *</label>
                            <select
                                value={form.category}
                                onChange={(e) => onChange("category", e.target.value)}
                                className="px-3 py-2 w-full text-white bg-black rounded-xl border border-gray-600"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="text-white bg-black">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">주제 *</label>
                            <input
                                type="text"
                                value={form.topic}
                                onChange={(e) => onChange("topic", e.target.value)}
                                placeholder="모임 주제를 입력하세요"
                                className="px-3 py-2 w-full placeholder-gray-400 text-white bg-black rounded-xl border border-gray-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                                label="최소 인원 *"
                                value={form.minParticipants}
                                onChange={(v) => onChange("minParticipants", v)}
                                min={1}
                            />
                            <NumberInput
                                label="최대 인원 *"
                                value={form.maxParticipants}
                                onChange={(v) => onChange("maxParticipants", v)}
                                min={form.minParticipants}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={onNext}
                                className="px-4 py-2 font-semibold text-black bg-white rounded-xl transition-colors hover:bg-gray-100"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">모임 방식 *</label>
                            <div className="space-y-2">
                                <Radio
                                    label="오프라인"
                                    checked={form.mode === "OFFLINE"}
                                    onChange={() => onChange("mode", "OFFLINE")}
                                />
                                <Radio
                                    label="온라인"
                                    checked={form.mode === "ONLINE"}
                                    onChange={() => onChange("mode", "ONLINE")}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">참가비 *</label>
                            <div className="space-y-2">
                                <Radio
                                    label="무료"
                                    checked={form.feeType === "FREE"}
                                    onChange={() => onChange("feeType", "FREE")}
                                />
                                <Radio
                                    label="유료"
                                    checked={form.feeType === "PAID"}
                                    onChange={() => onChange("feeType", "PAID")}
                                />
                            </div>
                        </div>

                        {form.feeType === "PAID" && (
                            <div className="space-y-3">
                                <NumberInput
                                    label="참가비 (원)"
                                    value={form.feeAmount || 0}
                                    onChange={(v) => onChange("feeAmount", v)}
                                    min={0}
                                />
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-white">참가비 안내</label>
                                    <input
                                        type="text"
                                        value={form.feeInfo || ""}
                                        onChange={(e) => onChange("feeInfo", e.target.value)}
                                        placeholder="참가비 사용처나 환불 정책 등을 안내해주세요"
                                        className="px-3 py-2 w-full placeholder-gray-400 text-white bg-black rounded-xl border border-gray-600"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 아이폰 다이얼식 날짜/시간 선택 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-white">이벤트 날짜 *</label>
                                <button
                                    type="button"
                                    onClick={() => setShowDatePicker(true)}
                                    className="px-3 py-2 w-full text-left text-white bg-black rounded-xl border border-gray-600 transition-colors hover:bg-gray-800"
                                >
                                    {formatDate(form.eventDate)}
                                </button>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-white">이벤트 시간 *</label>
                                <button
                                    type="button"
                                    onClick={() => setShowTimePicker(true)}
                                    className="px-3 py-2 w-full text-left text-white bg-black rounded-xl border border-gray-600 transition-colors hover:bg-gray-800"
                                >
                                    {formatTime(form.eventTime)}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">장소 *</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => onChange("location", e.target.value)}
                                placeholder="모임 장소를 입력하세요"
                                className="px-3 py-2 w-full placeholder-gray-400 text-white bg-black rounded-xl border border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">태그</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                                    placeholder="태그를 입력하고 Enter를 누르세요"
                                    className="flex-1 px-3 py-2 placeholder-gray-400 text-white bg-black rounded-xl border border-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-3 py-2 text-white rounded-xl border border-gray-600 hover:bg-gray-800"
                                >
                                    추가
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex gap-1 items-center px-2 py-1 text-xs text-white bg-gray-700 rounded-full"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={onPrev}
                                className="px-4 py-2 text-gray-300 rounded-xl border border-gray-600 hover:bg-gray-800"
                            >
                                이전
                            </button>
                            <button
                                onClick={onNext}
                                className="px-4 py-2 font-semibold text-black bg-white rounded-xl transition-colors hover:bg-gray-100"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-white">상세 내용</label>
                            <textarea
                                className="px-3 py-2 w-full h-32 placeholder-gray-400 text-white bg-black rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                value={form.contentHtml}
                                onChange={(e) => onChange("contentHtml", e.target.value)}
                                placeholder="모임에 대한 상세 내용을 작성해주세요."
                            />
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={onPrev}
                                className="px-4 py-2 text-gray-300 rounded-xl border border-gray-600 hover:bg-gray-800"
                            >
                                이전
                            </button>
                            <button
                                onClick={onSubmit}
                                disabled={loading}
                                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                                    loading 
                                        ? "text-gray-300 bg-gray-600 cursor-not-allowed" 
                                        : "text-black bg-white hover:bg-gray-100"
                                }`}
                            >
                                {loading ? "개설 중..." : "개설하기"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 날짜 선택 다이얼 */}
                {showDatePicker && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
                        <div className="p-6 mx-4 w-full max-w-sm bg-white rounded-xl">
                            <h3 className="mb-4 text-lg font-semibold text-black">날짜 선택</h3>
                            <DatePicker
                                selectedDate={form.eventDate}
                                onSelect={(date) => {
                                    onChange("eventDate", date);
                                    setShowDatePicker(false);
                                }}
                                onCancel={() => setShowDatePicker(false)}
                            />
                        </div>
                    </div>
                )}

                {/* 시간 선택 다이얼 */}
                {showTimePicker && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
                        <div className="p-6 mx-4 w-full max-w-sm bg-white rounded-xl">
                            <h3 className="mb-4 text-lg font-semibold text-black">시간 선택</h3>
                            <TimePicker
                                selectedTime={form.eventTime}
                                onSelect={(time) => {
                                    onChange("eventTime", time);
                                    setShowTimePicker(false);
                                }}
                                onCancel={() => setShowTimePicker(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 날짜 선택 다이얼 컴포넌트
function DatePicker({ selectedDate, onSelect, onCancel }: {
    selectedDate: string;
    onSelect: (date: string) => void;
    onCancel: () => void;
}) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [day, setDay] = useState(today.getDate());

    const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleConfirm = () => {
        const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        onSelect(dateString);
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                {/* 년도 선택 */}
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">년도</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}년</option>
                        ))}
                    </select>
                </div>

                {/* 월 선택 */}
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">월</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {months.map(m => (
                            <option key={m} value={m}>{m}월</option>
                        ))}
                    </select>
                </div>

                {/* 일 선택 */}
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">일</label>
                    <select
                        value={day}
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {days.map(d => (
                            <option key={d} value={d}>{d}일</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                >
                    취소
                </button>
                <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    확인
                </button>
            </div>
        </div>
    );
}

// 시간 선택 다이얼 컴포넌트
function TimePicker({ selectedTime, onSelect, onCancel }: {
    selectedTime: string;
    onSelect: (time: string) => void;
    onCancel: () => void;
}) {
    const [hour, setHour] = useState(9);
    const [minute, setMinute] = useState(0);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleConfirm = () => {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        onSelect(timeString);
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                {/* 시간 선택 */}
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">시간</label>
                    <select
                        value={hour}
                        onChange={(e) => setHour(Number(e.target.value))}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {hours.map(h => (
                            <option key={h} value={h}>{h}시</option>
                        ))}
                    </select>
                </div>

                {/* 분 선택 */}
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">분</label>
                    <select
                        value={minute}
                        onChange={(e) => setMinute(Number(e.target.value))}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {minutes.map(m => (
                            <option key={m} value={m}>{m}분</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                >
                    취소
                </button>
                <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    확인
                </button>
            </div>
        </div>
    );
}

// 나머지 컴포넌트들은 기존과 동일...
function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="inline-flex gap-2 items-center">
            <input type="radio" checked={checked} onChange={onChange} className="w-4 h-4 text-white bg-black border-gray-600 focus:ring-white" />
            <span className="text-white">{label}</span>
        </label>
    );
}

function NumberInput({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
    return (
        <div>
            <label className="block mb-1 text-sm font-medium text-white">{label}</label>
            <input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} className="px-3 py-2 w-full text-white bg-black rounded-xl border border-gray-600" />
        </div>
    );
}
