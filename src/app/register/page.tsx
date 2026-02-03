'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import styles from './Registration.module.css';

export default function RegistrationPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' // 'USER' or 'BUSINESS'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/login?registered=true');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.regCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>EAGLE<span>SEARCH</span></div>
                    <h1 className={styles.title}>Join the Community</h1>
                    <p className={styles.subtitle}>Create your account for personalized results.</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label><User size={16} /> Full Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Lock size={16} /> Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Briefcase size={16} /> I am a...</label>
                        <select name="role" value={formData.role} onChange={handleChange} className={styles.select}>
                            <option value="USER">Community Member (Reviewer)</option>
                            <option value="BUSINESS">Business Owner</option>
                        </select>
                    </div>

                    <button type="submit" className={styles.regBtn} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Already have an account? <Link href="/login">Log in here</Link></p>
                </div>

                <div className={styles.trustBanner}>
                    <ShieldCheck size={20} color="#008751" />
                    <span>Your data is never shared. Secure identity verification enabled.</span>
                </div>
            </div>
            <div className={styles.bgDecoration}>
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
            </div>
        </div>
    );
}
