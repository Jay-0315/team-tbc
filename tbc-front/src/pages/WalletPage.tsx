import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type WalletSummary = {
  walletId: number;
  balancePoints: number;
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const initialUserId = Number(sp.get('userId') || 1);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/mypage/wallet?userId=${userId}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as WalletSummary;
      setSummary(data);
    } catch (e: any) {
      setError(e.message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>포인트 확인 및 충전</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label>userId
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
            style={{ marginLeft: 6 }}
          />
        </label>
        <button onClick={load} disabled={loading}>조회</button>
        <button onClick={() => navigate(`/topup?userId=${userId}&amount=${Math.max(1000, 0)}`)} style={{ marginLeft: 'auto' }}>충전하기</button>
      </div>

      <div style={{
        border: '1px solid #e9ecef',
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: 900,
        background: '#fff'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between' }}>
          <strong>전체 보유 포인트</strong>
          <strong>{summary ? `${summary.balancePoints.toLocaleString()}pt` : (loading ? '로딩중...' : '0pt')}</strong>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef', width: '25%' }}>항목</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef', width: '25%' }}>지급포인트</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef', width: '25%' }}>잔여포인트</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef', width: '25%' }}>사용조건</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>일반 포인트</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>{summary ? summary.balancePoints.toLocaleString() : '-'}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>{summary ? summary.balancePoints.toLocaleString() : '-'}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>모임 참가 등 사용 가능</td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: '#d6336c' }}>오류: {error}</div>
      )}
    </div>
  );
}


