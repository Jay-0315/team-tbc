import { loadTossPayments } from "@tosspayments/payment-sdk";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  orderName: string;
  userId: number;
}

export default function PaymentButton({ orderId, amount, orderName, userId }: PaymentButtonProps) {
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as string;
  const successUrl = import.meta.env.VITE_TOSS_SUCCESS_URL as string;
  const failUrl = import.meta.env.VITE_TOSS_FAIL_URL as string;

  const requestPayment = async () => {
    try {
      // 먼저 백엔드 INIT 호출해서 orderId를 등록
      const initRes = await fetch("http://localhost:8080/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          orderId,   // props에서 받은 orderId (혹은 uuid)
          amount,
          orderName,
        }),
      });

      if (!initRes.ok) {
        const errText = await initRes.text();
        throw new Error(`INIT 실패: ${errText}`);
      }

      const data = await initRes.json();
      console.log("✅ INIT 성공:", data);

      // Toss 결제창 열기
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment("CARD", {
        amount,
        orderId: data.orderId, // 반드시 백엔드에서 저장한 값 사용
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

  return (
    <button onClick={requestPayment}>
      💳 결제하기
    </button>
  );
}
