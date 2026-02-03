import Link from 'next/link';
import { Star, Navigation, Phone, Globe } from 'lucide-react';
import styles from './BusinessCard.module.css';

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

    const isOpen = true; // Still mock for now

    return (
        <div className={`${styles.card} ${business.isFeatured ? styles.featuredCard : ''}`}>
            <div className={styles.imageWrapper}>
                {/* Placeholder for image */}
                {business.name.charAt(0)}
                {business.isFeatured && (
                    <div className={styles.featuredBadge}>FEATURED</div>
                )}
            </div>

            <div className={styles.content}>
                {/* 1. Name */}
                <div className={styles.nameContainer}>
                    <Link href={`/business/${business.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 className={styles.name}>{business.name}</h3>
                    </Link>
                    {business.isVerified && (
                        <div className={styles.verifiedBadge} title="Verified Business">
                            <Star size={12} fill="#008751" style={{ marginRight: '4px' }} />
                            Verified
                        </div>
                    )}
                </div>

                {/* 2. 5.0(1.1k) . Category */}
                <div className={styles.metaLine}>
                    <span className={styles.ratingText}>{business.rating.toFixed(1)}</span>
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

                {/* 3. Address . Phone (Truncated address for snippet feel) */}
                <div className={styles.addressLine}>
                    {business.address}, {business.city} <span className={styles.dot}>·</span> {business.phone}
                </div>

                {/* 4. Opens/Closed . Time */}
                <div className={styles.statusLine}>
                    {isOpen ? (
                        <span className={styles.open}>Open</span>
                    ) : (
                        <span className={styles.closed}>Closed</span>
                    )}
                    <span className={styles.dot}>·</span>
                    <span>{isOpen ? `Closes ${business.closingTime || '10:00 PM'}` : `Opens ${business.openingTime}`}</span>
                </div>

                {/* 5. Service Options (Tags) */}
                {tagsList.length > 0 && (
                    <div className={styles.tagsLine}>
                        {tagsList.join(' · ')}
                    </div>
                )}

                {/* Action Chips */}
                <div className={styles.actionChips}>
                    <button className={styles.chip}>
                        <Globe size={14} /> Website
                    </button>
                    <button className={styles.chip}>
                        <Navigation size={14} /> Directions
                    </button>
                    <button className={styles.chip}>
                        <Phone size={14} /> Call
                    </button>
                </div>
            </div>
        </div >
    );
}
