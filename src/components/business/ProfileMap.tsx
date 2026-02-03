'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet + Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15); // Closer zoom for profile
    }, [center, map]);
    return null;
}

interface ProfileMapProps {
    lat: number;
    lng: number;
    businessName: string;
}

export default function ProfileMap({ lat, lng, businessName }: ProfileMapProps) {
    const center: [number, number] = [lat, lng];

    return (
        <div style={{ height: '250px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer
                center={center}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} />
                <Marker position={center} icon={icon} />
            </MapContainer>
        </div>
    );
}
