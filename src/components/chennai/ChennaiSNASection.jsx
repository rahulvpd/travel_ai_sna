// src/components/chennai/ChennaiSNASection.jsx
// Main SNA container — 4 tabs: Map · Network Graph · Metrics · AI Insights
// Rendered inside DestinationDetails.jsx ONLY when isChennaiPage === true

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeChennaiSNA } from '../../services/chennaiSNA';
import ChennaiSNAMapGraph    from './ChennaiSNAMapGraph';
import ChennaiSNAForceGraph  from './ChennaiSNAForceGraph';
import ChennaiSNADashboard   from './ChennaiSNADashboard';
import ChennaiSNAInsights    from './ChennaiSNAInsights';

const TABS = [
  {
    key:   'map',
    label: '🗺️ Heritage Map',
    desc:  'All 26 sites plotted at real GPS coordinates with SNA edges drawn as curved lines',
  },
  {
    key:   'graph',
    label: '🕸️ Network Graph',
    desc:  'Abstract D3 force-directed layout — physics simulation reveals clustering and hub structure',
  },
  {
    key:   'dashboard',
    label: '📊 Metrics & Communities',
    desc:  'Centrality rankings, betweenness analysis, dynasty community cards, strongest edge table',
  },
  {
    key:   'insights',
    label: '🤖 AI Insights',
    desc:  'NVIDIA Nemotron-70B analysis — hub sites, bridge nodes, historical and tourism narrative',
  },
];

const LOADING_STEPS = [
  'Building heritage graph nodes…',
  'Computing 5 edge types…',
  'Running BFS for betweenness centrality…',
  'Power iteration for eigenvector centrality…',
  'Detecting dynasty communities…',
  'Requesting NVIDIA Nemotron insights…',
];

export default function ChennaiSNASection() {
  const [snaData,   setSnaData]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [loadStep,  setLoadStep]  = useState(0);

  useEffect(() => {
    // Animate loading steps
    const interval = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 600);

    computeChennaiSNA()
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
              Social Network Analysis
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-vibrant-gold/10 border border-vibrant-gold/25 text-vibrant-gold font-medium">
              Chennai Only
            </span>
          </div>
          {snaData && (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Computed
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-syne mb-3 leading-tight">
              Heritage Network Analysis
            </h2>
            <p className="text-white/50 text-sm max-w-2xl leading-relaxed">
              Chennai's 26 heritage sites modelled as a typed knowledge graph.
              <strong className="text-white/70"> Nodes</strong> represent heritage places ·
              <strong className="text-white/70"> Edges</strong> encode shared dynasty, architecture,
              geography, era and spiritual tradition ·
              <strong className="text-white/70"> Metrics</strong> reveal hubs, bridge sites and communities.
            </p>
          </div>

          {/* Live stats */}
          {snaData && (
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              {[
                { v: snaData.networkStats.totalNodes,  l: 'Sites',       accent: '#FFCC00' },
                { v: snaData.networkStats.totalEdges,  l: 'Edges',       accent: '#00C9B1' },
                { v: snaData.networkStats.communities, l: 'Communities', accent: '#A855F7' },
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

        {/* Top hub + bridge callout */}
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
            <div className="flex items-center gap-2 text-xs bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl text-purple-300">
              <span>🏘️ Largest Community:</span>
              <span className="font-semibold">{snaData.networkStats.largestCommunity}</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-blue-300">
              <span>🕸️ Density:</span>
              <span className="font-semibold">{snaData.networkStats.networkDensity}</span>
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
            <p className="text-white/25 text-xs mt-1">Computing Social Network Analysis…</p>
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
          <p className="text-red-300 font-semibold mb-1">SNA computation failed</p>
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
              {activeTab === 'map'       && <ChennaiSNAMapGraph   snaData={snaData} />}
              {activeTab === 'graph'     && <ChennaiSNAForceGraph  snaData={snaData} />}
              {activeTab === 'dashboard' && <ChennaiSNADashboard   snaData={snaData} />}
              {activeTab === 'insights'  && <ChennaiSNAInsights    snaData={snaData} />}
            </motion.div>
          </AnimatePresence>

        </div>
      )}
    </section>
  );
}