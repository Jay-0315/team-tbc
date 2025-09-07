import { useState } from 'react'
import Header from './components/Header'
import LoginModal from './modals/LoginModal'
import SignupModal from './modals/SignupModal'
import FindAccountModal from './modals/FindAccountModal'

export default function App() {
    const [openLogin, setOpenLogin] = useState(false)
    const [openSignup, setOpenSignup] = useState(false)
    const [openFind, setOpenFind] = useState(false)

    return (
        <div className="page">
            <Header
                onOpenLogin={() => setOpenLogin(true)}
                onOpenSignup={() => setOpenSignup(true)}
            />
            {/* ... 나머지 동일 */}
            <LoginModal
                isOpen={openLogin}
                onClose={() => setOpenLogin(false)}
                onOpenFind={() => setOpenFind(true)}
            />
            <SignupModal isOpen={openSignup} onClose={() => setOpenSignup(false)} />
            <FindAccountModal isOpen={openFind} onClose={() => setOpenFind(false)} />
        </div>
    )
}
