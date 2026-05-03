'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Message {
    role: 'user' | 'bot';
    text: string;
    results?: any[];
    type?: 'text' | 'results';
}

export default function EagleBot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Hi! 👋 I\'m 9jaBot. Ask me to find any business in Nigeria — hotels, mechanics, restaurants, hospitals and more. Try: "recommend a hotel in Ikeja"' }
    ]);
    const [loading, setLoading] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(20);
    const [chatWidth, setChatWidth] = useState(350);
    const [chatMaxHeight, setChatMaxHeight] = useState(500);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate correct bottom offset above mobile nav — runs only on client
    useEffect(() => {
        const update = () => {
            const isMobile = window.innerWidth <= 768;
            setBottomOffset(isMobile ? 70 : 20);
            setChatWidth(Math.min(350, window.innerWidth - 32));
            setChatMaxHeight(window.innerHeight - (isMobile ? 70 : 20) - 80);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    if (pathname?.startsWith('/admin')) return null;

    const handleSend = async () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.text, results: data.results, type: data.type }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I lost connection to the server.' }]);
        } finally {
            setLoading(false);
        }
    };

    const btnStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: bottomOffset,
        right: 16,
        zIndex: 10001,
        background: 'linear-gradient(135deg, #008751 0%, #006b3f 100%)',
        color: 'white', border: 'none', borderRadius: '50%',
        width: 56, height: 56,
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    if (!isOpen) {
        return <button onClick={() => setIsOpen(true)} style={btnStyle}><Bot size={28} /></button>;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: bottomOffset,
            right: 16,
            zIndex: 10001,
            width: Math.min(350, window.innerWidth - 32),
            maxHeight: window.innerHeight - bottomOffset - 80,
            height: '70vh',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 5px 25px rgba(0,0,0,0.2)', border: '1px solid #eee',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ padding: '12px 15px', background: '#008751', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'white', padding: '5px', borderRadius: '50%' }}>
                        <Bot size={18} color="#008751" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>9jaBot</div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>AI Business Finder</div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                        <div style={{
                            padding: '9px 13px', borderRadius: '12px',
                            background: msg.role === 'user' ? '#008751' : 'white',
                            color: msg.role === 'user' ? 'white' : '#333',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'bot' ? '2px' : '12px',
                            boxShadow: msg.role === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                            fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: msg.text
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#008751;font-weight:600">$1</a>')
                        }}
                        />
                        {msg.type === 'results' && msg.results && (
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {msg.results.map((biz: any) => (
                                    <Link href={`/business/${biz.slug}`} key={biz.id} style={{ textDecoration: 'none' }}>
                                        <div style={{ background: 'white', padding: '8px 10px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#e8f5e9', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#008751', fontSize: '16px' }}>
                                                {biz.name.charAt(0)}
                                            </div>
                                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</div>
                                                <div style={{ fontSize: '11px', color: '#666' }}>{biz.category} · {biz.city}</div>
                                                <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Star size={9} fill="#f59e0b" /> {biz.rating?.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '8px 13px', borderRadius: '12px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                        Searching...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length === 1 && (
                <div style={{ padding: '8px 12px 0', background: 'white', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {['Hotels Lagos', 'Mechanic Abuja', 'Hospital near me', 'Buy cement'].map(s => (
                        <button key={s} onClick={() => setInput(s)}
                            style={{ padding: '4px 9px', borderRadius: '12px', border: '1px solid #008751', background: '#f0fdf4', color: '#008751', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid #eee', background: 'white', flexShrink: 0 }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '13px' }}
                    />
                    <button type="submit" disabled={!input.trim()}
                        style={{ background: '#008751', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}

interface Message {
    role: 'user' | 'bot';
    text: string;
    results?: any[];
    type?: 'text' | 'results';
}

export default function EagleBot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Hi! 👋 I\'m 9jaBot. Ask me to find any business in Nigeria — hotels, mechanics, restaurants, hospitals and more. Try: "recommend a hotel in Ikeja"' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Hide on admin routes
    if (pathname?.startsWith('/admin')) return null;

    const handleSend = async () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'bot', text: data.text, results: data.results, type: data.type }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I lost connection to the server.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 'calc(70px + env(safe-area-inset-bottom))', // above mobile nav
                    right: '16px',
                    zIndex: 10001, // above mobile nav (10000)
                    background: 'linear-gradient(135deg, #008751 0%, #006b3f 100%)',
                    color: 'white', border: 'none', borderRadius: '50%',
                    width: '56px', height: '56px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <Bot size={28} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 'calc(70px + env(safe-area-inset-bottom))', // above mobile nav
            right: '16px',
            zIndex: 10001,
            width: 'min(350px, calc(100vw - 32px))', // responsive width
            maxHeight: 'calc(100vh - 160px)',
            height: '80vh',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 5px 25px rgba(0,0,0,0.2)', border: '1px solid #eee',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '15px', background: '#008751', color: 'white',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'white', padding: '5px', borderRadius: '50%' }}>
                        <Bot size={20} color="#008751" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>9jaBot</div>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>AI Concierge</div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%'
                    }}>
                        <div style={{
                            padding: '10px 15px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? '#008751' : 'white',
                            color: msg.role === 'user' ? 'white' : '#333',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'bot' ? '2px' : '12px',
                            boxShadow: msg.role === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                            fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: msg.text
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#008751;font-weight:600">$1</a>')
                        }}
                        />

                        {/* Render Results if any */}
                        {msg.type === 'results' && msg.results && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {msg.results.map((biz: any) => (
                                    <Link href={`/business/${biz.slug}`} key={biz.id} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'white', padding: '10px', borderRadius: '8px',
                                            border: '1px solid #eee', display: 'flex', gap: '10px',
                                            cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {/* Image Thumbnail */}
                                            <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '6px', flexShrink: 0, overflow: 'hidden' }}>
                                                {/* Simple placeholder logic */}
                                                {biz.images ? (
                                                    <img src={JSON.parse(biz.images)[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>🏠</div>
                                                )}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{biz.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>{biz.category} • {biz.city}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>
                                                    <Star size={10} fill="#f59e0b" /> {biz.rating.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '8px 15px', borderRadius: '12px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '15px', borderTop: '1px solid #eee', background: 'white' }}>
                {/* Quick suggestions — show only on first message */}
                {messages.length === 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {['Hotels in Lagos', 'Mechanic in Abuja', 'Hospital near me', 'Best restaurant Lekki'].map(s => (
                            <button key={s} onClick={() => { setInput(s); }}
                                style={{ padding: '5px 10px', borderRadius: '14px', border: '1px solid #008751', background: '#f0fdf4', color: '#008751', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    style={{ display: 'flex', gap: '10px' }}
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{
                            background: '#008751', color: 'white', border: 'none',
                            width: '40px', height: '40px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
