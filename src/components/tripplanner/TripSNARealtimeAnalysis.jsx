import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getPlacePairRelationship } from '../../services/tripPlannerSNA';

export default function TripSNARealtimeAnalysis({ analysis, loading, placeNames, subgraph }) {
  const [pairDetail, setPairDetail] = useState(null);
  const [pairLoading, setPairLoading] = useState(false);

  const loadPairDetail = async (placeA, placeB) => {
    setPairDetail({ placeA, placeB, data: null });
    setPairLoading(true);

    try {
      const data = await getPlacePairRelationship(placeA, placeB);
      setPairDetail({ placeA, placeB, data });
    } finally {
      setPairLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-6 h-6 rounded-full border-2 border-vibrant-gold/30 border-t-vibrant-gold animate-spin" />
        <p className="text-xs text-white/35">AI is analyzing your trip...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
        <p className="text-xs text-white/40">Select two or more Chennai places to unlock live trip analysis.</p>
        {!!subgraph?.totalNodes && (
          <p className="text-[11px] text-white/25 mt-2">
            Current network: {subgraph.totalNodes} places, {subgraph.totalEdges} links.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
      {analysis.narrativeArc && (
        <div className="rounded-xl border border-vibrant-gold/20 bg-vibrant-gold/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-vibrant-gold font-semibold mb-2">Heritage Journey</p>
          <p className="text-sm text-white/80 leading-relaxed">{analysis.narrativeArc}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {analysis.dynastySpan && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-white/40 mb-1">Dynasty Span</p>
            <p className="text-xs text-white font-medium">{analysis.dynastySpan}</p>
          </div>
        )}
        {analysis.strongestBond && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-white/40 mb-1">Strongest Bond</p>
            <p className="text-xs text-white font-medium line-clamp-2">{analysis.strongestBond}</p>
          </div>
        )}
      </div>

      {analysis.hiddenPattern && (
        <div className="rounded-xl border border-vibrant-pink/20 bg-vibrant-pink/10 p-3">
          <p className="text-xs text-vibrant-pink font-semibold mb-1">Hidden Pattern</p>
          <p className="text-xs text-white/75 leading-relaxed">{analysis.hiddenPattern}</p>
        </div>
      )}

      {analysis.uniqueInsight && (
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-3">
          <p className="text-xs text-teal-300 font-semibold mb-1">Unique Insight</p>
          <p className="text-xs text-white/75 leading-relaxed">{analysis.uniqueInsight}</p>
        </div>
      )}

      {analysis.suggestedOrder?.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs text-white/40 mb-2">Suggested Visit Order</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.suggestedOrder.map((place, index) => (
              <span
                key={`${place}-${index}`}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white/75"
              >
                <span className="font-bold text-vibrant-gold">{index + 1}</span>
                {place}
              </span>
            ))}
          </div>
          {analysis.suggestedOrderReason && (
            <p className="text-xs text-white/35 mt-2">{analysis.suggestedOrderReason}</p>
          )}
        </div>
      )}

      {analysis.pairwiseConnections?.length > 0 && (
        <div>
          <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-2">Place Connections</p>
          <div className="space-y-2">
            {analysis.pairwiseConnections.slice(0, 4).map((pair, index) => (
              <button
                key={`${pair.pair}-${index}`}
                type="button"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:border-white/20 transition-colors"
                onClick={() => {
                  const parts = String(pair.pair || '').split(' + ');
                  if (parts.length === 2) {
                    loadPairDetail(parts[0].trim(), parts[1].trim());
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs font-medium text-white">{pair.pair}</span>
                  <span className="text-[11px] text-vibrant-gold/80 bg-vibrant-gold/10 px-1.5 py-0.5 rounded">
                    {pair.connectionType}
                  </span>
                </div>
                <p className="text-xs text-white/55">{pair.story}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {pairDetail && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl border border-vibrant-gold/20 bg-white/10 p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-bold text-vibrant-gold">{pairDetail.placeA} + {pairDetail.placeB}</p>
                <p className="text-[11px] text-white/30 mt-1">
                  {placeNames?.length || 0} selected places in this Chennai trip network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPairDetail(null)}
                className="text-sm text-white/35 hover:text-white"
              >
                x
              </button>
            </div>

            {pairLoading && <p className="text-xs text-white/35 animate-pulse">Loading deeper pair analysis...</p>}

            {!pairLoading && !pairDetail.data && (
              <p className="text-xs text-white/35">Detailed pair insight is unavailable right now.</p>
            )}

            {pairDetail.data && (
              <div className="space-y-2 text-xs text-white/75 leading-relaxed">
                <p>{pairDetail.data.explanation}</p>
                {pairDetail.data.sharedHistory && (
                  <p className="text-teal-300">Shared history: {pairDetail.data.sharedHistory}</p>
                )}
                {pairDetail.data.visitTogether && (
                  <p className="text-vibrant-gold/85">Visit together: {pairDetail.data.visitTogether}</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
