'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

interface MapViewProps {
    businesses: any[];
    center?: [number, number];
}

export default function MapView({ businesses, center = [9.0820, 8.6753] }: MapViewProps) {
    // Nigeria center: [9.0820, 8.6753]

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '30px', border: '1px solid #ddd' }}>
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} />
                {businesses.map((biz) => (
                    biz.lat && biz.lng && (
                        <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={icon}>
                            <Popup>
                                <div style={{ padding: '5px' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#008751' }}>{biz.name}</h4>
                                    <p style={{ margin: 0, fontSize: '13px' }}>{biz.category}</p>
                                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{biz.phone}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}
