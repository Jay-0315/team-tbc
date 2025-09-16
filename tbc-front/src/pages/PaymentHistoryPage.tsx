import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type Item = {
  id: number;
  type: string;
  amountPoints: number;
  description?: string;
  createdAt: string;
};

export default function PaymentHistoryPage() {
  const [sp] = useSearchParams();
  const userId = Number(sp.get('userId') || 1);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const res = await fetch(`/api/mypage/wallet/txns?userId=${userId}&page=0&size=20`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>신청 및 결제 내역</h2>
      <div style={{ border: '1px solid #e9ecef', borderRadius: 6, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>ID</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>타입</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>금액</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>설명</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>일시</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 12, color: '#868e96' }}>내역이 없습니다.</td></tr>
            )}
            {items.map(x => (
              <tr key={x.id}>
                <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{x.id}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{x.type}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{x.amountPoints.toLocaleString()}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{x.description || '-'}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{new Date(x.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div style={{ marginTop: 12, color: '#d6336c' }}>오류: {error}</div>}
    </div>
  );
}


