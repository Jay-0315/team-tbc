// src/modals/FindAccountModal.tsx
import { useState } from 'react'
import Modal from '../components/Modal'
import { api } from '../api/client'

type FindAccountModalProps = {
    isOpen: boolean
    onClose: () => void
}

export default function FindAccountModal({ isOpen, onClose }: FindAccountModalProps) {
    // UI 탭 상태
    const [activeTab, setActiveTab] = useState<'findId' | 'resetPassword'>('findId')

    // 공통 에러 메시지
    const [errorMessage, setErrorMessage] = useState<string>('')

    // --- 아이디( username ) 찾기 ---
    const [emailOrPhone, setEmailOrPhone] = useState<string>('')
    const [foundUsername, setFoundUsername] = useState<string>('')

    // --- 비밀번호 초기화 ---
    const [usernameForReset, setUsernameForReset] = useState<string>('')
    const [temporaryPassword, setTemporaryPassword] = useState<string>('')

    // 로딩 상태(각 기능별)
    const [loadingFindId, setLoadingFindId] = useState<boolean>(false)
    const [loadingReset, setLoadingReset] = useState<boolean>(false)

    // 아이디 찾기
    const findId = async (): Promise<void> => {
        setErrorMessage('')
        setFoundUsername('')
        setLoadingFindId(true)
        try {
            const username: string = await api.findId(emailOrPhone)
            setFoundUsername(username || '(조회 결과 없음)')
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message || '아이디 찾기 실패')
            } else {
                setErrorMessage('아이디 찾기 실패 (알 수 없는 오류)')
            }
        } finally {
            setLoadingFindId(false)
        }
    }

    // 비밀번호 초기화
    const resetPassword = async (): Promise<void> => {
        setErrorMessage('')
        setTemporaryPassword('')
        setLoadingReset(true)
        try {
            const temp: string = await api.resetPassword(usernameForReset)
            setTemporaryPassword(temp)
            alert(`임시 비밀번호: ${temp}`)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message || '비밀번호 초기화 실패')
            } else {
                setErrorMessage('비밀번호 초기화 실패 (알 수 없는 오류)')
            }
        } finally {
            setLoadingReset(false)
        }
    }

    // 모달 닫힐 때 상태 초기화
    const handleClose = () => {
        setErrorMessage('')
        setFoundUsername('')
        setTemporaryPassword('')
        setEmailOrPhone('')
        setUsernameForReset('')
        setActiveTab('findId')
        onClose()
    }

    return (
        <Modal title="계정 찾기" isOpen={isOpen} onClose={handleClose} width={520}>
            {/* 탭 */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'findId' ? 'active' : ''}`}
                    onClick={() => setActiveTab('findId')}
                >
                    아이디 찾기
                </button>
                <button
                    className={`tab ${activeTab === 'resetPassword' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resetPassword')}
                >
                    비밀번호 초기화
                </button>
            </div>

            {/* 에러 메시지 */}
            {errorMessage && <p className="error-msg">{errorMessage}</p>}

            {/* 아이디 찾기 섹션 */}
            {activeTab === 'findId' && (
                <section className="section">
                    <label className="field">
                        <span className="label">이메일 또는 전화번호</span>
                        <input
                            type="text"
                            placeholder="예) test@a.com / 01012345678"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                        />
                    </label>

                    <button className="primary-btn block" onClick={findId} disabled={loadingFindId}>
                        {loadingFindId ? '조회 중…' : '아이디 찾기'}
                    </button>

                    {foundUsername && (
                        <div className="result-box">
                            <span className="result-label">조회 결과</span>
                            <strong className="result-value">{foundUsername}</strong>
                        </div>
                    )}
                </section>
            )}

            {/* 비밀번호 초기화 섹션 */}
            {activeTab === 'resetPassword' && (
                <section className="section">
                    <label className="field">
                        <span className="label">아이디(Username)</span>
                        <input
                            type="text"
                            placeholder="가입 시 사용한 아이디"
                            value={usernameForReset}
                            onChange={(e) => setUsernameForReset(e.target.value)}
                        />
                    </label>

                    <button className="primary-btn block" onClick={resetPassword} disabled={loadingReset}>
                        {loadingReset ? '처리 중…' : '임시 비밀번호 발급'}
                    </button>

                    {temporaryPassword && (
                        <div className="result-box">
                            <span className="result-label">임시 비밀번호</span>
                            <strong className="result-value">{temporaryPassword}</strong>
                            <p className="result-help">로그인 후 마이페이지에서 비밀번호를 변경하세요.</p>
                        </div>
                    )}
                </section>
            )}

            {/* 모달 하단 */}
            <div className="modal-footer">
                <button className="ghost-btn" onClick={handleClose}>
                    닫기
                </button>
            </div>

            {/* 간단 스타일 (필요시 공용 CSS로 이동) */}
            <style>{`
        .tabs { display:flex; gap:8px; margin-bottom:16px; }
        .tab { flex:1; padding:10px 12px; border:1px solid var(--line,#ddd); border-radius:8px; background:#f7f7f8; }
        .tab.active { background:#fff; border-color:#444; font-weight:600; }
        .error-msg { color:#d00; margin:8px 0 12px; }
        .section { display:flex; flex-direction:column; gap:12px; }
        .field { display:flex; flex-direction:column; gap:6px; }
        .label { font-size:12px; color:#666; }
        .block { width:100%; }
        .result-box { margin-top:8px; padding:10px; border:1px dashed #ccc; border-radius:8px; background:#fafafa; }
        .result-label { font-size:12px; color:#666; margin-right:6px; }
        .result-value { font-size:14px; }
        .result-help { margin-top:6px; font-size:12px; color:#777; }
        .modal-footer { display:flex; justify-content:flex-end; margin-top:12px; }
      `}</style>
        </Modal>
    )
}
