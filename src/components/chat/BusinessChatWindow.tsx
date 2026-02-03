'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ChatWindowProps {
    businessId: string;
    businessName: string;
    ownerId: string;
}

export default function BusinessChatWindow({ businessId, businessName, ownerId }: ChatWindowProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        if (isOpen && session?.user) {
            fetchMessages();
            // Poll for new messages every 5 seconds
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, session]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages/list?businessId=${businessId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                    scrollToBottom();
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (!session) {
            router.push(`/login?callbackUrl=/business/${businessId}`); // Or standard login
            return;
        }

        setSending(true);
        try {
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    content: newMessage
                })
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages(prev => [...prev, { ...sentMsg, isMine: true }]);
                setNewMessage('');
                scrollToBottom();
            }
        } catch (err) {
            console.error('Failed to send', err);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#008751',
                    color: 'white',
                    padding: '15px 20px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    zIndex: 1000
                }}
            >
                <MessageCircle size={20} /> Chat with Owner
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #eee'
        }}>
            {/* Header */}
            <div style={{
                padding: '15px',
                background: '#008751',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{businessName}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Typically replies in minutes</div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                padding: '15px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: '#f8f9fa'
            }}>
                {messages.length === 0 && <div style={{ textAlign: 'center', color: '#888', marginTop: '20px', fontSize: '13px' }}>Start a conversation with {businessName}</div>}
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: msg.isMine ? '#008751' : 'white',
                        color: msg.isMine ? 'white' : '#333',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        borderBottomRightRadius: msg.isMine ? '2px' : '12px',
                        borderBottomLeftRadius: msg.isMine ? '12px' : '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        fontSize: '14px',
                        lineHeight: '1.4'
                    }}>
                        {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
                padding: '15px',
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: '10px'
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '10px 15px',
                        borderRadius: '20px',
                        border: '1px solid #ddd',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    style={{
                        background: '#008751',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        opacity: sending ? 0.7 : 1
                    }}
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}
