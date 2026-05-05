import React, { useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

export default function CircuitsSNAForceGraph3D({ data }) {
    const fgRef = useRef();

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge').strength(-200);
            fgRef.current.d3Force('link').distance(100);
        }
    }, [data]);

    if (!data) return null;

    return (
        <div className="w-full h-full min-h-[500px] bg-black/60 rounded-xl overflow-hidden border border-white/10 relative">
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                nodeLabel={node => `${node.name} (${node.district})\n${node.circuitName}`}
                nodeAutoColorBy="group"
                nodeRelSize={6}
                nodeVal={node => node.val || 1}
                linkColor={() => 'rgba(255,255,255,0.4)'}
                linkWidth={1.5}
                linkDirectionalParticles={3}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="rgba(0,0,0,0)"
            />
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-2 rounded-lg border border-white/10 text-xs text-white pointer-events-none">
                <strong>3D Interactive Space</strong><br/>
                <span className="text-white/50">Drag to rotate, scroll to zoom</span>
            </div>
        </div>
    );
}
