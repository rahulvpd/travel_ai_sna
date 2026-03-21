import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

// Default to Tamil Nadu coordinates if no center provided
const DEFAULT_CENTER = { lat: 11.1271, lng: 78.6569 };

const MapComponent = ({ center, markers, showRoutes = false }) => {
    const SOLVICE_API_KEY = import.meta.env.VITE_SOLVICE_API_KEY || 'YOUR_SOLVICE_API_KEY';
    const MAP_STYLE = `https://cdn.solvice.io/styles/light.json?key=${SOLVICE_API_KEY}`;

    const viewState = useMemo(() => ({
        longitude: center?.lng || DEFAULT_CENTER.lng,
        latitude: center?.lat || DEFAULT_CENTER.lat,
        zoom: center ? 12 : 7
    }), [center]);

    // Create route GeoJSON from markers
    const routeGeoJSON = useMemo(() => {
        if (!markers || markers.length < 2 || !showRoutes) return null;

        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: markers.map(m => [m.lng, m.lat])
            }
        };
    }, [markers, showRoutes]);

    // Layer style for route line
    const routeLayerStyle = {
        type: 'line',
        paint: {
            'line-color': '#D4AF37',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 2]
        }
    };

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border-2 border-heritage-gold/30 shadow-2xl z-0 relative">
            <Map
                mapLib={maplibregl}
                initialViewState={viewState}
                style={{ width: "100%", height: "100%" }}
                mapStyle={MAP_STYLE}
                attributionControl={true}
            >
                <GeolocateControl position="top-left" />
                <FullscreenControl position="top-left" />
                <NavigationControl position="top-left" />
                <ScaleControl />

                {/* Route line */}
                {routeGeoJSON && (
                    <Source id="route" type="geojson" data={routeGeoJSON}>
                        <Layer {...routeLayerStyle} />
                    </Source>
                )}

                {/* Activity markers */}
                {markers && markers.map((marker, index) => (
                    <Marker
                        key={index}
                        longitude={marker.lng}
                        latitude={marker.lat}
                        anchor="bottom"
                    >
                        <div className="relative group cursor-pointer z-10">
                            {/* Numbered marker */}
                            <div className="flex flex-col items-center">
                                <div className="bg-vibrant-gold text-black font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg mb-1 animate-bounce">
                                    {index + 1}
                                </div>
                                <MapPin className="w-8 h-8 text-vibrant-gold drop-shadow-md fill-current" />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-lg shadow-xl text-black text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-50 border border-vibrant-gold/20">
                                <div className="font-bold text-vibrant-gold mb-1">{marker.title}</div>
                                {marker.time && <div className="text-xs text-gray-600">⏰ {marker.time}</div>}
                                {marker.rating && (
                                    <div className="text-xs text-yellow-600 mt-1">⭐ {marker.rating} stars</div>
                                )}
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>

            {/* API Key Warning Overlay */}
            {(!SOLVICE_API_KEY || SOLVICE_API_KEY === 'YOUR_SOLVICE_API_KEY') && (
                <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                    Warning: Solvice API Key missing
                </div>
            )}
        </div>
    );
};

export default MapComponent;
