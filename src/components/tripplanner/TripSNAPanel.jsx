import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHENNAI_NODES } from '../../services/chennaiSNA';
import { analyzeTripWithAI, buildTripSubgraph } from '../../services/tripPlannerSNA';
import TripSNAForceGraph from './TripSNAForceGraph';
import TripSNARelationshipMap from './TripSNARelationshipMap';
import TripSNARealtimeAnalysis from './TripSNARealtimeAnalysis';
import TripSNATimeline from './TripSNATimeline';

const TABS = [
  { key: 'map', label: 'Relationship Map', desc: 'Places plotted on the map with SNA links.' },
  { key: 'graph', label: 'Connection Graph', desc: 'Mini force graph for the selected subnetwork.' },
  { key: 'timeline', label: 'Dynasty Timeline', desc: 'Selected places arranged in chronological order.' },
  { key: 'ai', label: 'AI Trip Analysis', desc: 'Live AI insight for the current place combination.' },
];

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

function isChennaiSelection(place) {
  if (!place) {
    return false;
  }

  if (typeof place === 'object') {
    const districtValue = String(place.districtId || place.district || '').toLowerCase();
    const locationValue = String(place.location || place.city || place.destination || '').toLowerCase();

    if (districtValue === 'chn' || locationValue.includes('chennai')) {
      return true;
    }
  }

  return chennaiNameSet.has(normalizeText(getPlaceName(place)));
}

export default function TripSNAPanel({ selectedPlaces = [] }) {
  const [subgraphRecord, setSubgraphRecord] = useState({ key: '', data: null });
  const [analysisRecord, setAnalysisRecord] = useState({ key: '', data: null });
  const [activeTab, setActiveTab] = useState('map');
  const [expanded, setExpanded] = useState(true);

  const chennaiPlaces = useMemo(
    () => (Array.isArray(selectedPlaces) ? selectedPlaces.filter(isChennaiSelection) : []),
    [selectedPlaces]
  );

  const placeNames = useMemo(() => chennaiPlaces.map(getPlaceName).filter(Boolean), [chennaiPlaces]);
  const selectionKey = useMemo(() => placeNames.join('|'), [placeNames]);
  const subgraph = subgraphRecord.key === selectionKey ? subgraphRecord.data : null;
  const aiAnalysis = analysisRecord.key === selectionKey ? analysisRecord.data : null;
  const loading = placeNames.length >= 2 && subgraphRecord.key !== selectionKey;
  const aiLoading = !!subgraph && analysisRecord.key !== selectionKey;

  useEffect(() => {
    let cancelled = false;

    if (placeNames.length < 2 || subgraphRecord.key === selectionKey) {
      return undefined;
    }

    buildTripSubgraph(chennaiPlaces)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setSubgraphRecord({ key: selectionKey, data });
        setAnalysisRecord((current) => (current.key === selectionKey ? current : { key: '', data: null }));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setSubgraphRecord({ key: selectionKey, data: null });
        setAnalysisRecord((current) => (current.key === selectionKey ? current : { key: '', data: null }));
      });

    return () => {
      cancelled = true;
    };
  }, [chennaiPlaces, placeNames.length, selectionKey, subgraphRecord.key]);

  useEffect(() => {
    let cancelled = false;

    if (!subgraph || placeNames.length < 2 || analysisRecord.key === selectionKey) {
      return undefined;
    }

    analyzeTripWithAI(chennaiPlaces, subgraph)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setAnalysisRecord({ key: selectionKey, data });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setAnalysisRecord({ key: selectionKey, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [analysisRecord.key, chennaiPlaces, placeNames.length, selectionKey, subgraph]);

  if (placeNames.length < 2) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden backdrop-blur-xl"
      >
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10 cursor-pointer"
          onClick={() => setExpanded((value) => !value)}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white font-syne">Heritage Network Analysis</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-vibrant-gold/10 border border-vibrant-gold/25 text-vibrant-gold">
                {placeNames.length} places
              </span>
              {subgraph && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-teal-500/10 border border-teal-500/25 text-teal-300">
                  {subgraph.totalEdges} links
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">Chennai-only relationship view for the current trip selection.</p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {loading && <div className="w-4 h-4 rounded-full border border-vibrant-gold/30 border-t-vibrant-gold animate-spin" />}
            <span className="text-xs text-white/35">{expanded ? 'Hide' : 'Show'}</span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {aiAnalysis?.tripTheme && (
                <div className="px-5 py-3 bg-vibrant-gold/10 border-b border-vibrant-gold/15">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-vibrant-gold font-semibold mb-1">Trip Theme</p>
                  <p className="text-sm text-white font-medium">{aiAnalysis.tripTheme}</p>
                </div>
              )}

              {subgraph && (
                <div className="grid grid-cols-2 gap-3 px-5 py-4 border-b border-white/10 sm:grid-cols-4">
                  {[
                    { label: 'Places', value: subgraph.totalNodes, color: '#FFCC00' },
                    { label: 'Connections', value: subgraph.totalEdges, color: '#00C9B1' },
                    { label: 'Bond Score', value: subgraph.relationshipScore, color: '#FF6B00' },
                    { label: 'Connected', value: subgraph.isConnected ? 'Yes' : 'No', color: subgraph.isConnected ? '#10b981' : '#ef4444' },
                  ].map((item) => (
                    <div key={item.label} className="text-center rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2">
                      <div className="text-lg font-bold font-syne" style={{ color: item.color }}>
                        {item.value}
                      </div>
                      <div className="text-[11px] text-white/45 uppercase tracking-wide">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2 border-b border-white/10 flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-vibrant-gold text-black'
                        : 'bg-white/[0.03] text-white/55 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <p className="px-5 py-3 text-xs text-white/30 border-b border-white/10">
                {TABS.find((tab) => tab.key === activeTab)?.desc}
              </p>

              <div className="px-4 pb-4 pt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {activeTab === 'map' && subgraph && <TripSNARelationshipMap subgraph={subgraph} />}
                    {activeTab === 'graph' && subgraph && <TripSNAForceGraph subgraph={subgraph} />}
                    {activeTab === 'timeline' && subgraph && <TripSNATimeline subgraph={subgraph} />}
                    {activeTab === 'ai' && (
                      <TripSNARealtimeAnalysis
                        analysis={aiAnalysis}
                        loading={aiLoading}
                        placeNames={placeNames}
                        subgraph={subgraph}
                      />
                    )}
                    {!subgraph && loading && (
                      <div className="h-32 flex items-center justify-center">
                        <p className="text-xs text-white/35 animate-pulse">Building relationship graph...</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
