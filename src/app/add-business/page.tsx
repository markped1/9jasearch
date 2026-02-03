'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, MapPin, Phone, Globe, ChevronRight, ChevronLeft,
    CheckCircle2, Loader2, Mail, ShieldCheck, Smartphone, Sparkles,
    Info
} from 'lucide-react';
import styles from './AddBusiness.module.css';
import { BUSINESS_CATEGORIES } from '@/lib/categories';
import BusinessCard from '@/components/search/BusinessCard';

export default function AddBusiness() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Filter categories to ensure we only have the unique ones requested
    const categories = Array.from(new Set(BUSINESS_CATEGORIES)).sort();

    // OTP Specific States
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verifyingMobile, setVerifyingMobile] = useState(false);
    const [resendCooldown, setResendCooldown] = useState<{ email: number, mobile: number }>({ email: 0, mobile: 0 });
    const [businessId, setBusinessId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Hotels & Resorts',
        description: '',
        address: '',
        city: 'Lagos',
        state: 'Lagos',
        email: '',
        phone: '+234',
        whatsapp: '+234',
        website: '',
        openingTime: '9:00 AM',
        closingTime: '6:00 PM',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Special handling for Phone and WhatsApp to enforce +234 + 10 digits
        if (name === 'phone' || name === 'whatsapp') {
            const prefix = '+234';
            // Prevent user from removing the prefix
            if (!value.startsWith(prefix)) {
                return;
            }
            // Strip non-digits after prefix
            const digits = value.slice(prefix.length).replace(/\D/g, '');
            // Limit to 10 digits
            const truncated = digits.slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: prefix + truncated }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = async () => {
        if (step === 3) {
            setLoading(true);
            try {
                // Phase 6: Sync creation before OTP
                const res = await fetch('/api/businesses/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.id) {
                    setBusinessId(data.id);
                    sendOTP('EMAIL', formData.email);
                    sendOTP('MOBILE', formData.phone);
                } else {
                    throw new Error("Failed to create business");
                }
            } catch (err) {
                console.error("Early creation error", err);
                alert("We couldn't initialize your listing. Please check your connection.");
                return;
            } finally {
                setLoading(false);
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const sendOTP = async (type: 'EMAIL' | 'MOBILE', target: string) => {
        try {
            await fetch('/api/verify/otp', {
                method: 'POST',
                body: JSON.stringify({ action: 'send', target, type })
            });
        } catch (err) {
            console.warn("OTP Send error (skipped for demo stability)", err);
        }
    };

    const verifyOTP = async (type: 'EMAIL' | 'MOBILE', target: string, token: string) => {
        if (type === 'EMAIL') setVerifyingEmail(true);
        else setVerifyingMobile(true);

        try {
            const res = await fetch('/api/verify/otp', {
                method: 'POST',
                body: JSON.stringify({ action: 'verify', target, token, type, businessId })
            });
            const data = await res.json();
            if (data.success) {
                if (type === 'EMAIL') setEmailVerified(true);
                else setMobileVerified(true);
            } else {
                alert(data.error || "Verification failed");
                if (type === 'EMAIL') setEmailOtp('');
                else setMobileOtp('');
            }
        } catch (err) {
            console.error("Verify error", err);
            alert("Connection error during verification");
        } finally {
            if (type === 'EMAIL') setVerifyingEmail(false);
            else setVerifyingMobile(false);
        }
    };

    const handleResend = async (type: 'EMAIL' | 'MOBILE') => {
        const target = type === 'EMAIL' ? formData.email : formData.phone;
        await sendOTP(type, target);

        // Simple cooldown
        setResendCooldown(prev => ({ ...prev, [type.toLowerCase()]: 30 }));
        const timer = setInterval(() => {
            setResendCooldown(prev => {
                const val = prev[type.toLowerCase() as 'email' | 'mobile'];
                if (val <= 1) {
                    clearInterval(timer);
                    return { ...prev, [type.toLowerCase()]: 0 };
                }
                return { ...prev, [type.toLowerCase()]: val - 1 };
            });
        }, 1000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Just transition to success as the API already updated status
        setSubmitted(true);
    };

    // Prepare preview data to match BusinessCard props
    const previewBusiness = {
        id: 'preview',
        slug: 'preview',
        name: formData.name || 'Your Business Name',
        category: formData.category,
        address: formData.address || 'Street Address',
        city: formData.city || 'City',
        state: formData.state || 'State',
        phone: formData.phone || 'Phone Number',
        rating: 4.5,
        reviewCount: 0,
        isVerified: true,
        tags: ['New Listing', 'Verified'].join(' , '),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime
    };

    if (submitted) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.wizardLayout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.successOverlay}>
                        <div className={styles.successOrbit}>
                            <CheckCircle2 size={60} />
                        </div>
                        <h1 className={styles.title}>Welcome Aboard!</h1>
                        <p className={styles.subtitle}>
                            <strong>{formData.name}</strong> is now registered. Identity verify check successful.
                            <br />Your listing will be live after a quick quality review.
                        </p>
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push('/')} style={{ margin: '0 auto' }}>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.wizardLayout}>
                {/* Left: Form wizard */}
                <div className={styles.formSide}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Join Eagle Search</h1>
                        <p className={styles.subtitle}>Showcase your business to millions of trusted users.</p>
                    </div>

                    <div className={styles.stepIndicator}>
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`${styles.dot} ${step >= s ? styles.activeDot : ''}`}></div>
                        ))}
                    </div>

                    <div className={styles.formSection}>
                        {step === 1 && (
                            <div className={styles.sectionHeader}>
                                <h3><Building2 color="#008751" /> Basic Details</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup + ' ' + styles.fullWidth}>
                                        <label className={styles.inputLabel}>Business Public Name</label>
                                        <input className={styles.inputField} name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Category</label>
                                        <select className={styles.inputField} name="category" value={formData.category} onChange={handleChange}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Owners Email (Private)</label>
                                        <input className={styles.inputField} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="owner@gmail.com" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.sectionHeader}>
                                <h3><MapPin color="#008751" /> Reach & Contact</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup + ' ' + styles.fullWidth}>
                                        <label className={styles.inputLabel}>Physical Address</label>
                                        <input className={styles.inputField} name="address" value={formData.address} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>City</label>
                                        <input className={styles.inputField} name="city" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Phone (Global)</label>
                                        <input className={styles.inputField} name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.sectionHeader}>
                                <h3><Sparkles color="#008751" /> Store Front</h3>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputGroup + ' ' + styles.fullWidth}>
                                        <label className={styles.inputLabel}>Business Bio</label>
                                        <textarea className={styles.inputField} name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="What makes your business special?" />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Opening Time</label>
                                        <input className={styles.inputField} name="openingTime" value={formData.openingTime} onChange={handleChange} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Closing Time</label>
                                        <input className={styles.inputField} name="closingTime" value={formData.closingTime} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className={styles.sectionHeader}>
                                <h3><ShieldCheck color="#008751" /> Identity Lock</h3>
                                <p style={{ color: '#666', marginBottom: '20px' }}>Enter the OTPs sent to your email and phone to activate the listing.</p>

                                <div style={{ background: '#f9fdfb', padding: '20px', borderRadius: '15px', border: '1px solid #eefbf4', marginBottom: '20px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '8px' }}>
                                            <Mail color={emailVerified ? '#008751' : '#ccc'} />
                                            <input
                                                className={styles.inputField}
                                                style={{ flex: 1 }}
                                                placeholder="Email OTP (4 digits)"
                                                value={emailOtp}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    setEmailOtp(val);
                                                    if (val.length === 4) verifyOTP('EMAIL', formData.email, val);
                                                }}
                                                disabled={emailVerified || verifyingEmail}
                                                maxLength={4}
                                            />
                                            {verifyingEmail && <Loader2 className="animate-spin" size={20} color="#008751" />}
                                            {emailVerified && <CheckCircle2 color="#008751" />}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleResend('EMAIL')}
                                                disabled={resendCooldown.email > 0 || emailVerified}
                                                style={{ background: 'none', border: 'none', color: '#008751', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                            >
                                                {resendCooldown.email > 0 ? `Resend in ${resendCooldown.email}s` : 'Resend Email OTP'}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '8px' }}>
                                            <Smartphone color={mobileVerified ? '#008751' : '#ccc'} />
                                            <input
                                                className={styles.inputField}
                                                style={{ flex: 1 }}
                                                placeholder="Mobile OTP (4 digits)"
                                                value={mobileOtp}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    setMobileOtp(val);
                                                    if (val.length === 4) verifyOTP('MOBILE', formData.phone, val);
                                                }}
                                                disabled={mobileVerified || verifyingMobile}
                                                maxLength={4}
                                            />
                                            {verifyingMobile && <Loader2 className="animate-spin" size={20} color="#008751" />}
                                            {mobileVerified && <CheckCircle2 color="#008751" />}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleResend('MOBILE')}
                                                disabled={resendCooldown.mobile > 0 || mobileVerified}
                                                style={{ background: 'none', border: 'none', color: '#008751', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                            >
                                                {resendCooldown.mobile > 0 ? `Resend in ${resendCooldown.mobile}s` : 'Resend Mobile OTP'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {step > 1 && (
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={prevStep}>
                                <ChevronLeft /> Back
                            </button>
                        )}
                        {step < 4 ? (
                            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={nextStep}>
                                Continue <ChevronRight />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnPrimary} ${(!emailVerified || !mobileVerified || loading) ? styles.disabled : ''}`}
                                disabled={!emailVerified || !mobileVerified || loading}
                                onClick={handleSubmit}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Activate My Listing'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Immersive Preview */}
                <div className={styles.previewSide}>
                    <div className={styles.previewLabel}>LIVE PREVIEW</div>
                    <div className={styles.cardShadow}>
                        <BusinessCard business={previewBusiness as any} />
                    </div>
                    <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.8 }}>
                        <Info size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        <span style={{ fontSize: '13px' }}>This is exactly how your business will appear to users.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
