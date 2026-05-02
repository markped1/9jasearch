import Link from 'next/link';
import { Star, Navigation, Phone, Globe, Clock } from 'lucide-react';
import styles from './BusinessCard.module.css';
import { getBusinessStatus } from '@/lib/businessHours';

interface BusinessProps {
    business: {
        id: string;
        slug: string;
        name: string;
        category: string;
        address: string;
        city: string;
        state: string;
        phone: string;
        website?: string | null;
        rating: number;
        reviewCount: number;
        isVerified: boolean;
        isFeatured?: boolean;
        openingTime?: string | null;
        closingTime?: string | null;
        tags?: string | string[] | null;
    }
}

export default function BusinessCard({ business }: BusinessProps) {
    // Parse tags if it's a string (from Prisma)
    let tagsList: string[] = [];
    if (typeof business.tags === 'string') {
        try {
            tagsList = JSON.parse(business.tags);
        } catch (e) {
            tagsList = [];
        }
    } else if (Array.isArray(business.tags)) {
        tagsList = business.tags;
    }

    const status = getBusinessStatus(business.openingTime || null, business.closingTime || null);

    return (
        <div className={`${styles.card} ${business.isFeatured ? styles.featuredCard : ''}`}>
            <div className={styles.imageWrapper}>
                {/* Placeholder for image */}
                {(business?.name || '?').charAt(0)}
                {business?.isFeatured && (
                    <div className={styles.featuredBadge}>FEATURED</div>
                )}
            </div>

            <div className={styles.content}>
                {/* 1. Name */}
                <div className={styles.nameContainer}>
                    <h3 className={styles.name}>
                        <Link href={`/business/${business?.slug || '#'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {business?.name || 'Unknown Business'}
                        </Link>
                    </h3>
                    {business?.isVerified && (
                        <div className={styles.verifiedBadge} title="Verified Business">
                            <Star size={12} fill="#008751" style={{ marginRight: '4px' }} />
                            Verified
                        </div>
                    )}
                </div>

                {/* 2. Rating & Category */}
                <div className={styles.metaLine}>
                    <span className={styles.ratingText}>{(business?.rating || 0).toFixed(1)}</span>
                    <div style={{ display: 'flex' }}>
                        <Star className={styles.ratingStar} />
                        <Star className={styles.ratingStar} />
                        <Star className={styles.ratingStar} />
                        <Star className={styles.ratingStar} />
                        <Star className={styles.ratingStar} />
                    </div>
                    <span className={styles.reviewCount}>({business.reviewCount})</span>
                    <span className={styles.dot}>·</span>
                    <span>{business.category}</span>
                </div>

                {/* 3. Address & Phone */}
                <div className={styles.addressLine}>
                    {business.address}, {business.city} <span className={styles.dot}>·</span> {business.phone}
                </div>

                {/* 4. Opens/Closed . Time */}
                <div className={styles.statusLine}>
                    <span style={{ color: status.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {status.label}
                    </span>
                    <span className={styles.dot}>·</span>
                    <span style={{ color: '#5f6368' }}>{status.secondary}</span>
                </div>

                {/* 5. Service Options (Tags) */}
                {tagsList.length > 0 && (
                    <div className={styles.tagsLine}>
                        {tagsList.join(' · ')}
                    </div>
                )}

                {/* Action Chips */}
                <div className={styles.actionChips}>
                    {business.website && (
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className={styles.chip}>
                            <Globe size={14} /> Website
                        </a>
                    )}
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.address}, ${business.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.chip}
                    >
                        <Navigation size={14} /> Directions
                    </a>
                    <a href={`tel:${business.phone}`} className={styles.chip}>
                        <Phone size={14} /> Call
                    </a>
                </div>
            </div>
        </div >
    );
}
