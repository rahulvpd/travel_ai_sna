// src/components/chennai/ChennaiSNAMegaSection.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeChennaiMegaSNA } from '../../services/chennaiSNAMega';
import ChennaiSNAGraph from './ChennaiSNAGraph';
import ChennaiSNAForceGraph from './ChennaiSNAForceGraph';
import ChennaiSNADashboard from './ChennaiSNADashboard';
import ChennaiSNAInsights from './ChennaiSNAInsights';
import ChennaiSNACircuitExplorer from './ChennaiSNACircuitExplorer';

const TABS = [
  { key: 'map', label: '🗺️ Mega-City Map', desc: 'All 100+ urban and heritage sites plotted across Chennai.' },
  { key: 'graph', label: '🕸️ Neural Graph', desc: 'Force-directed layout revealing hidden clusters connecting modern and ancient sites.' },
  { key: 'metrics', label: '📊 Urban Metrics', desc: 'Advanced centrality metrics identifying the true hubs of the expanded city network.' },
  { key: 'insights', label: '🤖 AI Insights', desc: "NVIDIA Nemotron analysis on Chennai's duality as a traditional and hyper-modern megacity." },
  { key: 'circuits', label: '🛤️ Tourism Circuits', desc: 'AI-generated tourism circuits optimized for the Mega-City.' },
  { key: 'realtime', label: '📡 Real-time', desc: 'Live visitor flow simulation across 100+ nodes.' }
];

const LOADING_STEPS = [
  'Loading 100+ urban and heritage nodes...',
  'Computing geographic and semantic edges...',
  'Running Eigenvector & Betweenness Centralities...',
  'Detecting modern tourism vs heritage communities...',
  'Requesting NVIDIA AI megacity insights...'
];

export default function ChennaiSNAMegaSection() {
  const [snaData, setSnaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('graph');
  const [loadStep, setLoadStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 600);

    computeChennaiMegaSNA()
      .then(data => {
        clearInterval(interval);
        setSnaData(data);
        setLoading(false);
      })
      .catch(err => {
        clearInterval(interval);
        setError(err.message);
        setLoading(false);
      });

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mt-8">
      {/* ── Section Header ────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[3px] uppercase text-emerald-400">
              Mega-City Network Analysis
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/25 text-emerald-300 font-medium">
              100+ Nodes Loaded
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-syne mb-3 leading-tight">
              Chennai City-Scale Graph
              <span className="text-emerald-400 text-lg ml-2">v3.0</span>
            </h2>
            <p className="text-white/50 text-sm max-w-2xl leading-relaxed">
              Explore Chennai through a massive, interconnected web of over 100 locations. 
              This graph bridges the ancient Pallava temples directly with modern theme parks, 
              IT corridors, and urban eco-parks to reveal the true shape of the city.
            </p>
          </div>

          {/* Live stats */}
          {snaData && (
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              {[
                { v: snaData.networkStats.totalNodes, l: 'Urban Sites', accent: '#34d399' },
                { v: snaData.networkStats.totalEdges, l: 'Connections', accent: '#60a5fa' },
                { v: snaData.networkStats.communities, l: 'Clusters', accent: '#a78bfa' },
              ].map(s => (
                <div key={s.l} className="text-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[80px]">
                  <div className="text-2xl font-bold font-syne" style={{ color: s.accent }}>{s.v}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Loading State ─────────────────────────────────── */}
      {loading && (
        <div className="h-[500px] flex flex-col items-center justify-center gap-5 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border border-white/10 animate-pulse" />
          </div>
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-white/60 text-sm font-medium"
              >
                {LOADING_STEPS[loadStep]}
              </motion.p>
            </AnimatePresence>
            <p className="text-white/25 text-xs mt-1">Processing massive urban dataset…</p>
          </div>
        </div>
      )}

      {/* ── Error State ────────────────────────────────────── */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-red-300 font-semibold mb-1">Mega-City computation failed</p>
          <p className="text-red-300/60 text-sm">{error}</p>
        </div>
      )}

      {/* ── Main SNA Content ──────────────────────────────── */}
      {snaData && !loading && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          {/* Tab Bar */}
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 mb-4 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className="text-xs text-white/40 mb-6 pl-1">
            {TABS.find(t => t.key === activeTab)?.desc}
          </p>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'map' && <ChennaiSNAGraph data={snaData} />}
                {activeTab === 'graph' && <ChennaiSNAForceGraph data={snaData} />}
                {activeTab === 'metrics' && <ChennaiSNADashboard data={snaData} />}
                {activeTab === 'insights' && <ChennaiSNAInsights insights={snaData?.aiInsights} />}
                {activeTab === 'circuits' && <ChennaiSNACircuitExplorer snaData={snaData} />}
                {activeTab === 'realtime' && <ChennaiSNAMegaRealtimeDemo snaData={snaData} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// MEGA-CITY REAL-TIME DEMO COMPONENT
// ─────────────────────────────────────────────────────────────
function ChennaiSNAMegaRealtimeDemo({ snaData }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [simulatedVisitors, setSimulatedVisitors] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate visitor flow changes
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      const hour = new Date().getHours();
      const baseMultiplier = hour >= 10 && hour <= 18 ? 1.5 : 0.7;
      
      const newVisitors = {};
      snaData.nodes.forEach(node => {
        const base = node.visitorData?.dailyAverage || 1000;
        const hourFactor = Math.sin((hour / 24) * Math.PI) * 0.5 + 0.5;
        const randomFactor = 0.8 + Math.random() * 0.4;
        newVisitors[node.id] = Math.round(base * baseMultiplier * hourFactor * randomFactor / 24);
      });
      
      setSimulatedVisitors(newVisitors);
    }, 3000);

    return () => clearInterval(interval);
  }, [snaData]);

  const crowdedPlaces = Object.entries(simulatedVisitors)
    .map(([id, count]) => {
      const node = snaData.nodes.find(n => n.id === id);
      const capacity = node?.visitorData?.capacity || 1000;
      const occupancy = count / capacity;
      return { id, count, occupancy, node };
    })
    .filter(p => p.occupancy > 0.6)
    .sort((a, b) => b.occupancy - a.occupancy);

  return (
    <div className="space-y-6">
      {/* Time display */}
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white text-lg">📡</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Live Simulation</div>
            <div className="text-xs text-white/40">Updates every 3 seconds</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-white">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-xs text-white/40">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long' })}
          </div>
        </div>
      </div>

      {/* Crowd alerts */}
      {crowdedPlaces.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-semibold text-orange-300">High Crowd Alert</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {crowdedPlaces.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-orange-200">{p.node?.name}</span>
                <span className="text-orange-300 font-mono">{Math.round(p.occupancy * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visitor distribution grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-syne font-bold text-white mb-3 flex items-center gap-2">
            <span>👥</span> Current Visitor Distribution
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(simulatedVisitors)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([id, count]) => {
                const node = snaData.nodes.find(n => n.id === id);
                const capacity = node?.visitorData?.capacity || 1000;
                const occupancy = count / capacity;
                const barColor = occupancy > 0.8 ? 'bg-red-500' : occupancy > 0.5 ? 'bg-orange-500' : 'bg-emerald-500';
                
                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white truncate">{node?.name}</span>
                        <span className="text-xs text-white/40">{count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8">
                        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(occupancy * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Network health */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-syne font-bold text-white mb-3 flex items-center gap-2">
            <span>🩺</span> Network Health
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-emerald-400">
                  {Object.values(simulatedVisitors).filter((v, i) => {
                    const node = snaData.nodes[i];
                    const capacity = node?.visitorData?.capacity || 1000;
                    return v / capacity < 0.5;
                  }).length}
                </div>
                <div className="text-xs text-white/40">Low Crowd Sites</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-400">
                  {crowdedPlaces.length}
                </div>
                <div className="text-xs text-white/40">High Crowd Sites</div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-white mb-2">Best Time to Visit</div>
              <div className="flex flex-wrap gap-2">
                {snaData.nodes
                  .filter(n => n.visitorData?.bestVisitTime)
                  .slice(0, 5)
                  .map(n => (
                    <div key={n.id} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg">
                      {n.name.split(' ')[0]}: {n.visitorData.bestVisitTime[0]}
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/15 rounded-xl p-4">
              <div className="text-sm font-medium text-emerald-400 mb-2">💡 SNA Recommendation</div>
              <p className="text-xs text-white/60 leading-relaxed">
                Based on current visitor patterns, consider visiting{' '}
                <strong className="text-white">
                  {snaData.rankedByCentrality?.[Math.floor(snaData.rankedByCentrality.length / 2)]?.name || 'lesser-known sites'}
                </strong>{' '}
                for a quieter experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
