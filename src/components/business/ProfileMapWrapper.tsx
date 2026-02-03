'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const ProfileMap = dynamic(() => import('./ProfileMap'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '250px', background: '#ddd', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <MapPin className="animate-pulse" /> Loading Map...
        </div>
    )
});

export default function ProfileMapWrapper({ lat, lng, businessName }: { lat: number, lng: number, businessName: string }) {
    return <ProfileMap lat={lat} lng={lng} businessName={businessName} />;
}
