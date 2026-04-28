import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { analyzePlacePair, EDGE_CONFIG } from '../../services/chennaiTripIntelligence';
import { dynastyHex } from '../../utils/dynastyColors';

export default function TripBondAnalysis({ subgraph, moodColor }) {
  const [activePair, setActivePair] = useState(null);
  const [pairData, setPairData] = useState({});
  const [loadingPair, setLoadingPair] = useState(null);

  const sortedPairs = [...subgraph.pairs].sort((a, b) => {
    if (a.connected && !b.connected) {
      return -1;
    }

    if (!a.connected && b.connected) {
      return 1;
    }

    return b.weight - a.weight;
  });

  const loadPair = async (pair) => {
    const key = `${pair.nodeA.name}|${pair.nodeB.name}`;
    if (pairData[key]) {
      setActivePair(key);
      return;
    }

    setLoadingPair(key);
    setActivePair(key);

    const data = await analyzePlacePair(pair.nodeA.name, pair.nodeB.name, pair.edge);
    setPairData((current) => ({ ...current, [key]: data }));
    setLoadingPair(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
        {subgraph.pairs.length} place pairs - click any pair for AI bond analysis
      </p>

      {sortedPairs.map((pair, index) => {
        const key = `${pair.nodeA.name}|${pair.nodeB.name}`;
        const colorA = dynastyHex[pair.nodeA.dynasty] || '#888888';
        const colorB = dynastyHex[pair.nodeB.dynasty] || '#888888';
        const isActive = activePair === key;
        const isLoading = loadingPair === key;
        const data = pairData[key];

        return (
          <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <button
              type="button"
              onClick={() => (isActive ? setActivePair(null) : loadPair(pair))}
              className="w-full text-left p-3 rounded-xl transition-colors"
              style={{ background: isActive ? `${moodColor}10` : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? `${moodColor}30` : 'rgba(255,255,255,0.08)'}` }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorA }} />
                <span className="text-xs font-medium text-white">{pair.nodeA.name.split(' ')[0]}</span>

                {pair.connected ? (
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-0.5 rounded-full" style={{ background: EDGE_CONFIG[pair.edge?.primaryType]?.color || moodColor }} />
                    <span className="text-xs font-bold" style={{ color: EDGE_CONFIG[pair.edge?.primaryType]?.color || moodColor }}>w:{pair.weight}</span>
                    <div className="flex-1 h-0.5 rounded-full" style={{ background: EDGE_CONFIG[pair.edge?.primaryType]?.color || moodColor }} />
                  </div>
                ) : (
                  <div className="flex-1 h-0.5 rounded-full bg-white/10" />
                )}

                <span className="text-xs font-medium text-white">{pair.nodeB.name.split(' ')[0]}</span>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorB }} />

                {pair.connected &&
                  pair.connectionTypes.slice(0, 2).map((type) => (
                    <span key={type} className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${EDGE_CONFIG[type]?.color || '#888888'}15`, color: EDGE_CONFIG[type]?.color || '#888888', border: `1px solid ${EDGE_CONFIG[type]?.color || '#888888'}25` }}>
                      {type}
                    </span>
                  ))}

                {!pair.connected && <span className="text-xs text-white/25 ml-1">no direct link</span>}
                <span className="ml-auto text-xs text-white/30">{isActive ? '^' : 'v'}</span>
              </div>
            </button>

            <AnimatePresence>
              {isActive && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} className="overflow-hidden">
                  <div className="mx-1 rounded-b-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', borderTop: `1px solid ${moodColor}15` }}>
                    {isLoading && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="w-4 h-4 border border-vibrant-gold/30 border-t-vibrant-gold rounded-full animate-spin" />
                        <p className="text-xs text-white/30 animate-pulse">AI analyzing bond...</p>
                      </div>
                    )}

                    {data && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 10 }, (_, dotIndex) => (
                              <div key={dotIndex} className="w-2 h-2 rounded-full" style={{ background: dotIndex < (data.bondScore || 0) ? moodColor : 'rgba(255,255,255,0.1)' }} />
                            ))}
                          </div>
                          <span className="text-xs capitalize" style={{ color: moodColor }}>{data.bondStrength}</span>
                          <span className="text-xs text-white/30">{data.primaryLink}</span>
                        </div>

                        {data.story && <p className="text-xs text-white/65 leading-relaxed">{data.story}</p>}

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {data.sharedFact && (
                            <div className="rounded-lg p-2 bg-teal-500/10">
                              <p className="text-xs text-teal-300 font-bold mb-0.5">Shared Fact</p>
                              <p className="text-xs text-white/60">{data.sharedFact}</p>
                            </div>
                          )}

                          {data.visitInsight && (
                            <div className="rounded-lg p-2 bg-vibrant-gold/10">
                              <p className="text-xs text-vibrant-gold font-bold mb-0.5">Visit Tip</p>
                              <p className="text-xs text-white/60">{data.visitInsight}</p>
                            </div>
                          )}
                        </div>

                        {data.contrast && <p className="text-xs italic text-white/40">{data.contrast}</p>}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
