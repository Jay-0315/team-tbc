import { useState } from "react";

export default function MonitoringDashboard() {
    const [consistencyReport, setConsistencyReport] = useState("");
    const [retryReport, setRetryReport] = useState("");
    const [loading, setLoading] = useState(false);

    const checkConsistency = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/monitoring/wallets/consistency");
            const text = await res.text();
            setConsistencyReport(text);
        } finally {
            setLoading(false);
        }
    };

    const retryWebhooks = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/monitoring/webhooks/retry", {
                method: "POST"
            });
            const text = await res.text();
            setRetryReport(text);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">운영 모니터링 대시보드 (Phase 6)</h1>

            <div className="space-y-2 p-4 bg-white rounded-xl shadow">
                <h2 className="font-semibold">💰 Wallet Consistency</h2>
                <button
                    onClick={checkConsistency}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    지갑 정합성 검사 실행
                </button>
                {loading && <p className="text-gray-500">⏳ 실행 중...</p>}
                {consistencyReport && (
                    <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
            {consistencyReport}
          </pre>
                )}
            </div>

            <div className="space-y-2 p-4 bg-white rounded-xl shadow">
                <h2 className="font-semibold">🔁 Webhook 재처리</h2>
                <button
                    onClick={retryWebhooks}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    실패 웹훅 재처리 실행
                </button>
                {loading && <p className="text-gray-500">⏳ 실행 중...</p>}
                {retryReport && (
                    <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
            {retryReport}
          </pre>
                )}
            </div>

            <p className="text-gray-600 text-sm">
                👉 Phase 6의 목적은 <strong>데이터 정합성 보장</strong>과 <strong>운영 장애 복구</strong>입니다. <br />
                - Wallet Consistency: DB에 저장된 잔액과 Ledger 기록이 일치하는지 검사<br />
                - Webhook Retry: 실패했던 PG 웹훅 이벤트를 재처리해서 데이터 손실/누락 방지
            </p>
        </div>
    );
}