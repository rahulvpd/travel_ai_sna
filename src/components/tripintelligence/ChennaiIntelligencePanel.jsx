import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHENNAI_NODES } from '../../services/chennaiSNA';
import { buildTripSubgraph, generateTripNarrative } from '../../services/chennaiTripIntelligence';
import TripBondAnalysis from './TripBondAnalysis';
import TripDynastyFlow from './TripDynastyFlow';
import TripInsightCards from './TripInsightCards';
import TripNarrativeTab from './TripNarrativeTab';
import TripSNA3DGraph from './TripSNA3DGraph';
import TripSNAMapGraph from './TripSNAMapGraph';

const TABS = [
  { key: 'narrative', icon: 'AI', label: 'AI Narrative', color: '#FFCC00' },
  { key: '3d', icon: '3D', label: '3D Network', color: '#00C9B1' },
  { key: 'map', icon: 'Map', label: 'Heritage Map', color: '#4F8EFF' },
  { key: 'insights', icon: 'SNA', label: 'SNA Metrics', color: '#A855F7' },
  { key: 'dynasty', icon: 'Time', label: 'Dynasty Flow', color: '#FF6B6B' },
  { key: 'bond', icon: 'Bond', label: 'Bond Analysis', color: '#F97316' },
];

const MOOD_COLORS = {
  contemplative: '#A855F7',
  adventurous: '#F59E0B',
  spiritual: '#EC4899',
  historical: '#64748B',
  artistic: '#00C9B1',
  colonial: '#6366F1',
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getPlaceName(place) {
  if (typeof place === 'string') {
    return place;
  }

  return place?.name || place?.title || place?.placeName || '';
}

const chennaiNameSet = new Set(CHENNAI_NODES.map((node) => normalizeText(node.name)));

function isChennaiPlace(place) {
  if (!place) {
    return false;
  }

  if (typeof place === 'object') {
    const districtValue = String(place.district || place.districtId || '').toLowerCase();
    const regionValue = String(place.region || place.location || '').toLowerCase();

    if (districtValue === 'chn' || regionValue.includes('chennai')) {
      return true;
    }
  }

  return chennaiNameSet.has(normalizeText(getPlaceName(place)));
}

export default function ChennaiIntelligencePanel({ selectedPlaces = [] }) {
  const [subgraphRecord, setSubgraphRecord] = useState({ key: '', data: null });
  const [narrativeRecord, setNarrativeRecord] = useState({ key: '', data: null });
  const [activeTab, setActiveTab] = useState('narrative');
  const [collapsed, setCollapsed] = useState(false);

  const chennaiPlaces = useMemo(
    () => (Array.isArray(selectedPlaces) ? selectedPlaces.filter(isChennaiPlace) : []),
    [selectedPlaces]
  );
  const names = useMemo(() => chennaiPlaces.map(getPlaceName).filter(Boolean), [chennaiPlaces]);
  const selectionKey = useMemo(() => [...names].sort().join('|'), [names]);

  const subgraph = subgraphRecord.key === selectionKey ? subgraphRecord.data : null;
  const narrative = narrativeRecord.key === selectionKey ? narrativeRecord.data : null;
  const loading = names.length >= 2 && subgraphRecord.key !== selectionKey;
  const aiLoading = !!subgraph && narrativeRecord.key !== selectionKey;
  const moodColor = MOOD_COLORS[narrative?.tripMood] || '#FFCC00';

  useEffect(() => {
    let cancelled = false;

    if (names.length < 2 || subgraphRecord.key === selectionKey) {
      return undefined;
    }

    buildTripSubgraph(names)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setSubgraphRecord({ key: selectionKey, data });
        setNarrativeRecord((current) => (current.key === selectionKey ? current : { key: '', data: null }));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setSubgraphRecord({ key: selectionKey, data: null });
        setNarrativeRecord((current) => (current.key === selectionKey ? current : { key: '', data: null }));
      });

    return () => {
      cancelled = true;
    };
  }, [names, selectionKey, subgraphRecord.key]);

  useEffect(() => {
    let cancelled = false;

    if (!subgraph || narrativeRecord.key === selectionKey) {
      return undefined;
    }

    generateTripNarrative(names, subgraph)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setNarrativeRecord({ key: selectionKey, data });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setNarrativeRecord({ key: selectionKey, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [names, narrativeRecord.key, selectionKey, subgraph]);

  if (names.length < 2) {
    return null;
  }

  return (
    <div className="w-full mt-8" style={{ contain: 'layout' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-[24px]"
        style={{
          background: 'linear-gradient(135deg,rgba(7,8,20,0.98) 0%,rgba(12,8,28,0.98) 100%)',
          border: `1px solid ${moodColor}30`,
          boxShadow: `0 0 80px ${moodColor}10, 0 32px 80px rgba(0,0,0,0.7)`,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="h-[3px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${moodColor}, ${moodColor}80, transparent)` }}
        />

        <div className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} onClick={() => setCollapsed((value) => !value)}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${moodColor}20`, border: `1px solid ${moodColor}40` }}>
              IQ
              {(loading || aiLoading) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-vibrant-gold/40 border-t-vibrant-gold animate-spin" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-syne text-sm font-bold text-white">Chennai Heritage Intelligence</span>
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: `${moodColor}15`, border: `1px solid ${moodColor}30`, color: moodColor }}>
                  {names.length} places
                </span>
                {subgraph && (
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(0,201,177,0.12)', border: '1px solid rgba(0,201,177,0.25)', color: '#00C9B1' }}>
                    {subgraph.totalEdges} SNA bonds
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs" style={{ color: narrative?.tagline ? moodColor : 'rgba(255,255,255,0.32)' }}>
                {narrative?.tagline || (loading ? 'Computing SNA subgraph...' : aiLoading ? 'AI analyzing...' : 'Real-time SNA analysis')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {subgraph && (
              <div className="flex items-center gap-3 mr-3">
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke={moodColor}
                    strokeWidth="3"
                    strokeDasharray={`${subgraph.relationshipScore} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                  />
                  <text x="22" y="26" textAnchor="middle" fill={moodColor} fontSize="11" fontWeight="700">
                    {subgraph.relationshipScore}
                  </text>
                </svg>
                <div className="text-xs">
                  <div className="text-white/40">Bond</div>
                  <div className="font-bold" style={{ color: moodColor }}>Score</div>
                </div>
              </div>
            )}

            <button
              type="button"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {collapsed ? 'v' : '^'}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
              {subgraph && (
                <div className="grid grid-cols-5 divide-x divide-white/5 border-b border-white/5">
                  {[
                    { label: 'Sites', value: subgraph.totalNodes, color: '#FFCC00' },
                    { label: 'SNA Bonds', value: subgraph.totalEdges, color: '#00C9B1' },
                    { label: 'Dynasties', value: Object.keys(subgraph.dynastyCount).length, color: '#A855F7' },
                    { label: 'Density', value: `${(subgraph.density * 100).toFixed(0)}%`, color: '#4F8EFF' },
                    { label: 'Hub Site', value: subgraph.hubNode?.name?.split(' ')[0] || '-', color: moodColor },
                  ].map((item) => (
                    <div key={item.label} className="py-3 text-center">
                      <div className="text-lg font-bold font-syne" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-xs text-white/30">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {narrative?.tripTheme && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mx-6 mt-4 rounded-2xl border px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: `${moodColor}10`, borderColor: `${moodColor}20` }}>
                  <div className="text-lg font-syne font-bold" style={{ color: moodColor }}>Theme</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: moodColor }}>Trip Theme</p>
                    <p className="text-base font-syne font-bold text-white">{narrative.tripTheme}</p>
                  </div>
                  {narrative.aiConfidence && (
                    <span className="ml-auto rounded-xl px-2 py-1 text-xs" style={{ background: narrative.aiConfidence === 'high' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: narrative.aiConfidence === 'high' ? '#10B981' : '#F59E0B' }}>
                      {narrative.aiConfidence === 'high' ? 'High' : 'Medium'}
                    </span>
                  )}
                </motion.div>
              )}

              <div className="mx-6 mt-4 rounded-2xl p-1 flex gap-1 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="flex-shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                    style={activeTab === tab.key ? { background: tab.color, color: '#000', boxShadow: `0 4px 16px ${tab.color}50` } : { color: 'rgba(255,255,255,0.45)' }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 pt-4">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'narrative' && (
                      <TripNarrativeTab narrative={narrative} loading={aiLoading} subgraph={subgraph} names={names} moodColor={moodColor} />
                    )}
                    {activeTab === '3d' && subgraph && <TripSNA3DGraph key={subgraph.nodes.map((node) => node.id).join('|')} subgraph={subgraph} moodColor={moodColor} />}
                    {activeTab === 'map' && subgraph && <TripSNAMapGraph key={subgraph.nodes.map((node) => node.id).join('|')} subgraph={subgraph} moodColor={moodColor} />}
                    {activeTab === 'insights' && subgraph && <TripInsightCards subgraph={subgraph} narrative={narrative} moodColor={moodColor} />}
                    {activeTab === 'dynasty' && subgraph && <TripDynastyFlow subgraph={subgraph} moodColor={moodColor} />}
                    {activeTab === 'bond' && subgraph && <TripBondAnalysis subgraph={subgraph} moodColor={moodColor} />}

                    {!subgraph && loading && (
                      <div className="flex flex-col items-center gap-4 py-12">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-vibrant-gold animate-spin" />
                          <div className="absolute inset-3 rounded-full border border-white/10 animate-pulse" />
                        </div>
                        <p className="text-sm text-white/40">Computing SNA subgraph...</p>
                      </div>
                    )}

                    {activeTab === 'narrative' && aiLoading && (
                      <div className="flex flex-col items-center gap-4 py-10">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-vibrant-gold animate-spin" />
                        </div>
                        <p className="text-sm text-white/40 animate-pulse">AI analyzing your heritage trip...</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
