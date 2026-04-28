import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, BrainCircuit, Sparkles, Network, X } from 'lucide-react';
import * as THREE from 'three';

const NODE_COLORS = {
    hub: '#FFD700',      // Gold
    history: '#FF0055',  // Neon Red
    culture: '#00FFFF',  // Neon Cyan
    nature: '#00FF00',   // Neon Green
    food: '#FF9900',     // Neon Orange
    shopping: '#FF00FF', // Neon Pink
    cluster: '#FFFFFF',  // White
    default: '#AAAAAA'   // Grey
};

const GenerativeNetworkMap = ({ destination, items, budget, travelers, interests }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const containerRef = useRef(null);
    const fgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Create glowing materials
    const materials = useMemo(() => {
        const mats = {};
        Object.entries(NODE_COLORS).forEach(([key, color]) => {
            mats[key] = new THREE.MeshPhysicalMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.8, // Subtle glow
                roughness: 0.2,
                metalness: 0.8,
                clearcoat: 1,
                clearcoatRoughness: 0.1
            });
        });
        return mats;
    }, []);

    const expandGraph = useCallback((currentNodes, currentLinks) => {
        const isChennai = destination?.toLowerCase().includes('chennai');
        const newNodes = [];
        const newLinks = [...currentLinks];
        const interestSet = new Set(interests || []);

        if (isChennai) {
            // Curated Chennai Nodes
            const chennaiNodes = [
                { id: 'Kapaleeshwarar Temple', type: 'culture', desc: 'Ancient Shiva temple', tags: ['temples', 'culture'] },
                { id: 'Marina Beach', type: 'nature', desc: 'Urban beach', tags: ['beaches', 'nature'] },
                { id: 'Fort St. George', type: 'history', desc: 'Colonial fortress', tags: ['history'] },
                { id: 'T. Nagar', type: 'shopping', desc: 'Shopping hub', tags: ['shopping'] },
                { id: 'Sowcarpet', type: 'food', desc: 'Street food paradise', tags: ['food'] },
                { id: 'San Thome Cathedral', type: 'culture', desc: 'Basilica', tags: ['culture'] },
                { id: 'Guindy National Park', type: 'nature', desc: 'City park', tags: ['nature'] },
                { id: 'Phoenix Market City', type: 'shopping', desc: 'Luxury mall', tags: ['shopping'] }
            ];

            chennaiNodes.forEach(node => {
                if (!currentNodes.find(n => n.id === node.id)) {
                    // Filter logic
                    const matchesInterest = node.tags.some(t => interestSet.has(t));
                    const isBudget = budget === 'Budget';
                    // Skip luxury if budget
                    if (isBudget && node.desc.includes('Luxury')) return;
                    
                    if (matchesInterest || Math.random() > 0.4) {
                        newNodes.push({ ...node, val: matchesInterest ? 15 : 10, group: 2 });
                        newLinks.push({ source: destination, target: node.id });
                    }
                }
            });
            
            // Connect specific nodes (only if they exist)
            const allNodeIds = new Set([...currentNodes.map(n => n.id), ...newNodes.map(n => n.id), destination]);
            
            const specificLinks = [
                { source: 'Marina Beach', target: 'Fort St. George' },
                { source: 'Kapaleeshwarar Temple', target: 'San Thome Cathedral' }
            ];

            specificLinks.forEach(link => {
                if (allNodeIds.has(link.source) && allNodeIds.has(link.target)) {
                    newLinks.push(link);
                }
            });

        } else {
            // Generic Expansion
            const themes = [];
            if (interestSet.has('history')) themes.push({ id: 'History Hub', type: 'history' });
            if (interestSet.has('food')) themes.push({ id: 'Culinary Center', type: 'food' });
            if (interestSet.has('nature')) themes.push({ id: 'Nature Reserve', type: 'nature' });
            if (themes.length === 0) themes.push({ id: 'Local Gems', type: 'cluster' });

            themes.forEach(theme => {
                newNodes.push({ ...theme, val: 20, group: 2, desc: `AI-curated ${theme.type} zone` });
                newLinks.push({ source: destination, target: theme.id });
                // Connect existing nodes to themes
                currentNodes.forEach(n => {
                    if (n.group === 1 && Math.random() > 0.7) {
                        newLinks.push({ source: theme.id, target: n.id });
                    }
                });
            });
        }

        const finalNodes = [...currentNodes, ...newNodes];
        setGraphData({ nodes: finalNodes, links: newLinks });
        
        // Dynamic Zoom Fit
        setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.d3Force('charge').strength(-100);
                fgRef.current.zoomToFit(1000, 50);
            }
        }, 500);

    }, [destination, budget, interests]);

    const initGraph = useCallback(() => {
        setLoading(true);
        const baseNodes = items.map(item => ({
            id: item.title,
            group: 1,
            val: 10,
            type: item.type || 'default',
            desc: item.description
        }));

        baseNodes.push({
            id: destination,
            group: 0,
            val: 25,
            type: 'hub',
            desc: `Central Hub: ${destination}`
        });

        const baseLinks = items.map(item => ({
            source: destination,
            target: item.title
        }));

        setGraphData({ nodes: baseNodes, links: baseLinks });
        setLoading(false);
        setTimeout(() => expandGraph(baseNodes, baseLinks), 1000);
    }, [destination, items, expandGraph]);

  useEffect(() => {
    const cleanup = initGraph();
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      if (cleanup) cleanup();
    };
  }, [initGraph]);

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <BrainCircuit className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">NEURAL TRAVEL GRAPH</h4>
                        <p className="text-[10px] text-white/40 uppercase">AI-Generated 3D Visualization</p>
                    </div>
                </div>
            </div>

            <div ref={containerRef} className="flex-grow min-h-[500px] relative rounded-3xl overflow-hidden border border-white/5 bg-black shadow-2xl">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                        <Loader className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
                        <p className="text-cyan-400/60 text-xs font-mono tracking-widest">BUILDING NEURAL PATHWAYS...</p>
                    </div>
                )}

                <ForceGraph3D
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="id"
                    nodeRelSize={6}
                    
                    // Materials & Objects
                    nodeThreeObject={node => {
                        const mat = materials[node.type] || materials.default;
                        const geo = new THREE.SphereGeometry(node.val ? node.val * 0.4 : 4, 32, 32);
                        return new THREE.Mesh(geo, mat);
                    }}
                    
                    // Links
                    linkColor={() => '#ffffff'}
                    linkOpacity={0.1}
                    linkWidth={0.5}
                    linkDirectionalParticles={4}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticleWidth={1}
                    linkDirectionalParticleColor={() => '#00FFFF'}
                    
                    backgroundColor="#000000"
                    showNavInfo={false}
                    
                    onNodeClick={node => {
                        setSelectedNode(node);
                        const distance = 50;
                        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                        fgRef.current.cameraPosition(
                            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                            node,
                            2000
                        );
                    }}
                    onBackgroundClick={() => setSelectedNode(null)}
                />

                <AnimatePresence>
                    {selectedNode && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-6 left-6 right-6 p-6 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl z-30"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{selectedNode.id}</h3>
                                    <p className="text-sm text-cyan-400/80">{selectedNode.desc || 'Explored Location'}</p>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>
                            <div className="flex gap-2 mt-4">
                                {selectedNode.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GenerativeNetworkMap;
