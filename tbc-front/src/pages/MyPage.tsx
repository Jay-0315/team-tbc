import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

type Profile = {
  userId: number;
  email: string;
  username: string;
  name?: string;
  profileImage?: string;
  intro?: string;
};

type WalletSummary = {
  walletId: number;
  balancePoints: number;
};

export default function MyPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const initialUserId = Number(sp.get('userId') || 1);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeMeetups, setActiveMeetups] = useState<any[]>([]);
  const [endedMeetups, setEndedMeetups] = useState<any[]>([]);
  const [hostedMeetups, setHostedMeetups] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, wRes, aRes, eRes, hRes] = await Promise.all([
        fetch(`/api/mypage/profile?userId=${userId}`),
        fetch(`/api/mypage/wallet?userId=${userId}`),
        fetch(`/api/mypage/my-meetups/active?userId=${userId}&page=0&size=6`),
        fetch(`/api/mypage/my-meetups/ended?userId=${userId}&page=0&size=6`),
        fetch(`/api/mypage/hosted-meetups?userId=${userId}&page=0&size=6`),
      ]);

      if (!pRes.ok) throw new Error(await pRes.text());
      if (!wRes.ok) throw new Error(await wRes.text());

      setProfile(await pRes.json());
      setWallet(await wRes.json());
      const a = await aRes.json();
      const e = await eRes.json();
      const h = await hRes.json();

      const dedupeByMeetupId = (arr: any[]) => {
        if (!Array.isArray(arr)) return [];
        const m = new Map<number, any>();
        for (const x of arr) {
          if (x && x.meetupId != null && !m.has(x.meetupId)) m.set(x.meetupId, x);
        }
        return Array.from(m.values());
      };

      setActiveMeetups(dedupeByMeetupId(a?.content));
      setEndedMeetups(dedupeByMeetupId(e?.content));
      setHostedMeetups(dedupeByMeetupId(h?.content));
    } catch (e: any) {
      setError(e.message || '로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>나의 프로필</h2>

      <div style={{
        border: '1px solid #e9ecef',
        borderRadius: 8,
        background: '#fff',
        overflow: 'hidden',
      }}>
        {/* 프로필 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: 20, gap: 16, borderBottom: '1px solid #e9ecef' }}>
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt="profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e9ecef' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{profile?.username || '사용자'}</div>
              <span style={{ fontSize: 12, color: '#adb5bd' }}>웰컴 숏터뷰 미완료</span>
            </div>
            <div style={{ color: '#868e96' }}>{profile?.email || ''}</div>
          </div>
          {/* 헤더 우측 버튼 제거 (아래 빠른 이동 메뉴 사용) */}
        </div>

        {/* 10분 웰컴 숏터뷰 CTA */}
        <div style={{ padding: 40, textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
          <div style={{ color: '#495057' }}>
            지금 <b>10분 웰컴 숏터뷰</b>에 참여하고
            <br />
            하나뿐인 나의 커뮤니티 프로필을 받아 보세요!
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              style={{ padding: '12px 20px', background: '#212529', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700 }}
              onClick={() => alert('웰컴 숏터뷰 예약 화면으로 이동 (추후 연결)')}
            >
              10분 웰컴 숏터뷰 일정 잡기
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <button style={{ background: 'transparent', border: 'none', color: '#868e96', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => alert('웰컴 숏터뷰 안내 모달 (추후 구현)')}>
              10분 웰컴 숏터뷰란?
            </button>
          </div>
        </div>

        {/* 빠른 이동 메뉴 */}
        <div style={{ padding: 12 }}>
          <div style={{ display: 'grid', gap: 0 }}>
            <MenuItem label="개인 정보 수정" onClick={() => navigate(`/profile/edit?userId=${userId}`)} />
            <MenuItem label="내 카드 및 포인트" onClick={() => navigate(`/wallet?userId=${userId}`)} />
            <MenuItem label="신청 및 결제 내역" onClick={() => navigate(`/payments/history?userId=${userId}`)} />
          </div>
        </div>
      </div>


      {/* 나의 모임 */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>나의 모임</h3>
        <MyMeetupsTabs
          activeItems={activeMeetups}
          endedItems={endedMeetups}
          hostedItems={hostedMeetups}
        />
      </section>

      {error && <div style={{ marginTop: 12, color: '#d6336c' }}>오류: {error}</div>}
    </div>
  );
}


function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '14px 12px',
        border: 'none',
        background: 'transparent',
        borderTop: '1px solid #f1f3f5',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function MyMeetupsTabs({ activeItems, endedItems, hostedItems }: { activeItems: any[]; endedItems: any[]; hostedItems: any[] }) {
  const tabs = ['참여 중인 모임', '참여 종료된 모임', '내가 개설한 모임'];
  const [active, setActive] = useState<number>(0);
  return (
    <div style={{ border: '1px solid #e9ecef', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e9ecef' }}>
        {tabs.map((t, idx) => (
          <button
            key={t}
            onClick={() => setActive(idx)}
            style={{
              flex: 1,
              padding: 12,
              border: 'none',
              background: active === idx ? '#fff' : '#f8f9fa',
              fontWeight: active === idx ? 700 : 400,
              cursor: 'pointer',
              borderBottom: active === idx ? '2px solid #212529' : '2px solid transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <MeetupList
        title={tabs[active]}
        items={active === 0 ? activeItems : active === 1 ? endedItems : hostedItems}
      />
    </div>
  );
}

function MeetupList({ title, items }: { title: string; items: any[] }) {
  const navigate = useNavigate();
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#495057', marginBottom: 16 }}>{title}이(가) 없어요.</div>
        <button style={{ padding: '12px 20px', background: '#212529', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700 }}
          onClick={() => (window.location.href = '/')}>모임 구경하기</button>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, padding: 12 }}>
      {items.map((m: any) => (
        <div key={m.meetupId} style={{ border: '1px solid #e9ecef', borderRadius: 6, padding: 12, cursor: 'pointer' }} onClick={() => navigate(`/meetup/${m.meetupId}`)}>
          <div style={{ fontWeight: 700 }}>{m.title}</div>
          <div style={{ color: '#868e96', fontSize: 12 }}>{m.meetupStatus}</div>
          <div style={{ marginTop: 6 }}>가격: {m.pricePoints?.toLocaleString?.() || m.pricePoints}pt</div>
          <div style={{ marginTop: 6 }}>참여자: {m.participantCount}</div>
          {m.joinedAt && <div style={{ marginTop: 6, color: '#868e96' }}>참여: {new Date(m.joinedAt).toLocaleString()}</div>}
        </div>
      ))}
    </div>
  );
}

