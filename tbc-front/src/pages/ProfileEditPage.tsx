import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Profile = {
  userId: number;
  email: string;
  username: string;
  name?: string;
  profileImage?: string;
  intro?: string;
};

type UpdateProfileRequest = {
  username?: string;
  name?: string;
  intro?: string;
  profileImage?: string;
};

export default function ProfileEditPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const initialUserId = Number(sp.get('userId') || 1);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/mypage/profile?userId=${userId}`);
      if (!res.ok) throw new Error(await res.text());
      const p = (await res.json()) as Profile;
      setForm({
        username: p.username,
        name: p.name || '',
        intro: p.intro || '',
        profileImage: p.profileImage || '',
      });
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
        body: JSON.stringify(form),
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
      <h2>개인정보 수정</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
        <label>userId
          <input type="number" value={userId} onChange={e => setUserId(Number(e.target.value))} />
        </label>
        <label>닉네임
          <input value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} />
        </label>
        <label>이름
          <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>프로필 이미지 URL
          <input value={form.profileImage || ''} onChange={e => setForm({ ...form, profileImage: e.target.value })} />
        </label>
        <label>이미지 업로드
          <input type="file" accept="image/*" onChange={e => e.target.files && upload(e.target.files[0])} />
        </label>
        <label>소개
          <textarea value={form.intro || ''} onChange={e => setForm({ ...form, intro: e.target.value })} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading}>저장</button>
          <button onClick={() => navigate(-1)}>취소</button>
        </div>
        {msg && <div>{msg}</div>}
      </div>
    </div>
  );
}


