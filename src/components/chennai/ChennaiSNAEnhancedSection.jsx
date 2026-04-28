// src/components/chennai/ChennaiSNAEnhancedSection.jsx
// Enhanced SNA container — 6 tabs with advanced visualizations
// Includes: Tourism Metrics, Circuits, Real-time Analysis

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeEnhancedChennaiSNA } from '../../services/chennaiSNAEnhanced';
import ChennaiSNAMapGraph from './ChennaiSNAMapGraph';
import ChennaiSNAForceGraph from './ChennaiSNAForceGraph';
import ChennaiSNAEnhancedDashboard from './ChennaiSNAEnhancedDashboard';
import ChennaiSNATourismInsights from './ChennaiSNATourismInsights';
import ChennaiSNACircuitExplorer from './ChennaiSNACircuitExplorer';

const TABS = [
  {
    key: 'map',
    label: '🗺️ Heritage Map',
    desc: 'All 26 sites plotted at real GPS coordinates with SNA edges drawn as curved lines'
  },
  {
    key: 'graph',
    label: '🕸️ Network Graph',
    desc: 'Abstract D3 force-directed layout — physics simulation reveals clustering and hub structure'
  },
  {
    key: 'dashboard',
    label: '📊 Tourism Metrics',
    desc: 'Advanced SNA metrics: Tourism Centrality, Experience Diversity, Accessibility Index'
  },
  {
    key: 'circuits',
    label: '🛤️ Tourism Circuits',
    desc: 'AI-generated tourism circuits optimized for time, distance, and visitor experience'
  },
  {
    key: 'insights',
    label: '🤖 AI Insights',
    desc: 'NVIDIA Nemotron-70B tourism analysis — development priorities and marketing strategies'
  },
  {
    key: 'realtime',
    label: '📡 Real-time',
    desc: 'Live visitor flow simulation and dynamic network analysis (demo mode)'
  }
];

const LOADING_STEPS = [
  'Building enhanced heritage graph nodes…',
  'Computing 7 edge types with tourism weights…',
  'Running BFS for betweenness centrality…',
  'Calculating Tourism Centrality & Experience Diversity…',
  'Detecting dynasty and type communities…',
  'Generating optimal tourism circuits…',
  'Requesting NVIDIA Nemotron tourism insights…'
];

export default function ChennaiSNAEnhancedSection() {
  const [snaData, setSnaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [loadStep, setLoadStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 550);

    computeEnhancedChennaiSNA()
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
    <section className="mt-16">
      {/* ── Section Header ────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[3px] uppercase text-vibrant-gold/80">
              Enhanced Social Network Analysis
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-vibrant-gold/20 to-vibrant-pink/20 border border-vibrant-gold/25 text-vibrant-gold font-medium">
              Chennai Tourism Development
            </span>
          </div>
          {snaData && (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Enhanced Computed
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-syne mb-3 leading-tight">
              Heritage Network Analysis
              <span className="text-vibrant-gold text-lg ml-2">v2.0</span>
            </h2>
            <p className="text-white/50 text-sm max-w-2xl leading-relaxed">
              Chennai's 26 heritage sites modelled as a <strong className="text-white/70">typed knowledge graph</strong> with tourism-specific metrics.
              <strong className="text-white/70"> Tourism Centrality</strong> identifies key visitor hubs ·
              <strong className="text-white/70"> Experience Diversity</strong> measures variety ·
              <strong className="text-white/70"> Circuits</strong> optimize visitor routes.
            </p>
          </div>

          {/* Live stats */}
          {snaData && (
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              {[
                { v: snaData.networkStats.totalNodes, l: 'Sites', accent: '#FFCC00' },
                { v: snaData.networkStats.totalEdges, l: 'Edges', accent: '#00C9B1' },
                { v: snaData.networkStats.totalCircuits, l: 'Circuits', accent: '#FF6B00' },
                { v: snaData.networkStats.averageDegree, l: 'Avg Links', accent: '#4F8EFF' },
              ].map(s => (
                <div key={s.l} className="text-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[72px]">
                  <div className="text-2xl font-bold font-syne" style={{ color: s.accent }}>{s.v}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top hub + bridge + tourism callout */}
        {snaData && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300">
              <span>🏆 Hub:</span>
              <span className="font-semibold">{snaData.networkStats.mostCentralNode}</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-xl text-teal-300">
              <span>🌉 Bridge:</span>
              <span className="font-semibold">{snaData.networkStats.topBridgeNode}</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-orange-300">
              <span>📍 Tourism Hub:</span>
              <span className="font-semibold">{snaData.networkStats.topTourismHub}</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-blue-300">
              <span>⭐ Top Pick:</span>
              <span className="font-semibold">{snaData.networkStats.topRecommendation}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Loading State ─────────────────────────────────── */}
      {loading && (
        <div className="h-96 flex flex-col items-center justify-center gap-5 bg-white/3 rounded-2xl border border-white/10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-vibrant-gold/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-vibrant-gold animate-spin" />
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
            <p className="text-white/25 text-xs mt-1">Computing Enhanced Tourism SNA…</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i <= loadStep ? '#FFCC00' : 'rgba(255,255,255,0.15)',
                  transform: i === loadStep ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ────────────────────────────────────── */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-red-300 font-semibold mb-1">Enhanced SNA computation failed</p>
          <p className="text-red-300/60 text-sm">{error}</p>
        </div>
      )}

      {/* ── Main SNA Content ──────────────────────────────── */}
      {snaData && !loading && (
        <div>
          {/* Tab Bar */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 mb-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-vibrant-gold text-black font-semibold shadow-lg shadow-vibrant-gold/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className="text-xs text-white/30 mb-5 px-1">
            {TABS.find(t => t.key === activeTab)?.desc}
          </p>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activeTab === 'map' && <ChennaiSNAMapGraph snaData={snaData} />}
              {activeTab === 'graph' && <ChennaiSNAForceGraph snaData={snaData} />}
              {activeTab === 'dashboard' && <ChennaiSNAEnhancedDashboard snaData={snaData} />}
              {activeTab === 'circuits' && <ChennaiSNACircuitExplorer snaData={snaData} />}
              {activeTab === 'insights' && <ChennaiSNATourismInsights snaData={snaData} />}
              {activeTab === 'realtime' && <ChennaiSNARealtimeDemo snaData={snaData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// REAL-TIME DEMO COMPONENT
// ─────────────────────────────────────────────────────────────
function ChennaiSNARealtimeDemo({ snaData }) {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
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
                const barColor = occupancy > 0.8 ? 'bg-red-500' : occupancy > 0.5 ? 'bg-orange-500' : 'bg-green-500';
                
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
                <div className="text-2xl font-bold text-green-400">
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
                    <div key={n.id} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-lg">
                      {n.name.split(' ')[0]}: {n.visitorData.bestVisitTime[0]}
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-vibrant-gold/10 to-transparent border border-vibrant-gold/15 rounded-xl p-4">
              <div className="text-sm font-medium text-vibrant-gold mb-2">💡 SNA Recommendation</div>
              <p className="text-xs text-white/60 leading-relaxed">
                Based on current visitor patterns, consider visiting{' '}
                <strong className="text-white">
                  {snaData.rankedByRecommendation?.[2]?.name || 'lesser-known sites'}
                </strong>{' '}
                for a quieter experience while maintaining high heritage value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
