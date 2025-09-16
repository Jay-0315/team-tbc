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

type WalletTxn = {
  id: number;
  type: string;
  status?: string;
  amountPoints: number;
  meetupId?: string;
  externalRef?: string;
  description?: string;
  createdAt: string;
};

export default function MyPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const initialUserId = Number(sp.get('userId') || 1);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, wRes, tRes] = await Promise.all([
        fetch(`/api/mypage/profile?userId=${userId}`),
        fetch(`/api/mypage/wallet?userId=${userId}`),
        fetch(`/api/mypage/wallet/txns?userId=${userId}&page=0&size=10`),
      ]);

      if (!pRes.ok) throw new Error(await pRes.text());
      if (!wRes.ok) throw new Error(await wRes.text());
      if (!tRes.ok) throw new Error(await tRes.text());

      setProfile(await pRes.json());
      setWallet(await wRes.json());
      const t = await tRes.json();
      setTxns(Array.isArray(t?.content) ? t.content : []);
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
        <div style={{ display: 'flex', alignItems: 'center', padding: 20, gap: 16, borderBottom: '1px solid #e9ecef' }}>
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt="profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e9ecef' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{profile?.username || '예시용'}</div>
            <div style={{ color: '#868e96' }}>{profile?.email || ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(`/profile/edit?userId=${userId}`)}>개인정보 수정</button>
            <button onClick={() => navigate(`/wallet?userId=${userId}`)}>내 카드 및 포인트</button>
            <button onClick={() => navigate(`/payments/history?userId=${userId}`)}>신청 및 결제 내역</button>
            <button onClick={() => navigate(`/settings?userId=${userId}`)}>설정</button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>userId
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(Number(e.target.value))}
                style={{ marginLeft: 6 }}
              />
            </label>
            <button onClick={loadAll} disabled={loading}>새로고침</button>
            <div style={{ marginLeft: 'auto', fontWeight: 700 }}>
              전체 보유 포인트: {wallet ? `${wallet.balancePoints.toLocaleString()}pt` : (loading ? '로딩중...' : '0pt')}
            </div>
          </div>

          <div style={{ border: '1px solid #f1f3f5', borderRadius: 6, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>거래ID</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>타입</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>금액</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>사유</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e9ecef' }}>일시</th>
                </tr>
              </thead>
              <tbody>
                {txns.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 12, color: '#868e96' }}>거래 내역이 없습니다.</td>
                  </tr>
                )}
                {txns.map((t) => (
                  <tr key={t.id}>
                    <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{t.id}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{t.type}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{t.amountPoints.toLocaleString()}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{t.description || t.status || '-'}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #f1f3f5' }}>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <div style={{ marginTop: 12, color: '#d6336c' }}>오류: {error}</div>}
        </div>
      </div>
    </div>
  );
}


