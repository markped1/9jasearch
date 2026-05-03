'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Message {
    role: 'user' | 'bot';
    text: string;
    results?: any[];
    type?: 'text' | 'results';
}

const BUBBLE_MESSAGES = [
    'Chat with me 😊',
    'I can help! 🇳🇬',
    'Find businesses near you 📍',
    'Ask me anything! 💬',
    'Hotels, mechanics, food... 🍽️',
    'Search Naija. Find More. 🔍',
];

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
    const [bubbleIndex, setBubbleIndex] = useState(0);
    const [showBubble, setShowBubble] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Rotate bubble message every 10 seconds
    useEffect(() => {
        if (isOpen) return;
        const interval = setInterval(() => {
            setShowBubble(false);
            setTimeout(() => {
                setBubbleIndex(i => (i + 1) % BUBBLE_MESSAGES.length);
                setShowBubble(true);
            }, 400);
        }, 10000);
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const fixedBase = {
        position: 'fixed' as const,
        bottom: bottomOffset,
        right: 16,
        zIndex: 10001,
    };

    if (!isOpen) {
        return (
            <div style={{ ...fixedBase, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                {/* Animated typing bubble */}
                <div
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'white',
                        border: '1.5px solid #008751',
                        borderRadius: '18px 18px 4px 18px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#008751',
                        boxShadow: '0 2px 12px rgba(0,135,81,0.15)',
                        whiteSpace: 'nowrap',
                        opacity: showBubble ? 1 : 0,
                        transform: showBubble ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        cursor: 'pointer',
                    }}
                >
                    {BUBBLE_MESSAGES[bubbleIndex]}
                </div>

                {/* Friendly emoji button */}
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #008751 0%, #006b3f 100%)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 58, height: 58,
                        boxShadow: '0 4px 16px rgba(0,135,81,0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    aria-label="Open 9jaBot"
                >
                    😊
                </button>
            </div>
        );
    }

    return (
        <div style={{
            ...fixedBase,
            width: chatWidth,
            maxHeight: chatMaxHeight,
            height: '70vh',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 5px 25px rgba(0,0,0,0.2)', border: '1px solid #eee',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ padding: '12px 15px', background: 'linear-gradient(135deg, #008751 0%, #006b3f 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '28px', lineHeight: 1 }}>😊</div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>9jaBot</div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>● Online · AI Business Finder</div>
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
                        {msg.role === 'bot' && (
                            <div style={{ fontSize: '16px', marginBottom: '3px' }}>😊</div>
                        )}
                        <div
                            style={{
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
                                        <div style={{ background: 'white', padding: '8px 10px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', gap: '8px' }}>
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
                    <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '16px' }}>😊</div>
                        <div style={{ background: 'white', padding: '8px 13px', borderRadius: '12px', display: 'flex', gap: '4px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            {[0, 0.2, 0.4].map((delay, i) => (
                                <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#008751', display: 'inline-block', animation: `botBounce 1s ${delay}s infinite` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length === 1 && (
                <div style={{ padding: '8px 12px 0', background: 'white', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {['Hotels Lagos', 'Mechanic Abuja', 'Register a business', 'Prices in Nigeria'].map(s => (
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
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '13px' }}
                    />
                    <button type="submit" disabled={!input.trim()}
                        style={{ background: '#008751', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <Send size={16} />
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes botBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-4px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
