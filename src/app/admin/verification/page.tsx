'use client';

import { useEffect, useState } from 'react';
import { CircleCheck, XCircle, MoreVertical, Search, ShieldCheck } from 'lucide-react';

export default function VerificationPage() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch all businesses, filtered client-side for now or add 'status' param
        // For efficiency, we should have a 'status=pending_verification' on the search API 
        // OR just fetch all and filter for ones that MIGHT need verification (e.g. have a request)
        // Since we don't have a rigid request system yet, let's fetch unverified businesses.
        const res = await fetch('/api/businesses/search?verified=false&limit=50');
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: id, action })
            });
            if (res.ok) {
                fetchData(); // Refresh list
            }
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#333' }}>Verification Queue</h1>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Business Name</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Category</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'right', fontSize: '14px', color: '#666' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : businesses.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No pending verifications found.</td></tr>
                        ) : (
                            businesses.map((biz) => (
                                <tr key={biz.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '15px', fontWeight: '600', color: '#333' }}>{biz.name}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{biz.category}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Unverified</span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleAction(biz.id, 'APPROVE')}
                                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#008751', color: 'white', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <CircleCheck size={14} /> Verify
                                        </button>
                                        <button
                                            onClick={() => handleAction(biz.id, 'REJECT')}
                                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', color: '#666', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <XCircle size={14} /> Ignore
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
