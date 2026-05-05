import React, { useEffect, useRef, useState } from 'react';

const CircuitsSNAMap = ({ data }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const svgLayer = useRef(null);
    const [L, setL] = useState(null);

    // Dynamic Import of Leaflet
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((module) => {
                setL(module.default);
                import('leaflet/dist/leaflet.css'); 
            });
        }
    }, []);

    // Initialize Map & Render Graph
    useEffect(() => {
        if (!L || !mapContainer.current || !data) return;
        if (mapInstance.current) return;

        // Init Map centered on Tamil Nadu
        const map = L.map(mapContainer.current, {
            center: [10.8505, 78.2699], // Central TN
            zoom: 7,
            zoomControl: true,
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
        
        // Define colors for circuits
        const circuitColors = {
            'Chola Heartland Circuit': '#d97706', // amber-600
            'Silk & Scripture Circuit': '#7e22ce', // purple-700
            'Temple & Sea Trail': '#1d4ed8', // blue-700
            'Western Ghats Wilderness Circuit': '#15803d', // green-700
            'Chettinad Craft & Cuisine Circuit': '#991b1b', // red-800
            'Spiritual Fire Circuit': '#c2410c', // orange-700
            'Art & Bronze Legacy Circuit': '#a16207', // yellow-700
            'Sangam Literature & Language Trail': '#0f766e', // teal-700
        };

        // Render Nodes (Markers)
        const nodeMarkers = {};
        data.nodes.forEach(node => {
            if (!node.coord || !node.coord.lat || !node.coord.lng) return;

            const color = circuitColors[node.circuitName] || '#fff';
            const radius = 6;

            const marker = L.circleMarker([node.coord.lat, node.coord.lng], {
                radius: radius,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0.9
            }).addTo(map);

            marker.bindPopup(`
                <div class="font-sans text-black">
                    <strong>${node.name}</strong><br/>
                    <small>${node.district}</small><br/>
                    <span style="color:${color}; font-size:10px; font-weight:bold;">${node.circuitName}</span>
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

            data.links.forEach(edge => {
                const source = data.nodes.find(n => n.id === edge.source);
                const target = data.nodes.find(n => n.id === edge.target);

                if (!source || !target || !source.coord || !target.coord) return;

                const p1 = map.latLngToLayerPoint([source.coord.lat, source.coord.lng]);
                const p2 = map.latLngToLayerPoint([target.coord.lat, target.coord.lng]);

                // Create Path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                
                const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
                
                path.setAttribute('d', d);
                path.setAttribute('fill', 'none');
                
                const stroke = circuitColors[edge.circuit] || '#888';
                
                path.setAttribute('stroke', stroke);
                path.setAttribute('stroke-width', 2);
                path.setAttribute('stroke-opacity', 0.6);
                path.setAttribute('stroke-dasharray', '5,5');
                
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
    }, [L, data]);

    if (!L) return <div className="h-[500px] flex items-center justify-center text-white/30">Loading Geographic Engine...</div>;

    return (
        <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-white/10">
            <div ref={mapContainer} className="w-full h-full bg-[#111]" />
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-2 rounded-lg border border-white/10 text-xs text-white z-[1000]">
                <strong>Statewide Cultural Circuits</strong><br/>
                <span className="text-white/50">Hover/click nodes for details</span>
            </div>
        </div>
    );
};

export default CircuitsSNAMap;
