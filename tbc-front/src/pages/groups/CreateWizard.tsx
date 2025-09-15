import { useState } from "react";
import api from "../../../libs/api";
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
        contentHtml: "<p>모임에 대한 상세 내용을 작성해주세요.</p>",
    });

    const next = () => setStep((s) => (s === 3 ? 3 : ((s + 1) as 2 | 3)));
    const prev = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2)));
    const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

    const addTag = () => {
        const t = tagInput.trim();
        if (!t || form.tags.includes(t)) return;
        update("tags", [...form.tags, t]);
        setTagInput("");
    };
    const removeTag = (t: string) => update("tags", form.tags.filter((x) => x !== t));

    const validateStep1 = () => {
        if (!form.title.trim()) return "제목을 입력해주세요.";
        if (form.minParticipants < 1) return "최소 인원은 1명 이상이어야 합니다.";
        if (form.maxParticipants < form.minParticipants) return "최대 인원이 최소 인원보다 작을 수 없습니다.";
        return null;
    };
    const validateStep2 = () => {
        if (form.feeType === "PAID") {
            if (form.feeAmount == null || form.feeAmount < 0) return "참가비 금액을 올바르게 입력해주세요.";
        }
        return null;
    };

    const submit = async () => {
        setLoading(true);
        try {
            const payload = {
                title: form.title,
                category: form.category,
                topic: form.topic || "",
                minParticipants: form.minParticipants,
                maxParticipants: form.maxParticipants,
                mode: form.mode,
                feeType: form.feeType,
                feeAmount: form.feeType === "PAID" ? form.feeAmount : null,
                feeInfo: form.feeType === "PAID" ? form.feeInfo : null,
                tags: form.tags,
                contentHtml: form.contentHtml,
            };

            // 1) 그룹 생성
            const { data } = await api.post("/api/groups", payload);
            const groupId = data.groupId as number;

            // 2) 채팅방 ID 조회 (간단 재시도)
            let roomId: number | null = null;
            for (let i = 0; i < 6; i++) {
                try {
                    const r = await api.get(`/api/groups/${groupId}/chat-room`);
                    roomId = r.data.roomId;
                    if (roomId) break;
                } catch {}
                await new Promise((res) => setTimeout(res, 250));
            }

            if (roomId) onCreated(groupId, roomId);
            else alert("채팅방 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
        } catch (e: any) {
            alert(e?.response?.data?.message ?? "생성 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 space-y-6">
            <Header step={step} />
            {step === 1 && (
                <Step1
                    form={form}
                    onChange={update}
                    onNext={() => {
                        const err = validateStep1();
                        if (err) return alert(err);
                        next();
                    }}
                />
            )}
            {step === 2 && (
                <Step2
                    form={form}
                    onChange={update}
                    onPrev={prev}
                    onNext={() => {
                        const err = validateStep2();
                        if (err) return alert(err);
                        next();
                    }}
                />
            )}
            {step === 3 && (
                <Step3
                    form={form}
                    onChange={update}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    addTag={addTag}
                    removeTag={removeTag}
                    onPrev={prev}
                    onSubmit={submit}
                    loading={loading}
                />
            )}
        </div>
    );
}

/* UI 공통 */
function Header({ step }: { step: 1 | 2 | 3 }) {
    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold">소셜링 만들기</h1>
            <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? "bg-gray-900" : "bg-gray-200"}`} />
                ))}
            </div>
            <p className="text-sm text-gray-500">
                {step === 1 && "기본 정보 (제목, 인원, 온라인/오프라인, 종류)"}
                {step === 2 && "참가비 설정"}
                {step === 3 && "태그와 상세 내용 작성"}
            </p>
        </div>
    );
}

function Step1({
                   form, onChange, onNext,
               }: {
    form: Form;
    onChange: <K extends keyof Form>(k: K, v: Form[K]) => void;
    onNext: () => void;
}) {
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소셜링 제목</label>
                <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="예) 주말 러닝 번개"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <NumberInput label="최소 인원" value={form.minParticipants} onChange={(v) => onChange("minParticipants", v)} min={1} />
                <NumberInput label="최대 인원" value={form.maxParticipants} onChange={(v) => onChange("maxParticipants", v)} min={form.minParticipants} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">진행 방식</label>
                <div className="flex items-center gap-3">
                    <Radio label="오프라인" checked={form.mode === "OFFLINE"} onChange={() => onChange("mode", "OFFLINE")} />
                    <Radio label="온라인" checked={form.mode === "ONLINE"} onChange={() => onChange("mode", "ONLINE")} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">소셜링 종류</label>
                    <select
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-700"
                        value={form.category}
                        onChange={(e) => onChange("category", e.target.value)}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">주제(선택)</label>
                    <input
                        className="w-full rounded-xl border border-gray-200 px-3 py-2"
                        value={form.topic}
                        onChange={(e) => onChange("topic", e.target.value)}
                        placeholder="예) 러닝, 카페탐방 등"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={onNext} className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800">다음</button>
            </div>
        </div>
    );
}

function Step2({
                   form, onChange, onPrev, onNext,
               }: {
    form: Form;
    onChange: <K extends keyof Form>(k: K, v: Form[K]) => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const isPaid = form.feeType === "PAID";
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">참가비</label>
                <div className="flex items-center gap-3">
                    <Radio label="무료" checked={form.feeType === "FREE"} onChange={() => { onChange("feeType", "FREE"); onChange("feeAmount", null); onChange("feeInfo", null); }} />
                    <Radio label="유료" checked={form.feeType === "PAID"} onChange={() => onChange("feeType", "PAID")} />
                </div>
            </div>

            {isPaid && (
                <>
                    <NumberInput label="참가비는 얼마인가요?" value={form.feeAmount ?? 0} onChange={(v) => onChange("feeAmount", v)} min={0} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">참가비의 용도를 알려주세요.</label>
                        <textarea
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                            rows={3}
                            value={form.feeInfo ?? ""}
                            onChange={(e) => onChange("feeInfo", e.target.value)}
                            placeholder="호스트 수고비, 간식비 등"
                        />
                    </div>
                </>
            )}

            <div className="flex justify-between">
                <button onClick={onPrev} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">이전</button>
                <button onClick={onNext} className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800">다음</button>
            </div>
        </div>
    );
}

function Step3({
                   form, onChange, tagInput, setTagInput, addTag, removeTag, onPrev, onSubmit, loading,
               }: {
    form: Form;
    onChange: <K extends keyof Form>(k: K, v: Form[K]) => void;
    tagInput: string; setTagInput: (v: string) => void;
    addTag: () => void; removeTag: (t: string) => void;
    onPrev: () => void; onSubmit: () => void; loading: boolean;
}) {
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                <div className="flex items-center gap-2">
                    <input
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyUp={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="엔터로 추가"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">추가</button>
                </div>
                {form.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {form.tags.map((t) => (
                            <span key={t} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-sm flex items-center gap-1">
                #{t}
                                <button onClick={() => removeTag(t)} className="ml-1 text-gray-500 hover:text-gray-800" aria-label={`${t} 삭제`}>×</button>
              </span>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
                <div className="prose w-full max-w-none">
                    <CKEditor
                        editor={ClassicEditor as unknown as any}
                        data={form.contentHtml}
                        onChange={(_, editor: any) => onChange("contentHtml", editor.getData())}
                    />
                </div>
            </div>

            <div className="flex justify-between">
                <button onClick={onPrev} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">이전</button>
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl text-white ${loading ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"}`}
                >
                    {loading ? "개설 중..." : "개설하기"}
                </button>
            </div>
        </div>
    );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="inline-flex items-center gap-2">
            <input type="radio" checked={checked} onChange={onChange} className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-500" />
            <span className="text-gray-700">{label}</span>
        </label>
    );
}
function NumberInput({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
        </div>
    );
}
