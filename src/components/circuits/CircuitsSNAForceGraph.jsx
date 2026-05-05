import { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function CircuitsSNAForceGraph({ data }) {
    const fgRef = useRef();

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge').strength(-400);
            fgRef.current.d3Force('link').distance(80);
        }
    }, [data]);

    if (!data) return null;

    return (
        <div className="w-full h-full min-h-[500px] bg-black/60 rounded-xl overflow-hidden border border-white/10">
            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                nodeLabel={node => `${node.name} (${node.district})\n${node.circuitName}`}
                nodeAutoColorBy="group"
                nodeRelSize={6}
                nodeVal={node => node.val || 1}
                linkColor={() => 'rgba(255,255,255,0.2)'}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                width={800} // This will be responsive via CSS
                height={500}
                backgroundColor="transparent"
            />
        </div>
    );
}
