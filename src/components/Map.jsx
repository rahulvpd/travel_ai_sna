import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader } from 'lucide-react';

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY;

const DEFAULT_CENTER = { lat: 11.1271, lng: 78.6569 };

const typeConfig = {
    hotel: { color: '#3B82F6', icon: '🏨', label: 'Hotel' },
    food: { color: '#F97316', icon: '🍽️', label: 'Food' },
    shopping: { color: '#EC4899', icon: '🛍️', label: 'Shopping' },
    visit: { color: '#D4AF37', icon: '📸', label: 'Visit' },
    default: { color: '#D4AF37', icon: '📍', label: 'Place' },
};

const MapComponent = ({ center, markers = [], showRoutes = false }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapError, setMapError] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!OLA_MAPS_API_KEY) {
            console.error("Ola Maps API key is missing.");
            setTimeout(() => setMapError(true), 0);
            return;
        }
        if (!mapContainer.current) return;

        const lng = center?.lng || DEFAULT_CENTER.lng;
        const lat = center?.lat || DEFAULT_CENTER.lat;

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json`,
                center: [lng, lat],
                zoom: center ? 11 : 7,
                attributionControl: false,
                transformRequest: (url) => {
                    if (url.includes('api.olamaps.io')) {
                        const separator = url.includes('?') ? '&' : '?';
                        return {
                            url: `${url}${separator}api_key=${OLA_MAPS_API_KEY}`
                        };
                    }
                    return { url };
                }
            });

            // Add Controls
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
            map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
            map.current.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-left');
            map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
            map.current.addControl(
                new maplibregl.AttributionControl({
                    customAttribution: '© Ola Maps'
                })
            );

            map.current.on('load', () => {
                setMapLoaded(true);

                // Add Routes if enabled
                if (showRoutes && markers.length > 1) {
                    const coordinates = markers.filter(m => m && m.lng && m.lat).map(m => [m.lng, m.lat]);

                    if (coordinates.length > 1) {
                        map.current.addSource('route', {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'LineString',
                                    coordinates: coordinates
                                }
                            }
                        });

                        map.current.addLayer({
                            id: 'route-glow-layer',
                            type: 'line',
                            source: 'route',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#D4AF37',
                                'line-width': 8,
                                'line-opacity': 0.15,
                                'line-blur': 4
                            }
                        });

                        map.current.addLayer({
                            id: 'route-layer',
                            type: 'line',
                            source: 'route',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#D4AF37',
                                'line-width': 3,
                                'line-opacity': 0.7,
                                'line-dasharray': [2, 2]
                            }
                        });
                    }
                }

                // Add Markers
                markers.filter(m => m && m.lng && m.lat).forEach((marker, index) => {
                    const config = typeConfig[marker.type] || typeConfig.default;

                    // Create marker element
                    const el = document.createElement('div');
                    el.className = 'flex flex-col items-center cursor-pointer group z-10';

                    const badge = document.createElement('div');
                    badge.className = 'font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg mb-0.5 text-white';
                    badge.style.backgroundColor = config.color;
                    badge.innerText = index + 1;

                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-sm border-2 border-white transition-transform group-hover:scale-110';
                    iconContainer.style.backgroundColor = config.color;
                    iconContainer.innerHTML = config.icon;

                    el.appendChild(badge);
                    el.appendChild(iconContainer);

                    // Create popup
                    const popupContent = `
                        <div class="p-1 min-w-[150px] font-sans">
                            <h3 class="font-bold text-sm text-gray-900">${marker.title}</h3>
                            <div class="flex items-center gap-2 mt-1 text-xs text-gray-600">
                                ${marker.time ? `<span>⏰ ${marker.time}</span>` : ''}
                                ${marker.rating ? `<span>⭐ ${marker.rating}</span>` : ''}
                            </div>
                            <div class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                ${config.label}
                            </div>
                        </div>
                    `;

                    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

                    new maplibregl.Marker({ element: el, anchor: 'bottom' })
                        .setLngLat([marker.lng, marker.lat])
                        .setPopup(popup)
                        .addTo(map.current);
                });
            });

            map.current.on('error', (e) => {
                console.error('MapLibre Error:', e);
                setMapError(true);
            });

        } catch (error) {
            console.error('Failed to initialize Map:', error);
            setTimeout(() => setMapError(true), 0);
        }

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, [center, markers, showRoutes]);

    if (mapError || !OLA_MAPS_API_KEY) {
        return (
            <div className="h-full w-full rounded-2xl overflow-hidden border-2 border-vibrant-gold/30 shadow-2xl flex flex-col items-center justify-center bg-white/5">
                <p className="text-white/40 text-sm">Failed to load Ola Maps.</p>
                {!OLA_MAPS_API_KEY && <p className="text-white/30 text-xs mt-1">API Key missing.</p>}
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border-2 border-vibrant-gold/30 shadow-2xl z-0 relative">
            {!mapLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Loader size={24} className="text-vibrant-gold animate-spin mb-2" />
                    <p className="text-white/60 text-sm">Loading complete Ola Map...</p>
                </div>
            )}
            <div ref={mapContainer} className="w-full h-full" />

            {/* Embedded Legend */}
            {markers && markers.length > 0 && mapLoaded && (
                <div className="absolute bottom-6 right-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl z-20 pointer-events-none border border-gray-200">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Legend</div>
                    <div className="space-y-1">
                        {Object.entries(typeConfig).filter(([k]) => k !== 'default').map(([key, val]) => (
                            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-700">
                                <span className="text-[10px]">{val.icon}</span>
                                <span className="font-medium text-[10px]">{val.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
