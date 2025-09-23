import { useRef, useState } from 'react';
import PaymentButton from '../components/PaymentButton';

export default function TopupPage() {
  const [userId, setUserId] = useState<number>(1);
  const [amount, setAmount] = useState<number>(1000);
  const [orderName, setOrderName] = useState<string>('Point Topup');
  const [orderId, setOrderId] = useState<string>('');
  const [log, setLog] = useState<string>('');
  const fallbackOrderIdRef = useRef<string>(`ORDER-${Date.now()}`);

  const appendLog = (line: string) => setLog((prev) => prev + line + '\n');

  const createPayment = async () => {
    setLog('');
    const oid = orderId || `ORDER-${Date.now()}`;
    setOrderId(oid);
    try {
      const res = await fetch('http://localhost:8080/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orderId: oid, amount, orderName }),
      });
      const data = await res.json();
      appendLog('create: ' + JSON.stringify(data, null, 2));
    } catch (e: any) {
      appendLog('create error: ' + e.message);
    }
  };

  const confirmPayment = async () => {
    try {
      const paymentKey = prompt('paymentKey 입력 (테스트용):') || '';
      if (!paymentKey) return;
      const res = await fetch('http://localhost:8080/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      const data = await res.json();
      appendLog('confirm: ' + JSON.stringify(data, null, 2));
    } catch (e: any) {
      appendLog('confirm error: ' + e.message);
    }
  };

  const getWallet = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/mypage/wallet?userId=${userId}`);
      const data = await res.json();
      appendLog('wallet: ' + JSON.stringify(data, null, 2));
    } catch (e: any) {
      appendLog('wallet error: ' + e.message);
    }
  };

  const devCredit = async () => {
    try {
      const amt = Number(prompt('충전할 금액?') || amount);
      const res = await fetch(`/dev/wallet/credit?userId=${userId}&amount=${amt}`, { method: 'POST' });
      const data = await res.json();
      appendLog('dev credit: ' + JSON.stringify(data, null, 2));
    } catch (e: any) {
      appendLog('dev credit error: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>포인트 충전 테스트</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <label>userId
          <input type="number" value={userId} onChange={e => setUserId(Number(e.target.value))} />
        </label>
        <label>amount
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        </label>
        <label>orderName
          <input value={orderName} onChange={e => setOrderName(e.target.value)} />
        </label>
        <label>orderId(옵션)
          <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="미입력시 자동생성" />
        </label>
      </div>

      {/* Toss 결제 SDK 사용 버튼 (팀원 구현 연계) */}
      <div style={{ marginTop: 12 }}>
        <PaymentButton
          userId={userId}
          orderId={orderId || fallbackOrderIdRef.current}
          amount={amount}
          orderName={orderName}
        />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={createPayment}>주문 생성</button>
        <button onClick={confirmPayment}>결제 확인</button>
        <button onClick={getWallet}>지갑 조회</button>
        <button onClick={devCredit}>개발용 충전</button>
      </div>

      <pre style={{ marginTop: 16, background: '#111', color: '#0f0', padding: 12, whiteSpace: 'pre-wrap' }}>{log}</pre>
    </div>
  );
}