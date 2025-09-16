// src/components/PaymentButton.tsx
import { loadTossPayments } from "@tosspayments/payment-sdk";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  orderName: string;
  userId: number;
}

export default function PaymentButton({
  orderId,
  amount,
  orderName,
  userId,
}: PaymentButtonProps) {
  // 환경 변수 타입 오류 해결: import.meta.env를 any로 캐스팅
  const clientKey = (import.meta as any).env.VITE_TOSS_CLIENT_KEY as string;
  const successUrl = (import.meta as any).env.VITE_TOSS_SUCCESS_URL as string;
  const failUrl = (import.meta as any).env.VITE_TOSS_FAIL_URL as string;

  const requestPayment = async () => {
    try {
      // 1️⃣ 먼저 백엔드 INIT API 호출 → DB에 orderId 등록
      const initRes = await fetch("/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          orderId, // props에서 받은 orderId
          amount,
          orderName,
        }),
      });

      if (!initRes.ok) {
        const errText = await initRes.text();
        throw new Error(`INIT 실패: ${errText}`);
      }

      const initData = await initRes.json();
      console.log("✅ INIT 성공:", initData);

      // 2️⃣ TossPayments SDK 로드
      const tossPayments = await loadTossPayments(clientKey);

      // 3️⃣ Toss 결제창 호출 (반드시 백엔드에서 저장한 orderId 사용)
      await tossPayments.requestPayment("CARD", {
        amount,
        orderId: initData.orderId, // ✅ 서버에서 응답한 orderId
        orderName,
        customerName: `user-${userId}`,
        successUrl,
        failUrl,
      });
    } catch (err) {
      console.error("❌ 결제 요청 에러:", err);
      alert("결제 요청 실패: " + (err as Error).message);
    }
  };

  return <button onClick={requestPayment}>💳 결제하기</button>;
}