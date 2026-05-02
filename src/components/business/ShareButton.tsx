'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface Props {
    businessName: string;
    slug: string;
}

export default function ShareButton({ businessName, slug }: Props) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = `https://9jasearch.ng/business/${slug}`;
        const shareData = {
            title: businessName,
            text: `Check out ${businessName} on 9jaSearch`,
            url,
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled or error — fall through to clipboard
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch {
                // Fallback for older browsers
                const el = document.createElement('textarea');
                el.value = url;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            title="Share this business"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: copied ? 'rgba(37,211,102,0.25)' : 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.5)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s',
                backdropFilter: 'blur(4px)',
            }}
        >
            <Share2 size={16} />
            {copied ? 'Link copied!' : 'Share'}
        </button>
    );
}
