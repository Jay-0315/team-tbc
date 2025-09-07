import React, { useState } from 'react'
import Modal from '../components/Modal'
import { api } from '../api/client'

type SignupModalProps = {
    isOpen: boolean
    onClose: () => void
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [emailOk, setEmailOk] = useState<boolean | null>(null)
    const [phoneOk, setPhoneOk] = useState<boolean | null>(null)
    const [usernameOk, setUsernameOk] = useState<boolean | null>(null)

    const checkEmail = async () => setEmailOk(await api.checkEmail(email))
    const checkPhone = async () => setPhoneOk(await api.checkPhone(phone))
    const checkUsername = async () =>
        setUsernameOk(await api.checkUsername(username))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setErrorMessage('')
        try {
            await api.signup({ email, phone, username, password, nickname })
            alert('회원가입 완료!')
            onClose()
        } catch (err: any) {
            setErrorMessage(err.message || '회원가입 실패')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal title="회원가입" isOpen={isOpen} onClose={onClose} width={520}>
            <form className="form" onSubmit={handleSubmit}>
                <div className="grid-2">
                    <label>
                        이메일
                        <div className="with-btn">
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@company.com"
                                type="email"
                                required
                            />
                            <button type="button" className="mini-btn" onClick={checkEmail}>
                                중복확인
                            </button>
                        </div>
                        {emailOk !== null && (
                            <p className={emailOk ? 'ok' : 'no'}>{emailOk ? '사용 가능' : '이미 사용중'}</p>
                        )}
                    </label>

                    <label>
                        전화번호
                        <div className="with-btn">
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01012345678"
                                required
                            />
                            <button type="button" className="mini-btn" onClick={checkPhone}>
                                중복확인
                            </button>
                        </div>
                        {phoneOk !== null && (
                            <p className={phoneOk ? 'ok' : 'no'}>{phoneOk ? '사용 가능' : '이미 사용중'}</p>
                        )}
                    </label>

                    <label>
                        아이디
                        <div className="with-btn">
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="영문/숫자 4~20자"
                                required
                            />
                            <button type="button" className="mini-btn" onClick={checkUsername}>
                                중복확인
                            </button>
                        </div>
                        {usernameOk !== null && (
                            <p className={usernameOk ? 'ok' : 'no'}>{usernameOk ? '사용 가능' : '이미 사용중'}</p>
                        )}
                    </label>

                    <label>
                        비밀번호
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="영문/숫자/특수문자 포함 8자 이상"
                            required
                        />
                    </label>

                    <label className="span-2">
                        닉네임
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임"
                            required
                        />
                    </label>
                </div>

                {errorMessage && <p className="form-error">{errorMessage}</p>}

                <button className="primary-btn w-full" type="submit" disabled={submitting}>
                    {submitting ? '가입 중…' : '가입하기'}
                </button>
            </form>
        </Modal>
    )
}
