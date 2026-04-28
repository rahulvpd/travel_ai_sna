import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';
import { Loader, Zap, Share2, Maximize2, Hexagon } from 'lucide-react';

const NetworkMap = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/graph');
                const data = await response.json();
                setGraphData(data);
            } catch (error) {
                console.error("Graph Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGraph();

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight || 500
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        setTimeout(updateDimensions, 100);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const getGroupColor = (group) => {
        const colors = [
            '#FFD700', // Gold (Chola)
            '#FF4500', // Orange Red (Pallava)
            '#00BFFF', // Deep Sky Blue (Pandya)
            '#32CD32', // Lime Green (Modern)
            '#FF1493', // Deep Pink (Colonial)
            '#8A2BE2'  // Blue Violet
        ];
        return colors[group % colors.length];
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
            <Loader className="w-8 h-8 text-vibrant-gold animate-spin mb-4" />
            <p className="text-white/40 text-xs uppercase tracking-widest">Initialising Social Area Network...</p>
        </div>
    );

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-vibrant-gold/10 border border-vibrant-gold/20">
                        <Hexagon className="w-4 h-4 text-vibrant-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">Heritage Connectivity Graph</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">Spatial & Temporal Relationships</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <Maximize2 size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <Share2 size={14} />
                    </button>
                </div>
            </div>

            <div 
                ref={containerRef}
                className="flex-grow min-h-[450px] relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
            >
                {/* Graph Overlay UI */}
                <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full border border-black" style={{ backgroundColor: getGroupColor(i) }} />
                            ))}
                        </div>
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Dynastic Clusters</span>
                    </div>
                </div>

                {selectedNode && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-4 right-4 z-20 bg-vibrant-gold/10 backdrop-blur-xl border border-vibrant-gold/30 p-4 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-vibrant-gold text-black shadow-lg shadow-vibrant-gold/20">
                                🛕
                            </div>
                            <div>
                                <h5 className="font-bold text-white text-sm">{selectedNode.id}</h5>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 uppercase">{selectedNode.dynasty}</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-vibrant-gold/20 border border-vibrant-gold/30 text-vibrant-gold uppercase">{selectedNode.district}</span>
                                </div>
                            </div>
                        </div>
                        <button className="bg-vibrant-gold text-black text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2">
                            <Zap size={10} /> ADD TO TRIP
                        </button>
                    </motion.div>
                )}

                <ForceGraph2D
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeRelSize={6}
                    nodeAutoColorBy="group"
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.id;
                        const fontSize = 12/globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        // Node Glow
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = getGroupColor(node.group);
                        
                        // Node Circle
                        ctx.fillStyle = getGroupColor(node.group);
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.val || 4, 0, 2 * Math.PI, false);
                        ctx.fill();

                        // Node Label (only if zoomed in)
                        if (globalScale > 2) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(label, node.x, node.y + (node.val || 4) + 5);
                        }
                    }}
                    linkColor={() => 'rgba(255, 255, 255, 0.08)'}
                    linkWidth={1}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleColor={() => '#FFD700'}
                    backgroundColor="rgba(0,0,0,0)"
                    onNodeClick={(node) => setSelectedNode(node)}
                    onBackgroundClick={() => setSelectedNode(null)}
                    d3AlphaDecay={0.02}
                    d3VelocityDecay={0.3}
                />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Nodes', val: graphData.nodes.length, color: 'text-blue-400' },
                    { label: 'Edges', val: graphData.links.length, color: 'text-vibrant-pink' },
                    { label: 'Clusters', val: 5, color: 'text-vibrant-gold' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                        <div className={`text-sm font-bold ${stat.color}`}>{stat.val}</div>
                        <div className="text-[8px] text-white/30 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NetworkMap;
