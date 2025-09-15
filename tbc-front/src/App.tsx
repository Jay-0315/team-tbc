import { useEffect, useState } from "react"
import axios from "axios"

// 타입 정의
interface Profile {
    userId: number
    username: string
    email: string
    name: string | null
    profileImage?: string | null
    intro?: string | null
}

interface Wallet {
    walletId: number
    balancePoints: number
}

interface WalletTransaction {
    id: number
    type: string   // "CREDIT" | "DEBIT"
    status: string // "SUCCESS" | "FAILED"
    amountPoints: number
    description: string
    createdAt: string
}

interface MeetupItem {
    meetupId: number
    title: string
    startAt: string
    endAt: string
    role: string
    participantStatus: string
    meetupStatus: string
    participantCount: number
    pricePoints: number
    joinedAt: string | null
}

function App() {
    const [inputId, setInputId] = useState("1")
    const [userId, setUserId] = useState<number>(1)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<WalletTransaction[]>([])
    const [meetups, setMeetups] = useState<MeetupItem[]>([])
    const [openMeetups, setOpenMeetups] = useState<MeetupItem[]>([])
    const [error, setError] = useState<string | null>(null)

    // 프로필 수정용 state
    const [editNickname, setEditNickname] = useState("")
    const [editIntro, setEditIntro] = useState("")

    useEffect(() => {
        if (!userId) return
        setError(null)

        // 프로필
        axios.get<Profile>("/api/mypage/profile", { params: { userId } })
            .then(res => {
                setProfile(res.data)
                setEditNickname(res.data.username)
                setEditIntro(res.data.intro || "")
            })
            .catch(() => setProfile(null))

        // 지갑
        axios.get<Wallet>("/api/mypage/wallet", { params: { userId } })
            .then(res => setWallet(res.data))
            .catch(() => setWallet(null))

        // 거래내역
        axios.get<{ content: WalletTransaction[] }>("/api/mypage/wallet/txns", { params: { userId } })
            .then(res => setTransactions(res.data?.content ?? []))
            .catch(() => setTransactions([]))

        // 참가한 모임
        axios.get<{ content: MeetupItem[] }>("/api/mypage/meetups", { params: { userId } })
            .then(res => setMeetups(res.data?.content ?? []))
            .catch(() => setMeetups([]))

        // 열린 모임
        axios.get<MeetupItem[]>("/api/mypage/open-meetups")
            .then(res => setOpenMeetups(res.data ?? []))
            .catch(() => setOpenMeetups([]))
    }, [userId])

    // 참가 버튼
    const handleJoin = (meetupId: number) => {
        axios.post(`/api/meetups/${meetupId}/join`, {}, { params: { userId } })
            .then(() => {
                alert("참가 성공!")
                return axios.get<{ content: MeetupItem[] }>("/api/mypage/meetups", { params: { userId } })
            })
            .then(res => setMeetups(res.data?.content ?? []))
            .catch(err => {
                const msg = err.response?.data || err.message
                alert("참가 실패: " + msg)
                setError(msg)
            })
    }

    // 프로필 수정
    const handleUpdateProfile = async () => {
        try {
            const res = await axios.put<Profile>(
                "/api/mypage/profile",
                {
                    username: editNickname,
                    intro: editIntro,
                },
                { params: { userId } }
            )
            setProfile(res.data)
            alert("프로필 수정 완료!")
        } catch (err: any) {
            alert("수정 실패: " + (err.response?.data || err.message))
        }
    }

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>마이페이지 확인</h1>

            {/* 유저 ID 입력 */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="number"
                    value={inputId}
                    onChange={e => setInputId(e.target.value)}
                    placeholder="조회할 userId 입력"
                    style={{ padding: "5px", marginRight: "10px" }}
                />
                <button onClick={() => setUserId(Number(inputId))}>조회</button>
            </div>

            {error && <p style={{ color: "red" }}>에러: {error}</p>}

            {/* 프로필 */}
            <section style={{ marginBottom: "20px" }}>
                <h2>프로필</h2>
                {!profile ? <p>프로필 없음</p> : (
                    <ul>
                        <li><b>ID:</b> {profile.userId}</li>
                        <li><b>닉네임:</b> {profile.username}</li>
                        <li><b>이메일:</b> {profile.email}</li>
                        <li><b>이름:</b> {profile.name || "미등록"}</li>
                        <li><b>소개:</b> {profile.intro || "미등록"}</li>
                    </ul>
                )}
            </section>

            {/* 프로필 수정 */}
            <section style={{ marginBottom: "20px" }}>
                <h2>프로필 수정</h2>
                <input
                    type="text"
                    placeholder="새 닉네임"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    style={{ marginRight: "10px", padding: "5px" }}
                />
                <input
                    type="text"
                    placeholder="새 소개"
                    value={editIntro}
                    onChange={(e) => setEditIntro(e.target.value)}
                    style={{ marginRight: "10px", padding: "5px" }}
                />
                <button onClick={handleUpdateProfile}>수정하기</button>
            </section>

            {/* 지갑 */}
            <section style={{ marginBottom: "20px" }}>
                <h2>지갑 요약</h2>
                {!wallet ? <p>지갑 정보 없음</p> : (
                    <ul>
                        <li><b>지갑 ID:</b> {wallet.walletId}</li>
                        <li><b>현재 잔액:</b> {wallet.balancePoints} P</li>
                    </ul>
                )}
            </section>

            {/* 거래내역 */}
            <section style={{ marginBottom: "20px" }}>
                <h2>거래 내역</h2>
                {transactions.length === 0 ? <p>거래 내역 없음</p> : (
                    <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead style={{ backgroundColor: "#f5f5f5" }}>
                        <tr>
                            <th>타입</th>
                            <th>상태</th>
                            <th>포인트</th>
                            <th>설명</th>
                            <th>날짜</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((txn, index) => {
                            const isIncrease = txn.type === "CREDIT"
                            return (
                                <tr key={`txn-${txn.id}-${index}`}>
                                    <td>{isIncrease ? "충전" : "사용"}</td>
                                    <td>{txn.status}</td>
                                    <td style={{ color: isIncrease ? "green" : "red" }}>
                                        {isIncrease ? `+${txn.amountPoints}` : `-${txn.amountPoints}`} P
                                    </td>
                                    <td>{txn.description}</td>
                                    <td>{new Date(txn.createdAt).toLocaleString()}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                )}
            </section>

            {/* 열린 모임 */}
            <section style={{ marginBottom: "20px" }}>
                <h2>열린 모임</h2>
                {openMeetups.length === 0 ? <p>열린 모임 없음</p> : (
                    <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead style={{ backgroundColor: "#f5f5f5" }}>
                        <tr>
                            <th>제목</th>
                            <th>참가비</th>
                            <th>상태</th>
                            <th>참가</th>
                        </tr>
                        </thead>
                        <tbody>
                        {openMeetups.map((m, index) => (
                            <tr key={`open-${m.meetupId}-${index}`}>
                                <td>{m.title}</td>
                                <td>{m.pricePoints} P</td>
                                <td>{m.meetupStatus}</td>
                                <td>
                                    <button onClick={() => handleJoin(m.meetupId)}>참가하기</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* 내가 참가한 모임 */}
            <section>
                <h2>내가 참가한 모임</h2>
                {meetups.length === 0 ? <p>참가한 모임 없음</p> : (
                    <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead style={{ backgroundColor: "#f5f5f5" }}>
                        <tr>
                            <th>제목</th>
                            <th>상태</th>
                            <th>역할</th>
                            <th>인원</th>
                            <th>참가비</th>
                            <th>시작일</th>
                            <th>참여일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {meetups.map((m, index) => (
                            <tr key={`meetup-${m.meetupId}-${index}`}>
                                <td>{m.title}</td>
                                <td>{m.meetupStatus}</td>
                                <td>{m.role}</td>
                                <td>{m.participantCount}명</td>
                                <td>{m.pricePoints} P</td>
                                <td>{new Date(m.startAt).toLocaleString()}</td>
                                <td>{m.joinedAt ? new Date(m.joinedAt).toLocaleString() : "-"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}

export default App
