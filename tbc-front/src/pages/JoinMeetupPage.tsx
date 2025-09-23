import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinMeetupPage() {
  const [userId, setUserId] = useState<number>(1);
  const [meetupId, setMeetupId] = useState<number | null>(null);
  const [log, setLog] = useState<string>('');
  const navigate = useNavigate();
  const [requiredAmount, setRequiredAmount] = useState<number | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [openList, setOpenList] = useState<any[]>([]);

  // 항상 화면에 현재 잔액/필요 금액 표시: userId, meetupId 변경 시 조회
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [openRes, walletRes] = await Promise.all([
          fetch('/api/mypage/open-meetups'),
          fetch(`/api/mypage/wallet?userId=${userId}`)
        ]);

        if (mounted && openRes.ok) {
          const list = await openRes.json();
          const deduped = Array.isArray(list)
            ? Array.from(new Map(list.map((x: any) => [x.meetupId, x])).values())
            : [];
          setOpenList(deduped);
          const selectedId = meetupId ?? (deduped.length > 0 ? deduped[0].meetupId : null);
          if (meetupId == null && selectedId != null) setMeetupId(selectedId);
          const item = deduped.find((m: any) => m.meetupId === selectedId);
          setRequiredAmount(item?.pricePoints ?? null);
        } else if (mounted) {
          setRequiredAmount(null);
        }

        if (mounted && walletRes.ok) {
          const w = await walletRes.json();
          setCurrentBalance(typeof w?.balancePoints === 'number' ? w.balancePoints : null);
        } else if (mounted) {
          setCurrentBalance(null);
        }
      } catch {
        if (mounted) {
          setRequiredAmount(null);
          setCurrentBalance(null);
        }
      }
    })();
    return () => { mounted = false; };
  }, [userId, meetupId]);

  const appendLog = (line: string) => setLog((prev) => prev + line + '\n');

  const join = async () => {
    setLog('');
    try {
      if (meetupId == null) {
        appendLog('모임을 먼저 선택하세요.');
        return;
      }
      const res = await fetch(`/api/meetups/${meetupId}/join?userId=${userId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const text = await res.text();
        appendLog('join: ' + text);
        return;
      }

      // 에러 처리 분기
      if (res.status === 409) {
        const reason = (await res.text()).trim();
        if (reason === 'INSUFFICIENT_POINTS') {
          let required: number | undefined;
          let balance: number | undefined;
          try {
            const [openRes, walletRes] = await Promise.all([
              fetch('/api/mypage/open-meetups'),
              fetch(`/api/mypage/wallet?userId=${userId}`)
            ]);
            if (openRes.ok) {
              const list = await openRes.json();
              const item = Array.isArray(list)
                ? list.find((m: any) => m.meetupId === meetupId)
                : undefined;
              required = item?.pricePoints;
            }
            if (walletRes.ok) {
              const w = await walletRes.json();
              balance = w.balancePoints;
            }
          } catch {}

          setRequiredAmount(required ?? null);
          setCurrentBalance(balance ?? null);
          appendLog(`잔액 부족: 필요금액=${required ?? '?'} / 현재잔액=${balance ?? '?'}`);
          return;
        }
        if (reason === 'ALREADY_JOINED') {
          appendLog('이미 참가한 모임입니다.');
          return;
        }
        appendLog('join error: ' + reason);
        return;
      }

      const text = await res.text();
      appendLog(`join error(${res.status}): ` + text);
    } catch (e: any) {
      appendLog('join error: ' + e.message);
    }
  };

  const wallet = async () => {
    try {
      const res = await fetch(`/api/mypage/wallet?userId=${userId}`);
      if (!res.ok) {
        const t = await res.text();
        appendLog(`wallet error(${res.status}): ` + t);
        return;
      }
      const data = await res.json();
      appendLog('wallet: ' + JSON.stringify(data, null, 2));
    } catch (e: any) {
      appendLog('wallet error: ' + e.message);
    }
  };

  const txns = async () => {
    try {
      const res = await fetch(`/api/mypage/wallet/txns?userId=${userId}&page=0&size=10`);
      if (!res.ok) {
        const t = await res.text();
        appendLog(`txns error(${res.status}): ` + t);
        return;
      }
      const data = await res.json();
      appendLog('txns: ' + JSON.stringify(data, null, 2));
    } catch (e: any) {
      appendLog('txns error: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>모임 참가(포인트 차감) 테스트</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <label>userId
          <input type="number" value={userId} onChange={e => setUserId(Number(e.target.value))} />
        </label>
        <label>모임 선택
          <select value={meetupId ?? ''} onChange={e => setMeetupId(e.target.value ? Number(e.target.value) : null)}>
            {openList.length === 0 && <option value="">열린 모임 없음</option>}
            {openList.map((m: any) => (
              <option key={m.meetupId} value={m.meetupId}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: '1px solid #e2e3e5',
          background: '#f8f9fa',
          color: '#343a40',
          borderRadius: 4,
          maxWidth: 420,
          display: 'grid',
          gap: 6,
        }}
      >
        <div>필요 금액: {requiredAmount !== null ? requiredAmount.toLocaleString() : '-'}</div>
        <div>현재 잔액: {currentBalance !== null ? currentBalance.toLocaleString() : '-'}</div>
        <div>
          부족액: {requiredAmount !== null && currentBalance !== null
            ? Math.max(0, requiredAmount - currentBalance).toLocaleString()
            : '-'}
        </div>
        {requiredAmount !== null && currentBalance !== null && requiredAmount > currentBalance && (
          <button onClick={() => navigate(`/topup?userId=${userId}&amount=${requiredAmount - currentBalance}`)}>
            부족액만 충전하기
          </button>
        )}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={join}>참가하기</button>
        <button onClick={wallet}>지갑 조회</button>
        <button onClick={txns}>거래내역</button>
      </div>

      <pre style={{ marginTop: 16, background: '#111', color: '#0f0', padding: 12, whiteSpace: 'pre-wrap' }}>{log}</pre>
    </div>
  );
}