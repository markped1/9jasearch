'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ShieldCheck, Building2, Phone, MessageSquare,
  CheckCircle2, Loader2, ArrowLeft, MapPin, Star
} from 'lucide-react';
import Link from 'next/link';

export default function ClaimBusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/claim/${slug}`);
    }
  }, [status, slug, router]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/businesses/search?q=${slug}&limit=1`);
        const data = await res.json();
        // Find exact slug match
        const found = Array.isArray(data) ? data.find((b: any) => b.slug === slug) : null;
        setBusiness(found || null);
      } catch {
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/businesses/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, phone, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit claim');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#008751' }} />
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <Building2 size={48} color="#ccc" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#333' }}>Business not found</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>We couldn't find this business listing.</p>
        <Link href="/" style={{ color: '#008751', fontWeight: '600' }}>← Back to Home</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: '560px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <CheckCircle2 size={40} color="#008751" />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#333', marginBottom: '12px' }}>
          Claim Submitted!
        </h2>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
          Your claim for <strong>{business.name}</strong> has been submitted.
          Our team will verify your ownership within <strong>24–48 hours</strong> and
          send confirmation to <strong>{session?.user?.email}</strong>.
        </p>
        <div style={{
          background: '#f0fdf4', border: '1px solid #c8e6c9', borderRadius: '12px',
          padding: '20px', marginBottom: '32px', textAlign: 'left',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#008751', marginBottom: '12px' }}>
            What happens next?
          </h3>
          {[
            'Admin reviews your claim request',
            'You receive an email confirmation',
            'Your business dashboard becomes active',
            'Update photos, hours, description & more',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', background: '#008751',
                color: 'white', fontSize: '12px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: '14px', color: '#444' }}>{step}</span>
            </div>
          ))}
        </div>
        <Link href={`/business/${slug}`}
          style={{ background: '#008751', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>
          View Business Profile
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px 80px' }}>
      {/* Back link */}
      <Link href={`/business/${slug}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#008751', fontWeight: '600', fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to listing
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} color="#008751" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#333', margin: 0 }}>
            Claim This Business
          </h1>
        </div>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
          Are you the owner of <strong>{business.name}</strong>? Claim your listing to manage your profile,
          respond to reviews, update hours, and attract more customers.
        </p>
      </div>

      {/* Business preview card */}
      <div style={{
        background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '12px',
        padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '14px', alignItems: 'center',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '10px', background: '#008751',
          color: 'white', fontWeight: '900', fontSize: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {business.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#333' }}>{business.name}</div>
          <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <MapPin size={12} /> {business.address}, {business.city}
            <span>·</span>
            <Star size={12} fill="#f59e0b" color="#f59e0b" /> {business.rating?.toFixed(1)}
          </div>
        </div>
      </div>

      {/* What you get */}
      <div style={{
        background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px',
        padding: '20px', marginBottom: '28px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#333', marginBottom: '14px' }}>
          What you get as a verified owner:
        </h3>
        {[
          ['📸', 'Upload photos and a cover image'],
          ['🕐', 'Set accurate opening & closing hours'],
          ['📝', 'Edit your business description'],
          ['💬', 'Respond to customer reviews'],
          ['🎯', 'Post deals and special offers'],
          ['📊', 'View analytics — calls, views, clicks'],
          ['✅', 'Get a Verified badge on your listing'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{ fontSize: '14px', color: '#444' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Claim form */}
      <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '20px' }}>
          Verify your ownership
        </h3>

        {error && (
          <div style={{ background: '#fdecea', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
            <Phone size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            Your Phone Number *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            required
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            Must match the phone number on the listing for faster verification.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
            <MessageSquare size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            Additional Info (optional)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell us how you're connected to this business..."
            rows={3}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', outline: 'none',
              resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
            background: submitting ? '#aaa' : '#008751', color: 'white',
            fontSize: '15px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {submitting
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
            : <><ShieldCheck size={18} /> Submit Claim Request</>
          }
        </button>

        <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '12px' }}>
          By submitting, you confirm you are authorised to manage this business.
        </p>
      </form>
    </div>
  );
}
