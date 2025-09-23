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
  // 동의/고급설정 제거
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
      {/* 안내 배너 제거 */}

      <div style={{ display: 'grid', gap: 18, maxWidth: 720 }}>
        {/* 프로필 사진 */}
        <div>
          <div style={{ marginBottom: 8 }}>프로필 사진</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt="profile"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '1px solid #dee2e6' }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e9ecef' }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
              {form.profileImage && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, profileImage: '' })}
                  style={{ padding: '8px 10px', background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: 6, cursor: 'pointer' }}
                >
                  이미지 제거
                </button>
              )}
            </div>
          </div>
        </div>

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

        {/* 동의 영역 제거 */}

        {/* 고급 설정(개발용) 제거 */}

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


