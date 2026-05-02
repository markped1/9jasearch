'use client';

import { useEffect } from 'react';

interface Props {
    businessId: string;
}

export default function BusinessAnalyticsTracker({ businessId }: Props) {
    useEffect(() => {
        // Track page_view on mount
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, eventType: 'page_view' }),
        }).catch(() => {/* silent fail */});
    }, [businessId]);

    return null;
}
