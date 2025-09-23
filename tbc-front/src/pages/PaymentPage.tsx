// src/pages/PaymentPage.tsx
import { useState } from "react";
import PaymentButton from "../components/PaymentButton";
import { generateOrderId } from "../utils/orderId";

export default function PaymentPage() {
    const userId = 3; // 로그인한 유저 ID (예시)
    const [orderId, setOrderId] = useState(() => generateOrderId(userId));
    const amount = 15000;
    const orderName = "포인트 충전";

    const regenerateOrderId = () => {
        setOrderId(generateOrderId(userId));
    };

    return (
        <div>
            <h2>결제 테스트</h2>
            <p>현재 orderId: {orderId}</p>
            <PaymentButton
                orderId={orderId}
                amount={amount}
                orderName={orderName}
                userId={userId}
            />
            <button onClick={regenerateOrderId}>🔄 새 orderId 생성</button>
        </div>
    );
}