// src/components/chennai/ChennaiSNADashboard.jsx
// TAB 3 — Metrics, community cards, top edges

import { dynastyHex, dynastyIcons } from '../../utils/dynastyColors';

export default function ChennaiSNADashboard({ snaData }) {
  if (!snaData) return null;
  const { networkStats, rankedByCentrality, rankedByBetweenness, communities, topEdges } = snaData;

  return (
    <div className="space-y-8">

      {/* Network stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📍', label: 'Heritage Sites',  value: networkStats.totalNodes,     color: '#FFCC00' },
          { icon: '🔗', label: 'Connections',     value: networkStats.totalEdges,     color: '#00C9B1' },
          { icon: '📊', label: 'Avg Connections', value: networkStats.averageDegree,   color: '#4F8EFF' },
          { icon: '🏛️', label: 'Communities',     value: networkStats.communities,    color: '#A855F7' },
        ].map(s => (
          <div key={s.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-white/18 transition-all cursor-default">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold font-syne" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Centrality rankings side by side */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Degree centrality — Hub sites */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-white mb-1">🏆 Hub Sites</h3>
          <p className="text-xs text-white/40 mb-5">Most connected nodes — highest degree centrality</p>
          <div className="space-y-3.5">
            {rankedByCentrality.slice(0, 7).map((n, i) => (
              <div key={n.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${dynastyHex[n.dynasty] || '#888'}20`, color: dynastyHex[n.dynasty] || '#888', border: `1px solid ${dynastyHex[n.dynasty] || '#888'}40` }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate pr-2">{n.name}</span>
                    <span className="text-xs text-white/40 flex-shrink-0">{n.degree} links</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(n.degreeCentrality || 0) * 100}%`, background: dynastyHex[n.dynasty] || '#888' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Betweenness centrality — Bridge sites */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-white mb-1">🌉 Bridge Sites</h3>
          <p className="text-xs text-white/40 mb-5">Sites on most shortest paths — betweenness centrality</p>
          <div className="space-y-3.5">
            {rankedByBetweenness.slice(0, 7).map((n, i) => (
              <div key={n.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate pr-2">{n.name}</span>
                    <span className="text-xs text-white/40 flex-shrink-0">{((n.betweennessCentrality || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-teal-400 transition-all duration-700"
                      style={{ width: `${(n.betweennessCentrality || 0) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynasty community cards */}
      <div>
        <h3 className="font-syne font-bold text-white mb-1">🏘️ Heritage Communities</h3>
        <p className="text-xs text-white/40 mb-4">Dynastically coherent sub-networks — community detection result</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...communities].filter(c => c.size > 0).sort((a, b) => b.size - a.size).map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${c.color}20`, border: `1px solid ${c.color}40` }}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{c.name}</div>
                  <div className="text-xs text-white/40">{c.size} sites</div>
                </div>
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}70` }} />
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-3">{c.desc}</p>
              <div className="flex flex-wrap gap-1">
                {c.nodeIds.slice(0, 4).map(nId => {
                  const node = snaData.nodes.find(n => n.id === nId);
                  return node ? (
                    <span key={nId} className="text-xs px-2 py-0.5 rounded-full border"
                      style={{ borderColor: `${c.color}40`, color: c.color, background: `${c.color}10` }}>
                      {node.name.split(' ')[0]}
                    </span>
                  ) : null;
                })}
                {c.nodeIds.length > 4 && (
                  <span className="text-xs text-white/30 self-center pl-1">+{c.nodeIds.length - 4} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top edges */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-syne font-bold text-white mb-1">⚡ Strongest Connections</h3>
        <p className="text-xs text-white/40 mb-4">Top heritage site pairings by combined edge weight</p>
        <div className="space-y-3">
          {topEdges.slice(0, 7).map((e, i) => (
            <div key={e.id} className="flex items-start gap-4 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/12 transition-all">
              <div className="text-vibrant-gold font-bold text-sm w-5 flex-shrink-0 mt-0.5">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{e.sourceName} ↔ {e.targetName}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {e.connections.map((c, ci) => (
                    <span key={ci} className="text-xs px-2 py-0.5 rounded-full bg-vibrant-gold/10 text-vibrant-gold/80 border border-vibrant-gold/20">{c.label}</span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-white/35 bg-white/5 px-2 py-1 rounded-lg flex-shrink-0">w:{e.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary insight box */}
      <div className="bg-gradient-to-r from-vibrant-gold/8 to-transparent border border-vibrant-gold/15 rounded-2xl p-5">
        <h4 className="font-syne font-semibold text-vibrant-gold mb-2">📐 Network Summary</h4>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-white/60 leading-relaxed">
          <div>
            Most connected site: <strong className="text-white">{networkStats.mostCentralNode}</strong>
          </div>
          <div>
            Top bridge site: <strong className="text-white">{networkStats.topBridgeNode}</strong>
          </div>
          <div>
            Dominant community: <strong className="text-white">{networkStats.largestCommunity}</strong>
          </div>
          <div>
            Network density: <strong className="text-white">{networkStats.networkDensity}</strong> (higher = denser)
          </div>
        </div>
      </div>
    </div>
  );
}