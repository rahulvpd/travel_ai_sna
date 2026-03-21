// src/components/chennai/ChennaiSNAForceGraph.jsx
// TAB 2 — D3 force-directed abstract network graph
// Physics simulation — forceLink, forceManyBody, forceCollide

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dynastyHex } from '../../utils/dynastyColors';
import { EDGE_CONFIG } from '../../services/chennaiSNA';

export default function ChennaiSNAForceGraph({ snaData }) {
  const svgRef = useRef(null);
  const contRef = useRef(null);
  const simRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [dynasty, setDynasty] = useState(null);
  const [edgeVis, setEdgeVis] = useState(Object.fromEntries(Object.keys(EDGE_CONFIG).map(k => [k, true])));
  const [search, setSearch] = useState('');
  const [ready, setReady] = useState(false);
  const [dims, setDims] = useState({ w: 820, h: 520 });

  // Responsive resize
  useEffect(() => {
    if (!contRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.max(entry.contentRect.width, 320);
      setDims({ w, h: Math.min(Math.max(w * 0.62, 400), 560) });
    });
    ro.observe(contRef.current);
    return () => ro.disconnect();
  }, []);

  // D3 render
  useEffect(() => {
    if (!snaData || !svgRef.current) return;
    setReady(false);

    import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then(d3 => {
      renderGraph(d3, snaData, dims);
      setReady(true);
    });

    return () => {
      if (simRef.current) simRef.current.stop();
      if (svgRef.current) svgRef.current.innerHTML = '';
    };
  }, [snaData, dims]);

  function renderGraph(d3, data, { w, h }) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', '100%').attr('height', h).attr('viewBox', `0 0 ${w} ${h}`);

    // Defs — glow filter
    const defs = svg.append('defs');
    const glow = defs.append('filter').attr('id', 'snaGlow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const fm = glow.append('feMerge');
    fm.append('feMergeNode').attr('in', 'blur');
    fm.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    // Zoom & pan
    const zoom = d3.zoom().scaleExtent([0.2, 5])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(w * 0.05, h * 0.05).scale(0.9));

    // Prepare node/link data
    const nodes = data.nodes.map(n => ({
      ...n,
      r: 7 + Math.min((data.metrics[n.id]?.weightedDegree || 0) * 1.3, 18),
      color: dynastyHex[n.dynasty] || '#888888',
      degree: data.metrics[n.id]?.degree || 0,
      cent: data.metrics[n.id]?.degreeCentrality || 0,
      btw: data.metrics[n.id]?.betweennessCentrality || 0,
    }));
    const links = data.edges.map(e => ({ ...e }));

    // Force simulation
    const sim = d3.forceSimulation(nodes)
      .force('link',
        d3.forceLink(links).id(d => d.id)
          .distance(d => Math.max(95 - d.weight * 9, 48))
          .strength(d => d.weight * 0.07)
      )
      .force('charge', d3.forceManyBody().strength(-175).distanceMax(380))
      .force('center', d3.forceCenter(w / 2, h / 2).strength(0.05))
      .force('collide', d3.forceCollide().radius(d => d.r + 11).strength(0.85))
      .force('x', d3.forceX(w / 2).strength(0.02))
      .force('y', d3.forceY(h / 2).strength(0.02))
      .alphaDecay(0.022);
    simRef.current = sim;

    // Draw edges
    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('class', d => `sna-link sna-link-${d.primaryType}`)
      .attr('stroke', d => EDGE_CONFIG[d.primaryType]?.color || '#fff')
      .attr('stroke-opacity', d => {
        const base = [0.65, 0.55, 0.45, 0.40, 0.38];
        const keys = Object.keys(EDGE_CONFIG);
        return base[keys.indexOf(d.primaryType)] || 0.35;
      })
      .attr('stroke-width', d => Math.sqrt(d.weight) * 0.85)
      .attr('stroke-dasharray', d => {
        if (d.primaryType === 'geographic') return '6,4';
        if (d.primaryType === 'era') return '10,5';
        if (d.primaryType === 'spiritual') return '3,5';
        return 'none';
      });

    // Draw node groups
    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('class', 'sna-node')
      .attr('cursor', 'pointer')
      .style('opacity', 0)
      .call(
        d3.drag()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Hub outer glow ring
    node.filter(d => d.cent > 0.55)
      .append('circle')
      .attr('r', d => d.r + 9)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.28)
      .attr('filter', 'url(#snaGlow)');

    // Main node circle
    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.88)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.8)
      .attr('stroke-opacity', 0.55);

    // Inner glare highlight
    node.append('circle')
      .attr('r', d => d.r * 0.42)
      .attr('cx', d => -d.r * 0.22)
      .attr('cy', d => -d.r * 0.28)
      .attr('fill', 'rgba(255,255,255,0.22)')
      .attr('pointer-events', 'none');

    // Labels for degree >= 5
    node.filter(d => d.degree >= 5)
      .append('text')
      .text(d => d.name.split(' ')[0])
      .attr('x', d => d.r + 5)
      .attr('y', 4)
      .attr('fill', 'rgba(255,255,255,.72)')
      .attr('font-size', '9px')
      .attr('font-family', 'Outfit,sans-serif')
      .attr('pointer-events', 'none');

    // Bridge site indicator
    node.filter(d => d.btw > 0.6)
      .append('circle')
      .attr('r', 3)
      .attr('cx', d => d.r - 2)
      .attr('cy', d => -d.r + 2)
      .attr('fill', '#00C9B1')
      .attr('opacity', 0.9);

    // Interactions
    node
      .on('mouseover', (e, d) => {
        setTooltip({ x: e.clientX, y: e.clientY, node: d, metrics: snaData.metrics[d.id] });
        link.attr('stroke-opacity', l => {
          const isConnected = l.source.id === d.id || l.target.id === d.id;
          const keys = Object.keys(EDGE_CONFIG);
          const base = [0.65, 0.55, 0.45, 0.40, 0.38];
          return isConnected ? (base[keys.indexOf(l.primaryType)] || 0.35) * 2 : 0.04;
        });
        node.style('opacity', n =>
          n.id === d.id || snaData.metrics[d.id]?.neighbours?.includes(n.id) ? 1 : 0.1
        );
      })
      .on('mousemove', e => setTooltip(p => p ? { ...p, x: e.clientX, y: e.clientY } : null))
      .on('mouseout', () => {
        setTooltip(null);
        const keys = Object.keys(EDGE_CONFIG);
        const base = [0.65, 0.55, 0.45, 0.40, 0.38];
        link.attr('stroke-opacity', d => base[keys.indexOf(d.primaryType)] || 0.35);
        node.style('opacity', 1);
      })
      .on('click', (e, d) => {
        e.stopPropagation();
        setSelected(prev => prev?.id === d.id ? null : {
          ...d,
          metrics: snaData.metrics[d.id],
          connectedNames: (snaData.metrics[d.id]?.neighbours || [])
            .map(nId => snaData.nodes.find(n => n.id === nId)?.name)
            .filter(Boolean),
        });
      });

    svg.on('click', () => setSelected(null));

    // Tick
    let tick = 0;
    sim.on('tick', () => {
      tick++;
      if (tick === 14) node.transition().duration(500).style('opacity', 1);
      nodes.forEach(d => {
        d.x = Math.max(d.r + 8, Math.min(w - d.r - 8, d.x));
        d.y = Math.max(d.r + 8, Math.min(h - d.r - 8, d.y));
      });
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    setTimeout(() => sim.alphaTarget(0), 4500);
  }

  const toggleEdge = useCallback((type) => {
    setEdgeVis(prev => {
      const next = { ...prev, [type]: !prev[type] };
      import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then(d3 => {
        d3.select(svgRef.current)
          .selectAll(`.sna-link-${type}`)
          .attr('stroke-opacity', next[type] ? null : 0)
          .attr('display', next[type] ? null : 'none');
      });
      return next;
    });
  }, []);

  const filterDynasty = useCallback((d) => {
    const next = dynasty === d ? null : d;
    setDynasty(next);
    setSelected(null);
    import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then(d3 => {
      const svg = d3.select(svgRef.current);
      if (!next) {
        svg.selectAll('.sna-node').style('opacity', 1);
        const keys = Object.keys(EDGE_CONFIG);
        const base = [0.65, 0.55, 0.45, 0.40, 0.38];
        svg.selectAll('line').attr('stroke-opacity', l => base[keys.indexOf(l.primaryType)] || 0.35);
      } else {
        svg.selectAll('.sna-node').style('opacity', n => n.dynasty === next ? 1 : 0.08);
        svg.selectAll('line').attr('stroke-opacity', l =>
          (l.source.dynasty === next || l.target.dynasty === next) ? 0.75 : 0.03
        );
      }
    });
  }, [dynasty]);

  const handleSearch = useCallback((q) => {
    setSearch(q);
    if (!svgRef.current) return;
    import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then(d3 => {
      const svg = d3.select(svgRef.current);
      if (!q.trim()) { svg.selectAll('.sna-node').style('opacity', 1); return; }
      svg.selectAll('.sna-node').style('opacity',
        n => n.name?.toLowerCase().includes(q.toLowerCase()) ? 1 : 0.07
      );
    });
  }, []);

  const dynasties = snaData ? [...new Set(snaData.nodes.map(n => n.dynasty))] : [];

  return (
    <div className="space-y-4">

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <input type="text" placeholder="🔍 Search node…" value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-vibrant-gold/50 transition-all" />
          {search && <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-lg">×</button>}
        </div>
        <button
          onClick={() => { if (simRef.current) { simRef.current.alpha(0.5).restart(); setTimeout(() => simRef.current?.alphaTarget(0), 4000); }}}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">
          ⟳ Restart Physics
        </button>
        {dynasty && (
          <button onClick={() => filterDynasty(dynasty)}
            className="px-3 py-1.5 text-xs border border-vibrant-gold/30 text-vibrant-gold bg-vibrant-gold/10 rounded-xl hover:bg-vibrant-gold/20 transition-all">
            ✕ Clear Filter
          </button>
        )}
      </div>

      {/* Edge toggles */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30 flex-shrink-0">Edges:</span>
        {Object.entries(EDGE_CONFIG).map(([type, cfg]) => (
          <button key={type} onClick={() => toggleEdge(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              edgeVis[type] ? 'bg-white/8 border-white/20 text-white/80' : 'bg-white/3 border-white/5 text-white/18 line-through'
            }`}>
            <span className="w-4 h-0.5 rounded-full" style={{ background: edgeVis[type] ? cfg.color : 'rgba(255,255,255,.12)' }} />
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Graph canvas */}
      <div ref={contRef} className="relative w-full bg-white/3 border border-white/10 rounded-2xl overflow-hidden" style={{ minHeight: dims.h }}>
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-vibrant-gold/30 border-t-vibrant-gold rounded-full animate-spin" />
            <p className="text-white/40 text-xs">Simulating network forces…</p>
          </div>
        )}
        <svg ref={svgRef} style={{ display: ready ? 'block' : 'none' }} />
        {ready && (
          <div className="absolute bottom-3 right-3 text-xs text-white/18 pointer-events-none select-none">
            Scroll zoom · Drag pan · Drag nodes · Click inspect · 🟢 = bridge site
          </div>
        )}
      </div>

      {/* Dynasty legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30 flex-shrink-0">Filter:</span>
        {dynasties.map(d => (
          <button key={d} onClick={() => filterDynasty(d)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              dynasty === d ? 'border-white/40 bg-white/12 text-white scale-105'
                : dynasty ? 'border-white/5 text-white/22 bg-white/3'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
            }`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: dynastyHex[d] || '#888' }} />
            {d}
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none" style={{ left: tooltip.x + 14, top: tooltip.y - 54 }}>
          <div className="bg-black/92 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-3 text-xs shadow-2xl min-w-40">
            <div className="font-semibold text-white mb-1">{tooltip.node.name}</div>
            <div className="text-white/50 mb-2">{tooltip.node.dynasty} · {tooltip.node.placeType}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span className="text-white/40">Links</span> <span className="text-vibrant-gold font-medium">{tooltip.node.degree}</span>
              <span className="text-white/40">Centrality</span> <span className="text-vibrant-gold font-medium">{((tooltip.metrics?.degreeCentrality || 0) * 100).toFixed(0)}%</span>
              <span className="text-white/40">Bridge</span> <span className="text-teal-400 font-medium">{((tooltip.metrics?.betweennessCentrality || 0) * 100).toFixed(0)}%</span>
              <span className="text-white/40">Influence</span> <span className="text-purple-400 font-medium">{(tooltip.metrics?.eigenvector || 0).toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold font-syne flex-shrink-0"
                  style={{ background: `${dynastyHex[selected.dynasty] || '#888'}20`, border: `1.5px solid ${dynastyHex[selected.dynasty] || '#888'}50`, color: dynastyHex[selected.dynasty] || '#888' }}>
                  {selected.metrics?.degree || 0}
                </div>
                <div>
                  <h3 className="font-syne font-bold text-white">{selected.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ background: `${dynastyHex[selected.dynasty] || '#888'}15`, borderColor: `${dynastyHex[selected.dynasty] || '#888'}40`, color: dynastyHex[selected.dynasty] || '#888' }}>
                    {selected.dynasty}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xl">×</button>
            </div>
            {selected.significance && (
              <p className="text-xs text-white/50 leading-relaxed mb-4 border-l-2 pl-3"
                style={{ borderColor: `${dynastyHex[selected.dynasty] || '#888'}40` }}>
                {selected.significance}
              </p>
            )}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { l: 'Links', v: selected.metrics?.degree || 0, c: '#FFCC00' },
                { l: 'Centrality', v: `${((selected.metrics?.degreeCentrality || 0) * 100).toFixed(0)}%`, c: '#00C9B1' },
                { l: 'Bridging', v: `${((selected.metrics?.betweennessCentrality || 0) * 100).toFixed(0)}%`, c: '#4F8EFF' },
                { l: 'Influence', v: (selected.metrics?.eigenvector || 0).toFixed(3), c: '#A855F7' },
              ].map(m => (
                <div key={m.l} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-lg font-bold font-syne" style={{ color: m.c }}>{m.v}</div>
                  <div className="text-xs text-white/50 mt-0.5">{m.l}</div>
                </div>
              ))}
            </div>
            {selected.connectedNames?.length > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Connected to {selected.connectedNames.length} sites</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.connectedNames.slice(0, 10).map(n => (
                    <span key={n} className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60">{n}</span>
                  ))}
                  {selected.connectedNames.length > 10 && <span className="text-xs text-white/25">+{selected.connectedNames.length - 10}</span>}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}