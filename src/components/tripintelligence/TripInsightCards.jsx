import { motion } from 'framer-motion';
import { dynastyHex } from '../../utils/dynastyColors';

const SNA_METRICS = [
  {
    key: 'degree',
    label: 'Degree Centrality',
    desc: 'Most directly connected site in your trip subgraph',
    color: '#FFCC00',
    icon: 'Links',
    getValue: (metric) => metric.degreeCentrality || 0,
    format: (value) => `${(value * 100).toFixed(0)}%`,
    explanation: 'How many other selected places this site directly connects to',
  },
  {
    key: 'betweenness',
    label: 'Betweenness Centrality',
    desc: 'Bridge site - lies on the most shortest paths',
    color: '#00C9B1',
    icon: 'Bridge',
    getValue: (metric) => metric.betweennessCentrality || 0,
    format: (value) => `${(value * 100).toFixed(0)}%`,
    explanation: 'How often this site appears on the shortest path between other selected places',
  },
  {
    key: 'closeness',
    label: 'Closeness Centrality',
    desc: 'Most accessible - closest to all other selected sites',
    color: '#4F8EFF',
    icon: 'Reach',
    getValue: (metric) => metric.closeness || 0,
    format: (value) => value.toFixed(3),
    explanation: 'How quickly this site can reach all other selected places in the fewest hops',
  },
  {
    key: 'eigenvector',
    label: 'Eigenvector Centrality',
    desc: 'Prestige score - connected to other well-connected sites',
    color: '#A855F7',
    icon: 'Influence',
    getValue: (metric) => metric.eigenvector || 0,
    format: (value) => value.toFixed(3),
    explanation: 'A site is important if it connects to other important sites',
  },
  {
    key: 'clustering',
    label: 'Clustering Coefficient',
    desc: 'Local density - how interconnected neighbours are',
    color: '#F97316',
    icon: 'Cluster',
    getValue: (metric) => metric.clusteringCoeff || 0,
    format: (value) => value.toFixed(2),
    explanation: 'How likely the neighbours of this site are also connected to each other',
  },
];

export default function TripInsightCards({ subgraph, narrative, moodColor }) {
  const getSortedNodes = (metric) => [...subgraph.nodes].sort((a, b) => metric.getValue(subgraph.metrics[b.id] || {}) - metric.getValue(subgraph.metrics[a.id] || {}));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Sites', value: subgraph.totalNodes, color: '#FFCC00' },
          { label: 'SNA Bonds', value: subgraph.totalEdges, color: '#00C9B1' },
          { label: 'Dynasties', value: Object.keys(subgraph.dynastyCount).length, color: '#A855F7' },
          { label: 'Density', value: `${(subgraph.density * 100).toFixed(0)}%`, color: moodColor },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl p-4 text-center"
            style={{ background: `${item.color}10`, border: `1px solid ${item.color}22` }}
          >
            <div className="text-2xl font-bold font-syne" style={{ color: item.color }}>{item.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {SNA_METRICS.map((metric, metricIndex) => {
        const sortedNodes = getSortedNodes(metric);
        const topNode = sortedNodes[0];
        const topValue = metric.getValue(subgraph.metrics[topNode?.id] || {}) || 1;

        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + metricIndex * 0.1 }}
            className="rounded-2xl p-5 border"
            style={{ background: `${metric.color}08`, borderColor: `${metric.color}20` }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-sm font-semibold px-2 py-1 rounded-xl" style={{ background: `${metric.color}15`, color: metric.color }}>{metric.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-syne font-bold text-white text-sm">{metric.label}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${metric.color}15`, color: metric.color, border: `1px solid ${metric.color}25` }}>SNA metric</span>
                </div>
                <p className="text-xs text-white/45 mt-0.5">{metric.explanation}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {sortedNodes.map((node, index) => {
                const value = metric.getValue(subgraph.metrics[node.id] || {});
                const width = topValue > 0 ? (value / topValue) * 100 : 0;
                const color = dynastyHex[node.dynasty] || '#888888';
                const isTop = index === 0;

                return (
                  <div key={node.id} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1 gap-3">
                        <span className={`text-xs font-medium truncate ${isTop ? 'text-white' : 'text-white/70'}`}>
                          {node.name}
                          {isTop && <span className="ml-1" style={{ color: metric.color }}>← {metric.desc}</span>}
                        </span>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: metric.color }}>{metric.format(value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ delay: 0.15 + metricIndex * 0.1 + index * 0.04, duration: 0.6, ease: 'easeOut' }}
                          style={{ background: isTop ? metric.color : color, opacity: isTop ? 1 : 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      <div className="rounded-2xl p-5 border" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
        <h4 className="font-syne font-bold text-white text-sm mb-4">Dynasty Distribution</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(subgraph.dynastyCount).map(([dynasty, count]) => (
            <div key={dynasty} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${dynastyHex[dynasty] || '#888888'}12`, border: `1px solid ${dynastyHex[dynasty] || '#888888'}25` }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dynastyHex[dynasty] || '#888888', boxShadow: `0 0 8px ${(dynastyHex[dynasty] || '#888888')}60` }} />
              <span className="text-xs text-white/70">{dynasty}</span>
              <span className="text-xs font-bold" style={{ color: dynastyHex[dynasty] || '#888888' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {narrative?.networkInsight && (
        <div className="rounded-2xl p-4 border" style={{ background: `${moodColor}08`, borderColor: `${moodColor}20` }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: moodColor }}>Network Density Insight</p>
          <p className="text-sm text-white/70 leading-relaxed">{narrative.networkInsight}</p>
        </div>
      )}
    </div>
  );
}
