'use client';

import { useState } from 'react';
import { Globe, Mail, Phone, Search, FileText, Building2, ToggleLeft, ToggleRight, Save, CheckCircle2 } from 'lucide-react';

interface Settings {
    siteName: string;
    contactEmail: string;
    contactPhone: string;
    metaTitle: string;
    metaDescription: string;
    autoApprove: boolean;
    maxFreeListings: number;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        siteName: '9jaSearch',
        contactEmail: 'support@9jasearch.com',
        contactPhone: '+234 800 9JA SEARCH',
        metaTitle: '9jaSearch – Find Local Businesses in Nigeria',
        metaDescription: 'Discover verified local businesses, services, and professionals across Nigeria. Search by category, city, or keyword on 9jaSearch.',
        autoApprove: false,
        maxFreeListings: 1,
    });

    const [toast, setToast] = useState(false);
    const [saving, setSaving] = useState(false);

    const update = (key: keyof Settings, value: string | boolean | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save delay (no backend needed)
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        setToast(true);
        setTimeout(() => setToast(false), 3000);
    };

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    padding: '14px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
                    background: '#008751', color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <CheckCircle2 size={16} />
                    Settings saved successfully
                </div>
            )}

            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#333' }}>Settings</h1>
            <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>Configure platform-wide settings for 9jaSearch</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '760px' }}>

                {/* Platform Info */}
                <Section title="Platform Info" icon={Globe} iconColor="#008751" iconBg="#e8f5e9">
                    <Field
                        label="Site Name"
                        icon={Globe}
                        value={settings.siteName}
                        onChange={v => update('siteName', v)}
                        placeholder="9jaSearch"
                    />
                    <Field
                        label="Contact Email"
                        icon={Mail}
                        value={settings.contactEmail}
                        onChange={v => update('contactEmail', v)}
                        placeholder="support@9jasearch.com"
                        type="email"
                    />
                    <Field
                        label="Contact Phone"
                        icon={Phone}
                        value={settings.contactPhone}
                        onChange={v => update('contactPhone', v)}
                        placeholder="+234 800 9JA SEARCH"
                        type="tel"
                    />
                </Section>

                {/* SEO Settings */}
                <Section title="SEO Settings" icon={Search} iconColor="#3498db" iconBg="#eaf6fc">
                    <Field
                        label="Meta Title"
                        icon={FileText}
                        value={settings.metaTitle}
                        onChange={v => update('metaTitle', v)}
                        placeholder="9jaSearch – Find Local Businesses in Nigeria"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} color="#aaa" />
                            Meta Description
                        </label>
                        <textarea
                            value={settings.metaDescription}
                            onChange={e => update('metaDescription', e.target.value)}
                            rows={3}
                            style={{
                                padding: '11px 14px', borderRadius: '10px',
                                border: '1px solid #e0e0e0', fontSize: '14px',
                                outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                                color: '#333', lineHeight: '1.5',
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#aaa' }}>{settings.metaDescription.length} / 160 characters</span>
                    </div>
                </Section>

                {/* Business Listing Settings */}
                <Section title="Business Listing Settings" icon={Building2} iconColor="#9b59b6" iconBg="#f5eef8">
                    {/* Auto-approve toggle */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', background: '#f9f9f9', borderRadius: '10px',
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>Auto-approve Listings</div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                Automatically approve new business listings without manual review
                            </div>
                        </div>
                        <button
                            onClick={() => update('autoApprove', !settings.autoApprove)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                            aria-label={settings.autoApprove ? 'Disable auto-approve' : 'Enable auto-approve'}
                        >
                            {settings.autoApprove
                                ? <ToggleRight size={36} color="#008751" />
                                : <ToggleLeft size={36} color="#ccc" />
                            }
                        </button>
                    </div>

                    {/* Max free listings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={14} color="#aaa" />
                            Max Free Listings per User
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={settings.maxFreeListings}
                                onChange={e => update('maxFreeListings', parseInt(e.target.value) || 1)}
                                style={{
                                    width: '100px', padding: '11px 14px',
                                    borderRadius: '10px', border: '1px solid #e0e0e0',
                                    fontSize: '14px', outline: 'none', color: '#333',
                                }}
                            />
                            <span style={{ fontSize: '13px', color: '#888' }}>listing(s) per account on the free tier</span>
                        </div>
                    </div>
                </Section>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '13px 28px', borderRadius: '12px', border: 'none',
                            background: saving ? '#aaa' : '#008751', color: 'white',
                            fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                        }}
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Section({ title, icon: Icon, iconColor, iconBg, children }: {
    title: string; icon: any; iconColor: string; iconBg: string; children: React.ReactNode;
}) {
    return (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{
                padding: '18px 24px', borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', background: iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={18} color={iconColor} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#333', margin: 0 }}>{title}</h2>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {children}
            </div>
        </div>
    );
}

function Field({ label, icon: Icon, value, onChange, placeholder, type = 'text' }: {
    label: string; icon: any; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={14} color="#aaa" />
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    padding: '11px 14px', borderRadius: '10px',
                    border: '1px solid #e0e0e0', fontSize: '14px',
                    outline: 'none', color: '#333',
                }}
            />
        </div>
    );
}
