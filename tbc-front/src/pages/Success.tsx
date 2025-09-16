import { useEffect, useState } from "react";

export default function Success() {
    const query = new URLSearchParams(window.location.search);
    const paymentKey = query.get("paymentKey");
    const orderId = query.get("orderId");
    const amount = query.get("amount");

    const [message, setMessage] = useState("⏳ 결제 확인 중...");

    useEffect(() => {
        if (!paymentKey || !orderId || !amount) {
            setMessage("❌ 잘못된 요청입니다.");
            return;
        }

        // Backend API 호출
        fetch("http://localhost:8080/payments/confirm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                paymentKey,
                orderId,
                amount: Number(amount),
            }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || "결제 확인 실패");
                }
                return res.json();
            })
            .then((data) => {
                console.log("✅ Confirm Response:", data);
                setMessage(
                    `✅ 결제 성공! 주문번호: ${data.orderId}, 잔액: ${data.balanceAfter}`
                );
            })
            .catch((err) => {
                console.error(err);
                setMessage(`❌ 결제 확인 실패: ${err.message}`);
            });
    }, [paymentKey, orderId, amount]);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>결제 완료 페이지</h2>
            <p>{message}</p>
            <p>paymentKey: {paymentKey}</p>
            <p>orderId: {orderId}</p>
            <p>amount: {amount}</p>
        </div>
    );
}