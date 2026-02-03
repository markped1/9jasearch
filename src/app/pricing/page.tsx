'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Pricing.module.css';

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (plan: 'SILVER' | 'GOLD' | 'PLATINUM') => {
        if (!session) {
            router.push(`/login?callbackUrl=/pricing`);
            return;
        }

        // @ts-ignore
        if (session.user.role !== 'BUSINESS') {
            alert('Only business owners can subscribe.');
            return;
        }

        // Check if user has a business (quick check or rely on backend validation)
        // ideally we let them select WHICH business to upgrade if they have multiple.
        // For level 1-5 we assumed 1 user = 1 business or implicitly linked.
        // Let's first ask them to select a business or just fetch their primary one?
        // For simplicity, we assume we upgrade the business associated with the user.
        // Actually, the initialize endpoint expects a businessId.
        // So we need to fetch user's businesses first.

        try {
            setLoading(plan);
            // Fetch user's businesses
            const res = await fetch('/api/admin/businesses'); // Reusing admin listing but filter for owner?
            // Better: create a lightweight endpoint or use existing one.
            // Let's assume we can get it from the session if we added it, but let's try to fetch
            // Actually, let's fetch from /api/businesses?ownerId=... if supported or just /api/user/business

            // Hack: For now, let's assume the user has access to their business ID via dashboard or just fetch it here.
            // Let's fetch the first business owned by the user.
            const bizRes = await fetch(`/api/businesses/search?q=${session.user.email}`); // Search by owner email if implemented?
            // No, let's use the dashboard logic: fetch all businesses and find the one owned by user.
            // We really need a "getMyBusinesses" endpoint. 
            // Let's assume the user is on the dashboard or we redirect them to dashboard to click "Upgrade".
            // But this is a Pricing Page. 

            // Strategy: Initiate payment requires businessId. 
            // If we don't have it, we can't start. 
            // Let's Fetch /api/businesses then filter.
            const allBizRes = await fetch('/api/businesses/search?limit=100');
            const allBiz = await allBizRes.json();
            const myBiz = allBiz.find((b: any) => b.ownerId === session.user.id);

            if (!myBiz) {
                alert('You need to create a business first!');
                router.push('/add-business');
                return;
            }

            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    businessId: myBiz.id
                })
            });

            const data = await response.json();

            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                alert(data.error || 'Payment initialization failed');
                setLoading(null);
            }

        } catch (error) {
            console.error(error);
            alert('An error occurred');
            setLoading(null);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Grow Your Business with Eagle Search</h1>
                <p className={styles.subtitle}>Choose the plan that fits your needs and start getting more customers today.</p>
            </div>

            <div className={styles.pricingGrid}>
                {/* SILVER PLAN */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.planName}>Silver</h2>
                        <div className={styles.price}>₦10,000<span className={styles.period}>/mo</span></div>
                        <p className={styles.planDesc}>Great for small businesses</p>
                    </div>
                    <ul className={styles.features}>
                        <li><Check size={16} /> Standard Listing</li>
                        <li><Check size={16} /> <strong>Verified Badge</strong></li>
                        <li><Check size={16} /> 10 Photos</li>
                        <li><Check size={16} /> Customer Reviews</li>
                        <li className={styles.disabled}>Analytics Dashboard</li>
                        <li className={styles.disabled}>Featured Homepage Spot</li>
                    </ul>
                    <button
                        className={styles.btn}
                        onClick={() => handleSubscribe('SILVER')}
                        disabled={!!loading}
                    >
                        {loading === 'SILVER' ? <Loader2 className="animate-spin" /> : 'Choose Silver'}
                    </button>
                </div>

                {/* GOLD PLAN */}
                <div className={`${styles.card} ${styles.popular}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.badge}>Most Popular</div>
                        <h2 className={styles.planName}>Gold</h2>
                        <div className={styles.price}>₦25,000<span className={styles.period}>/mo</span></div>
                        <p className={styles.planDesc}>For growing brands</p>
                    </div>
                    <ul className={styles.features}>
                        <li><Check size={16} /> <strong>Verified Badge</strong> (Blue Check)</li>
                        <li><Check size={16} /> <strong>Advanced Analytics</strong></li>
                        <li><Check size={16} /> Priority Ranking</li>
                        <li><Check size={16} /> 30 Photos</li>
                        <li><Check size={16} /> WhatsApp Direct Link</li>
                        <li className={styles.disabled}>Featured Homepage Spot</li>
                    </ul>
                    <button
                        className={styles.btn}
                        onClick={() => handleSubscribe('GOLD')}
                        disabled={!!loading}
                    >
                        {loading === 'GOLD' ? <Loader2 className="animate-spin" /> : 'Choose Gold'}
                    </button>
                </div>

                {/* PLATINUM PLAN */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.planName}>Platinum</h2>
                        <div className={styles.price}>₦50,000<span className={styles.period}>/mo</span></div>
                        <p className={styles.planDesc}>Maximum domination</p>
                    </div>
                    <ul className={styles.features}>
                        <li><Check size={16} /> <strong>All Gold Features</strong></li>
                        <li><Check size={16} /> <strong>Featured on Homepage</strong></li>
                        <li><Check size={16} /> Video Cover Image</li>
                        <li><Check size={16} /> Social Media Promotion</li>
                        <li><Check size={16} /> Unlimited Photos</li>
                        <li><Check size={16} /> SEO & Blog Feature</li>
                    </ul>
                    <button
                        className={styles.btn}
                        onClick={() => handleSubscribe('PLATINUM')}
                        disabled={!!loading}
                    >
                        {loading === 'PLATINUM' ? <Loader2 className="animate-spin" /> : 'Choose Platinum'}
                    </button>
                </div>
            </div>
        </main>
    );
}
