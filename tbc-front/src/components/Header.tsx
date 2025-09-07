type HeaderProps = {
    onOpenLogin: () => void
    onOpenSignup: () => void
}

export default function Header({ onOpenLogin, onOpenSignup }: HeaderProps) {
    return (
        <header className="site-header">
            <div className="header-inner">
                <div className="brand">
                    <div className="brand-dot" />
                    <span>TBC</span>
                </div>
                <nav className="nav">
                    <button className="text-btn" onClick={onOpenLogin}>로그인</button>
                    <button className="primary-btn" onClick={onOpenSignup}>회원가입</button>
                </nav>
            </div>
        </header>
    )
}
