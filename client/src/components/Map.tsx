'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Reset Default Icon (Next.js/Leaflet bug fix)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fly to new location when props change
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13);
    }, [center, map]);
    return null;
}

export default function DispatchMap() {
    // Default to New York or the user's university city?
    // Let's default to a generic city center for the demo.
    // DHA Suffa University (Karachi) Coordinates: 24.8219, 67.0728
    const defaultPos: [number, number] = [24.8219, 67.0728]; // DHA Suffa University

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-800 z-0">
            <MapContainer
                center={defaultPos}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={defaultPos}>
                    <Popup>
                        Incident Location <br /> DHA Suffa University.
                    </Popup>
                </Marker>
                <MapUpdater center={defaultPos} />
            </MapContainer>
        </div>
    );
}
