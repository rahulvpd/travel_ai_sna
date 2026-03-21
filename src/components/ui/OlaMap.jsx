import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader, MapPin } from 'lucide-react';

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY;

const OlaMap = ({ center = [78.6569, 11.1271], zoom = 10, title = 'Destination', className = 'w-full h-[400px]' }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapError, setMapError] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!OLA_MAPS_API_KEY) {
            setTimeout(() => {
                setErrorMsg('Ola Maps API key missing in .env');
                setMapError(true);
            }, 0);
            return;
        }
        if (!mapContainer.current) return;

        // Clean up previous instance if re-rendering
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
        setMapLoaded(false);
        setMapError(false);

        const styleUrl = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${OLA_MAPS_API_KEY}`;

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: styleUrl,
                center: [center[1], center[0]], // [lng, lat]
                zoom: zoom,
                attributionControl: false,
                transformRequest: (url) => {
                    if (url.includes('api.olamaps.io')) {
                        const separator = url.includes('?') ? '&' : '?';
                        return { url: `${url}${separator}api_key=${OLA_MAPS_API_KEY}` };
                    }
                    return { url };
                }
            });

            map.current.addControl(
                new maplibregl.AttributionControl({ customAttribution: '© Ola Maps' })
            );
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            map.current.on('load', () => {
                setMapLoaded(true);

                const el = document.createElement('div');
                el.style.cssText = 'width:32px;height:32px;background:#ec4899;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;';
                el.innerHTML = '📍';

                new maplibregl.Marker({ element: el })
                    .setLngLat([center[1], center[0]])
                    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<h3 style="font-weight:bold;padding:4px 8px;">${title}</h3>`))
                    .addTo(map.current);
            });

            map.current.on('error', (e) => {
                console.error('Ola Maps Error:', e);
                // Don't crash on tile errors — only crash on fatal errors
                if (e.error && e.error.status >= 400 && e.error.status < 500) {
                    setErrorMsg(`Ola Maps API Error (${e.error.status}): Invalid or expired API key.`);
                    setMapError(true);
                }
            });

        } catch (error) {
            console.error('Failed to initialize Ola Map:', error);
            setErrorMsg('Failed to initialize Ola Maps.');
            setMapError(true);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center[0], center[1], zoom, title]);

    if (mapError || !OLA_MAPS_API_KEY) {
        return (
            <div className={`flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl gap-2 ${className}`}>
                <MapPin size={32} className="text-white/20" />
                <p className="text-white/40 text-sm font-medium">Ola Maps Unavailable</p>
                {errorMsg && <p className="text-white/25 text-xs text-center px-4">{errorMsg}</p>}
                {!OLA_MAPS_API_KEY && (
                    <p className="text-white/25 text-xs">Add <code>VITE_OLA_MAPS_API_KEY</code> to .env</p>
                )}
            </div>
        );
    }

    return (
        <div className={`relative rounded-2xl overflow-hidden border border-white/10 group ${className}`}>
            {!mapLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Loader size={24} className="text-vibrant-gold animate-spin mb-2" />
                    <p className="text-white/60 text-sm">Loading Ola Map...</p>
                </div>
            )}
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
};

export default OlaMap;
