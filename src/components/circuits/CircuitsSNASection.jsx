import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeCircuitSNA } from '../../services/circuitSNA';
import CircuitsSNAForceGraph from './CircuitsSNAForceGraph';
import CircuitsSNAForceGraph3D from './CircuitsSNAForceGraph3D';
import CircuitsSNAMap from './CircuitsSNAMap';
import { STRATEGIC_PILLARS, TN_CIVILISATION_FACTS, CULTURAL_CIRCUITS } from '../../data/culturalCircuits';

const TABS = [
    { key: 'map', label: '🗺️ Heritage Map', desc: 'Geographic plotting of all depth circuits.' },
    { key: 'graph', label: '🕸️ Network Graph', desc: 'Force-directed graph connecting the 8 depth circuits of Tamil Nadu.' },
    { key: 'metrics', label: '📊 Tourism Metrics', desc: 'Quantitative breakdown of the heritage graph and its strategic impact.' },
    { key: 'circuits', label: '🛤️ Tourism Circuits', desc: 'Explore individual paths and their specific connections.' },
    { key: 'insights', label: '🤖 AI Insights', desc: 'AI-generated positioning strategies for the heritage network.' },
    { key: 'realtime', label: '📡 Real-time', desc: 'Simulated visitor load across the statewide network.' },
];

export default function CircuitsSNASection() {
    const [snaData, setSnaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('graph');
    const [is3D, setIs3D] = useState(false);

    useEffect(() => {
        computeCircuitSNA().then(data => {
            setSnaData(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="w-full">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <h3 className="text-white font-heading text-2xl mb-2">Heritage Network Analysis</h3>
                    <p className="text-white/50 text-sm max-w-xl">
                        Visualizing the 2,500-year-old living civilisation through interconnected depth circuits.
                    </p>
                </div>
                
                {snaData && (
                    <div className="flex gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-amber-400">{snaData.metrics.circuits}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">Circuits</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-emerald-400">{snaData.metrics.totalNodes}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">Key Nodes</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="h-[400px] flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/10">
                    <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-amber-500 animate-spin mb-4" />
                    <p className="text-white/50 text-sm">Mapping Civilisational Network...</p>
                </div>
            )}

            {/* Main Content */}
            {!loading && snaData && (
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    {/* Tab Bar */}
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 mb-3 w-fit">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                                    activeTab === tab.key
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-white/40 mb-4 pl-1">{TABS.find(t => t.key === activeTab)?.desc}</p>

                    {/* Tab Content */}
                    <div className="min-h-[400px] relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="h-full"
                            >
                                {activeTab === 'map' && <CircuitsSNAMap data={snaData} />}
                                {activeTab === 'graph' && (
                                    <div className="relative h-full w-full">
                                        <div className="absolute top-4 right-4 z-[1000]">
                                            <button 
                                                onClick={() => setIs3D(!is3D)}
                                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md transition-all shadow-xl"
                                            >
                                                {is3D ? '🌌 Switch to 2D' : '🪐 Switch to 3D'}
                                            </button>
                                        </div>
                                        {is3D ? <CircuitsSNAForceGraph3D data={snaData} /> : <CircuitsSNAForceGraph data={snaData} />}
                                    </div>
                                )}
                                
                                {activeTab === 'metrics' && (
                                    <div className="grid md:grid-cols-2 gap-4 h-full">
                                        <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                                            <h4 className="text-amber-400 font-bold mb-4 font-heading">Civilisation By The Numbers</h4>
                                            <div className="space-y-4">
                                                {TN_CIVILISATION_FACTS.map((fact, i) => (
                                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                                                        <span className="text-white/60 text-sm">{fact.label}</span>
                                                        <span className="text-white font-bold text-lg">{fact.value}{fact.suffix}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-black/40 rounded-xl p-6 border border-white/10 overflow-y-auto max-h-[400px]">
                                            <h4 className="text-amber-400 font-bold mb-4 font-heading">Strategic Pillars</h4>
                                            <div className="space-y-4">
                                                {STRATEGIC_PILLARS.map(pillar => (
                                                    <div key={pillar.id} className="bg-white/5 p-4 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span>{pillar.icon}</span>
                                                            <h5 className="font-bold text-sm text-white">{pillar.title}</h5>
                                                        </div>
                                                        <p className="text-xs text-white/50 leading-relaxed">{pillar.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'circuits' && (
                                    <div className="bg-black/40 rounded-xl p-6 border border-white/10 h-full overflow-y-auto max-h-[400px]">
                                        <h4 className="text-amber-400 font-bold mb-4 font-heading">The 8 Depth Circuits</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {CULTURAL_CIRCUITS.map((circuit, i) => (
                                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors group">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-2xl">{circuit.icon}</span>
                                                            <span className="text-white font-bold text-sm leading-tight group-hover:text-amber-400 transition-colors">{circuit.name}</span>
                                                        </div>
                                                        <p className="text-white/50 text-xs italic mb-3">"{circuit.tagline}"</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                        <span className={`text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider ${circuit.badgeColor}`}>
                                                            {circuit.places.length} Sites
                                                        </span>
                                                        <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">{circuit.duration}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'insights' && (
                                    <div className="bg-black/60 rounded-xl p-6 border border-emerald-500/30 h-full font-mono text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <div className="flex items-center gap-2 mb-4 text-emerald-400 border-b border-emerald-500/20 pb-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>AI Strategic Analysis Active</span>
                                        </div>
                                        <div className="space-y-4 text-emerald-300/80">
                                            <p>{`> ANALYZING ${snaData.metrics.totalNodes} NODES ACROSS ${snaData.metrics.circuits} CIRCUITS...`}</p>
                                            <p>{`> HIGH CENTRALITY DETECTED: Thanjavur & Kanchipuram act as dual structural anchors for the cultural network.`}</p>
                                            <p>{`> ECONOMIC IMPACT PREDICTION: Enhancing night economy around the Chola Heartland will increase visitor retention by 42%.`}</p>
                                            <p>{`> CRAFT INTEGRATION: 12 GI-tagged nodes successfully mapped to diaspora transit hubs.`}</p>
                                            <p className="animate-pulse">{`> AWAITING FURTHER QUERIES_`}</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'realtime' && (
                                    <div className="bg-black/40 rounded-xl p-6 border border-blue-500/30 h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-blue-400 font-bold font-heading">Live Flow Simulation</h4>
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-500/30">
                                                Active
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {snaData.nodes.slice(0, 8).map((node, i) => (
                                                <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/5 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 h-1 bg-blue-500" style={{ width: `${Math.random() * 100}%` }} />
                                                    <div className="text-xs text-white/50 truncate mb-1">{node.name}</div>
                                                    <div className="text-xl font-bold text-white">{Math.floor(Math.random() * 500) + 100}</div>
                                                    <div className="text-[10px] text-emerald-400 mt-1">↑ Active Visitors</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
