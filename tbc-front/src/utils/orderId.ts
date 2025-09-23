// src/utils/orderId.ts
export function generateOrderId(userId: number): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    // 랜덤 4자리 → 동시 결제 시 충돌 방지
    const rand = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");

    return `ORD-${yyyy}${MM}${dd}${HH}${mm}${ss}-${userId}-${rand}`;
}
  