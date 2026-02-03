'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import styles from './Login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>EAGLE<span>SEARCH</span></div>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Log in to manage your verified listings.</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Lock size={16} /> Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Log In <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Don't have an account? <Link href="/register">Create one</Link></p>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <ShieldCheck size={18} color="#008751" />
                        <span>Verified Accounts</span>
                    </div>
                    <div className={styles.feature}>
                        <Zap size={18} color="#ffd700" />
                        <span>Instant Access</span>
                    </div>
                </div>
            </div>
            <div className={styles.bgDecoration}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
            </div>
        </div>
    );
}
