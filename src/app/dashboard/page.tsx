'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Building2, MessageSquare, Star,
    Settings, Globe, MapPin, Phone, Clock, Save,
    Loader2, AlertCircle, TrendingUp, Zap, CheckCircle2, Tag, Calendar, User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import ImageUploader from '@/components/business/ImageUploader';
import styles from './Dashboard.module.css';

export default function OwnerDashboard() {
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [promoting, setPromoting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: session } = useSession();

    useEffect(() => {
        const fetchBiz = async () => {
            if (!session?.user?.id) return;

            try {
                // Fetch business owned by this user
                const res = await fetch(`/api/businesses/owner`);
                const data = await res.json();

                if (data.id) {
                    setBusiness(data);

                    // Handle payment success from URL
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('payment') === 'success') {
                        handlePaymentSuccess(data.id);
                    }
                } else {
                    setError('You do not have an active business listing yet.');
                }
            } catch (err) {
                setError('Failed to load business data');
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchBiz();
    }, [session]);

    const handlePaymentSuccess = async (id: string) => {
        setSuccess('Payment successful! Your business is now FEATURED.');
        window.history.replaceState({}, '', window.location.pathname);

        try {
            await fetch('/api/payments/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'charge.success',
                    data: { metadata: { businessId: id } }
                })
            });
            const res = await fetch('/api/businesses/search?q=Eko&limit=1');
            const data = await res.json();
            if (data.length > 0) setBusiness(data[0]);
        } catch (err) {
            console.error('Webhook sync error', err);
        }
    };

    const handlePromote = async () => {
        setPromoting(true);
        try {
            const res = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    email: business.email,
                    amount: 500000 // N5,000.00
                })
            });
            const data = await res.json();
            if (data.status && data.data.authorization_url) {
                window.location.href = data.data.authorization_url;
            }
        } catch (err) {
            setError('Failed to initialize payment');
            setPromoting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBusiness((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/businesses/${business.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(business)
            });

            if (res.ok) {
                setSuccess('Business details updated successfully!');
            } else {
                setError('Failed to update business');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleImagesChange = (newImages: string[]) => {
        setBusiness((prev: any) => ({
            ...prev,
            images: JSON.stringify(newImages)
        }));
    };

    const getImagesArray = (): string[] => {
        if (!business?.images) return [];
        try {
            return typeof business.images === 'string'
                ? JSON.parse(business.images)
                : business.images;
        } catch {
            return [];
        }
    };

    if (loading) return <div className={styles.loadingState}><Loader2 className="animate-spin" size={40} /></div>;
    if (error) return <div className={styles.errorState}>{error}</div>;

    return (
        <div className={styles.dashboardContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>EAGLE<span>OWNER</span></div>
                <nav className={styles.nav}>
                    <button className={`${styles.navItem} ${styles.active}`}><LayoutDashboard size={20} /> Overview</button>
                    <button className={styles.navItem}><Building2 size={20} /> My Listing</button>
                    <a href="/dashboard/messages" className={styles.navItem} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <MessageSquare size={20} /> Messages
                    </a>
                    <a href="/dashboard/offers" className={styles.navItem} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Tag size={20} /> Deals
                    </a>
                    <a href="/dashboard/calendar" className={styles.navItem} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Calendar size={20} /> Calendar
                    </a>
                    <button className={styles.navItem}><Star size={20} /> Reviews</button>
                    <button className={styles.navItem}><TrendingUp size={20} /> Analytics</button>
                    <a href="/pricing" className={styles.navItem} style={{ textDecoration: 'none', color: '#b48a27' }}><Zap size={20} /> Upgrade Plan</a>
                    <div className={styles.navSpacer}></div>
                    <button className={styles.navItem}><Settings size={20} /> Settings</button>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className={styles.title}>Welcome back, {business.name}</h1>
                            <p className={styles.subtitle}>Manage your business presence on Eagle Search Naija.</p>
                        </div>

                        {!business.isFeatured && (
                            <button className={styles.promoteBtn} onClick={handlePromote} disabled={promoting}>
                                {promoting ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} /> Promote to Featured</>}
                            </button>
                        )}
                        {business.isFeatured && (
                            <div className={styles.featuredBadge}>
                                <Zap size={16} fill="white" /> Featured Listing
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #fdfbf7 0%, #fff 100%)', border: '1px solid #f0e6d2' }}>
                        <div className={styles.statLabel}>Current Plan</div>
                        <div className={styles.statValue} style={{ color: '#b48a27', fontSize: '24px' }}>
                            {business.tier || 'FREE'}
                        </div>
                        {business.tier !== 'PLATINUM' && (
                            <a href="/pricing" className={styles.upgradeLink} style={{ fontSize: '13px', color: '#008751', fontWeight: 600, display: 'flex', alignItems: 'center', marginTop: '5px', textDecoration: 'none' }}>
                                Upgrade Plan <TrendingUp size={14} style={{ marginLeft: '4px' }} />
                            </a>
                        )}
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Views</div>
                        <div className={styles.statValue}>1,250</div>
                        <div className={styles.statTrend}>+12% this week</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Avg. Rating</div>
                        <div className={styles.statValue} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {business.rating.toFixed(1)} <Star size={24} fill="#FFD700" color="#FFD700" />
                        </div>
                        <div className={styles.statTrend}>From {business.reviewCount} reviews</div>
                    </div>
                </div>

                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <Building2 size={24} color="#008751" />
                        <h2>Edit Business Details</h2>
                    </div>

                    {success && <div className={styles.successAlert}><CheckCircle2 size={18} /> {success}</div>}
                    {error && <div className={styles.errorAlert}><AlertCircle size={18} /> {error}</div>}

                    <form onSubmit={handleSave} className={styles.editForm}>
                        <div className={styles.inputGrid}>
                            <div className={styles.inputGroup}>
                                <label><Building2 size={16} /> Business Name</label>
                                <input name="name" value={business.name} onChange={handleChange} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><Globe size={16} /> Website</label>
                                <input name="website" value={business.website || ''} onChange={handleChange} placeholder="https://..." />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><Phone size={16} /> Phone</label>
                                <input name="phone" value={business.phone} onChange={handleChange} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><MessageSquare size={16} /> WhatsApp</label>
                                <input name="whatsapp" value={business.whatsapp || ''} onChange={handleChange} />
                            </div>
                            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                <label><MapPin size={16} /> Physical Address</label>
                                <input name="address" value={business.address} onChange={handleChange} />
                            </div>
                            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                <label>Description</label>
                                <textarea name="description" value={business.description || ''} onChange={handleChange} rows={5} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><Clock size={16} /> Opening Time</label>
                                <input name="openingTime" value={business.openingTime || ''} onChange={handleChange} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><Clock size={16} /> Closing Time</label>
                                <input name="closingTime" value={business.closingTime || ''} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" className={styles.saveBtn} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                        </button>
                    </form>
                </div>

                {/* Image Gallery Management */}
                <div className={styles.formCard}>
                    <ImageUploader
                        images={getImagesArray()}
                        onImagesChange={handleImagesChange}
                        maxImages={10}
                    />
                    <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                        Upload high-quality images to attract more customers. Changes are saved when you click "Save Changes" above.
                    </p>
                </div>
            </main>
        </div>
    );
}
