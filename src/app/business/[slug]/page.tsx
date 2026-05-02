import { MapPin, Phone, MessageCircle, Clock, Star, Globe, ShieldCheck, Tag } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import styles from './BusinessProfile.module.css';
import ReviewsSection from '@/components/business/ReviewsSection';
import ImageGallery from '@/components/business/ImageGallery';
import dynamic from 'next/dynamic';
import BusinessChatWindow from '@/components/chat/BusinessChatWindow';
import BookingWidget from '@/components/booking/BookingWidget';
import ProfileMapWrapper from '@/components/business/ProfileMapWrapper';
import { calculateTrustScore } from '@/lib/trustScore';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const business = await prisma.business.findUnique({
        where: { slug },
        select: { name: true, description: true, images: true, city: true, category: true }
    });

    if (!business) {
        return {
            title: 'Business Not Found - 9jaSearch'
        };
    }

    const images = business.images ? JSON.parse(business.images) : [];
    const ogImage = images.length > 0 ? images[0] : '/og-default.jpg';

    return {
        title: `${business.name} - ${business.category} in ${business.city} | 9jaSearch`,
        description: business.description?.slice(0, 160) || `Find details for ${business.name} in ${business.city}.`,
        openGraph: {
            images: [ogImage],
        }
    };
}

export default async function BusinessProfile({ params }: Props) {
    const { slug } = await params;

    const business = await prisma.business.findUnique({
        where: { slug },
        include: { offers: { where: { isActive: true } } }
    });

    if (!business) {
        notFound();
    }

    const trust = calculateTrustScore(business);

    return (
        <div className={styles.container}>
            {/* Banner */}
            <div className={styles.banner} style={{ backgroundImage: `url('/hero-bg.jpg')` }}>
                <div className={styles.bannerOverlay}>
                    <div style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
                        {business.category}
                    </div>
                    <h1 className={styles.businessName}>
                        {business.name}
                        {business.isVerified && <span className={styles.badge}><ShieldCheck size={16} /> Verified</span>}
                    </h1>
                    <div className={styles.metaRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Star fill="#FFD700" color="#FFD700" size={20} />
                            <span style={{ fontWeight: 700 }}>{business.rating.toFixed(1)}</span>
                            <span>({business.reviewCount} reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={18} />
                            <span>{business.city}, {business.state}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>

                {/* Left Column: Info */}
                <div>
                    <h2 className={styles.sectionTitle}>About</h2>
                    <p className={styles.description}>
                        {business.description || `Welcome to ${business.name}. We are located in ${business.city} and offer premium ${business.category} services.`}
                    </p>

                    {/* Active Deals Widget */}
                    {business.offers && business.offers.length > 0 && (
                        <div style={{ marginBottom: '30px', background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px dashed #008751' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#008751', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag size={20} /> Active Deals & Coupons
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {business.offers.map((offer) => (
                                    <div key={offer.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontWeight: '700', fontSize: '16px' }}>{offer.title}</div>
                                        <p style={{ fontSize: '14px', margin: '5px 0', color: '#555' }}>{offer.description}</p>
                                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {offer.code ? (
                                                <div style={{ background: '#eee', padding: '5px 10px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: '600', border: '1px solid #ddd', color: '#333' }}>
                                                    CODE: {offer.code}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#666' }}>No code needed - Just mention this ad</div>
                                            )}
                                            {offer.expiresAt && <div style={{ fontSize: '12px', color: '#e53e3e' }}>Expires: {new Date(offer.expiresAt).toLocaleDateString()}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Image Gallery */}
                    <ImageGallery
                        images={business.images ? JSON.parse(business.images) : []}
                        businessName={business.name}
                    />

                    <div style={{ marginTop: '40px' }}>
                        <ReviewsSection businessId={business.id} />
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className={styles.sidebar}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Book Service</h3>
                        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Select a date to schedule an appointment.</p>
                        <BookingWidget businessId={business.id} businessName={business.name} />
                    </div>

                    <div className={styles.contactCard}>
                        {/* Trust Score Badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', background: '#f9f9f9', borderRadius: '10px',
                            marginBottom: '16px', border: `1px solid ${trust.color}22`,
                        }}>
                            <div>
                                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trust Score</div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: trust.color }}>{trust.score}/100</div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: trust.color }}>{trust.level}</div>
                            </div>
                            <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                                <svg width="52" height="52" viewBox="0 0 52 52">
                                    <circle cx="26" cy="26" r="22" fill="none" stroke="#e0e0e0" strokeWidth="5" />
                                    <circle cx="26" cy="26" r="22" fill="none" stroke={trust.color} strokeWidth="5"
                                        strokeDasharray={`${(trust.score / 100) * 138.2} 138.2`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 26 26)" />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: trust.color }}>
                                    {trust.score}
                                </div>
                            </div>
                        </div>
                        <a href={`tel:${business.phone}`} className={`${styles.actionBtn} ${styles.callBtn}`}>
                            <Phone size={20} /> Call Now
                        </a>
                        <a href={`https://wa.me/${business.whatsapp?.replace(/\s/g, '')}`} className={`${styles.actionBtn} ${styles.whatsappBtn}`}>
                            <MessageCircle size={20} /> WhatsApp
                        </a>

                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

                        <div className={styles.contactItem}>
                            <Clock size={20} color="#008751" />
                            <div>
                                <span style={{ display: 'block', paddingBottom: '2px', fontWeight: 600 }}>Hours</span>
                                <span style={{ fontSize: '14px', color: '#666' }}>
                                    {business.openingTime} - {business.closingTime || 'Late'}
                                </span>
                            </div>
                        </div>
                        <div className={styles.contactItem}>
                            <Globe size={20} color="#008751" />
                            <div>
                                <span style={{ display: 'block', paddingBottom: '2px', fontWeight: 600 }}>Website</span>
                                {business.website ? (
                                    <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#008751', textDecoration: 'underline' }}>Visit Website</a>
                                ) : (
                                    <span style={{ fontSize: '14px', color: '#999' }}>Not provided</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.contactItem}>
                            <MapPin size={20} color="#008751" />
                            <div>
                                <span style={{ display: 'block', paddingBottom: '2px', fontWeight: 600 }}>Address</span>
                                <span style={{ fontSize: '14px', color: '#666' }}>{business.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Functional Map */}
                    {business.lat && business.lng && (
                        <div style={{ marginBottom: '20px' }}>
                            <ProfileMapWrapper lat={business.lat} lng={business.lng} businessName={business.name} />
                        </div>
                    )}

                    {!business.lat && (
                        <div style={{ height: '250px', background: '#ddd', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 600 }}>
                            <MapPin size={30} style={{ marginRight: '10px' }} /> Map Not Available
                        </div>
                    )}

                    {/* Own this business? — like Google Business Profile */}
                    {!business.ownerId && (
                        <div style={{
                            marginTop: '16px', padding: '16px', background: '#f9f9f9',
                            border: '1px solid #e0e0e0', borderRadius: '12px', textAlign: 'center',
                        }}>
                            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 10px' }}>
                                Is this your business?
                            </p>
                            <a href={`/claim/${business.slug}`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                color: '#008751', fontWeight: '700', fontSize: '14px',
                                textDecoration: 'none', border: '1px solid #008751',
                                padding: '8px 16px', borderRadius: '8px',
                                transition: 'all 0.2s',
                            }}>
                                ✅ Claim this business
                            </a>
                        </div>
                    )}
                </div>

            </div>

            {/* Messaging Widget */}
            <BusinessChatWindow
                businessId={business.id}
                businessName={business.name}
                ownerId={business.ownerId || ''}
            />
        </div>
    );
}
