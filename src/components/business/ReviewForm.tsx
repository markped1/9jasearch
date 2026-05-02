'use client';

import { useState } from 'react';
import { Star, Loader2, Send, CheckCircle2 } from 'lucide-react';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
    businessId: string;
    onSuccess: () => void;
}

export default function ReviewForm({ businessId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [guestName, setGuestName] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim()) {
            alert('Please enter your name');
            return;
        }
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
                body: JSON.stringify({ rating, comment, guestName: guestName.trim() })
            });

            if (res.ok) {
                setRating(0);
                setComment('');
                setGuestName('');
                setSubmitted(true);
                onSuccess();
                // Reset success message after 5 seconds
                setTimeout(() => setSubmitted(false), 5000);
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

    if (submitted) {
        return (
            <div className={styles.reviewFormCard} style={{ textAlign: 'center', padding: '40px 30px' }}>
                <CheckCircle2 size={48} color="#008751" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#008751', marginBottom: '8px' }}>Thank you for your review!</h3>
                <p style={{ color: '#555', marginBottom: '20px' }}>Your feedback helps the community make better choices.</p>
                <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    style={{
                        background: 'none', border: '1px solid #008751', color: '#008751',
                        padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: '600', fontSize: '14px'
                    }}
                >
                    Write another review
                </button>
            </div>
        );
    }

    return (
        <div className={styles.reviewFormCard}>
            <h3>Leave a Review</h3>
            <p>No account needed — just your name and honest feedback.</p>

            <form onSubmit={handleSubmit}>
                {/* Guest Name Field */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '8px' }}>
                        Your Name <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Chidi Okeke"
                        required
                        style={{
                            width: '100%',
                            border: '2px solid #eef2f0',
                            borderRadius: '12px',
                            padding: '12px 15px',
                            fontSize: '16px',
                            background: 'white',
                            fontFamily: 'inherit',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#008751'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#eef2f0'; }}
                    />
                </div>

                {/* Star Rating */}
                <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={styles.starBtn}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                            <Star
                                size={28}
                                fill={(hover || rating) >= star ? "#FFD700" : "none"}
                                color={(hover || rating) >= star ? "#FFD700" : "#ccc"}
                            />
                        </button>
                    ))}
                    <span className={styles.ratingLabel}>
                        {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                </div>

                {/* Comment */}
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
                    disabled={loading || rating === 0 || !comment.trim() || !guestName.trim()}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Post Review</>}
                </button>
            </form>
        </div>
    );
}
