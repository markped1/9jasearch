'use client';

import { useEffect, useState } from 'react';
import {
    ShieldCheck, XCircle, Clock, CheckCircle2,
    Loader2, User, Building2, Phone, Mail,
    FileText, CreditCard, AlertCircle, Eye
} from 'lucide-react';

interface KYCRecord {
    id: string;
    businessId: string;
    businessSize: string;
    nin?: string;
    ninName?: string;
    cacNumber?: string;
    cacName?: string;
    taxId?: string;
    directorName?: string;
    directorPhone?: string;
    status: string;
    reviewNote?: string;
    reviewedAt?: string;
    createdAt: string;
    documents?: string | null;
    business?: {
        id: string;
        name: string;
        category: string;
        city: string;
        state: string;
        email: string;
        phone: string;
        status: string;
    };
}

export default function AdminKYCPage() {
    const [records, setRecords] = useState<KYCRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
    const [selected, setSelected] = useState<KYCRecord | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const fetchRecords = async (status = filter) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/kyc?status=${status}`);
            const data = await res.json();
            setRecords(data.records || []);
        } catch {
            showToast('Failed to load KYC records', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(filter); }, [filter]);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAction = async (kycId: string, action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT' && !rejectNote.trim()) {
            showToast('Please enter a reason for rejection', 'error');
            return;
        }
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/kyc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kycId, action, note: rejectNote }),
            });
            if (res.ok) {
                showToast(
                    action === 'APPROVE'
                        ? '✅ KYC Approved — business is now live'
                        : '❌ KYC Rejected — business notified',
                    action === 'APPROVE' ? 'success' : 'error'
                );
                setSelected(null);
                setRejectNote('');
                fetchRecords(filter);
            } else {
                showToast('Action failed', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { bg: string; color: string; icon: any }> = {
            PENDING: { bg: '#fef9e7', color: '#d97706', icon: Clock },
            APPROVED: { bg: '#e8f5e9', color: '#008751', icon: CheckCircle2 },
            REJECTED: { bg: '#fdecea', color: '#e74c3c', icon: XCircle },
        };
        const s = map[status] || map.PENDING;
        const Icon = s.icon;
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: s.bg, color: s.color }}>
                <Icon size={12} /> {status}
            </span>
        );
    };

    const pending = records.filter(r => r.status === 'PENDING').length;

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, padding: '14px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', background: toast.type === 'success' ? '#008751' : '#e74c3c', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {toast.msg}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#333', margin: 0 }}>KYC Verification</h1>
                    <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
                        Review identity documents submitted by business owners
                    </p>
                </div>
                {pending > 0 && (
                    <div style={{ background: '#fef9e7', border: '1px solid #ffe082', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={18} color="#d97706" />
                        <span style={{ fontWeight: '700', color: '#d97706', fontSize: '14px' }}>{pending} pending review{pending !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
                        background: filter === f ? '#008751' : '#f0f0f0',
                        color: filter === f ? 'white' : '#555',
                        transition: 'all 0.15s',
                    }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                        <Loader2 className="animate-spin" size={32} color="#008751" style={{ margin: '0 auto 12px' }} />
                        <p>Loading KYC records...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}>
                        <ShieldCheck size={48} color="#ddd" style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>No {filter.toLowerCase()} KYC records</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
                                    {['Business', 'Type', 'KYC Info', 'Submitted', 'Status', 'Actions'].map(col => (
                                        <th key={col} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((rec, i) => (
                                    <tr key={rec.id} style={{ borderBottom: i < records.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: '700', color: '#333', fontSize: '14px' }}>{rec.business?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{rec.business?.category} · {rec.business?.city}</div>
                                            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{rec.business?.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                                                background: rec.businessSize === 'small' ? '#eaf6fc' : '#f5eef8',
                                                color: rec.businessSize === 'small' ? '#3498db' : '#9b59b6',
                                            }}>
                                                {rec.businessSize === 'small' ? <User size={12} /> : <Building2 size={12} />}
                                                {rec.businessSize === 'small' ? 'Individual' : 'Organisation'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#555' }}>
                                            {rec.businessSize === 'small' ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>NIN: <span style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{rec.nin ? `${rec.nin.slice(0, 4)}****${rec.nin.slice(-3)}` : '—'}</span></div>
                                                    <div style={{ color: '#888', marginTop: '2px' }}>{rec.ninName}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>CAC: {rec.cacNumber}</div>
                                                    <div style={{ color: '#888', marginTop: '2px' }}>{rec.cacName}</div>
                                                    {rec.directorName && <div style={{ color: '#aaa', fontSize: '12px' }}>Dir: {rec.directorName}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#888' }}>
                                            {new Date(rec.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>{statusBadge(rec.status)}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {rec.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => { setSelected(rec); setRejectNote(''); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#e8f5e9', color: '#008751', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <Eye size={14} /> Review
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#aaa' }}>
                                                    {rec.reviewedAt ? new Date(rec.reviewedAt).toLocaleDateString('en-GB') : '—'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#333', margin: 0 }}>Review KYC Submission</h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '20px' }}>✕</button>
                        </div>

                        {/* Business info */}
                        <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: '700', fontSize: '16px', color: '#333', marginBottom: '8px' }}>{selected.business?.name}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#555' }}>
                                <div><span style={{ color: '#aaa' }}>Category:</span> {selected.business?.category}</div>
                                <div><span style={{ color: '#aaa' }}>City:</span> {selected.business?.city}, {selected.business?.state}</div>
                                <div><span style={{ color: '#aaa' }}>Email:</span> {selected.business?.email}</div>
                                <div><span style={{ color: '#aaa' }}>Phone:</span> {selected.business?.phone}</div>
                            </div>
                        </div>

                        {/* KYC details */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #c8e6c9', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: '700', color: '#008751', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {selected.businessSize === 'small' ? <><User size={16} /> Individual / Small Business</> : <><Building2 size={16} /> Large Organisation</>}
                            </div>

                            {selected.businessSize === 'small' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#555', fontWeight: '600' }}>NIN:</span>
                                        <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '16px', letterSpacing: '2px' }}>{selected.nin}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#555', fontWeight: '600' }}>Name on NIN:</span>
                                        <span style={{ fontWeight: '600' }}>{selected.ninName}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                    <Row label="CAC Number" value={selected.cacNumber} />
                                    <Row label="Company Name" value={selected.cacName} />
                                    {selected.taxId && <Row label="TIN" value={selected.taxId} />}
                                    <Row label="Director" value={selected.directorName} />
                                    {selected.directorPhone && <Row label="Director Phone" value={selected.directorPhone} />}
                                </div>
                            )}
                        </div>

                        {/* Verification checklist — what admin should do */}
                        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#7a5c00' }}>
                            <strong>✅ Admin Verification Checklist:</strong>
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selected.businessSize === 'small' ? (
                                    <>
                                        <CheckItem text="Does the name on the ID match the NIN name provided?" />
                                        <CheckItem text="Is the ID card photo clear and unaltered?" />
                                        <CheckItem text="Does the selfie clearly show the person holding the ID?" />
                                        <CheckItem text="Does the face in the selfie match the ID photo?" />
                                        <CheckItem text="Call the registered phone number to confirm identity" />
                                        <CheckItem text="If utility bill provided, does the address match?" />
                                    </>
                                ) : (
                                    <>
                                        <CheckItem text="Is the CAC number format valid? (RC-XXXXXXX or BN-XXXXXXX)" />
                                        <CheckItem text="Does the company name on the CAC cert match what was entered?" />
                                        <CheckItem text="Is the CAC certificate clearly legible and unaltered?" />
                                        <CheckItem text="Does the director name match the ID card provided?" />
                                        <CheckItem text="Call the director phone number to confirm" />
                                        <CheckItem text="Cross-check CAC number at search.cac.gov.ng (free public search)" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Uploaded documents */}
                        {selected.documents && (() => {
                            try {
                                const d = JSON.parse(selected.documents);
                                return (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontWeight: '700', color: '#333', marginBottom: '12px', fontSize: '14px' }}>📎 Uploaded Documents</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {d.idCard && <DocPreview label="ID Card" src={d.idCard} />}
                                            {d.selfieWithId && <DocPreview label="Selfie with ID" src={d.selfieWithId} />}
                                            {d.utilityBill && <DocPreview label="Utility Bill" src={d.utilityBill} />}
                                            {d.cacCert && <DocPreview label="CAC Certificate" src={d.cacCert} />}
                                        </div>
                                        {!d.idCard && !d.selfieWithId && !d.cacCert && (
                                            <p style={{ color: '#aaa', fontSize: '13px' }}>No documents uploaded</p>
                                        )}
                                    </div>
                                );
                            } catch { return null; }
                        })()}

                        {/* Rejection note */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
                                Rejection Reason (required if rejecting)
                            </label>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="e.g. NIN does not match provided name, CAC number not found..."
                                rows={3}
                                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => handleAction(selected.id, 'APPROVE')}
                                disabled={actionLoading}
                                style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: '#008751', color: 'white', fontSize: '15px', fontWeight: '700', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: actionLoading ? 0.7 : 1 }}
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Approve & Activate</>}
                            </button>
                            <button
                                onClick={() => handleAction(selected.id, 'REJECT')}
                                disabled={actionLoading}
                                style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '2px solid #e74c3c', background: 'white', color: '#e74c3c', fontSize: '15px', fontWeight: '700', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: actionLoading ? 0.7 : 1 }}
                            >
                                <XCircle size={18} /> Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ label, value }: { label: string; value?: string | null }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555', fontWeight: '600' }}>{label}:</span>
            <span style={{ fontWeight: '600' }}>{value || '—'}</span>
        </div>
    );
}

function CheckItem({ text }: { text: string }) {
    return (
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ marginTop: '2px', accentColor: '#008751', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', lineHeight: '1.5' }}>{text}</span>
        </label>
    );
}

function DocPreview({ label, src }: { label: string; src: string }) {
    const isPdf = src.startsWith('data:application/pdf') || src.endsWith('.pdf');
    return (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '6px 10px', background: '#f9f9f9', fontSize: '11px', fontWeight: '700', color: '#555', borderBottom: '1px solid #e0e0e0' }}>
                {label}
            </div>
            {isPdf ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                    📄 PDF Document
                    <br />
                    <a href={src} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#008751', fontWeight: '600', fontSize: '12px' }}>
                        Open PDF
                    </a>
                </div>
            ) : (
                <a href={src} target="_blank" rel="noopener noreferrer">
                    <img src={src} alt={label}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
                </a>
            )}
        </div>
    );
}
