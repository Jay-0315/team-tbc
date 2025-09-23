import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
};

const CATEGORIES = ["SPORTS", "MUSIC", "STUDY", "FOOD", "TRAVEL", "GAME", "ETC"] as const;

export default function CreateWizard({ onCreated }: Props) {
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState("");

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

            // 1) 그룹 생성
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
        next();
    };

    const onPrev = () => {
        prev();
    };

    const onChange = (key: keyof Form, value: any) => {
        update(key, value);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">소셜링 만들기</h1>

                {/* Step indicator */}
                <div className="flex items-center justify-center mb-8">
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
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">제목 *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => onChange("title", e.target.value)}
                                placeholder="모임 제목을 입력하세요"
                                className="w-full rounded-xl border border-gray-600 px-4 py-3 bg-black text-white placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">카테고리 *</label>
                            <select
                                value={form.category}
                                onChange={(e) => onChange("category", e.target.value)}
                                className="w-full rounded-xl border border-gray-600 px-4 py-3 bg-black text-white"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="bg-black text-white">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">주제 *</label>
                            <input
                                type="text"
                                value={form.topic}
                                onChange={(e) => onChange("topic", e.target.value)}
                                placeholder="모임 주제를 입력하세요"
                                className="w-full rounded-xl border border-gray-600 px-4 py-3 bg-black text-white placeholder-gray-400"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-4">모임 방식 *</label>
                            <div className="space-y-3">
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
                            <label className="block text-sm font-medium text-white mb-4">참가비 *</label>
                            <div className="space-y-3">
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
                            <div className="space-y-4">
                                <NumberInput
                                    label="참가비 (원)"
                                    value={form.feeAmount || 0}
                                    onChange={(v) => onChange("feeAmount", v)}
                                    min={0}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">참가비 안내</label>
                                    <input
                                        type="text"
                                        value={form.feeInfo || ""}
                                        onChange={(e) => onChange("feeInfo", e.target.value)}
                                        placeholder="참가비 사용처나 환불 정책 등을 안내해주세요"
                                        className="w-full rounded-xl border border-gray-600 px-4 py-3 bg-black text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">태그</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                                    placeholder="태그를 입력하고 Enter를 누르세요"
                                    className="flex-1 rounded-xl border border-gray-600 px-4 py-2 bg-black text-white placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 rounded-xl border border-gray-600 text-white hover:bg-gray-800"
                                >
                                    추가
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700 text-white text-sm"
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
                                className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                                이전
                            </button>
                            <button
                                onClick={onNext}
                                className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">상세 내용</label>
                            <div className="prose w-full max-w-none">
                                <CKEditor
                                    editor={ClassicEditor as unknown as any}
                                    data={form.contentHtml}
                                    onChange={(_, editor: any) => onChange("contentHtml", editor.getData())}
                                    config={{
                                        toolbar: [
                                            'heading', '|',
                                            'bold', 'italic', '|',
                                            'bulletedList', 'numberedList', '|',
                                            'outdent', 'indent', '|',
                                            'blockQuote', '|',
                                            'undo', 'redo'
                                        ],
                                        placeholder: '모임에 대한 상세 내용을 작성해주세요...'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={onPrev}
                                className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                                이전
                            </button>
                            <button
                                onClick={onSubmit}
                                disabled={loading}
                                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                                    loading 
                                        ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                                        : "bg-white text-black hover:bg-gray-100"
                                }`}
                            >
                                {loading ? "개설 중..." : "개설하기"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="inline-flex items-center gap-2">
            <input type="radio" checked={checked} onChange={onChange} className="w-4 h-4 text-white border-gray-600 focus:ring-white bg-black" />
            <span className="text-white">{label}</span>
        </label>
    );
}

function NumberInput({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
    return (
        <div>
            <label className="block text-sm font-medium text-white mb-1">{label}</label>
            <input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-xl border border-gray-600 px-3 py-2 bg-black text-white" />
        </div>
    );
}
