'use client';

import { MessageCircle } from 'lucide-react';

interface Props {
    whatsappNumber: string;
    businessId: string;
    businessName: string;
}

export default function WhatsAppButton({ whatsappNumber, businessId, businessName }: Props) {
    const trackAndOpen = () => {
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, eventType: 'whatsapp_click' }),
        }).catch(() => {/* silent */});
    };

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackAndOpen}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: '#25D366',
                color: 'white',
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '16px',
                textDecoration: 'none',
                marginBottom: '12px',
                transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#1ebe5d';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#25D366';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
        >
            <MessageCircle size={20} />
            💬 Chat on WhatsApp
        </a>
    );
}
