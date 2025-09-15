import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type Props = { roomId: number; userId?: number };

type ChatMsg = {
    id?: string | number;
    userId?: number;
    content: string;
    type?: "CHAT" | "SYSTEM";
    createdAt?: string;
};

export default function ChatRoom({ roomId, userId }: Props) {
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const [msgs, setMsgs] = useState<ChatMsg[]>([]);
    const [text, setText] = useState("");

    useEffect(() => {
        const client = new Client({
            // Spring STOMP + SockJS 엔드포인트
            webSocketFactory: () => new SockJS("/ws"),
            reconnectDelay: 1000,
            debug: () => {}
        });

        client.onConnect = () => {
            setConnected(true);
            // 구독 경로는 프로젝트 설정에 맞춰 조정
            client.subscribe(`/topic/rooms/${roomId}`, (msg: IMessage) => {
                try {
                    const body: ChatMsg = JSON.parse(msg.body);
                    setMsgs(prev => [...prev, body]);
                } catch {
                    setMsgs(prev => [...prev, { content: msg.body, type: "SYSTEM" }]);
                }
            });
        };

        client.onStompError = () => setConnected(false);
        client.onWebSocketClose = () => setConnected(false);

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [roomId]);

    const send = () => {
        if (!clientRef.current || !connected || !text.trim()) return;
        const payload: ChatMsg = {
            content: text.trim(),
            type: "CHAT",
            userId
        };
        // 전송 경로는 프로젝트 설정에 맞춰 조정
        clientRef.current.publish({
            destination: `/app/rooms/${roomId}/send`,
            body: JSON.stringify(payload)
        });
        setText("");
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">그룹 채팅방 #{roomId}</h2>
                <span className={`text-sm ${connected ? "text-green-600" : "text-red-500"}`}>
          {connected ? "연결됨" : "연결 끊김"}
        </span>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl p-3 space-y-2 bg-gray-50">
                {msgs.length === 0 && (
                    <div className="text-gray-400 text-center py-10">메시지가 없습니다.</div>
                )}
                {msgs.map((m, i) => (
                    <div key={i} className="text-sm">
                        {m.type === "SYSTEM" ? (
                            <div className="text-gray-500 italic">※ {m.content}</div>
                        ) : (
                            <div>
                <span className="font-medium text-gray-700">
                  {m.userId ?? "익명"}
                </span>
                                <span className="mx-2 text-gray-400">|</span>
                                <span className="text-gray-800">{m.content}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-3 flex gap-2">
                <input
                    className="flex-1 border rounded-xl px-3 py-2"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyUp={(e) => { if (e.key === "Enter") send(); }}
                    placeholder="메시지를 입력하세요"
                />
                <button
                    onClick={send}
                    className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                >
                    전송
                </button>
            </div>
        </div>
    );
}
