// src/components/chennai/ChennaiSNATemporalAnimation.jsx
// Temporal Network Animation - Historical Evolution Visualization
// Shows how Chennai's heritage network evolved across different time periods

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────
// HISTORICAL PERIODS DATA
// ─────────────────────────────────────────────────────────────
const HISTORICAL_PERIODS = [
  {
    id: 'pre_pallava',
    name: 'Pre-Pallava Era',
    period: 'Before 600 CE',
    year: 500,
    color: '#78716c',
    icon: '🗿',
    description: 'Ancient settlements and early Tamil civilization',
    sites: ['Mylapore Heritage District'],
    dynasty: 'Pre-dynastic'
  },
  {
    id: 'pallava',
    name: 'Pallava Dynasty',
    period: '600–900 CE',
    year: 700,
    color: '#a855f7',
    icon: '🏛️',
    description: 'Rock-cut temples and early Dravidian architecture',
    sites: ['Parthasarathy Temple', 'Marundeeswarar Temple', 'Kapaleeshwarar Temple'],
    dynasty: 'Pallava'
  },
  {
    id: 'chola',
    name: 'Chola Period',
    period: '900–1300 CE',
    year: 1000,
    color: '#f59e0b',
    icon: '🛕',
    description: 'Classical Tamil temple tradition expansion',
    sites: ['Kapaleeshwarar Temple'],
    dynasty: 'Chola'
  },
  {
    id: 'colonial',
    name: 'British Colonial',
    period: '1639–1947 CE',
    year: 1700,
    color: '#64748b',
    icon: '🏰',
    description: 'Indo-Saracenic architecture and urban development',
    sites: [
      'Fort St. George',
      'San Thome Cathedral',
      'Ripon Building',
      'Madras High Court',
      'Chepauk Palace',
      'Government Museum',
      'Connemara Public Library',
      'Theosophical Society',
      'George Town'
    ],
    dynasty: 'British Colonial'
  },
  {
    id: 'post_independence',
    name: 'Post-Independence',
    period: '1947–Present',
    year: 1975,
    color: '#14b8a6',
    icon: '🎓',
    description: 'Modern institutions and infrastructure',
    sites: [
      'Vadapalani Murugan Temple',
      'DakshinaChitra',
      'Kalakshetra Foundation',
      'Cholamandal Artists Village',
      'Vandalur Zoo',
      'Guindy National Park',
      'IIT Madras Campus',
      'Anna Centenary Library',
      'Valluvar Kottam',
      'Pondy Bazaar & T. Nagar',
      'Ratna Cafe'
    ],
    dynasty: 'Post-Independence'
  },
  {
    id: 'natural',
    name: 'Natural Heritage',
    period: 'Timeless',
    year: 0,
    color: '#10b981',
    icon: '🌿',
    description: 'Natural formations preserved through ages',
    sites: ['Marina Beach', "Elliot's Beach", 'Guindy National Park'],
    dynasty: 'Natural'
  }
];

// ─────────────────────────────────────────────────────────────
// TIMELINE COMPONENT
// ─────────────────────────────────────────────────────────────
function TimelineBar({ currentPeriod, onPeriodSelect, isPlaying }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-syne font-bold text-white text-sm">
          📅 Historical Timeline
        </h3>
        <div className="text-xs text-white/40">
          {currentPeriod?.period}
        </div>
      </div>

      {/* Timeline track */}
      <div className="relative">
        {/* Period markers */}
        <div className="flex justify-between items-center mb-2">
          {HISTORICAL_PERIODS.map((period, idx) => (
            <button
              key={period.id}
              onClick={() => onPeriodSelect(idx)}
              className={`flex flex-col items-center transition-all ${
                currentPeriod?.id === period.id ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 transition-all ${
                  currentPeriod?.id === period.id
                    ? 'ring-2 ring-offset-2 ring-offset-black ring-white shadow-lg'
                    : ''
                }`}
                style={{
                  backgroundColor: currentPeriod?.id === period.id ? period.color : `${period.color}40`,
                  boxShadow: currentPeriod?.id === period.id ? `0 0 20px ${period.color}` : 'none'
                }}
              >
                {period.icon}
              </div>
              <span className="text-[10px] text-white/50 text-center max-w-[60px]">
                {period.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: currentPeriod?.color }}
            initial={{ width: '0%' }}
            animate={{
              width: `${((HISTORICAL_PERIODS.findIndex(p => p.id === currentPeriod?.id) + 1) / HISTORICAL_PERIODS.length) * 100}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NETWORK EVOLUTION DISPLAY
// ─────────────────────────────────────────────────────────────
function NetworkEvolution({ period, snaData, allNodes }) {
  const periodNodes = useMemo(() => {
    if (!allNodes) return [];
    return allNodes.filter(node => 
      period.sites.some(siteName => 
        node.name.toLowerCase().includes(siteName.toLowerCase()) ||
        siteName.toLowerCase().includes(node.name.toLowerCase())
      )
    );
  }, [period, allNodes]);

  const periodEdges = useMemo(() => {
    if (!snaData?.edges || periodNodes.length === 0) return [];
    const nodeIds = new Set(periodNodes.map(n => n.id));
    return snaData.edges.filter(e => 
      nodeIds.has(e.source) && nodeIds.has(e.target)
    );
  }, [snaData, periodNodes]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Left: Network visualization placeholder */}
      <div 
        className="h-[400px] rounded-2xl border border-white/10 overflow-hidden relative"
        style={{ 
          background: `radial-gradient(circle at center, ${period.color}20 0%, transparent 70%)` 
        }}
      >
        {/* Nodes display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {periodNodes.slice(0, 12).map((node, idx) => {
              const angle = (idx / periodNodes.length) * 2 * Math.PI;
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px - 30px)`,
                    top: `calc(50% + ${y}px - 30px)`,
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-2"
                    style={{
                      backgroundColor: `${period.color}30`,
                      borderColor: period.color,
                      boxShadow: `0 0 15px ${period.color}50`
                    }}
                  >
                    <span className="text-xl">{node.emoji}</span>
                    <span className="text-[8px] text-white/70 text-center leading-tight">
                      {node.name.split(' ')[0]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Center label */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl mb-1">{period.icon}</div>
              <div className="text-white font-semibold text-sm">{period.name}</div>
              <div className="text-white/40 text-xs">{period.sites.length} sites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Period info */}
      <div className="space-y-4">
        {/* Period header */}
        <div 
          className="bg-white/5 border rounded-2xl p-5"
          style={{ borderColor: `${period.color}40` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${period.color}30` }}
            >
              {period.icon}
            </div>
            <div>
              <h4 className="font-semibold text-white">{period.name}</h4>
              <p className="text-xs text-white/50">{period.period}</p>
            </div>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {period.description}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: period.color }}
            >
              {periodNodes.length}
            </div>
            <div className="text-xs text-white/40">Heritage Sites</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: period.color }}
            >
              {periodEdges.length}
            </div>
            <div className="text-xs text-white/40">Connections</div>
          </div>
        </div>

        {/* Sites list */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">
            Sites from this period
          </div>
          <div className="flex flex-wrap gap-2">
            {period.sites.slice(0, 8).map((site, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="text-xs px-2 py-1 rounded-full border"
                style={{ 
                  borderColor: `${period.color}40`,
                  color: period.color,
                  backgroundColor: `${period.color}10`
                }}
              >
                {site.split(' ').slice(0, 2).join(' ')}
              </motion.span>
            ))}
            {period.sites.length > 8 && (
              <span className="text-xs text-white/30">
                +{period.sites.length - 8} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChennaiSNATemporalAnimation({ snaData }) {
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000); // ms per period

  const currentPeriod = HISTORICAL_PERIODS[currentPeriodIndex];

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentPeriodIndex(prev => 
        prev < HISTORICAL_PERIODS.length - 1 ? prev + 1 : 0
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentPeriodIndex, speed]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-white text-lg flex items-center gap-2">
            <span>⏳</span> Temporal Evolution
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Watch Chennai's heritage network evolve through 2,000 years of history
          </p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPeriodIndex(0)}
            className="px-3 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ⏮️
          </button>
          <button
            onClick={() => setCurrentPeriodIndex(prev => Math.max(0, prev - 1))}
            className="px-3 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ◀️
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isPlaying
                ? 'bg-vibrant-gold text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            onClick={() => setCurrentPeriodIndex(prev => Math.min(HISTORICAL_PERIODS.length - 1, prev + 1))}
            className="px-3 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ▶️
          </button>
          <button
            onClick={() => setCurrentPeriodIndex(HISTORICAL_PERIODS.length - 1)}
            className="px-3 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ⏭️
          </button>
        </div>
      </div>

      {/* Timeline */}
      <TimelineBar
        currentPeriod={currentPeriod}
        onPeriodSelect={setCurrentPeriodIndex}
        isPlaying={isPlaying}
      />

      {/* Network evolution display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPeriod.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <NetworkEvolution
            period={currentPeriod}
            snaData={snaData}
            allNodes={snaData?.nodes || []}
          />
        </motion.div>
      </AnimatePresence>

      {/* Speed control */}
      <div className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3">
        <span className="text-xs text-white/40">Speed:</span>
        <input
          type="range"
          min="1000"
          max="5000"
          step="500"
          value={5000 - speed + 1000}
          onChange={(e) => setSpeed(5000 - Number(e.target.value) + 1000)}
          className="flex-1"
        />
        <span className="text-xs text-white/60">
          {speed / 1000}s/period
        </span>
      </div>
    </div>
  );
}
