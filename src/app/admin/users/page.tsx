'use client';

import { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, Ban, Loader2 } from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    _count: { reviews: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = async (userId: string, action: 'MAKE_ADMIN' | 'SUSPEND') => {
        setActionLoading(`${userId}-${action}`);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
            });
            if (res.ok) {
                showToast(action === 'MAKE_ADMIN' ? 'User promoted to Admin' : 'User suspended', 'success');
                fetchUsers();
            } else {
                showToast('Action failed', 'error');
            }
        } catch {
            showToast('Action failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = users.filter(u =>
        (u.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleBadge = (role: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            ADMIN: { bg: '#e8f5e9', color: '#008751' },
            USER: { bg: '#eaf6fc', color: '#3498db' },
            BUSINESS: { bg: '#fef9e7', color: '#f39c12' },
            SUSPENDED: { bg: '#fdecea', color: '#e74c3c' },
        };
        const s = styles[role] || { bg: '#f0f0f0', color: '#666' };
        return (
            <span style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: s.bg,
                color: s.color,
            }}>
                {role}
            </span>
        );
    };

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    padding: '14px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
                    background: toast.type === 'success' ? '#008751' : '#e74c3c',
                    color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                    {toast.message}
                </div>
            )}

            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#333' }}>Users</h1>
            <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>Manage all registered users on the platform</p>

            {/* Stats + Search Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{
                    background: 'white', padding: '16px 24px', borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '14px'
                }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} color="#008751" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>Total Users</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>{users.length}</div>
                    </div>
                </div>

                <div style={{ position: 'relative', flex: '1', maxWidth: '360px' }}>
                    <Search size={16} color="#aaa" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '11px 14px 11px 40px',
                            borderRadius: '10px', border: '1px solid #e0e0e0',
                            fontSize: '14px', outline: 'none', background: 'white',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
            </div>

            {/* Table Card */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                        <Loader2 className="animate-spin" size={32} color="#008751" style={{ margin: '0 auto 12px' }} />
                        <p>Loading users...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
                                    {['Name', 'Email', 'Role', 'Joined Date', 'Actions'].map(col => (
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
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((user, i) => (
                                        <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        background: '#e8f5e9', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontWeight: '700', color: '#008751', fontSize: '14px',
                                                        flexShrink: 0,
                                                    }}>
                                                        {(user.name || user.email)[0].toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                                                        {user.name || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontSize: '14px', color: '#555' }}>{user.email}</td>
                                            <td style={{ padding: '16px 20px' }}>{roleBadge(user.role)}</td>
                                            <td style={{ padding: '16px 20px', fontSize: '13px', color: '#888' }}>
                                                {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {user.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleAction(user.id, 'MAKE_ADMIN')}
                                                            disabled={actionLoading === `${user.id}-MAKE_ADMIN`}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                                                background: '#e8f5e9', color: '#008751',
                                                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                                opacity: actionLoading === `${user.id}-MAKE_ADMIN` ? 0.6 : 1,
                                                            }}
                                                        >
                                                            {actionLoading === `${user.id}-MAKE_ADMIN`
                                                                ? <Loader2 size={12} className="animate-spin" />
                                                                : <ShieldCheck size={12} />
                                                            }
                                                            Make Admin
                                                        </button>
                                                    )}
                                                    {user.role !== 'SUSPENDED' && (
                                                        <button
                                                            onClick={() => handleAction(user.id, 'SUSPEND')}
                                                            disabled={actionLoading === `${user.id}-SUSPEND`}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                                                background: '#fdecea', color: '#e74c3c',
                                                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                                opacity: actionLoading === `${user.id}-SUSPEND` ? 0.6 : 1,
                                                            }}
                                                        >
                                                            {actionLoading === `${user.id}-SUSPEND`
                                                                ? <Loader2 size={12} className="animate-spin" />
                                                                : <Ban size={12} />
                                                            }
                                                            Suspend
                                                        </button>
                                                    )}
                                                </div>
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
