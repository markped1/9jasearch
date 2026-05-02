'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.stats) {
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><Loader2 className="animate-spin" /> Loading stats...</div>;
    if (!stats) return <div>Error loading stats</div>;

    const {
        totalUsers = 0,
        totalBusinesses = 0,
        pendingVerifications = 0,
        revenue = 0,
        tiers = { platinum: 0, gold: 0, silver: 0 }
    } = stats?.stats || {};
    const recentPayments = stats?.recentPayments || [];

    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px', color: '#333' }}>Dashboard Overview</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Card label="Total Revenue" value={`₦${revenue.toLocaleString()}`} icon={TrendingUp} color="#008751" bg="#e8f5e9" />
                <Card label="Active Businesses" value={totalBusinesses} icon={Building2} color="#3498db" bg="#eaf6fc" />
                <Card label="Total Users" value={totalUsers} icon={Users} color="#9b59b6" bg="#f5eef8" />
                <Card label="Pending Verifications" value={pendingVerifications} icon={AlertTriangle} color="#f39c12" bg="#fef9e7" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Subscription Tiers */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={20} color="#555" /> Active Subscriptions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <TierRow label="Platinum Plan" count={tiers.platinum} color="#333" />
                        <TierRow label="Gold Plan" count={tiers.gold} color="#f1c40f" />
                        <TierRow label="Silver Plan" count={tiers.silver} color="#95a5a6" />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} color="#555" /> Recent Payments
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentPayments.length === 0 ? <p style={{ color: '#888' }}>No recent payments</p> :
                            recentPayments.map((p: any) => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#333' }}>{p.business?.name || 'Unknown Business'}</div>
                                        <div style={{ color: '#888', fontSize: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontWeight: '700', color: '#008751' }}>+₦{p.amount.toLocaleString()}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ label, value, icon: Icon, color, bg }: any) {
    return (
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '14px', color: '#888', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#333', marginTop: '5px' }}>{value}</div>
            </div>
        </div>
    );
}

function TierRow({ label, count, color }: any) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
                <span style={{ fontWeight: '600', color: '#444' }}>{label}</span>
            </div>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>{count}</span>
        </div>
    );
}
