'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MapPin, ChevronRight, Star } from 'lucide-react';
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
        { role: 'bot', text: 'Hi! I\'m Eagle Bot. 🦅 looking for something? Just ask!' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Hide on admin routes?
    if (pathname?.startsWith('/admin')) return null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

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
                    position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
                    background: 'linear-gradient(135deg, #008751 0%, #006b3f 100%)',
                    color: 'white', border: 'none', borderRadius: '50%',
                    width: '60px', height: '60px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <Bot size={32} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
            width: '350px', maxHeight: '500px', height: '80vh',
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
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>Eagle Bot</div>
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
                            fontSize: '14px', lineHeight: '1.4'
                        }}>
                            {msg.text}
                        </div>

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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'cursor'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
