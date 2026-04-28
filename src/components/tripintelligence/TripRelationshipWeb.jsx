import { useEffect, useMemo, useRef, useState } from 'react';
import { EDGE_CONFIG } from '../../services/chennaiTripIntelligence';
import { dynastyHex } from '../../utils/dynastyColors';

export default function TripRelationshipWeb({ subgraph, moodColor }) {
  const svgRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [renderedKey, setRenderedKey] = useState('');
  const graphKey = useMemo(() => (subgraph?.nodes?.map((node) => node.id).join('|') || ''), [subgraph]);
  const ready = !!graphKey && renderedKey === graphKey;

  useEffect(() => {
    let cancelled = false;

    if (!subgraph || !svgRef.current || renderedKey === graphKey) {
      return undefined;
    }

    import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then((d3) => {
      if (cancelled || !svgRef.current) {
        return;
      }

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = 500;
      const height = 400;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;
      const nodes = subgraph.nodes;
      const total = Math.max(nodes.length, 1);
      const nodePositions = {};

      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

      nodes.forEach((node, index) => {
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        nodePositions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          angle,
        };
      });

      subgraph.edges.forEach((edge) => {
        const sourcePoint = nodePositions[edge.source];
        const targetPoint = nodePositions[edge.target];
        if (!sourcePoint || !targetPoint) {
          return;
        }

        const config = EDGE_CONFIG[edge.primaryType] || EDGE_CONFIG.dynasty;
        const midX = (sourcePoint.x + targetPoint.x) / 2;
        const midY = (sourcePoint.y + targetPoint.y) / 2;
        const dx = midX - centerX;
        const dy = midY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const pull = Math.max(0.2, 1 - (edge.weight || 0) / 8);
        const controlX = midX - (dx / distance) * distance * pull;
        const controlY = midY - (dy / distance) * distance * pull;

        svg
          .append('path')
          .attr('d', `M ${sourcePoint.x} ${sourcePoint.y} Q ${controlX} ${controlY} ${targetPoint.x} ${targetPoint.y}`)
          .attr('fill', 'none')
          .attr('stroke', config.color || '#FFCC00')
          .attr('stroke-opacity', 0.5)
          .attr('stroke-width', Math.sqrt(edge.weight || 1) * 1.5);
      });

      nodes.forEach((node) => {
        const position = nodePositions[node.id];
        const metrics = subgraph.metrics[node.id] || {};
        const color = dynastyHex[node.dynasty] || '#888888';
        const nodeRadius = 8 + Math.min((metrics.degree || 0) * 2.5, 16);
        const group = svg
          .append('g')
          .attr('transform', `translate(${position.x}, ${position.y})`)
          .attr('cursor', 'pointer')
          .on('click', () => setSelected((current) => (current?.id === node.id ? null : node)));

        group.append('circle').attr('r', nodeRadius + 6).attr('fill', color).attr('fill-opacity', 0.1);
        group.append('circle').attr('r', nodeRadius).attr('fill', color).attr('fill-opacity', 0.88).attr('stroke', color).attr('stroke-width', 2).attr('stroke-opacity', 0.6);

        const labelRadius = radius + 24;
        const labelX = centerX + labelRadius * Math.cos(position.angle) - position.x;
        const labelY = centerY + labelRadius * Math.sin(position.angle) - position.y;
        const anchor = position.x > centerX + 10 ? 'start' : position.x < centerX - 10 ? 'end' : 'middle';

        group
          .append('text')
          .attr('x', labelX)
          .attr('y', labelY + 4)
          .attr('text-anchor', anchor)
          .attr('fill', 'rgba(255,255,255,0.75)')
          .attr('font-size', '9px')
          .attr('font-family', 'Outfit, sans-serif')
          .attr('pointer-events', 'none')
          .text(node.name.split(' ')[0]);
      });

      svg.append('text').attr('x', centerX).attr('y', centerY - 8).attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.3)').attr('font-size', '9px').attr('font-family', 'Outfit, sans-serif').text('HERITAGE');
      svg.append('text').attr('x', centerX).attr('y', centerY + 6).attr('text-anchor', 'middle').attr('fill', moodColor).attr('font-size', '11px').attr('font-weight', '700').text('WEB');

      setRenderedKey(graphKey);
    });

    return () => {
      cancelled = true;
    };
  }, [graphKey, moodColor, renderedKey, subgraph]);

  return (
    <div>
      <div className="bg-white/3 rounded-2xl border border-white/8 overflow-hidden">
        <svg ref={svgRef} />
        {!ready && (
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-white/30 animate-pulse">Building relationship web...</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-3 p-4 rounded-xl border" style={{ background: `${dynastyHex[selected.dynasty] || '#888888'}10`, borderColor: `${dynastyHex[selected.dynasty] || '#888888'}25` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white">{selected.name}</p>
            <button type="button" onClick={() => setSelected(null)} className="text-white/30 hover:text-white">x</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${dynastyHex[selected.dynasty] || '#888888'}20`, color: dynastyHex[selected.dynasty] || '#888888', border: `1px solid ${dynastyHex[selected.dynasty] || '#888888'}40` }}>
              {selected.dynasty}
            </span>
            <span className="text-xs text-white/40">{selected.period}</span>
            <span className="text-xs text-white/40">{selected.placeType}</span>
          </div>
          {selected.significance && <p className="mt-2 text-xs text-white/55 leading-relaxed">{selected.significance}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(EDGE_CONFIG).map(([type, config]) =>
          subgraph.edges.some((edge) => edge.primaryType === type) ? (
            <span key={type} className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="inline-block w-3 h-0.5 rounded-full" style={{ background: config.color }} />
              {config.label}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
