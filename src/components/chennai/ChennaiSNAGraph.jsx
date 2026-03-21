import React, { useEffect, useRef, useState } from 'react';
import { dynastyHex } from '../../utils/dynastyColors';

const ChennaiSNAGraph = ({ data }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const svgLayer = useRef(null);
    const [L, setL] = useState(null);

    // 1. Dynamic Import of Leaflet
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((module) => {
                setL(module.default);
                // Import CSS dynamically if needed, or assume global CSS handles it
                // Usually better to add <link> in index.html, but we can't touch that.
                // Assuming leaflet CSS is present or imported via global styles.
                import('leaflet/dist/leaflet.css'); 
            });
        }
    }, []);

    // 2. Initialize Map & Render Graph
    useEffect(() => {
        if (!L || !mapContainer.current || !data) return;
        if (mapInstance.current) return; // Double-init guard

        // Init Map
        const map = L.map(mapContainer.current, {
            center: [13.0674, 80.2376],
            zoom: 12,
            zoomControl: false,
            attributionControl: false
        });

        // Dark Tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(map);

        mapInstance.current = map;

        // Create SVG Overlay for Edges
        L.svg({ clickable: true }).addTo(map);
        const overlayPane = map.getPane('overlayPane');
        const svgElement = overlayPane.querySelector('svg');
        svgLayer.current = svgElement;
        
        // Render Nodes (Markers)
        const nodeMarkers = {};
        data.nodes.forEach(node => {
            if (!node.lat || !node.lng) return;

            const color = dynastyHex[node.dynasty] || '#fff';
            const radius = Math.max(4, Math.sqrt(node.degree || 1) * 3);

            const marker = L.circleMarker([node.lat, node.lng], {
                radius: radius,
                fillColor: color,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            marker.bindPopup(`
                <div class="font-sans text-black">
                    <strong>${node.name}</strong><br/>
                    <span style="color:${color}">${node.dynasty}</span><br/>
                    <small>${node.type}</small>
                </div>
            `);
            
            nodeMarkers[node.id] = marker;
        });

        // Function to Draw Edges
        const drawEdges = () => {
            if (!svgElement) return;
            
            // Clear existing paths
            while (svgElement.firstChild) {
                svgElement.removeChild(svgElement.firstChild);
            }

            data.edges.forEach(edge => {
                const source = data.nodes.find(n => n.id === edge.source);
                const target = data.nodes.find(n => n.id === edge.target);

                if (!source || !target || !source.lat || !target.lat) return;

                const p1 = map.latLngToLayerPoint([source.lat, source.lng]);
                const p2 = map.latLngToLayerPoint([target.lat, target.lng]);

                // Create Bezier Curve
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                
                // Calculate control point for curve
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                // Offset perpendicular to line
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offset = dist * 0.2; // Curve amount
                
                const cx = midX - dy * 0.2;
                const cy = midY + dx * 0.2;

                const d = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
                
                path.setAttribute('d', d);
                path.setAttribute('fill', 'none');
                
                // Color based on edge type
                let stroke = '#555';
                if (edge.type === 'dynasty') stroke = '#FFD700'; // Gold
                else if (edge.type === 'spiritual') stroke = '#9370DB'; // Purple
                else if (edge.type === 'era') stroke = '#FF4500'; // Orange
                
                path.setAttribute('stroke', stroke);
                path.setAttribute('stroke-width', (edge.weight || 1) * 0.5);
                path.setAttribute('stroke-opacity', 0.6);
                
                svgElement.appendChild(path);
            });
        };

        // Redraw on zoom/move
        map.on('moveend zoomend', drawEdges);
        
        // Initial Draw
        drawEdges();

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [L, data]); // Re-run if data or L changes

    if (!L) return <div className="h-[500px] flex items-center justify-center text-white/30">Loading Map Engine...</div>;

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-white/10">
            <div ref={mapContainer} className="w-full h-full bg-[#111]" />
            
            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur p-3 rounded-lg border border-white/10 text-xs text-white z-[1000]">
                <div className="font-bold mb-2 text-white/70">Edge Types</div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-0.5 bg-[#FFD700]"></span> Dynasty Link
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-0.5 bg-[#9370DB]"></span> Spiritual Path
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-[#FF4500]"></span> Era Match
                </div>
            </div>
        </div>
    );
};

export default ChennaiSNAGraph;
