'use client';

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Loader2 } from 'lucide-react';

interface Payment {
    id: string;
    reference: string;
    amount: number;
    plan: string;
    status: string;
    createdAt: string;
    business: { name: string; city: string } | null;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch('/api/admin/payments');
                const data = await res.json();
                setPayments(data.payments || []);
                setTotalRevenue(data.totalRevenue || 0);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const statusBadge = (status: string) => {
        const map: Record<string, { bg: string; color: string; label: string }> = {
            success: { bg: '#e8f5e9', color: '#008751', label: 'Success' },
            pending: { bg: '#fef9e7', color: '#f39c12', label: 'Pending' },
            failed: { bg: '#fdecea', color: '#e74c3c', label: 'Failed' },
        };
        const s = map[status] || { bg: '#f0f0f0', color: '#666', label: status };
        return (
            <span style={{
                padding: '4px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '600',
                background: s.bg, color: s.color,
            }}>
                {s.label}
            </span>
        );
    };

    const planBadge = (plan: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            PLATINUM: { bg: '#f3e8ff', color: '#7c3aed' },
            GOLD: { bg: '#fef9e7', color: '#d97706' },
            SILVER: { bg: '#f0f0f0', color: '#6b7280' },
        };
        const s = map[plan] || { bg: '#f0f0f0', color: '#666' };
        return (
            <span style={{
                padding: '4px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '600',
                background: s.bg, color: s.color,
            }}>
                {plan}
            </span>
        );
    };

    const successCount = payments.filter(p => p.status === 'success').length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;

    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#333' }}>Payments</h1>
            <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>Track all transactions and subscription payments</p>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard
                    label="Total Revenue"
                    value={`₦${totalRevenue.toLocaleString()}`}
                    icon={TrendingUp}
                    color="#008751"
                    bg="#e8f5e9"
                />
                <StatCard
                    label="Successful Payments"
                    value={successCount}
                    icon={CreditCard}
                    color="#3498db"
                    bg="#eaf6fc"
                />
                <StatCard
                    label="Pending Payments"
                    value={pendingCount}
                    icon={CreditCard}
                    color="#f39c12"
                    bg="#fef9e7"
                />
                <StatCard
                    label="Total Transactions"
                    value={payments.length}
                    icon={CreditCard}
                    color="#9b59b6"
                    bg="#f5eef8"
                />
            </div>

            {/* Table Card */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                        <Loader2 className="animate-spin" size={32} color="#008751" style={{ margin: '0 auto 12px' }} />
                        <p>Loading payments...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
                                    {['Business Name', 'Amount', 'Plan', 'Status', 'Date'].map(col => (
                                        <th key={col} style={{
                                            padding: '14px 20px', textAlign: 'left',
                                            fontSize: '12px', fontWeight: '700', color: '#888',
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                        }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                                            No payments found
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment, i) => (
                                        <tr key={payment.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                                                    {payment.business?.name || 'Unknown Business'}
                                                </div>
                                                {payment.business?.city && (
                                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                                                        {payment.business.city}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px', fontWeight: '700', color: '#008751', fontSize: '15px' }}>
                                                ₦{payment.amount.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>{planBadge(payment.plan)}</td>
                                            <td style={{ padding: '16px 20px' }}>{statusBadge(payment.status)}</td>
                                            <td style={{ padding: '16px 20px', fontSize: '13px', color: '#888' }}>
                                                {new Date(payment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }: {
    label: string; value: string | number; icon: any; color: string; bg: string;
}) {
    return (
        <div style={{
            background: 'white', padding: '22px', borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <div style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#333', marginTop: '4px' }}>{value}</div>
            </div>
        </div>
    );
}
