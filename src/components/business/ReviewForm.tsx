'use client';

import { useState } from 'react';
import { Star, Loader2, Send } from 'lucide-react';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
    businessId: string;
    onSuccess: () => void;
}

export default function ReviewForm({ businessId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/businesses/${businessId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                setRating(0);
                setComment('');
                onSuccess();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit review');
            }
        } catch (err) {
            console.error('Submit review error', err);
            alert('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.reviewFormCard}>
            <h3>Leave a Review</h3>
            <p>Your feedback helps the community make better choices.</p>

            <form onSubmit={handleSubmit}>
                <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={styles.starBtn}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star
                                size={28}
                                fill={(hover || rating) >= star ? "#FFD700" : "none"}
                                color={(hover || rating) >= star ? "#FFD700" : "#ccc"}
                            />
                        </button>
                    ))}
                    <span className={styles.ratingLabel}>
                        {rating > 0 ? `${rating} Stars` : 'Select rating'}
                    </span>
                </div>

                <textarea
                    className={styles.textArea}
                    placeholder="Tell us about your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || rating === 0 || !comment.trim()}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Post Review</>}
                </button>
            </form>
        </div>
    );
}
