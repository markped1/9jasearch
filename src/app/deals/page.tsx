import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Tag, Calendar, Building2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Deals & Offers | 9jaSearch',
    description: 'Browse the latest deals, discounts, and special offers from businesses across Nigeria on 9jaSearch.',
};

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
    const offers = await prisma.offer.findMany({
        where: { isActive: true },
        include: {
            business: {
                select: { name: true, slug: true, city: true, category: true, isActive: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    // Only show offers from active businesses
    const activeOffers = offers.filter(o => o.business.isActive);

    return (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '8px 20px', borderRadius: '20px', marginBottom: '16px' }}>
                    <Tag size={18} color="#008751" />
                    <span style={{ color: '#008751', fontWeight: '700', fontSize: '14px' }}>LIVE DEALS</span>
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1a1a1a', marginBottom: '12px' }}>
                    Deals & Offers
                </h1>
                <p style={{ fontSize: '16px', color: '#666', maxWidth: '500px', margin: '0 auto' }}>
                    Exclusive discounts and special offers from businesses across Nigeria. Updated daily.
                </p>
            </div>

            {activeOffers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
                    <Tag size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No active deals right now</h3>
                    <p>Check back soon — businesses are always adding new offers.</p>
                    <Link href="/" style={{ display: 'inline-block', marginTop: '20px', color: '#008751', fontWeight: '600', textDecoration: 'underline' }}>
                        Browse businesses →
                    </Link>
                </div>
            ) : (
                <>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
                        {activeOffers.length} active deal{activeOffers.length !== 1 ? 's' : ''} available
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {activeOffers.map((offer) => (
                            <div
                                key={offer.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e8f5e9',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                                }}
                            >
                                {/* Deal header */}
                                <div style={{ background: 'linear-gradient(135deg, #008751, #00a86b)', padding: '20px', color: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <Tag size={16} />
                                        <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                                            {offer.business.category}
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, lineHeight: '1.3' }}>
                                        {offer.title}
                                    </h2>
                                </div>

                                {/* Deal body */}
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                                        {offer.description}
                                    </p>

                                    {/* Coupon code */}
                                    {offer.code && (
                                        <div style={{
                                            background: '#f0fdf4',
                                            border: '1.5px dashed #008751',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>COUPON CODE</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '16px', color: '#008751', letterSpacing: '1px' }}>
                                                {offer.code}
                                            </span>
                                        </div>
                                    )}

                                    {!offer.code && (
                                        <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                                            No code needed — just mention this offer
                                        </div>
                                    )}

                                    {/* Expiry */}
                                    {offer.expiresAt && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#e53e3e' }}>
                                            <Calendar size={14} />
                                            Expires: {new Date(offer.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    )}

                                    {/* Business info */}
                                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Building2 size={16} color="#008751" />
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{offer.business.name}</div>
                                                <div style={{ fontSize: '12px', color: '#888' }}>{offer.business.city}</div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/business/${offer.business.slug}`}
                                            style={{
                                                background: '#008751',
                                                color: 'white',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            View Business
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
