import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EDGE_CONFIG } from '../../services/chennaiTripIntelligence';
import { dynastyHex } from '../../utils/dynastyColors';

const TILES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export default function TripSNAMapGraph({ subgraph, moodColor }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const svgOverlayRef = useRef(null);
  const markersLayerRef = useRef(null);
  const edgeVisibilityRef = useRef(Object.fromEntries(Object.keys(EDGE_CONFIG).map((key) => [key, true])));
  const [selected, setSelected] = useState(null);
  const [tileStyle, setTileStyle] = useState('dark');
  const [ready, setReady] = useState(false);
  const [edgeVisibility, setEdgeVisibility] = useState(edgeVisibilityRef.current);

  edgeVisibilityRef.current = edgeVisibility;

  const drawEdges = useCallback((leaflet, map, overlay, visibility) => {
    if (!overlay || !map || !subgraph) {
      return;
    }

    const overlayRoot = overlay._container || overlay;
    const svgElement = overlayRoot?.querySelector?.('svg') || overlayRoot;
    if (!svgElement) {
      return;
    }

    const existing = svgElement.querySelector('.trip-sna-edges');
    if (existing) {
      existing.remove();
    }

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'trip-sna-edges');
    svgElement.appendChild(group);

    subgraph.edges.forEach((edge) => {
      if (!visibility[edge.primaryType]) {
        return;
      }

      const source = subgraph.nodes.find((node) => node.id === edge.source);
      const target = subgraph.nodes.find((node) => node.id === edge.target);
      if (!source || !target) {
        return;
      }

      const sourcePoint = map.latLngToLayerPoint([source.lat, source.lng]);
      const targetPoint = map.latLngToLayerPoint([target.lat, target.lng]);
      const config = EDGE_CONFIG[edge.primaryType] || { color: moodColor };
      const dx = targetPoint.x - sourcePoint.x;
      const dy = targetPoint.y - sourcePoint.y;
      const controlX1 = sourcePoint.x + dx * 0.25 + dy * 0.25;
      const controlY1 = sourcePoint.y + dy * 0.25 - dx * 0.25;
      const controlX2 = targetPoint.x - dx * 0.25 + dy * 0.25;
      const controlY2 = targetPoint.y - dy * 0.25 - dx * 0.25;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${sourcePoint.x} ${sourcePoint.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetPoint.x} ${targetPoint.y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', config.color || moodColor);
      path.setAttribute('stroke-opacity', '0.8');
      path.setAttribute('stroke-width', String(Math.max(1.5, Math.sqrt(edge.weight || 1) * 2)));

      if (edge.primaryType === 'geographic') {
        path.setAttribute('stroke-dasharray', '6,4');
      }
      if (edge.primaryType === 'era') {
        path.setAttribute('stroke-dasharray', '10,5');
      }
      if (edge.primaryType === 'spiritual') {
        path.setAttribute('stroke-dasharray', '3,5');
      }

      group.appendChild(path);
    });
  }, [moodColor, subgraph]);

  useEffect(() => {
    if (!subgraph || !containerRef.current) {
      return undefined;
    }

    let mounted = true;
    let redraw = null;
    let readyTimer = null;
    const container = containerRef.current;

    (async () => {
      const leaflet = await import('leaflet');
      if (!mounted || !container) {
        return;
      }

      container.innerHTML = '';
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      const latitudes = subgraph.nodes.map((node) => node.lat);
      const longitudes = subgraph.nodes.map((node) => node.lng);
      const centerLat = latitudes.reduce((sum, value) => sum + value, 0) / latitudes.length;
      const centerLng = longitudes.reduce((sum, value) => sum + value, 0) / longitudes.length;

      const map = leaflet.map(container, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });
      mapRef.current = map;

      tileLayerRef.current = leaflet.tileLayer(TILES[tileStyle], {
        attribution: '© CartoDB © OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      svgOverlayRef.current = leaflet.svg().addTo(map);
      markersLayerRef.current = leaflet.layerGroup().addTo(map);

      subgraph.nodes.forEach((node) => {
        const metrics = subgraph.metrics[node.id] || {};
        const color = dynastyHex[node.dynasty] || '#888888';
        const radius = 10 + Math.min((metrics.degree || 0) * 2.5, 16);
        const isHub = (metrics.degreeCentrality || 0) > 0.55;
        const icon = leaflet.divIcon({
          className: '',
          html: `<div style="position:relative;width:${radius * 2}px;height:${radius * 2}px;transform:translate(-50%,-50%)">${isHub ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:1.5px solid ${color};opacity:.3;animation:snaPulse 2s ease-in-out infinite"></div>` : ''}<div style="width:${radius * 2}px;height:${radius * 2}px;border-radius:50%;background:${color};opacity:.92;border:2px solid ${color};box-shadow:0 0 ${isHub ? 18 : 8}px ${color}70;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:rgba(0,0,0,.75);cursor:pointer;">${metrics.degree || 0}</div></div>`,
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius],
        });

        const marker = leaflet.marker([node.lat, node.lng], { icon });
        marker.on('click', () => {
          setSelected({
            ...node,
            metrics,
            connectedNames: (metrics.neighbours || [])
              .map((id) => subgraph.nodes.find((item) => item.id === id)?.name)
              .filter(Boolean),
          });
        });
        marker.addTo(markersLayerRef.current);
      });

      redraw = () => {
        if (!mounted || !mapRef.current || !svgOverlayRef.current) {
          return;
        }
        drawEdges(leaflet, mapRef.current, svgOverlayRef.current, edgeVisibilityRef.current);
      };

      map.on('moveend zoomend resize viewreset', redraw);

      map.whenReady(() => {
        const bounds = leaflet.latLngBounds(subgraph.nodes.map((node) => [node.lat, node.lng]));
        map.fitBounds(bounds, { padding: [40, 40], animate: false });

        readyTimer = window.setTimeout(() => {
          if (!mounted || !mapRef.current) {
            return;
          }

          map.invalidateSize(false);
          redraw();
          setReady(true);
        }, 180);
      });
    })();

    return () => {
      mounted = false;
      if (readyTimer) {
        window.clearTimeout(readyTimer);
      }
      if (mapRef.current && redraw) {
        mapRef.current.off('moveend zoomend resize viewreset', redraw);
        mapRef.current.stop();
        mapRef.current.remove();
      }
      mapRef.current = null;
      tileLayerRef.current = null;
      svgOverlayRef.current = null;
      markersLayerRef.current = null;
      container.innerHTML = '';
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, [drawEdges, subgraph, tileStyle]);

  useEffect(() => {
    let cancelled = false;

    import('leaflet').then((leaflet) => {
      if (cancelled || !mapRef.current || !svgOverlayRef.current) {
        return;
      }
      drawEdges(leaflet, mapRef.current, svgOverlayRef.current, edgeVisibility);
    });

    return () => {
      cancelled = true;
    };
  }, [drawEdges, edgeVisibility]);

  const changeTile = useCallback((style) => {
    setTileStyle(style);
  }, []);

  const toggleEdge = useCallback((type) => {
    setEdgeVisibility((current) => ({
      ...current,
      [type]: !current[type],
    }));
  }, []);

  return (
    <div className="space-y-3">
      <style>{`
        @keyframes snaPulse { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.5);opacity:0} }
        .leaflet-control-zoom{border:1px solid rgba(255,255,255,.12)!important;border-radius:10px!important;overflow:hidden}
        .leaflet-control-zoom a{background:rgba(7,8,20,.9)!important;color:rgba(255,255,255,.7)!important;border-bottom:1px solid rgba(255,255,255,.1)!important}
        .leaflet-control-zoom a:hover{background:rgba(255,204,0,.2)!important;color:#FFCC00!important}
        .leaflet-attribution-flag{display:none!important}
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {[
            ['dark', 'Dark'],
            ['light', 'Light'],
            ['osm', 'OSM'],
          ].map(([style, label]) => (
            <button
              key={style}
              type="button"
              onClick={() => changeTile(style)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${tileStyle === style ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="text-xs text-white/25">Leaflet + CartoDB only · No Ola Maps</div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30">Edges:</span>
        {Object.entries(EDGE_CONFIG).map(([type, config]) =>
          subgraph.edges.some((edge) => edge.primaryType === type) ? (
            <button
              key={type}
              type="button"
              onClick={() => toggleEdge(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${edgeVisibility[type] ? 'bg-white/8 border-white/20 text-white/80' : 'bg-white/3 border-white/5 text-white/20 line-through'}`}
            >
              <span className="w-3 h-0.5 rounded-full" style={{ background: edgeVisibility[type] ? config.color : 'rgba(255,255,255,.12)' }} />
              {config.label}
            </button>
          ) : null
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: 400 }}>
        {!ready && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-vibrant-gold/30 border-t-vibrant-gold rounded-full animate-spin" />
              <p className="text-xs text-white/40">Loading SNA map...</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute bottom-3 left-3 z-10 text-xs text-white/20 pointer-events-none">Leaflet SNA map · Click node for details</div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl border"
            style={{ background: `${dynastyHex[selected.dynasty] || '#888888'}10`, borderColor: `${dynastyHex[selected.dynasty] || '#888888'}30` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-syne font-bold text-white">{selected.name}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${dynastyHex[selected.dynasty] || '#888888'}20`, color: dynastyHex[selected.dynasty] || '#888888', border: `1px solid ${dynastyHex[selected.dynasty] || '#888888'}40` }}>
                    {selected.dynasty}
                  </span>
                  <span className="text-xs text-white/40">{selected.placeType} · {selected.period}</span>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-xl text-white/30 hover:text-white">x</button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Degree', value: selected.metrics?.degree || 0, color: '#FFCC00' },
                { label: 'Centrality', value: `${((selected.metrics?.degreeCentrality || 0) * 100).toFixed(0)}%`, color: '#00C9B1' },
                { label: 'Bridge', value: `${((selected.metrics?.betweennessCentrality || 0) * 100).toFixed(0)}%`, color: '#4F8EFF' },
                { label: 'Cluster', value: (selected.metrics?.clusteringCoeff || 0).toFixed(2), color: '#A855F7' },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
                  <div className="text-sm font-bold font-syne" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-white/40">{item.label}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/30">{selected.lat?.toFixed(4)}N, {selected.lng?.toFixed(4)}E</p>

            {selected.connectedNames?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-white/40 mb-1">Connected to:</p>
                <div className="flex flex-wrap gap-1">
                  {selected.connectedNames.slice(0, 8).map((name) => (
                    <span key={name} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-white/60">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
