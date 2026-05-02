/**
 * 9jaSearch Trust Score
 * Calculates a 0–100 trust score for a business based on
 * verifiable signals the admin can check manually.
 */

export interface TrustSignal {
  label: string;
  points: number;
  achieved: boolean;
  description: string;
}

export function calculateTrustScore(business: {
  isVerified?: boolean;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  description?: string | null;
  images?: string | null;
  lat?: number | null;
  lng?: number | null;
  openingTime?: string | null;
  closingTime?: string | null;
  reviewCount?: number;
  rating?: number;
  ownerId?: string | null;
}): { score: number; level: string; color: string; signals: TrustSignal[] } {

  const signals: TrustSignal[] = [
    {
      label: 'KYC Verified',
      points: 30,
      achieved: !!business.isVerified,
      description: 'Identity documents reviewed and approved by admin',
    },
    {
      label: 'Phone Number',
      points: 10,
      achieved: !!business.phone && business.phone.length >= 10,
      description: 'Valid Nigerian phone number provided',
    },
    {
      label: 'Email Address',
      points: 5,
      achieved: !!business.email && business.email.includes('@'),
      description: 'Valid email address provided',
    },
    {
      label: 'Physical Address',
      points: 10,
      achieved: !!business.address && business.address.length > 10,
      description: 'Full physical address provided',
    },
    {
      label: 'Map Location',
      points: 10,
      achieved: !!business.lat && !!business.lng,
      description: 'GPS coordinates set — customers can get directions',
    },
    {
      label: 'Business Description',
      points: 5,
      achieved: !!business.description && business.description.length > 30,
      description: 'Detailed business description provided',
    },
    {
      label: 'Photos Uploaded',
      points: 10,
      achieved: (() => {
        try {
          const imgs = JSON.parse(business.images || '[]');
          return Array.isArray(imgs) && imgs.length > 0;
        } catch { return false; }
      })(),
      description: 'At least one business photo uploaded',
    },
    {
      label: 'Opening Hours',
      points: 5,
      achieved: !!business.openingTime && !!business.closingTime,
      description: 'Opening and closing times set',
    },
    {
      label: 'WhatsApp',
      points: 5,
      achieved: !!business.whatsapp && business.whatsapp.length >= 10,
      description: 'WhatsApp number provided for customer contact',
    },
    {
      label: 'Website',
      points: 5,
      achieved: !!business.website && business.website.startsWith('http'),
      description: 'Business website linked',
    },
    {
      label: 'Has Reviews',
      points: 5,
      achieved: (business.reviewCount || 0) >= 3,
      description: 'At least 3 customer reviews received',
    },
    {
      label: 'Claimed Listing',
      points: 5,
      achieved: !!business.ownerId,
      description: 'Business owner has claimed and manages this listing',
    },
  ];

  const score = signals.reduce((sum, s) => sum + (s.achieved ? s.points : 0), 0);

  let level: string;
  let color: string;

  if (score >= 80) { level = 'Highly Trusted';  color = '#008751'; }
  else if (score >= 60) { level = 'Trusted';     color = '#2196F3'; }
  else if (score >= 40) { level = 'Moderate';    color = '#FF9800'; }
  else if (score >= 20) { level = 'Low Trust';   color = '#FF5722'; }
  else                  { level = 'Unverified';  color = '#9E9E9E'; }

  return { score, level, color, signals };
}
