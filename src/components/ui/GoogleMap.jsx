import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

// ─── Leaflet/OpenStreetMap Map Component ─────────────────────────────────────
// Uses free OpenStreetMap tiles — no API key required, always works.
const GoogleMap = ({ center = { lat: 13.0827, lng: 80.2707 }, zoom = 12, title = 'Location', className = 'w-full h-[400px]', markers = [] }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        // If a previous map instance exists (e.g. tab switch), destroy it first
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        setMapLoaded(false);
        setMapError(false);

        let isDestroyed = false;

        const initLeaflet = async () => {
            try {
                const L = (await import('leaflet')).default;

                if (isDestroyed || !mapContainer.current) return;

                // Fix default icon paths broken by webpack/vite bundlers
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(mapContainer.current, {
                    center: [center.lat, center.lng],
                    zoom: zoom,
                    zoomControl: true,
                    scrollWheelZoom: false,
                });

                // OpenStreetMap tiles — completely free, no API key
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }).addTo(map);

                // Main marker for the destination
                const mainMarker = L.marker([center.lat, center.lng]).addTo(map);
                mainMarker.bindPopup(`<strong>${title}</strong>`).openPopup();

                // Additional markers (e.g. nearby attractions)
                markers.forEach((m, idx) => {
                    L.marker([m.lat, m.lng])
                        .addTo(map)
                        .bindPopup(`<strong>${m.title || `Place ${idx + 1}`}</strong>`);
                });

                if (!isDestroyed) {
                    mapInstance.current = map;
                    setMapLoaded(true);
                } else {
                    map.remove();
                }
            } catch (e) {
                console.error('Failed to initialize Leaflet map:', e);
                if (!isDestroyed) setMapError(true);
            }
        };

        initLeaflet();

        return () => {
            isDestroyed = true;
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center.lat, center.lng, zoom, title]);

    if (mapError) {
        return (
            <div className={`flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl ${className}`}>
                <p className="text-white/40 text-sm">Failed to load Map.</p>
                <p className="text-white/30 text-xs mt-1">Check browser console for details.</p>
            </div>
        );
    }

    return (
        <div className={`relative rounded-2xl overflow-hidden border border-white/10 ${className}`}>
            {!mapLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Loader size={24} className="text-vibrant-gold animate-spin mb-2" />
                    <p className="text-white/60 text-sm">Loading OpenStreetMap...</p>
                </div>
            )}
            <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '300px' }} />
        </div>
    );
};

export default GoogleMap;
