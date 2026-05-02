'use client';

import { Phone, Globe, MapPin } from 'lucide-react';

interface Props {
    businessId: string;
    phone: string;
    website?: string | null;
    address: string;
    city: string;
}

export default function TrackedActionButtons({ businessId, phone, website, address, city }: Props) {
    const track = (eventType: string) => {
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, eventType }),
        }).catch(() => {/* silent */});
    };

    return (
        <>
            <a
                href={`tel:${phone}`}
                onClick={() => track('call_click')}
                style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    background: '#008751',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
            >
                <Phone size={20} /> Call Now
            </a>

            {website && (
                <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('website_click')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#008751',
                        fontSize: '14px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                >
                    <Globe size={16} /> Visit Website
                </a>
            )}

            <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('directions_click')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#008751',
                    fontSize: '14px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '8px',
                }}
            >
                <MapPin size={16} /> Get Directions
            </a>
        </>
    );
}
