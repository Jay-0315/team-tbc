import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Profile = {
  userId: number;
  email: string;
  username: string;
  name?: string;
  profileImage?: string;
  intro?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'F' | 'M';
};

type UpdateProfileRequest = {
  username?: string;
  name?: string;
  intro?: string;
  profileImage?: string;
  phone?: string;
  birthDate?: string; // yyyy-MM-dd
  gender?: 'F' | 'M';
};

export default function ProfileEditPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const initialUserId = Number(sp.get('userId') || 1);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [phone, setPhone] = useState<string>('');
  const [birth, setBirth] = useState<string>('');
  const [gender, setGender] = useState<'F' | 'M' | ''>('');
  const [agreeAll, setAgreeAll] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [agreePrivacy, setAgreePrivacy] = useState<boolean>(false);
  const [agreeMarketing, setAgreeMarketing] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/mypage/profile?userId=${userId}`);
      if (!res.ok) throw new Error(await res.text());
      const p = (await res.json()) as Profile;
      setProfile(p);
      setForm({
        username: p.username,
        name: p.name || '',
        intro: p.intro || '',
        profileImage: p.profileImage || '',
        phone: p.phone || '',
        birthDate: p.birthDate || '',
        gender: p.gender || undefined,
      });
      setPhone(p.phone || '');
      setBirth(p.birthDate || '');
      setGender((p.gender as any) || '');
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/mypage/profile?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone,
          birthDate: birth,
          gender: gender || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg('저장되었습니다');
      navigate(`/mypage?userId=${userId}`);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const upload = async (f: File) => {
    const fd = new FormData();
    fd.append('file', f);
    const res = await fetch('/api/mypage/profile/image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error(await res.text());
    const url = (await res.text()).replaceAll('"', '');
    const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
    setForm({ ...form, profileImage: fullUrl });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>개인 정보</h2>

      {/* 안내 배너 */}
      <div style={{
        padding: 12,
        marginBottom: 16,
        border: '1px solid #e9ecef',
        background: '#f8f9fa',
        color: '#868e96',
        borderRadius: 8,
        maxWidth: 720,
      }}>
        하단 정보는 본인 확인 및 마케팅 수신 서비스에 사용되며, 절대로 프로필에 공개되지 않습니다.
      </div>

      <div style={{ display: 'grid', gap: 18, maxWidth: 720 }}>
        {/* 이름 */}
        <div>
          <div style={{ marginBottom: 8 }}>이름</div>
          <input
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #dee2e6', borderRadius: 8 }}
            value={form.name || ''}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 휴대전화 */}
        <div>
          <div style={{ marginBottom: 8 }}>휴대전화 번호</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ flex: 1, padding: '12px 14px', border: '1px solid #dee2e6', borderRadius: 8 }}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="01012345678"
            />
            <span style={{ color: '#20c997', fontSize: 12 }}>✓ 인증 완료</span>
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <div style={{ marginBottom: 8 }}>이메일</div>
          <input
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #dee2e6', borderRadius: 8, background: '#f8f9fa' }}
            value={profile?.email || ''}
            readOnly
          />
        </div>

        {/* 생일 */}
        <div>
          <div style={{ marginBottom: 8 }}>생일</div>
          <input
            type="date"
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #dee2e6', borderRadius: 8 }}
            value={birth}
            onChange={e => setBirth(e.target.value)}
          />
        </div>

        {/* 성별 */}
        <div>
          <div style={{ marginBottom: 8 }}>성별</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" checked={gender === 'F'} onChange={() => setGender('F')} /> 여성
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" checked={gender === 'M'} onChange={() => setGender('M')} /> 남성
            </label>
          </div>
        </div>

        {/* 동의 영역 */}
        <div>
          <div style={{ marginBottom: 8 }}>개인 정보 처리 및 마케팅 수신 동의</div>
          <div style={{ border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e9ecef' }}>
              <input type="checkbox" checked={agreeAll} onChange={(e) => {
                const v = e.target.checked;
                setAgreeAll(v);
                setAgreeTerms(v);
                setAgreePrivacy(v);
                setAgreeMarketing(v);
              }} /> 전체 동의(선택항목 포함)
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} /> 이용약관
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} /> 개인정보 수집 및 이용에 대한 안내
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={agreeMarketing} onChange={e => setAgreeMarketing(e.target.checked)} /> 마케팅 수신(선택)
              </label>
              <div style={{ color: '#868e96', fontSize: 12 }}>동의 시 할인 및 공지 관련 문자 및 이메일로 전송드립니다.</div>
            </div>
          </div>
        </div>

        {/* 숨김: 개발 편의용 userId/닉네임 */}
        <details>
          <summary style={{ cursor: 'pointer', color: '#868e96' }}>고급 설정(개발용)</summary>
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            <label>userId
              <input type="number" value={userId} onChange={e => setUserId(Number(e.target.value))} />
            </label>
            <label>닉네임
              <input value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} />
            </label>
          </div>
        </details>

        {/* 저장 버튼 */}
        <div>
          <button
            onClick={save}
            disabled={loading}
            style={{ width: '100%', padding: '14px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 700 }}
          >
            정보 수정
          </button>
          {msg && <div style={{ marginTop: 8, color: '#20c997' }}>{msg}</div>}
        </div>

        {/* 회원 탈퇴 */}
        <div style={{ textAlign: 'center', color: '#868e96' }}>
          <button style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => alert('회원 탈퇴는 추후 연결 예정입니다.')}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
}


