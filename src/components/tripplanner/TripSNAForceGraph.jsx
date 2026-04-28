import { useEffect, useRef, useState } from 'react';
import { dynastyHex } from '../../utils/dynastyColors';

export default function TripSNAForceGraph({ subgraph }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!subgraph?.nodes?.length || !svgRef.current) {
      setReady(false);
      return undefined;
    }

    setReady(false);

    import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then((d3) => {
      if (cancelled || !svgRef.current) {
        return;
      }

      const width = 340;
      const height = 260;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

      const nodes = subgraph.nodes.map((node) => ({
        ...node,
        r: 11 + Math.min((subgraph.metrics?.[node.id]?.degree || 0) * 2, 14),
        color: dynastyHex[node.dynasty] || '#888888',
      }));

      const links = subgraph.edges.map((edge) => ({ ...edge }));

      const simulation = d3
        .forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((node) => node.id).distance(80).strength(0.45))
        .force('charge', d3.forceManyBody().strength(-140))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide().radius((node) => node.r + 10));

      simulationRef.current = simulation;

      const link = svg
        .append('g')
        .attr('stroke', '#FFCC00')
        .attr('stroke-opacity', 0.55)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', (edge) => Math.max(1.25, Math.sqrt(edge.weight || 1)));

      const node = svg.append('g').selectAll('g').data(nodes).join('g');

      node
        .append('circle')
        .attr('r', (item) => item.r)
        .attr('fill', (item) => item.color)
        .attr('fill-opacity', 0.88)
        .attr('stroke', 'rgba(255,255,255,0.7)')
        .attr('stroke-width', 1.25);

      node
        .append('text')
        .text((item) => item.name.split(' ')[0])
        .attr('x', (item) => item.r + 4)
        .attr('y', 4)
        .attr('fill', 'rgba(255,255,255,0.75)')
        .attr('font-size', '8px')
        .attr('font-family', 'Outfit, sans-serif')
        .attr('pointer-events', 'none');

      node.append('title').text((item) => `${item.name} - ${item.dynasty}`);

      simulation.on('tick', () => {
        nodes.forEach((item) => {
          item.x = Math.max(item.r + 4, Math.min(width - item.r - 4, item.x ?? width / 2));
          item.y = Math.max(item.r + 4, Math.min(height - item.r - 4, item.y ?? height / 2));
        });

        link
          .attr('x1', (item) => item.source.x)
          .attr('y1', (item) => item.source.y)
          .attr('x2', (item) => item.target.x)
          .attr('y2', (item) => item.target.y);

        node.attr('transform', (item) => `translate(${item.x},${item.y})`);
      });

      window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        simulation.alphaTarget(0);
        setReady(true);
      }, 2200);
    });

    return () => {
      cancelled = true;
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
    };
  }, [subgraph]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <svg ref={svgRef} />
      {!ready && <p className="py-2 text-center text-xs text-white/35 animate-pulse">Simulating network...</p>}
    </div>
  );
}
