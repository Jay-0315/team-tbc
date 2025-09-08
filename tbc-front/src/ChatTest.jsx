import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ChatWsTest() {
    const [host, setHost] = useState("localhost:8080");
    const [roomId, setRoomId] = useState(1);
    const [token, setToken] = useState("uid:77");
    const [autoConnect, setAutoConnect] = useState(true);
    const [status, setStatus] = useState("CLOSED");
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);
    const [limit, setLimit] = useState(50);
    const [nextCursor, setNextCursor] = useState(null);
    const hbRef = useRef(null);
    const wsRef = useRef(null);

    const wsUrl = useMemo(() => {
        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        return `${scheme}://${host}/chat/${roomId}?token=${encodeURIComponent(token)}`;
    }, [host, roomId, token]);

    const httpBase = useMemo(() => {
        const scheme = window.location.protocol === "https:" ? "https" : "http";
        const normalized = host.startsWith("http") ? host : `${scheme}://${host}`;
        return normalized.replace(/\/$/, "");
    }, [host]);

    function log(line) {
        setLogs((l) => [...l.slice(-999), `[${new Date().toLocaleTimeString()}] ${line}`]);
    }

    function connect() {
        if (wsRef.current && (wsRef.current.readyState === 0 || wsRef.current.readyState === 1)) {
            log("Already connected or connecting");
            return;
        }
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        setStatus("CONNECTING");

        ws.onopen = () => {
            setStatus("OPEN");
            log(`OPEN ${wsUrl}`);
            hbRef.current && clearInterval(hbRef.current);
            hbRef.current = setInterval(() => {
                try {
                    if (ws.readyState === 1) ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
                } catch {}
            }, 30000);
        };

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data?.type === "SYSTEM") {
                    log(`SYSTEM ${data.subType} user=${data.userId} online=${data.online}`);
                } else {
                    setMessages((m) => {
                        const next = [...m];
                        if (data?.id && !next.some((x) => x.id === data.id)) next.push(data);
                        else next.push(data);
                        return next.slice(-500);
                    });
                }
            } catch {
                log(`TEXT ${e.data}`);
            }
        };

        ws.onclose = (e) => {
            setStatus("CLOSED");
            log(`CLOSE code=${e.code} reason=${e.reason || ""}`);
            hbRef.current && clearInterval(hbRef.current);
            hbRef.current = null;
        };

        ws.onerror = (e) => {
            log("ERROR " + (e.message || e.type));
        };
    }

    function disconnect() {
        hbRef.current && clearInterval(hbRef.current);
        hbRef.current = null;
        if (wsRef.current) {
            try {
                wsRef.current.close(1000, "client-close");
            } catch {}
        }
        setStatus("CLOSED");
    }

    function send() {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== 1) {
            log("Not connected");
            return;
        }
        const text = msg.trim();
        if (!text) return;
        ws.send(JSON.stringify({ type: "chat", content: text }));
        setMsg("");
    }

    async function loadHistory() {
        try {
            const cursorParam = nextCursor ? `&cursor=${nextCursor}` : "";
            const res = await fetch(`${httpBase}/api/chat/rooms/${roomId}/messages?limit=${limit}${cursorParam}`);
            const data = await res.json();
            const items = data?.items || data || [];
            setNextCursor(data?.nextCursor ?? null);
            setMessages((m) => {
                const ids = new Set(m.filter((x) => x.id).map((x) => x.id));
                const merged = [...items.filter((x) => !ids.has(x.id)), ...m];
                merged.sort((a, b) => (a.sentAt || a.id || 0) > (b.sentAt || b.id || 0) ? 1 : -1);
                return merged.slice(-500);
            });
            log(`Loaded ${items.length} messages`);
        } catch (e) {
            log("History load failed: " + e.message);
        }
    }

    useEffect(() => {
        if (autoConnect) connect();
        return () => {
            hbRef.current && clearInterval(hbRef.current);
            wsRef.current && wsRef.current.close(1000, "page-leave");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wsUrl, autoConnect]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto grid gap-4">
                <h1 className="text-2xl font-semibold">Chat WebSocket Tester</h1>

                <div className="grid md:grid-cols-4 gap-2 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600">Host</label>
                        <input className="border rounded px-2 py-1" value={host} onChange={(e) => setHost(e.target.value)} placeholder="localhost:8080"/>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600">Room ID</label>
                        <input className="border rounded px-2 py-1" type="number" value={roomId} onChange={(e) => setRoomId(Number(e.target.value) || 1)} />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600">Token</label>
                        <input className="border rounded px-2 py-1" value={token} onChange={(e) => setToken(e.target.value)} placeholder="uid:77"/>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-3 py-2 rounded bg-black text-white" onClick={connect}>Connect</button>
                        <button className="px-3 py-2 rounded border" onClick={disconnect}>Disconnect</button>
                    </div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} />
                        Auto-connect
                    </label>
                    <div className="col-span-full text-sm text-gray-600">Status: <span className="font-medium">{status}</span> · ws: {wsUrl}</div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 border rounded bg-white p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <input className="flex-1 border rounded px-2 py-2" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder='Type and press Enter' />
                            <button className="px-3 py-2 rounded bg-black text-white" onClick={send}>Send</button>
                        </div>
                        <div className="h-72 overflow-y-auto space-y-2">
                            {messages.map((m, idx) => (
                                <div key={m.id ?? `m_${idx}`} className="text-sm">
                                    {"type" in m && m.type === "SYSTEM" ? (
                                        <div className="text-gray-500">[SYSTEM] {m.subType} · user {m.userId} · online {m.online}</div>
                                    ) : (
                                        <div className="p-2 rounded border">
                                            <div className="text-xs text-gray-500">{m.sentAt || ""} · room {m.roomId} · user {m.userId}</div>
                                            <div className="font-medium whitespace-pre-wrap break-words">{m.content ?? JSON.stringify(m)}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border rounded bg-white p-3">
                        <div className="flex items-end gap-2 mb-2">
                            <div className="flex-1">
                                <label className="text-sm text-gray-600">History limit</label>
                                <input className="border rounded px-2 py-1 w-full" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 50)} />
                            </div>
                            <button className="px-3 py-2 rounded border" onClick={loadHistory}>Load history</button>
                        </div>
                        <div className="h-64 overflow-y-auto text-xs font-mono whitespace-pre-wrap bg-gray-50 p-2 rounded">
                            {logs.map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

