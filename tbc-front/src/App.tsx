import { useState } from "react";
import ChatRoom from "@/components/ChatRoom";
import CreateWizard from "@/pages/groups/CreateWizard";

export default function App() {
    const [roomId, setRoomId] = useState<number | null>(null);
    const [groupId, setGroupId] = useState<number | null>(null);

    // (임시) 로그인 유저 ID. 실제로는 JWT/세션에서 받아 쓰세요.
    const [userId] = useState<number>(1);

    if (roomId && groupId) {
        return <ChatRoom roomId={roomId} userId={userId} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                <CreateWizard
                    onCreated={(gId, rId) => {
                        setGroupId(gId);
                        setRoomId(rId);
                    }}
                />
            </div>
        </div>
    );
}
