"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import PinBlack from "../../../../public/pin_black.png";
import styles from "./map.module.css";

const Pin = new L.Icon({
    iconUrl: PinBlack.src,
    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -32], // point from which the popup should open relative to the iconAnchor
});

interface MapPin {
    coordinates: [number, number];
    popupHtml: string;
}

interface MapProps {
    center: {
        lng: number;
        lat: number;
    };
    pins: MapPin[];
    zoom: number;
}

const Map: React.FC<MapProps> = ({ center, pins, zoom }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Initial Map Setup
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        // Create map instance
        const m = L.map(mapContainer.current, {
            zoomControl: true,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            boxZoom: true,
            keyboard: false,
        });

        // Use OpenStreetMap standard tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(m);

        // Set initial view immediately
        const lat = !isNaN(center.lat) ? center.lat : 39.8283;
        const lng = !isNaN(center.lng) ? center.lng : -98.5795;
        const z = !isNaN(zoom) ? zoom : 4;

        m.setView([lat, lng], z);

        // Assign to ref for cleanup and updates
        mapInstance.current = m;

        // Mark as ready after a tick to ensure DOM is settled
        const timer = setTimeout(() => {
            if (mapInstance.current) {
                mapInstance.current.invalidateSize();
                setMapReady(true);
            }
        }, 300); // 300ms buffer for layout stability

        return () => {
            clearTimeout(timer);
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                setMapReady(false);
            }
        };
    }, []);

    // Handle View Updates
    useEffect(() => {
        if (!mapReady || !mapInstance.current) return;

        const lat = typeof center.lat === 'number' && !isNaN(center.lat) ? center.lat : null;
        const lng = typeof center.lng === 'number' && !isNaN(center.lng) ? center.lng : null;
        const z = typeof zoom === 'number' && !isNaN(zoom) ? zoom : null;

        if (lat !== null && lng !== null && z !== null) {
            // Small timeout to ensure layout stability before animation
            const timer = setTimeout(() => {
                if (mapInstance.current) {
                    mapInstance.current.invalidateSize();
                    mapInstance.current.flyTo([lat, lng], z, {
                        animate: true,
                        duration: 1
                    });
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [mapReady, center.lat, center.lng, zoom]);

    // Handle Pin Updates
    useEffect(() => {
        if (!mapReady || !mapInstance.current) return;

        // Clear existing markers
        mapInstance.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstance.current!.removeLayer(layer);
            }
        });

        // Add pins to the map
        pins.forEach((pin) => {
            const [plat, plng] = pin.coordinates;
            if (!isNaN(plat) && !isNaN(plng)) {
                L.marker(pin.coordinates, { icon: Pin })
                    .addTo(mapInstance.current!)
                    .bindPopup(pin.popupHtml);
            }
        });
    }, [mapReady, pins]);

    return (
        <div className={styles.mapWrap}>
            <div ref={mapContainer} className={styles.map} />
        </div>
    );
};

export default Map;
