// src/components/chennai/ChennaiSNAMapGraph.jsx
// TAB 1 — Real Leaflet map with 26 nodes at GPS coordinates
// SNA edges drawn as Bezier curves via L.svg() overlay
// Redraws on every map pan / zoom

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dynastyHex } from '../../utils/dynastyColors';
import { EDGE_CONFIG } from '../../services/chennaiSNA';

const MAP_TILES = {
  dark:  { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',  label: '🌙 Dark' },
  light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', label: '☀️ Light' },
  osm:   { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',            label: '🗺️ OSM' },
};

const CHENNAI_CENTER = [13.0674, 80.2376];
const DEFAULT_ZOOM = 12;

export default function ChennaiSNAMapGraph({ snaData }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const svgLayerRef = useRef(null);
  const tileRef = useRef(null);
  const markersRef = useRef([]);
  const isDestroyed = useRef(false);

  const [selected, setSelected] = useState(null);
  const [activeDynasty, setActiveDynasty] = useState(null);
  const [edgeVis, setEdgeVis] = useState(
    Object.fromEntries(Object.keys(EDGE_CONFIG).map(k => [k, true]))
  );
  const [mapStyle, setMapStyle] = useState('dark');
  const [search, setSearch] = useState('');
  const [showEdges, setShowEdges] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // ── Draw Bezier SVG edges ─────────────────────────────────
  const drawEdges = useCallback((L, map, svgContainer, ev, dynasty) => {
    if (!svgContainer || !map || !snaData) return;
    const svgEl = svgContainer.querySelector('svg') || svgContainer;
    const old = svgEl.querySelector('.sna-edges');
    if (old) old.remove();

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'sna-edges');
    svgEl.appendChild(g);

    snaData.edges.forEach(edge => {
      if (!ev[edge.primaryType]) return;
      const src = snaData.nodes.find(n => n.id === edge.source);
      const tgt = snaData.nodes.find(n => n.id === edge.target);
      if (!src || !tgt) return;

      const cfg = EDGE_CONFIG[edge.primaryType];
      if (!cfg) return;

      if (dynasty) {
        if (src.dynasty !== dynasty && tgt.dynasty !== dynasty) return;
      }

      const sp = map.latLngToLayerPoint([src.lat, src.lng]);
      const tp = map.latLngToLayerPoint([tgt.lat, tgt.lng]);

      // Cubic Bezier control points
      const dx = tp.x - sp.x, dy = tp.y - sp.y;
      const cx1 = sp.x + dx * 0.25 + dy * 0.22;
      const cy1 = sp.y + dy * 0.25 - dx * 0.22;
      const cx2 = tp.x - dx * 0.25 + dy * 0.22;
      const cy2 = tp.y - dy * 0.25 - dx * 0.22;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${sp.x} ${sp.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tp.x} ${tp.y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', cfg.color);
      path.setAttribute('stroke-opacity', String(dynasty ? cfg.opacity * 1.6 : cfg.opacity));
      path.setAttribute('stroke-width', String(cfg.width * Math.sqrt(edge.weight || 1) * 0.7));
      if (edge.primaryType === 'geographic') path.setAttribute('stroke-dasharray', '6,4');
      if (edge.primaryType === 'era') path.setAttribute('stroke-dasharray', '10,5');
      if (edge.primaryType === 'spiritual') path.setAttribute('stroke-dasharray', '3,5');
      g.appendChild(path);
    });
  }, [snaData]);

  // ── Add markers ───────────────────────────────────────────
  const addMarkers = useCallback((L, map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    snaData.nodes.forEach(node => {
      const met = snaData.metrics[node.id] || {};
      const r = 8 + Math.min((met.weightedDegree || 0) * 1.3, 20);
      const color = dynastyHex[node.dynasty] || '#888';
      const isHub = (met.degreeCentrality || 0) > 0.55;
      const cent = ((met.degreeCentrality || 0) * 100).toFixed(0);

      const icon = L.divIcon({
        className: '',
        html: `
<div style="position:relative;width:${r*2}px;height:${r*2}px;transform:translate(-50%,-50%)">
${isHub ? `
<div style="position:absolute;inset:-8px;border-radius:50%;
  border:1.5px solid ${color};opacity:.3;
  animation:snaPulse 2s ease-in-out infinite;"></div>
<div style="position:absolute;inset:-4px;border-radius:50%;
  border:1px solid ${color};opacity:.15;
  animation:snaPulse 2s ease-in-out infinite .5s;"></div>
` : ''}
<div style="
  width:${r*2}px;height:${r*2}px;border-radius:50%;
  background:${color};opacity:.92;
  border:2px solid ${color};
  box-shadow:0 0 ${isHub?18:8}px ${color}70, inset 0 1px 2px rgba(255,255,255,.25);
  display:flex;align-items:center;justify-content:center;
  font-size:${r>14?'10':'8'}px;font-weight:700;
  color:rgba(0,0,0,.75);font-family:'Outfit',sans-serif;
  cursor:pointer;transition:transform .2s;">
  ${met.degree || 0}
</div>
</div>`,
        iconSize: [r * 2, r * 2],
        iconAnchor: [r, r],
      });

      const marker = L.marker([node.lat, node.lng], { icon });

      marker.bindPopup(`
<div style="font-family:'Outfit',sans-serif;min-width:210px;padding:2px">
  <div style="font-size:11px;font-weight:700;margin-bottom:2px;color:#0a0a0f">${node.emoji || '📍'} ${node.name}</div>
  <div style="display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap">
    <span style="padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;
      background:${color}20;border:1px solid ${color}50;color:${color}">${node.dynasty}</span>
    <span style="padding:2px 8px;border-radius:12px;font-size:10px;background:#f0f0f0;color:#555">${node.placeType}</span>
  </div>
  <p style="font-size:11px;color:#444;line-height:1.5;margin-bottom:6px">${node.significance?.slice(0, 100)}…</p>
  <table style="font-size:11px;width:100%;border-collapse:collapse">
    <tr><td style="color:#666;padding:1px 0">Connections</td><td style="font-weight:700;color:#0a0a0f;text-align:right">${met.degree || 0}</td></tr>
    <tr><td style="color:#666;padding:1px 0">Centrality</td><td style="font-weight:700;color:#c8a400;text-align:right">${cent}%</td></tr>
    <tr><td style="color:#666;padding:1px 0">Period</td><td style="color:#333;text-align:right;font-size:10px">${node.period}</td></tr>
  </table>
</div>`, { maxWidth: 260 });

      marker.on('click', () => {
        setSelected({
          ...node, metrics: met,
          connectedNames: (met.neighbours || [])
            .map(nId => snaData.nodes.find(n => n.id === nId)?.name)
            .filter(Boolean),
        });
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [snaData]);

  // ── Init map ──────────────────────────────────────────────
  useEffect(() => {
    if (!snaData || !containerRef.current) return;
    isDestroyed.current = false;

    (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      if (isDestroyed.current) return;

      const container = containerRef.current;
      if (!container || container._leaflet_id) return;

      const map = L.map(container, { center: CHENNAI_CENTER, zoom: DEFAULT_ZOOM, zoomControl: true });
      mapRef.current = map;

      tileRef.current = L.tileLayer(MAP_TILES.dark.url, {
        attribution: '© CartoDB © OpenStreetMap', maxZoom: 18,
      }).addTo(map);

      const svgOverlay = L.svg().addTo(map);
      svgLayerRef.current = svgOverlay._container;

      drawEdges(L, map, svgLayerRef.current, edgeVis, activeDynasty);
      addMarkers(L, map);

      map.on('moveend zoomend', () => {
        if (!isDestroyed.current) {
          drawEdges(L, map, svgLayerRef.current, edgeVis, activeDynasty);
        }
      });

      setMapReady(true);
    })();

    return () => {
      isDestroyed.current = true;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [snaData]);

  // ── Change tile style ─────────────────────────────────────
  const changeStyle = useCallback(async (style) => {
    setMapStyle(style);
    if (!mapRef.current) return;
    const L = await import('leaflet');
    if (tileRef.current) mapRef.current.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(MAP_TILES[style].url, {
      attribution: '© CartoDB © OpenStreetMap', maxZoom: 18,
    }).addTo(mapRef.current);
  }, []);

  // ── Toggle edge type ──────────────────────────────────────
  const toggleEdge = useCallback(async (type) => {
    setEdgeVis(prev => {
      const next = { ...prev, [type]: !prev[type] };
      import('leaflet').then(L => {
        if (mapRef.current && svgLayerRef.current) {
          drawEdges(L, mapRef.current, svgLayerRef.current, next, activeDynasty);
        }
      });
      return next;
    });
  }, [drawEdges, activeDynasty]);

  // ── Dynasty filter ────────────────────────────────────────
  const filterDynasty = useCallback(async (d) => {
    const next = activeDynasty === d ? null : d;
    setActiveDynasty(next);
    import('leaflet').then(L => {
      if (mapRef.current && svgLayerRef.current) {
        drawEdges(L, mapRef.current, svgLayerRef.current, edgeVis, next);
      }
    });
    markersRef.current.forEach((marker, i) => {
      const node = snaData?.nodes[i];
      const el = marker.getElement();
      if (el) {
        el.style.opacity = !next || node?.dynasty === next ? '1' : '0.12';
        el.style.transition = 'opacity .3s';
      }
    });
  }, [activeDynasty, drawEdges, edgeVis, snaData]);

  // ── Search fly-to ─────────────────────────────────────────
  const doSearch = useCallback(async (q) => {
    setSearch(q);
    if (!q.trim()) {
      markersRef.current.forEach(m => { const el = m.getElement(); if (el) el.style.opacity = '1'; });
      return;
    }
    const match = snaData?.nodes.find(n => n.name.toLowerCase().includes(q.toLowerCase()));
    if (match && mapRef.current) {
      const L = await import('leaflet');
      mapRef.current.flyTo([match.lat, match.lng], 16, { duration: 1.2 });
    }
    markersRef.current.forEach((marker, i) => {
      const node = snaData?.nodes[i];
      const el = marker.getElement();
      if (el) el.style.opacity = node?.name.toLowerCase().includes(q.toLowerCase()) ? '1' : '0.08';
    });
  }, [snaData]);

  const dynasties = snaData ? [...new Set(snaData.nodes.map(n => n.dynasty))] : [];

  return (
    <div className="space-y-4">

      {/* Pulse animation */}
      <style>{`
@keyframes snaPulse { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.6);opacity:0} }
.leaflet-control-zoom { border:1px solid rgba(255,255,255,.12)!important; border-radius:12px!important; overflow:hidden }
.leaflet-control-zoom a { background:rgba(10,10,15,.9)!important; color:rgba(255,255,255,.7)!important; border-bottom:1px solid rgba(255,255,255,.1)!important; width:32px!important; height:32px!important; line-height:32px!important }
.leaflet-control-zoom a:hover { background:rgba(255,204,0,.2)!important; color:#FFCC00!important }
.leaflet-popup-content-wrapper { border-radius:14px!important; box-shadow:0 24px 60px rgba(0,0,0,.5)!important }
.leaflet-attribution-flag { display:none!important }
`}</style>

      {/* Controls Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            placeholder="🔍 Search site & fly to it…"
            value={search}
            onChange={e => doSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-vibrant-gold/50 focus:bg-white/8 transition-all"
          />
          {search && (
            <button onClick={() => doSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-lg">×</button>
          )}
        </div>

        {/* Map style */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {Object.entries(MAP_TILES).map(([key, { label }]) => (
            <button key={key} onClick={() => changeStyle(key)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${mapStyle === key ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Edge toggle */}
        <button
          onClick={() => {
            setShowEdges(p => {
              const next = !p;
              if (svgLayerRef.current) svgLayerRef.current.style.display = next ? '' : 'none';
              return next;
            });
          }}
          className={`px-3 py-2 rounded-xl text-xs border transition-all ${showEdges ? 'bg-vibrant-gold/10 border-vibrant-gold/30 text-vibrant-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
        >
          {showEdges ? '🔗 Edges On' : '🔗 Edges Off'}
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            if (mapRef.current) mapRef.current.flyTo(CHENNAI_CENTER, DEFAULT_ZOOM, { duration: 1 });
            filterDynasty(activeDynasty || '');
            doSearch('');
          }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white hover:border-white/25 transition-all"
        >
          ⟳ Reset
        </button>
      </div>

      {/* Edge type toggles */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30 flex-shrink-0">Edge types:</span>
        {Object.entries(EDGE_CONFIG).map(([type, cfg]) => (
          <button key={type} onClick={() => toggleEdge(type)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              edgeVis[type] ? 'bg-white/8 border-white/20 text-white/80' : 'bg-white/3 border-white/5 text-white/20 line-through'
            }`}>
            <span className="w-4 h-0.5 rounded-full inline-block flex-shrink-0"
              style={{ background: edgeVis[type] ? cfg.color : 'rgba(255,255,255,.12)' }} />
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: 520 }}>
        {!mapReady && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-vibrant-gold/30 border-t-vibrant-gold rounded-full animate-spin" />
              <p className="text-white/50 text-xs">Initialising map…</p>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full" />

        {/* Network stats overlay */}
        {snaData && mapReady && (
          <div className="absolute top-3 left-3 z-10 bg-black/82 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-2 font-medium">Network</div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 text-xs">
              <span className="text-white/50">Sites</span> <span className="text-vibrant-gold font-bold">{snaData.networkStats.totalNodes}</span>
              <span className="text-white/50">Edges</span> <span className="text-vibrant-gold font-bold">{snaData.networkStats.totalEdges}</span>
              <span className="text-white/50">Avg Links</span> <span className="text-white/70">{snaData.networkStats.averageDegree}</span>
              <span className="text-white/50">Density</span> <span className="text-white/70">{snaData.networkStats.networkDensity}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-10 text-xs text-white/20 pointer-events-none select-none">
          Click node for details · Scroll to zoom · Drag to pan
        </div>
      </div>

      {/* Dynasty filter legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30 flex-shrink-0">Filter dynasty:</span>
        {dynasties.map(d => (
          <button key={d} onClick={() => filterDynasty(d)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              activeDynasty === d
                ? 'border-white/40 bg-white/12 text-white scale-105 shadow-lg'
                : activeDynasty
                  ? 'border-white/5 bg-white/3 text-white/22'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
            }`}>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dynastyHex[d] || '#888' }} />
            {d}
            <span className="text-white/30">({snaData?.nodes.filter(n => n.dynasty === d).length})</span>
          </button>
        ))}
        {activeDynasty && (
          <button onClick={() => filterDynasty(activeDynasty)}
            className="px-3 py-1.5 text-xs border border-vibrant-gold/30 text-vibrant-gold bg-vibrant-gold/10 rounded-lg hover:bg-vibrant-gold/20 transition-all">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Selected node detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: .97 }}
            transition={{ duration: 0.22 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold font-syne flex-shrink-0"
                  style={{
                    background: `${dynastyHex[selected.dynasty] || '#888'}20`,
                    border: `1.5px solid ${dynastyHex[selected.dynasty] || '#888'}50`,
                    color: dynastyHex[selected.dynasty] || '#888',
                    boxShadow: `0 0 20px ${dynastyHex[selected.dynasty] || '#888'}20`,
                  }}>
                  {selected.metrics?.degree || 0}
                </div>
                <div>
                  <h3 className="font-syne font-bold text-white text-lg leading-tight">{selected.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs px-2.5 py-1 rounded-full border font-medium"
                      style={{
                        background: `${dynastyHex[selected.dynasty] || '#888'}15`,
                        borderColor: `${dynastyHex[selected.dynasty] || '#888'}40`,
                        color: dynastyHex[selected.dynasty] || '#888',
                      }}>
                      {selected.dynasty}
                    </span>
                    <span className="text-xs text-white/40">{selected.placeType}</span>
                    <span className="text-xs text-white/25">·</span>
                    <span className="text-xs text-white/30">{selected.period}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const L = await import('leaflet');
                    if (mapRef.current) mapRef.current.flyTo([selected.lat, selected.lng], 16, { duration: 1.2 });
                  }}
                  className="text-xs px-3 py-1.5 bg-white/8 border border-white/15 rounded-xl text-white/60 hover:text-white hover:border-white/30 transition-all">
                  📍 Fly to
                </button>
                <button onClick={() => setSelected(null)}
                  className="text-white/30 hover:text-white text-xl transition-colors px-1">×</button>
              </div>
            </div>

            {/* Significance */}
            {selected.significance && (
              <p className="text-sm text-white/60 leading-relaxed mb-5 border-l-2 pl-4"
                style={{ borderColor: `${dynastyHex[selected.dynasty] || '#888'}50` }}>
                {selected.significance}
              </p>
            )}

            {/* 4 SNA metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { l: 'Connections', v: selected.metrics?.degree || 0, c: '#FFCC00', sub: 'degree' },
                { l: 'Centrality', v: `${((selected.metrics?.degreeCentrality || 0) * 100).toFixed(0)}%`, c: '#00C9B1', sub: 'normalised' },
                { l: 'Bridging', v: `${((selected.metrics?.betweennessCentrality || 0) * 100).toFixed(0)}%`, c: '#4F8EFF', sub: 'betweenness' },
                { l: 'Influence', v: (selected.metrics?.eigenvector || 0).toFixed(3), c: '#A855F7', sub: 'eigenvector' },
              ].map(m => (
                <div key={m.l} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center hover:border-white/15 transition-all">
                  <div className="text-2xl font-bold font-syne" style={{ color: m.c }}>{m.v}</div>
                  <div className="text-xs font-medium text-white/70 mt-0.5">{m.l}</div>
                  <div className="text-xs text-white/30">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* GPS + connected sites */}
            <p className="text-xs text-white/25 mb-3">
              📍 {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E
            </p>
            {selected.connectedNames?.length > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                  Connected to {selected.connectedNames.length} sites
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.connectedNames.slice(0, 10).map(name => (
                    <button key={name}
                      onClick={async () => {
                        const node = snaData?.nodes.find(n => n.name === name);
                        if (node && mapRef.current) {
                          const L = await import('leaflet');
                          mapRef.current.flyTo([node.lat, node.lng], 15, { duration: 1 });
                        }
                      }}
                      className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/25 transition-all">
                      {name}
                    </button>
                  ))}
                  {selected.connectedNames.length > 10 && (
                    <span className="text-xs text-white/25 px-1">+{selected.connectedNames.length - 10} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}