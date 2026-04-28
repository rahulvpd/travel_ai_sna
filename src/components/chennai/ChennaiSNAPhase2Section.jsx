// src/components/chennai/ChennaiSNAPhase2Section.jsx
// Phase 2 Enhanced SNA Section - 3D, Temporal, Heat Map, Multi-Layer
// Integrates all Phase 2 visualizations into a unified interface

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeEnhancedChennaiSNA } from '../../services/chennaiSNAEnhanced';
import { getMultiLayerSNA } from '../../services/multiLayerSNA';

// Phase 2 Components
import ChennaiSNA3DGraph from './ChennaiSNA3DGraph';
import ChennaiSNATemporalAnimation from './ChennaiSNATemporalAnimation';
import ChennaiSNAHeatMap from './ChennaiSNAHeatMap';
import ChennaiSNAMultiLayerView from './ChennaiSNAMultiLayerView';

const PHASE2_TABS = [
  {
    key: '3d',
    label: '🌐 3D Network',
    desc: 'Interactive 3D visualization with camera controls and node selection',
    icon: '🌐',
    color: '#A855F7'
  },
  {
    key: 'temporal',
    label: '⏳ Temporal',
    desc: 'Historical evolution from Pallava to Modern era with animation',
    icon: '⏳',
    color: '#FF6B00'
  },
  {
    key: 'heatmap',
    label: '🗺️ Heat Map',
    desc: 'Visitor density, popularity, and network metrics visualization',
    icon: '🗺️',
    color: '#FFCC00'
  },
  {
    key: 'multilayer',
    label: '📊 Multi-Layer',
    desc: 'Heritage + Transport + Visitor Flow + Cultural Events layers',
    icon: '📊',
    color: '#4F8EFF'
  }
];

export default function ChennaiSNAPhase2Section() {
  const [snaData, setSnaData] = useState(null);
  const [multiLayerData, setMultiLayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('3d');
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const loadSequence = async () => {
      // Step 1: Load enhanced SNA
      setLoadProgress(20);
      const data = await computeEnhancedChennaiSNA();
      setSnaData(data);
      setLoadProgress(50);

      // Step 2: Compute multi-layer
      setLoadProgress(70);
      const multi = await getMultiLayerSNA(data);
      setMultiLayerData(multi);
      setLoadProgress(100);

      setLoading(false);
    };

    loadSequence();
  }, []);

  return (
    <section className="mt-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[3px] uppercase text-vibrant-pink/80">
              Phase 2 Advanced SNA
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/25 text-purple-300 font-medium">
              New Visualizations
            </span>
          </div>
          {snaData && (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Phase 2 Active
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-syne mb-3 leading-tight">
              Advanced Network Analysis
              <span className="text-vibrant-pink text-lg ml-2">v2.5</span>
            </h2>
            <p className="text-white/50 text-sm max-w-2xl leading-relaxed">
              Explore Chennai's heritage through <strong className="text-white/70">3D visualization</strong>,
              <strong className="text-white/70"> historical evolution</strong>,
              <strong className="text-white/70"> heat maps</strong>, and
              <strong className="text-white/70"> multi-layer networks</strong>.
            </p>
          </div>

          {/* Quick stats */}
          {snaData && (
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              {[
                { v: snaData.networkStats?.totalNodes || 26, l: 'Sites', accent: '#A855F7' },
                { v: '3D', l: 'Mode', accent: '#FF6B00' },
                { v: '4', l: 'Layers', accent: '#4F8EFF' },
                { v: '6', l: 'Periods', accent: '#FFCC00' },
              ].map(s => (
                <div key={s.l} className="text-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[72px]">
                  <div className="text-2xl font-bold font-syne" style={{ color: s.accent }}>{s.v}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="h-[500px] flex flex-col items-center justify-center gap-5 bg-white/3 rounded-2xl border border-white/10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
            <div className="absolute inset-4 rounded-full border border-white/10 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">Loading Phase 2 Visualizations...</p>
            <p className="text-white/25 text-xs mt-1">Computing 3D, temporal, and multi-layer data</p>
          </div>
          {/* Progress bar */}
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${loadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-white/30">{loadProgress}% complete</p>
        </div>
      )}

      {/* Main content */}
      {!loading && snaData && (
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 mb-2 overflow-x-auto">
            {PHASE2_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-max px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? 'text-white font-semibold shadow-lg'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: activeTab === tab.key ? tab.color : undefined
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className="text-xs text-white/30 mb-5 px-1">
            {PHASE2_TABS.find(t => t.key === activeTab)?.desc}
          </p>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === '3d' && (
                <ChennaiSNA3DGraph snaData={snaData} />
              )}
              {activeTab === 'temporal' && (
                <ChennaiSNATemporalAnimation snaData={snaData} />
              )}
              {activeTab === 'heatmap' && (
                <ChennaiSNAHeatMap snaData={snaData} />
              )}
              {activeTab === 'multilayer' && (
                <ChennaiSNAMultiLayerView 
                  snaData={snaData} 
                  multiLayerData={multiLayerData}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Feature highlights */}
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            {PHASE2_TABS.map(tab => (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeTab === tab.key
                    ? 'bg-white/5 border-white/20'
                    : 'bg-white/3 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-2xl mb-2">{tab.icon}</div>
                <div className="text-sm font-semibold text-white mb-1">{tab.label}</div>
                <p className="text-xs text-white/40 line-clamp-2">{tab.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
