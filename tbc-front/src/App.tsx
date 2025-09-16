import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/topup">포인트 충전</Link>
        <Link to="/join">모임 참가</Link>
        <Link to="/wallet">포인트 확인</Link>
      </nav>
      <Outlet />
    </>
  );
}