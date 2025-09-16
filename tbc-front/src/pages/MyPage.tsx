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

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, wRes] = await Promise.all([
        fetch(`/api/mypage/profile?userId=${userId}`),
        fetch(`/api/mypage/wallet?userId=${userId}`),
      ]);

      if (!pRes.ok) throw new Error(await pRes.text());
      if (!wRes.ok) throw new Error(await wRes.text());

      setProfile(await pRes.json());
      setWallet(await wRes.json());
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(`/profile/edit?userId=${userId}`)}>개인정보 수정</button>
            <button onClick={() => navigate(`/wallet?userId=${userId}`)}>내 카드 및 포인트</button>
            <button onClick={() => navigate(`/payments/history?userId=${userId}`)}>신청 및 결제 내역</button>
          </div>
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

      {/* 나의 멤버십 */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>나의 멤버십</h3>
        <div style={{ border: '1px solid #e9ecef', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: 16, background: '#f8f9fa', color: '#868e96' }}>멤버십이 없습니다.</div>
          <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>놀러가기</div>
            <div style={{ color: '#868e96' }}>잔여 티켓 0개</div>
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #e9ecef', textAlign: 'right' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#495057', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => navigate('/')}>
              모임 구경하기
            </button>
          </div>
        </div>
      </section>

      {/* 나의 모임 */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>나의 모임</h3>
        <MyMeetupsEmpty />
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

function MyMeetupsEmpty() {
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
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#495057', marginBottom: 16 }}>참여 중인 모임이 없어요.</div>
        <button style={{ padding: '12px 20px', background: '#212529', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700 }}
          onClick={() => (window.location.href = '/')}>정기모임 구경하기</button>
      </div>
    </div>
  );
}

