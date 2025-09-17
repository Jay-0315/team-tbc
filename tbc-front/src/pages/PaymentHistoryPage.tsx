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

      const dedupeBy = <T extends Record<string, any>>(arr: T[], key: keyof T) => {
        if (!Array.isArray(arr)) return [] as T[];
        const map = new Map<any, T>();
        for (const x of arr) {
          const k = x?.[key];
          if (k != null && !map.has(k)) map.set(k, x);
        }
        return Array.from(map.values());
      };

      const txList = Array.isArray(txData?.content) ? dedupeBy(txData.content, 'id') : [];
      const meetupList = Array.isArray(mData?.content) ? dedupeBy(mData.content, 'meetupId') : [];

      setItems(txList);
      setMeetups(meetupList);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>신청 및 결제 내역</h2>

      {/* 신청 완료 카드 리스트 (결제내역 테이블 제거, 카드 UX 강화) */}
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
              <div style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 8, background: '#f1f3f5' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#868e96' }}>정기 모임</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{m.title}</div>
                  <div style={{ marginTop: 6, color: '#868e96' }}>{new Date(m.startAt).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8, padding: 12, borderTop: '1px solid #e9ecef' }}>
                <button style={{ height: 44, border: '1px solid #ced4da', borderRadius: 6, background: '#fff' }}
                        onClick={() => alert('커뮤니티 입장은 추후 연결 예정')}>모임 커뮤니티 입장</button>
                <button style={{ height: 44, border: '1px solid #ced4da', borderRadius: 6, background: '#fff' }}
                        onClick={() => navigate(`/meetup/${m.meetupId}`)}>모임 상세 페이지</button>
                <button style={{ height: 44, border: '1px solid #ced4da', borderRadius: 6, background: '#fff' }}
                        onClick={() => alert('후기 작성은 추후 연결 예정')}>모임 후기 작성</button>
              </div>
              <div style={{ padding: 12, borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', color: '#495057' }}>
                <div>카드 간편 결제</div>
                <div style={{ fontWeight: 700 }}>{m.pricePoints?.toLocaleString?.() || m.pricePoints}원</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 표형 결제내역 섹션 제거. 카드 하단에 금액 표시로 대체 */}
      {error && <div style={{ marginTop: 12, color: '#d6336c' }}>오류: {error}</div>}
    </div>
  );
}


