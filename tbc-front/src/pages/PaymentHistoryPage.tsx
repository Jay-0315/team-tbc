import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Item = {
  id: number;
  type: string;
  amountPoints: number;
  description?: string;
  createdAt: string;
};

type MeetupItem = {
  meetupId: number;
  title: string;
  startAt: string;
  endAt?: string;
  role: string;
  participantStatus: string;
  pricePoints: number;
};

export default function PaymentHistoryPage() {
  const [sp] = useSearchParams();
  const userId = Number(sp.get('userId') || 1);
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [meetups, setMeetups] = useState<MeetupItem[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const [txRes, mRes] = await Promise.all([
        fetch(`/api/mypage/wallet/txns?userId=${userId}&page=0&size=20`),
        fetch(`/api/mypage/meetups?userId=${userId}&page=0&size=10`),
      ]);
      if (!txRes.ok) throw new Error(await txRes.text());
      if (!mRes.ok) throw new Error(await mRes.text());
      const txData = await txRes.json();
      const mData = await mRes.json();
      setItems(Array.isArray(txData?.content) ? txData.content : []);
      setMeetups(Array.isArray(mData?.content) ? mData.content : []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>신청 및 결제 내역</h2>

      {/* 신청 완료 카드 리스트 */}
      <section style={{ marginTop: 12, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>신청 완료</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {meetups.length === 0 && (
            <div style={{ padding: 16, border: '1px solid #e9ecef', borderRadius: 8, color: '#868e96' }}>
              신청한 모임이 없습니다.
            </div>
          )}
          {meetups.map(m => (
            <div key={`${m.meetupId}-${m.title}`} style={{ border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 14, color: '#495057', marginBottom: 6 }}>정기 모임</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{m.title}</div>
                <div style={{ marginTop: 6, color: '#868e96' }}>
                  {new Date(m.startAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8, padding: 12, borderTop: '1px solid #e9ecef' }}>
                <button style={{ height: 44, border: '1px solid #ced4da', borderRadius: 6, background: '#fff' }}
                        onClick={() => alert('커뮤니티 입장은 추후 연결 예정')}>모임 커뮤니티 입장</button>
                <button style={{ height: 44, border: '1px solid #ced4da', borderRadius: 6, background: '#fff' }}
                        onClick={() => navigate(`/event/${m.meetupId}`)}>모임 상세 페이지</button>
                <button style={{ height: 44, border: '1px solid #ced4da', borderRadius: 6, background: '#fff' }}
                        onClick={() => alert('후기 작성은 추후 연결 예정')}>모임 후기 작성</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ border: '1px solid #e9ecef', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', fontWeight: 700, borderBottom: '1px solid #e9ecef' }}>결제 내역</div>
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


