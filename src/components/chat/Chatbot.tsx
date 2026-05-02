'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Zap, Search, Sparkles } from 'lucide-react';
import styles from './Chatbot.module.css';
import { parseQuery, ParsedQuery } from '@/lib/queryParser';

interface Message {
    role: 'bot' | 'user';
    content: string;
    businesses?: any[];
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
    { label: 'Best rated hotels', query: 'Find me the best rated hotels' },
    { label: 'Restaurants near Ikeja', query: 'Restaurants in Ikeja' },
    { label: 'Verified mechanics', query: 'Find verified mechanics' },
    { label: 'Affordable services', query: 'Show me affordable services' }
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            content: '🔍 Welcome to 9jaSearch AI! I\'m your smart business guide.\n\nTry asking me things like:\n• "Find a quiet hotel in Lagos"\n• "Best rated restaurants near Lekki"\n• "Affordable mechanics"\n\nWhat can I help you find today?'
        }
    ]);

    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSuggestionClick = (query: string) => {
        setInput(query);
        // Auto-submit
        setTimeout(() => {
            const form = document.querySelector(`.${styles.chatFooter}`) as HTMLFormElement;
            form?.requestSubmit();
        }, 100);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Parse the user's query using our smart parser
            const parsed: ParsedQuery = parseQuery(userMsg);
            let response = "";
            let businessResults: any[] = [];

            // Handle search intent
            if (parsed.intent === 'search' || parsed.category) {
                // Build search URL with parsed parameters
                const searchParams = new URLSearchParams();

                if (parsed.category) {
                    searchParams.set('q', parsed.category);
                } else {
                    // Extract key terms from original query
                    searchParams.set('q', userMsg.replace(/find|locate|show|search|me|a|an|the|in|near|for/gi, '').trim());
                }

                if (parsed.location) {
                    searchParams.set('location', parsed.location);
                }

                if (parsed.sortBy !== 'relevance') {
                    searchParams.set('sortBy', parsed.sortBy);
                }

                if (parsed.attributes.length > 0) {
                    searchParams.set('attributes', parsed.attributes.join(','));
                }

                if (parsed.attributes.includes('verified')) {
                    searchParams.set('verified', 'true');
                }

                searchParams.set('limit', '5');

                const res = await fetch(`/api/businesses/search?${searchParams.toString()}`);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    businessResults = data;

                    // Build contextual response
                    let contextParts: string[] = [];
                    if (parsed.category) contextParts.push(parsed.category);
                    if (parsed.location) contextParts.push(`in ${parsed.location}`);
                    if (parsed.attributes.includes('rated')) contextParts.push('(sorted by rating)');
                    if (parsed.attributes.includes('verified')) contextParts.push('(verified only)');

                    const contextStr = contextParts.length > 0 ? contextParts.join(' ') : 'your search';

                    response = `🔍 Found ${data.length} result${data.length > 1 ? 's' : ''} for **${contextStr}**:\n\n` +
                        data.map((b: any, i: number) =>
                            `${i + 1}. **${b.name}**${b.isVerified ? ' ✓' : ''}\n   📍 ${b.city}, ${b.state}\n   ⭐ ${b.rating.toFixed(1)} (${b.reviewCount} reviews)\n   📞 ${b.phone}`
                        ).join('\n\n');

                    // Add helpful follow-up
                    if (parsed.attributes.length === 0) {
                        response += '\n\n💡 **Tip**: Try adding "best rated", "verified", or "affordable" to refine results!';
                    }
                } else {
                    response = `I couldn't find any ${parsed.category || 'businesses'}${parsed.location ? ` in ${parsed.location}` : ''}.\n\nTry:\n• Broadening your search\n• Checking a different location\n• [Adding a business](/add-business) to help others find it!`;
                }
            }
            // Handle info/help intent
            else if (parsed.intent === 'info') {
                if (userMsg.toLowerCase().includes('cac') || userMsg.toLowerCase().includes('register')) {
                    response = "**CAC Registration Guide (2026):**\n\n1. Visit https://icrp.cac.gov.ng\n2. Reserve your business name (₦500)\n3. Complete digital registration\n4. Once approved, [add your business here](/add-business) to reach customers!";
                } else if (userMsg.toLowerCase().includes('help') || userMsg.toLowerCase().includes('how')) {
                    response = "Here's what I can help you with:\n\n🔍 **Find Businesses** - \"Find hotels in Lagos\"\n⭐ **Best Rated** - \"Best rated restaurants\"\n✓ **Verified Only** - \"Verified mechanics\"\n📍 **By Location** - \"Services near Ikeja\"\n💰 **By Price** - \"Affordable hotels\"\n\nJust ask naturally!";
                } else {
                    response = "I'm here to help! Try asking me to find businesses, or ask about CAC registration.";
                }
            }
            // Fallback
            else {
                response = "I'm your smart business guide! 🔍\n\nTry asking:\n• \"Find hotels in Lagos\"\n• \"Best rated restaurants\"\n• \"Verified mechanics near me\"\n• \"Affordable IT services\"";
            }

            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'bot', content: response, businesses: businessResults }]);
                setLoading(false);
            }, 400);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', content: "Oops! Something went wrong. Please try again." }]);
            setLoading(false);
        }
    };

    // Simple markdown-like formatting
    const formatMessage = (text: string) => {
        return text.split('\n').map((line, i) => {
            // Bold text
            const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return (
                <p
                    key={i}
                    style={{ margin: line.trim() === '' ? '10px 0' : '3px 0' }}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />
            );
        });
    };

    return (
        <div className={styles.chatbotContainer}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerTitle}>
                            <div className={styles.botIcon}><Sparkles size={18} /></div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: 800 }}>9jaSearch AI</span>
                                <span style={{ fontSize: '10px', opacity: 0.8 }}>Smart Search • Level 3</span>
                            </div>
                        </div>
                        <X className={styles.closeBtn} onClick={() => setIsOpen(false)} />
                    </div>

                    <div className={styles.chatBody} ref={chatBodyRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`${styles.message} ${msg.role === 'bot' ? styles.botMessage : styles.userMessage}`}>
                                {formatMessage(msg.content)}
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.message} ${styles.botMessage} ${styles.thinking}`}>
                                <Search size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                                <span>Searching verified businesses...</span>
                            </div>
                        )}

                        {/* Quick suggestions after welcome message */}
                        {messages.length === 1 && !loading && (
                            <div className={styles.suggestions}>
                                {QUICK_SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        className={styles.suggestionChip}
                                        onClick={() => handleSuggestionClick(s.query)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <form className={styles.chatFooter} onSubmit={handleSend}>
                        <input
                            className={styles.inputField}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Find hotels in Lagos, best rated..."
                        />
                        <button type="submit" className={styles.sendBtn} disabled={loading}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.floatingBtn} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={30} /> : <div style={{ position: 'relative' }}><MessageSquare size={30} /><div className={styles.pulseIndicator}></div></div>}
            </div>
        </div>
    );
}
