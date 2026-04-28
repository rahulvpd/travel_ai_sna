import { motion } from 'framer-motion';
import { dynastyDescriptions, dynastyHex, dynastyIcons } from '../../utils/dynastyColors';

export default function TripDynastyFlow({ subgraph, moodColor }) {
  const dynastyGroups = {};

  subgraph.byTime.forEach((node) => {
    if (!dynastyGroups[node.dynasty]) {
      dynastyGroups[node.dynasty] = [];
    }

    dynastyGroups[node.dynasty].push(node);
  });

  return (
    <div className="space-y-5">
      <div className="relative">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Your Journey Through Time</p>

        <div className="relative pl-4">
          <div className="absolute left-4 top-3 bottom-3 w-0.5 rounded-full" style={{ background: `linear-gradient(180deg, ${moodColor}66, transparent)` }} />

          <div className="space-y-4">
            {subgraph.byTime.map((node, index) => {
              const color = dynastyHex[node.dynasty] || '#888888';

              return (
                <motion.div key={node.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-3 h-3 rounded-full mt-1" style={{ background: color, boxShadow: `0 0 10px ${color}70`, border: `2px solid ${color}` }} />
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{node.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                        {dynastyIcons[node.dynasty] || 'o'} {node.dynasty}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">{node.period} · {node.placeType}</p>
                    {node.significance && <p className="text-xs text-white/50 mt-1 leading-relaxed">{node.significance}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Dynasties in Your Trip</p>
        <div className="space-y-2">
          {Object.entries(dynastyGroups).map(([dynasty, nodes]) => (
            <div key={dynasty} className="rounded-xl p-3" style={{ background: `${dynastyHex[dynasty] || '#888888'}08`, border: `1px solid ${dynastyHex[dynasty] || '#888888'}20` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{dynastyIcons[dynasty] || 'o'}</span>
                <span className="text-sm font-semibold text-white">{dynasty}</span>
                <span className="text-xs text-white/30 ml-auto">{nodes.length} place{nodes.length > 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">{dynastyDescriptions[dynasty] || `${dynasty} heritage`}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {nodes.map((node) => (
                  <span key={node.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${dynastyHex[dynasty] || '#888888'}15`, color: dynastyHex[dynasty] || '#888888' }}>
                    {node.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
