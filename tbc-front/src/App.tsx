import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">홈(이벤트)</Link>
        <Link to="/topup">포인트 충전</Link>
        <Link to="/join">모임 참가</Link>
        <Link to="/wallet">포인트 확인</Link>
        <Link to="/mypage">마이페이지</Link>
      </nav>
      <Outlet />
    </>
  );
}