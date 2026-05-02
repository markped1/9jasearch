'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.error) {
            setError('Invalid credentials');
            setLoading(false);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#f4f6f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '40px',
                width: '100%', maxWidth: '400px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: '#e8f5e9', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px',
                    }}>
                        <ShieldCheck size={28} color="#008751" />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#333', margin: '0 0 6px' }}>
                        Admin Access
                    </h1>
                    <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
                        9jaSearch Administration
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fdecea', color: '#c0392b', padding: '12px 16px',
                        borderRadius: '8px', fontSize: '14px', marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <Mail size={13} /> Email
                        </label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="admin@eaglesearch.ng" required
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <Lock size={13} /> Password
                        </label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" disabled={loading} style={{
                        padding: '13px', borderRadius: '8px', border: 'none',
                        background: loading ? '#aaa' : '#008751', color: 'white',
                        fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                        {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
