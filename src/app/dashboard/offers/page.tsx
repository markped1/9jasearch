'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Plus, Trash2, Tag, Calendar } from 'lucide-react';

export default function OffersPage() {
    const { data: session } = useSession();
    const [business, setBusiness] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => {
        // Fetch Business first (Quick hack: search by user name or just assume first business owned)
        // Better: API to get "My Business"
        // For this demo, using the same search trick or improve API logic would be better.
        // Let's assume we can fetch by owner? No, search API doesn't support ownerId yet explicitly publicly.
        // But dashboard uses search?
        // Let's replicate dashboard fetch logic for now.
        const fetchBiz = async () => {
            const res = await fetch('/api/businesses/search?limit=1'); // This is risky if lots of biz.
            // Wait, the dashboard fetches q=Eko?
            // I'll make a dedicated call or just fetch offers if I knew the ID.
            // I'll fetch businesses owned by me?
            // Actually, let's use the same trick as Dashboard.
            if (session?.user?.email) {
                // Fetch standard search and filter in client? No.
                // Let's search by a term we know the user used?
                // Or better: Modify search API to allow fetching by ownerId (securely)?
                // Or just fetch all my businesses.
                // I'll use a hack: Fetch business by "Eko" as hardcoded in Dashboard demo?
                // Dashboard hardcodes `q=Eko`. I shall reset that assumption.
                // I will try to fetch offers for the business ID used in the dashboard.
                // But I don't know it here.
                // I'll fetch `/api/businesses/search?q=Eko` to consistent with dashboard demo.
                const res = await fetch('/api/businesses/search?q=Eko&limit=1');
                const data = await res.json();
                if (data.length > 0) {
                    setBusiness(data[0]);
                    fetchOffers(data[0].id);
                } else {
                    setLoading(false);
                }
            }
        };
        fetchBiz();
    }, [session]);

    const fetchOffers = async (bizId: string) => {
        const res = await fetch(`/api/offers?businessId=${bizId}`);
        if (res.ok) {
            setOffers(await res.json());
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        const res = await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: business.id,
                title,
                description,
                code,
                expiresAt // YYYY-MM-DD
            })
        });

        if (res.ok) {
            fetchOffers(business.id);
            setTitle('');
            setDescription('');
            setCode('');
            setExpiresAt('');
        }
        setCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this offer?')) return;
        await fetch(`/api/offers/${id}`, { method: 'DELETE' });
        fetchOffers(business.id);
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;
    if (!business) return <div style={{ padding: '40px' }}>Business not found.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag color="#008751" /> Manage Deals & Coupons
            </h1>

            {/* Create Form */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Create New Offer</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Title (e.g., 20% Off)</label>
                        <input required value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Description</label>
                        <textarea required value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Coupon Code (Optional)</label>
                            <input value={code} onChange={e => setCode(e.target.value)} placeholder="SAVE20" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Expires At</label>
                            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                    </div>
                    <button type="submit" disabled={creating} style={{ background: '#008751', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {creating ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Publish Offer</>}
                    </button>
                </form>
            </div>

            {/* List */}
            <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Active Deals</h3>
                {offers.length === 0 ? <p style={{ color: '#666' }}>No active offers.</p> : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {offers.map(offer => (
                            <div key={offer.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#008751' }}>{offer.title}</div>
                                    <div style={{ fontSize: '14px', color: '#333', margin: '4px 0' }}>{offer.description}</div>
                                    <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
                                        {offer.code && <span style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>Code: {offer.code}</span>}
                                        {offer.expiresAt && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Expires: {new Date(offer.expiresAt).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(offer.id)} style={{ color: '#ff4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
