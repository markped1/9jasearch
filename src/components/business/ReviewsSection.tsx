'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';
import styles from '@/app/business/[slug]/BusinessProfile.module.css';

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
    };
}

interface ReviewsSectionProps {
    businessId: string;
}

export default function ReviewsSection({ businessId }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(`/api/businesses/${businessId}/reviews`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (err) {
            console.error('Fetch reviews error', err);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <div>
            <ReviewForm businessId={businessId} onSuccess={fetchReviews} />

            <h2 className={styles.sectionTitle}>
                <MessageSquare size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Reviews ({reviews.length})
            </h2>

            <div className={styles.reviewsList}>
                {loading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <div className={styles.reviewCard}>
                        <p style={{ color: '#666', fontSize: '15px' }}>No reviews yet. Be the first to share your experience!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <span className={styles.reviewerName}>{review.user?.name || 'Community Member'}</span>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "#FFD700" : "none"} color="#FFD700" />
                                    ))}
                                </div>
                                <span style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ color: '#444', fontSize: '15px', lineHeight: '1.6' }}>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
