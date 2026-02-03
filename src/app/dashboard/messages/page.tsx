'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';

export default function InboxPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    // Poll messages if a conversation is selected
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (selectedConv) {
            fetchMessages(selectedConv);
            interval = setInterval(() => fetchMessages(selectedConv), 5000);
        }
        return () => clearInterval(interval);
    }, [selectedConv]);

    const fetchConversations = async () => {
        const res = await fetch('/api/conversations');
        if (res.ok) {
            const data = await res.json();
            setConversations(data);
        }
        setLoading(false);
    };

    const fetchMessages = async (convId: string) => {
        const res = await fetch(`/api/messages/list?conversationId=${convId}`);
        if (res.ok) {
            const data = await res.json();
            setMessages(data.messages);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        // Need businessId to send? The API is smart enough to use convId if provided.
        // But my 'send' API expects 'businessId' OR 'conversationId' in a specific way.
        // Let's check send route: if (conversationId) it works.

        // Wait, send route: const { businessId, content, conversationId } = body;
        // if (!finalConvId && businessId) ...
        // So passing conversationId is enough.

        await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: selectedConv,
                content: newMessage,
                // businessId is not strictly needed if conversationId exists, but let's see.
            })
        });

        setNewMessage('');
        fetchMessages(selectedConv);
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' }}>
            {/* Sidebar List */}
            <div style={{ width: '300px', background: 'white', borderRadius: '12px', overflowY: 'auto', border: '1px solid #eee' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Inboxes</div>
                {conversations.length === 0 ? (
                    <div style={{ padding: '20px', color: '#888', fontSize: '13px' }}>No conversations yet.</div>
                ) : (
                    conversations.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedConv(c.id)}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #f9f9f9',
                                cursor: 'pointer',
                                background: selectedConv === c.id ? '#f0fdf4' : 'white',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                                {c.isOwner ? c.partner.name : c.partner.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.lastMessage}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
                {selectedConv ? (
                    <>
                        <div style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Chat</span>
                            <button onClick={() => setSelectedConv(null)} style={{ fontSize: '12px', color: '#888' }}>Close</button>
                        </div>

                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8f9fa' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.isMine ? 'flex-end' : 'flex-start',
                                    padding: '10px 15px',
                                    background: msg.isMine ? '#008751' : 'white',
                                    color: msg.isMine ? 'white' : '#333',
                                    borderRadius: '12px',
                                    maxWidth: '70%',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    fontSize: '14px'
                                }}>
                                    {msg.content}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <button type="submit" style={{ background: '#008751', color: 'white', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
