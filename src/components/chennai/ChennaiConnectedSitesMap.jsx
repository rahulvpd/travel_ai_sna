// src/components/chennai/ChennaiConnectedSitesMap.jsx
// Leaflet map of heritage sites across Tamil Nadu connected to a selected Chennai place

import { useEffect, useRef, useState } from 'react';
 
import { motion } from 'framer-motion';
import { X, Loader2, Link2 } from 'lucide-react';
import { getChennaiHeritageNetwork } from '../../services/chennaiAgent';
import { DYNASTY_DOT_COLORS } from '../../services/chennaiMediaService';

// Chennai center coordinates
const CHENNAI_COORDS = [13.0827, 80.2707];
const TN_CENTER = [10.79, 78.70];

export default function ChennaiConnectedSitesMap({ placeName, onClose }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
     
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        getChennaiHeritageNetwork(placeName)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [placeName]);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current || loading) return;
        let isDestroyed = false;

        import('leaflet').then((L) => {
            if (isDestroyed || !mapRef.current) return;
            try {
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(mapRef.current, { zoomControl: true }).setView(TN_CENTER, 7);
                mapInstance.current = map;

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors', maxZoom: 18
                }).addTo(map);

                // Chennai star marker
                const starIcon = L.divIcon({
                    className: '',
                    html: `<div style="font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">⭐</div>`,
                    iconSize: [32, 32], iconAnchor: [16, 16]
                });
                L.marker(CHENNAI_COORDS, { icon: starIcon })
                    .addTo(map)
                    .bindPopup(`<b style="font-size:14px">${placeName}</b><br/><span style="color:#888;font-size:12px">Selected place · Chennai</span>`)
                    .openPopup();

                // Connected site markers
                const sites = data?.connectedSites || [];
                sites.forEach(site => {
                    if (!site.lat || !site.lng) return;
                    // Get dot color from dynasty
                    const dotColor = DYNASTY_DOT_COLORS[site.dynasty] || '#888';

                    const circleIcon = L.divIcon({
                        className: '',
                        html: `<div style="width:14px;height:14px;border-radius:50%;background:${dotColor.replace('bg-', '').replace('-400', '')};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.5)"></div>`,
                        iconSize: [14, 14], iconAnchor: [7, 7]
                    });

                    L.marker([site.lat, site.lng], { icon: circleIcon })
                        .addTo(map)
                        .bindPopup(`
              <div style="min-width:200px;font-family:sans-serif">
                <b style="font-size:14px">${site.name}</b><br/>
                <span style="color:#888;font-size:12px">📍 ${site.district}</span><br/>
                <span style="color:#888;font-size:12px">🔗 ${site.connectionType}</span><br/>
                <span style="font-size:12px;color:#555">${site.connectionReason}</span>
              </div>
            `);

                    // Draw line from Chennai to site
                    L.polyline([CHENNAI_COORDS, [site.lat, site.lng]], {
                        color: '#FFCC00', weight: 1.5, opacity: 0.4, dashArray: '5, 8'
                    }).addTo(map);
                });

                setMapReady(true);
            } catch {
                if (!isDestroyed) setMapError(true);
                setMapReady(true);
            }
        }).catch(() => {
            if (!isDestroyed) setMapError(true);
            setMapReady(true);
        });

        return () => {
            isDestroyed = true;
            if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
        };
    }, [loading, data, placeName]);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-yellow-400" />
                            <h3 className="text-white font-bold">Connected Heritage</h3>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">
                            Sites across Tamil Nadu linked to <span className="text-yellow-300">{placeName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Map */}
                <div className="relative h-80">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                        </div>
                    )}
                    {mapError && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                            Map unavailable
                        </div>
                    )}
                    <div ref={mapRef} className="w-full h-full" />
                </div>

                {/* Connected sites list */}
                {data?.connectedSites && data.connectedSites.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/10 max-h-48 overflow-y-auto space-y-2">
                        {data.connectedSites.map((site, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${DYNASTY_DOT_COLORS[site.dynasty] || 'bg-white/30'}`} />
                                <div>
                                    <span className="text-white font-medium">{site.name}</span>
                                    <span className="text-white/40 text-xs ml-2">{site.district}</span>
                                    <p className="text-white/40 text-xs">{site.connectionReason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
