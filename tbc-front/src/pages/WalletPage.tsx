import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type WalletSummary = {
  walletId: number;
  balancePoints: number;
};

type WalletTxn = {
  id: number;
  type: string;
  amountPoints: number;
  description?: string;
  status?: string;
  createdAt: string;
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const initialUserId = Number(sp.get('userId') || 1);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [wRes, tRes] = await Promise.all([
        fetch(`/api/mypage/wallet?userId=${userId}`),
        fetch(`/api/mypage/wallet/txns?userId=${userId}&page=0&size=10`),
      ]);
      if (!wRes.ok) throw new Error(await wRes.text());
      if (!tRes.ok) throw new Error(await tRes.text());
      setSummary((await wRes.json()) as WalletSummary);
      const t = await tRes.json();
      setTxns(Array.isArray(t?.content) ? t.content : []);
    } catch (e: any) {
      setError(e.message);
      setSummary(null);
      setTxns([]);
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
        <button onClick={() => navigate(`/topup?userId=${userId}&amount=1000`)} style={{ marginLeft: 'auto' }}>충전하기</button>
      </div>

      {/* 요약 카드 */}
      <div style={{
        border: '1px solid #e9ecef',
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: 980,
        background: '#fff'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: 20 }}>포인트 확인</strong>
          <button onClick={() => navigate(`/topup?userId=${userId}&amount=1000`)} style={{ padding: '10px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 8 }}>충전하기</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', fontWeight: 700 }}>
          {summary ? `${summary.balancePoints.toLocaleString()}pt` : (loading ? '로딩중...' : '0pt')}
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

      {/* 거래 내역 */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>최근 거래 내역</h3>
        <div style={{ border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden', background: '#fff', maxWidth: 980 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef' }}>일시</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef' }}>유형</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef' }}>금액</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e9ecef' }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16, color: '#868e96' }}>내역이 없습니다.</td>
                </tr>
              )}
              {txns.map(tx => (
                <tr key={tx.id}>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>{tx.type}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>{tx.amountPoints.toLocaleString()}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f3f5' }}>{tx.description || tx.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {error && (
        <div style={{ marginTop: 12, color: '#d6336c' }}>오류: {error}</div>
      )}
    </div>
  );
}


