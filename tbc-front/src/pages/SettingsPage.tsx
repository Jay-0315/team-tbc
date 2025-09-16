import { useSearchParams } from 'react-router-dom';

export default function SettingsPage() {
  const [sp] = useSearchParams();
  const userId = sp.get('userId') || '1';
  return (
    <div style={{ padding: 20 }}>
      <h2>설정</h2>
      <div style={{ marginTop: 12 }}>
        <div>사용자 ID: {userId}</div>
        <div style={{ marginTop: 8, color: '#868e96' }}>
          (샘플) 알림 설정, 보안, 연결 계정 등 섹션을 여기에 구성하세요.
        </div>
      </div>
    </div>
  );
}


