import { motion } from 'framer-motion';
import { dynastyHex } from '../../utils/dynastyColors';

export default function TripNarrativeTab({ narrative, loading, subgraph, moodColor }) {
  if (loading || !narrative) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-4 rounded-full animate-pulse"
            style={{ background: 'rgba(255,255,255,0.06)', width: `${90 - item * 15}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {narrative.narrative && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: `linear-gradient(180deg, ${moodColor}, transparent)` }} />
          <p className="pl-4 text-sm text-white/75 leading-relaxed">{narrative.narrative}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Era Span', value: narrative.eraSpan, color: '#FFCC00' },
          { label: 'Dominant', value: narrative.dominantDynasty?.split(' ')[0], color: '#A855F7' },
          { label: 'Best Time', value: narrative.bestTimeOfDay?.split('/')[0], color: '#00C9B1' },
        ]
          .filter((item) => item.value)
          .map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl p-3 text-center"
              style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}
            >
              <div className="text-xs text-white/40 mb-1">{item.label}</div>
              <div className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</div>
            </motion.div>
          ))}
      </div>

      {narrative.hiddenPattern && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Hidden SNA Pattern</p>
          <p className="text-sm text-white/70 leading-relaxed">{narrative.hiddenPattern}</p>
        </motion.div>
      )}

      {narrative.uniqueExperience && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4" style={{ background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-2">Unique Experience</p>
          <p className="text-sm text-white/70 leading-relaxed">{narrative.uniqueExperience}</p>
        </motion.div>
      )}

      {narrative.suggestedOrder?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">AI Suggested Visit Order</p>
          <div className="space-y-2">
            {narrative.suggestedOrder.map((item, index) => {
              const placeName = item.place || item;
              const node = subgraph?.nodes.find((candidate) => candidate.name.toLowerCase().includes(String(placeName).toLowerCase()));
              const color = node ? dynastyHex[node.dynasty] || '#888888' : moodColor;

              return (
                <motion.div
                  key={`${placeName}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${color}24`, border: `1px solid ${color}40`, color }}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{placeName}</p>
                    {item.reason && <p className="text-xs text-white/42 mt-1">{item.reason}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {narrative.snaCentralPlace && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.2)' }}>
            <p className="text-xs font-bold text-vibrant-gold mb-1">Network Hub</p>
            <p className="text-xs text-white/70">{narrative.snaCentralPlace}</p>
          </div>
        )}

        {narrative.weakLink && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
            <p className="text-xs font-bold text-red-300 mb-1">Weak Link</p>
            <p className="text-xs text-white/70">{narrative.weakLink}</p>
          </div>
        )}
      </div>
    </div>
  );
}
