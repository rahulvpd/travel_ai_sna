import { useEffect, useRef, useState } from 'react';
import { EDGE_CONFIG } from '../../services/chennaiSNA';
import { dynastyHex } from '../../utils/dynastyColors';

export default function TripSNARelationshipMap({ subgraph }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const rendererRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let drawEdges = null;

    if (!subgraph?.nodes?.length || !containerRef.current) {
      setReady(false);
      return undefined;
    }

    setReady(false);

    (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (cancelled || !containerRef.current) {
        return;
      }

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 18,
      }).addTo(map);

      const bounds = L.latLngBounds(
        subgraph.nodes.map((node) => [node.lat, node.lng])
      );
      map.fitBounds(bounds.pad(0.25));

      const renderer = L.svg();
      renderer.addTo(map);
      rendererRef.current = renderer;

      subgraph.nodes.forEach((node) => {
        const metric = subgraph.metrics?.[node.id] || {};
        const color = dynastyHex[node.dynasty] || '#888888';
        const radius = 12;
        const degree = metric.degree || 0;

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${radius * 2}px;height:${radius * 2}px;border-radius:999px;background:${color};border:2px solid rgba(255,255,255,0.75);box-shadow:0 0 18px ${color}66;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.75);font-size:9px;font-weight:700;">${degree}</div>`,
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius],
        });

        L.marker([node.lat, node.lng], { icon })
          .bindTooltip(`<strong>${node.name}</strong><br/>${node.dynasty} · ${node.period}`, {
            direction: 'top',
            className: 'sna-tooltip',
          })
          .addTo(map);
      });

      drawEdges = () => {
        const svgRoot = rendererRef.current?._container;
        if (!svgRoot) {
          return;
        }

        const existing = svgRoot.querySelector('.trip-sna-edges');
        if (existing) {
          existing.remove();
        }

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'trip-sna-edges');
        svgRoot.appendChild(group);

        subgraph.edges.forEach((edge) => {
          const source = subgraph.nodes.find((node) => node.id === edge.source);
          const target = subgraph.nodes.find((node) => node.id === edge.target);
          if (!source || !target) {
            return;
          }

          const sourcePoint = map.latLngToLayerPoint([source.lat, source.lng]);
          const targetPoint = map.latLngToLayerPoint([target.lat, target.lng]);
          const config = EDGE_CONFIG[edge.primaryType] || EDGE_CONFIG.dynasty;

          const dx = targetPoint.x - sourcePoint.x;
          const dy = targetPoint.y - sourcePoint.y;
          const curve = 0.22;
          const cx1 = sourcePoint.x + dx * 0.25 + dy * curve;
          const cy1 = sourcePoint.y + dy * 0.25 - dx * curve;
          const cx2 = targetPoint.x - dx * 0.25 + dy * curve;
          const cy2 = targetPoint.y - dy * 0.25 - dx * curve;

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', `M ${sourcePoint.x} ${sourcePoint.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetPoint.x} ${targetPoint.y}`);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', config.color || '#FFCC00');
          path.setAttribute('stroke-opacity', '0.8');
          path.setAttribute('stroke-width', String(Math.max(1.5, Math.sqrt(edge.weight || 1) * 1.8)));
          group.appendChild(path);
        });
      };

      map.on('moveend zoomend resize', drawEdges);
      drawEdges();
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        if (drawEdges) {
          mapRef.current.off('moveend zoomend resize', drawEdges);
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      rendererRef.current = null;
    };
  }, [subgraph]);

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
        <div ref={containerRef} className="w-full" style={{ height: 260 }} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm">
            <p className="text-xs text-white/35">Loading relationship map...</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(EDGE_CONFIG).map(([type, config]) =>
          subgraph?.edges?.some((edge) => edge.primaryType === type) ? (
            <span key={type} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/50">
              <span className="inline-block w-3 h-[2px] rounded-full" style={{ background: config.color }} />
              {config.label}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
