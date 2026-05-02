'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, MapPin, Phone, Globe, ChevronRight, ChevronLeft,
    CheckCircle2, Loader2, Mail, ShieldCheck, Smartphone, Sparkles,
    Info, CreditCard, FileText, Upload, AlertCircle, Users
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
    const [debugCodes, setDebugCodes] = useState<{ email?: string, mobile?: string }>({});
    const [error, setError] = useState<string | null>(null);

    // ── KYC State ──────────────────────────────────────────────────
    const [businessSize, setBusinessSize] = useState<'small' | 'large'>('small');
    const [kycData, setKycData] = useState({
        nin: '',
        ninName: '',
        cacNumber: '',
        cacName: '',
        taxId: '',
        directorName: '',
        directorPhone: '',
        proofType: 'nin',
        agreeTerms: false,
    });
    const [kycError, setKycError] = useState('');

    // Bank verification state
    const [banks, setBanks] = useState<{name: string; code: string}[]>([]);
    const [bankData, setBankData] = useState({ accountNumber: '', bankCode: '', bankName: '' });
    const [bankVerifying, setBankVerifying] = useState(false);
    const [bankResult, setBankResult] = useState<{
        verified: boolean; bankAccountName?: string; message: string; status: string;
    } | null>(null);

    // Document uploads (base64 previews for display, URLs after upload)
    const [docs, setDocs] = useState<{
        idCard: string | null;       // NIN slip / passport / driver's licence
        selfieWithId: string | null; // Selfie holding ID
        utilityBill: string | null;  // Utility bill / address proof
        cacCert: string | null;      // CAC certificate (large orgs)
    }>({ idCard: null, selfieWithId: null, utilityBill: null, cacCert: null });
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const handleDocUpload = async (field: keyof typeof docs, file: File) => {
        if (!file) return;
        setUploadingDoc(field);
        try {
            // Convert to base64 for preview (in production this would upload to Cloudinary)
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocs(prev => ({ ...prev, [field]: e.target?.result as string }));
                setUploadingDoc(null);
            };
            reader.readAsDataURL(file);
        } catch {
            setUploadingDoc(null);
        }
    };

    // Load banks on mount
    useEffect(() => {
        fetch('/api/kyc/verify-bank')
            .then(r => r.json())
            .then(d => setBanks(d.banks || []))
            .catch(() => {});
    }, []);

    const handleBankVerify = async () => {
        if (!bankData.accountNumber || bankData.accountNumber.length !== 10) {
            setKycError('Please enter a valid 10-digit account number.');
            return;
        }
        if (!bankData.bankCode) {
            setKycError('Please select your bank.');
            return;
        }
        setBankVerifying(true);
        setBankResult(null);
        setKycError('');
        try {
            const res = await fetch('/api/kyc/verify-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountNumber: bankData.accountNumber,
                    bankCode: bankData.bankCode,
                    registeredName: formData.name,
                    businessId: businessId || undefined,
                }),
            });
            const data = await res.json();
            setBankResult(data);
            if (!data.verified && data.error) {
                setKycError(data.error + (data.hint ? ' — ' + data.hint : ''));
            }
        } catch {
            setKycError('Connection error. Please try again.');
        } finally {
            setBankVerifying(false);
        }
    };

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
        // Step 1 Validation
        if (step === 1) {
            if (!formData.name) return alert("Please enter your business name");
            if (!formData.email) return alert("Please enter your email address");
            if (!formData.email.includes('@')) return alert("Please enter a valid email address");
        }

        // Step 2 Validation
        if (step === 2) {
            if (!formData.address) return alert("Please enter your physical address");
            if (!formData.city) return alert("Please enter your city");
            if (!formData.phone || formData.phone.length < 14) return alert("Please enter a valid phone number (+234 + 10 digits)");
        }

        // Step 4 KYC validation — bank verification
        if (step === 4) {
            setKycError('');
            if (!kycData.agreeTerms) {
                setKycError('You must agree to the Terms of Service to continue.');
                return;
            }
            if (!bankResult?.verified) {
                setKycError('Please verify your bank account before continuing.');
                return;
            }
        }

        if (step === 4) {
            setLoading(true);
            try {
                // Phase 6: Sync creation before OTP
                const res = await fetch('/api/businesses/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, kyc: { ...kycData, businessSize, docs } })
                });

                let data;
                try {
                    data = await res.json();
                } catch (jsonErr) {
                    console.error("JSON Parse Error:", jsonErr);
                    throw new Error(`Server returned an invalid response (${res.status}). Please try again later.`);
                }

                if (res.ok && data.id) {
                    setBusinessId(data.id);
                    sendOTP('EMAIL', formData.email);
                    sendOTP('MOBILE', formData.phone);
                } else {
                    const errorMsg = data.details || data.error || "Failed to initialize listing";
                    setError(errorMsg);
                    throw new Error(errorMsg);
                }
            } catch (err: any) {
                console.error("Early creation error", err);
                alert(`[DEBUG] Registration Error: ${err.message || "Unknown Connection Issue"}. Please ensure all fields are filled correctly.`);
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
            const res = await fetch('/api/verify/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send', target, type, debug: true })
            });
            const data = await res.json();
            if (data.debugCode) {
                setDebugCodes(prev => ({ ...prev, [type.toLowerCase()]: data.debugCode }));
            }
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
                headers: { 'Content-Type': 'application/json' },
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
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push('/dashboard')} style={{ margin: '0 auto' }}>
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
                        <h1 className={styles.title}>Join 9jaSearch</h1>
                        <p className={styles.subtitle}>Showcase your business to millions of trusted users.</p>
                    </div>

                    <div className={styles.stepIndicator}>
                        {[1, 2, 3, 4, 5].map(s => (
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
                                        <input className={styles.inputField} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="owner@gmail.com" required />
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

                        {/* ── STEP 4: Bank Verification via Flutterwave ── */}
                        {step === 4 && (
                            <div className={styles.sectionHeader}>
                                <h3><CreditCard color="#008751" /> Identity Verification</h3>

                                {/* How it works */}
                                <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1b5e20', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🏦 Instant verification via Flutterwave
                                    </div>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#2e7d32', lineHeight: '1.6' }}>
                                        Enter your Nigerian bank account number. Flutterwave looks up the name registered with your bank.
                                        If it matches your registered name, you are <strong>instantly verified</strong> — no documents, no waiting.
                                        Your account number is <strong>never stored</strong> and <strong>no money is charged</strong>.
                                    </p>
                                </div>

                                {kycError && (
                                    <div style={{ background: '#fdecea', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={16} /> {kycError}
                                    </div>
                                )}

                                {/* Bank selector */}
                                <div className={styles.inputGroup} style={{ marginBottom: '14px' }}>
                                    <label className={styles.inputLabel}>Select Your Bank *</label>
                                    <select
                                        className={styles.inputField}
                                        value={bankData.bankCode}
                                        onChange={e => {
                                            const bank = banks.find(b => b.code === e.target.value);
                                            setBankData(p => ({ ...p, bankCode: e.target.value, bankName: bank?.name || '' }));
                                            setBankResult(null);
                                        }}
                                    >
                                        <option value="">-- Select your bank --</option>
                                        {banks.map(b => (
                                            <option key={b.code} value={b.code}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Account number + verify button */}
                                <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
                                    <label className={styles.inputLabel}>Account Number (10 digits) *</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            className={styles.inputField}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={10}
                                            placeholder="e.g. 0123456789"
                                            value={bankData.accountNumber}
                                            onChange={e => {
                                                setBankData(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                                                setBankResult(null);
                                            }}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleBankVerify}
                                            disabled={bankVerifying || bankData.accountNumber.length !== 10 || !bankData.bankCode}
                                            style={{
                                                padding: '0 18px', borderRadius: '8px', border: 'none', whiteSpace: 'nowrap',
                                                background: (bankVerifying || bankData.accountNumber.length !== 10 || !bankData.bankCode) ? '#ccc' : '#008751',
                                                color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                                            }}
                                        >
                                            {bankVerifying
                                                ? <><Loader2 size={16} className="animate-spin" /> Checking...</>
                                                : <><ShieldCheck size={16} /> Verify</>}
                                        </button>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>
                                        {bankData.accountNumber.length}/10 digits
                                    </span>
                                </div>

                                {/* Result */}
                                {bankResult && (
                                    <div style={{
                                        padding: '16px', borderRadius: '10px', marginBottom: '16px',
                                        background: bankResult.verified ? '#e8f5e9' : '#fdecea',
                                        border: `1px solid ${bankResult.verified ? '#c8e6c9' : '#ffcdd2'}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            {bankResult.verified
                                                ? <CheckCircle2 size={20} color="#008751" />
                                                : <AlertCircle size={20} color="#c0392b" />}
                                            <span style={{ fontWeight: '700', color: bankResult.verified ? '#008751' : '#c0392b', fontSize: '14px' }}>
                                                {bankResult.verified ? 'Identity Verified!' : 'Verification Failed'}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.6' }}>
                                            {bankResult.message}
                                        </p>
                                        {!bankResult.verified && bankResult.status === 'name_mismatch' && (
                                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', background: '#fff8e1', padding: '10px', borderRadius: '6px' }}>
                                                💡 <strong>Tip:</strong> Use the bank account registered in your own name, or go back to Step 1 and update your business name to match your account name exactly.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Terms */}
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={kycData.agreeTerms}
                                        onChange={e => setKycData(p => ({ ...p, agreeTerms: e.target.checked }))}
                                        style={{ marginTop: '3px', accentColor: '#008751', width: '16px', height: '16px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                                        I confirm I am authorised to register this business. I agree to the{' '}
                                        <a href="/terms" target="_blank" style={{ color: '#008751', fontWeight: '600' }}>Terms of Service</a> and{' '}
                                        <a href="/privacy" target="_blank" style={{ color: '#008751', fontWeight: '600' }}>Privacy Policy</a>.
                                    </span>
                                </label>
                            </div>
                        )}

                        {step === 5 && (
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
                                        {debugCodes.email && !emailVerified && (
                                            <div style={{ fontSize: '12px', color: '#008751', fontWeight: 'bold', marginBottom: '8px' }}>
                                                [DEV MODE] OTP: {debugCodes.email}
                                            </div>
                                        )}
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
                                        {debugCodes.mobile && !mobileVerified && (
                                            <div style={{ fontSize: '12px', color: '#008751', fontWeight: 'bold', marginBottom: '8px' }}>
                                                [DEV MODE] OTP: {debugCodes.mobile}
                                            </div>
                                        )}
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
                        {step < 5 ? (
                            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={nextStep} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ChevronRight /></>}
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

/* ── Document Upload Component ── */
function DocUpload({
    label, hint, field, value, uploading, onChange
}: {
    label: string;
    hint: string;
    field: string;
    value: string | null;
    uploading: boolean;
    onChange: (f: File) => void;
}) {
    return (
        <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
                {label}
            </label>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>{hint}</p>

            {value ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={value}
                        alt="Uploaded document"
                        style={{ width: '100%', maxWidth: '280px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #008751' }}
                    />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#008751', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                        ✓
                    </div>
                    <label style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#008751', fontWeight: '600', cursor: 'pointer' }}>
                        Change photo
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
                    </label>
                </div>
            ) : (
                <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '120px', border: '2px dashed #d0d0d0', borderRadius: '10px',
                    cursor: 'pointer', background: '#fafafa', transition: 'border-color 0.2s',
                }}>
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#008751' }}>
                            <div style={{ width: '24px', height: '24px', border: '3px solid #008751', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ fontSize: '13px' }}>Uploading...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#aaa' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>Tap to upload</span>
                            <span style={{ fontSize: '11px' }}>JPG, PNG or PDF · Max 5MB</span>
                        </div>
                    )}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                        onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
                </label>
            )}
        </div>
    );
}
