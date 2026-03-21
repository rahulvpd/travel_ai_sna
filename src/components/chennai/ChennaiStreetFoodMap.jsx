// src/components/chennai/ChennaiStreetFoodMap.jsx
// Interactive Leaflet map of Chennai's iconic street food spots

import { useEffect, useRef, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

const STREET_FOOD_SPOTS = [
    { name: "Marina Beach Sundal", lat: 13.0500, lng: 80.2824, food: "Sundal, Bajji, Kothu Parotta", timing: "Evening 5PM–9PM", price: "₹20–80", emoji: "🌊" },
    { name: "Ratna Cafe, Triplicane", lat: 13.0604, lng: 80.2785, food: "Idli Sambar, Filter Coffee", timing: "6:30AM–11:30AM", price: "₹40–100", emoji: "☕" },
    { name: "Murugan Idli Shop", lat: 13.0418, lng: 80.2341, food: "Idli, Dosa, Pongal, Filter Coffee", timing: "6AM–10PM", price: "₹50–120", emoji: "🫓" },
    { name: "Sowcarpet Chaat Street", lat: 13.0935, lng: 80.2800, food: "Pani Puri, Bhel Puri, Dahi Vada", timing: "Evening 4PM–11PM", price: "₹30–80", emoji: "🥙" },
    { name: "Anjappar Chettinad", lat: 13.0569, lng: 80.2425, food: "Chettinad Chicken, Parotta, Biryani", timing: "12PM–11PM", price: "₹200–400", emoji: "🍗" },
    { name: "Buhari Hotel, Anna Salai", lat: 13.0604, lng: 80.2448, food: "Ambur Biryani, Chicken 65, Korma", timing: "12PM–11PM", price: "₹150–350", emoji: "🍛" },
    { name: "Mylapore Filter Coffee", lat: 13.0333, lng: 80.2693, food: "Filter Coffee, Medu Vada, Pongal", timing: "5:30AM–8PM", price: "₹15–60", emoji: "☕" },
    { name: "George Town Parotta Stall", lat: 13.0872, lng: 80.2834, food: "Parotta, Salna, Mutton Curry", timing: "Evening 6PM–12AM", price: "₹60–120", emoji: "🫓" },
];

export default function ChennaiStreetFoodMap() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        if (mapInstance.current || !mapRef.current) return;
        let isDestroyed = false;

        import('leaflet').then((L) => {
            if (isDestroyed || !mapRef.current) return;
            try {
                // Fix default icon paths for Vite
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(mapRef.current, { zoomControl: true }).setView([13.0604, 80.2490], 12);
                mapInstance.current = map;

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);

                STREET_FOOD_SPOTS.forEach(spot => {
                    const icon = L.divIcon({
                        className: '',
                        html: `<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">${spot.emoji}</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    L.marker([spot.lat, spot.lng], { icon })
                        .addTo(map)
                        .bindPopup(`
              <div style="min-width:180px;font-family:sans-serif">
                <b style="font-size:14px">${spot.name}</b><br/>
                <span style="color:#888;font-size:12px">🍴 ${spot.food}</span><br/>
                <span style="color:#888;font-size:12px">⏰ ${spot.timing}</span><br/>
                <span style="color:#e68000;font-size:12px;font-weight:600">${spot.price}</span>
              </div>
            `);
                });
            } catch {
                if (!isDestroyed) setMapError(true);
            }
        }).catch(() => { if (!isDestroyed) setMapError(true); });

        return () => {
            isDestroyed = true;
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
                <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-bold text-white">Eat Like a Chennai Local</h2>
            </div>
            <p className="text-white/50 text-sm mb-5">The city's iconic food spots mapped</p>

            {mapError ? (
                <div className="h-72 rounded-xl bg-white/5 flex items-center justify-center text-white/40 text-sm">
                    Map unavailable — please check your connection
                </div>
            ) : (
                <div ref={mapRef} className="h-72 rounded-xl overflow-hidden" />
            )}

            {/* Quick legend */}
            <div className="mt-4 flex flex-wrap gap-3">
                {STREET_FOOD_SPOTS.slice(0, 4).map(s => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/60">
                        <span>{s.emoji}</span>
                        <span className="truncate max-w-[120px]">{s.name.split(',')[0]}</span>
                    </div>
                ))}
                <span className="text-xs text-white/30">+{STREET_FOOD_SPOTS.length - 4} more</span>
            </div>
        </div>
    );
}
