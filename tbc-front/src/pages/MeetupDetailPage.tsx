import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MeetupDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/meetups/${id}`);
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
      } catch (e: any) {
        setError(e.message || '로드 실패');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>불러오는 중...</div>;
  if (error) return <div style={{ padding: 20, color: '#d6336c' }}>{error}</div>;
  if (!data) return <div style={{ padding: 20 }}>데이터가 없습니다.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{data.title}</h2>
      <div style={{ color: '#868e96' }}>{data.status}</div>
      <div style={{ marginTop: 8 }}>가격: {data.pricePoints?.toLocaleString?.() || data.pricePoints}pt</div>
      <div style={{ marginTop: 8 }}>시작: {data.startAt && new Date(data.startAt).toLocaleString()}</div>
      <div style={{ marginTop: 8 }}>종료: {data.endAt && new Date(data.endAt).toLocaleString()}</div>
      <div style={{ marginTop: 8 }}>위치: {data.location}</div>
      <p style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>{data.description}</p>
    </div>
  );
}


