// src/components/chennai/ChennaiSNAEnhancedDashboard.jsx
// TAB 3 — Enhanced Tourism Metrics Dashboard
// Shows: Tourism Centrality, Experience Diversity, Accessibility, Recommendations

import { dynastyHex } from '../../utils/dynastyColors';

export default function ChennaiSNAEnhancedDashboard({ snaData }) {
  if (!snaData) return null;

  const { networkStats, rankedByCentrality, rankedByBetweenness, rankedByTourismCentrality, rankedByRecommendation, communities, topEdges } = snaData;

  return (
    <div className="space-y-8">
      {/* Tourism-specific stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: '📍', label: 'Heritage Sites', value: networkStats.totalNodes, color: '#FFCC00' },
          { icon: '🔗', label: 'Connections', value: networkStats.totalEdges, color: '#00C9B1' },
          { icon: '🏛️', label: 'Dynasties', value: networkStats.communities, color: '#A855F7' },
          { icon: '🛤️', label: 'Circuits', value: networkStats.totalCircuits, color: '#FF6B00' },
          { icon: '📊', label: 'Avg Links', value: networkStats.averageDegree, color: '#4F8EFF' },
        ].map(s => (
          <div key={s.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-white/18 transition-all cursor-default">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold font-syne" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Four-column metric rankings */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tourism Centrality */}
        <MetricRankingCard
          title="🎯 Tourism Hubs"
          subtitle="By visitor potential + network position"
          data={rankedByTourismCentrality?.slice(0, 5) || []}
          metricKey="tourismCentrality"
          color="#FFCC00"
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />

        {/* Recommendation Score */}
        <MetricRankingCard
          title="⭐ Top Picks"
          subtitle="Best overall visitor experience"
          data={rankedByRecommendation?.slice(0, 5) || []}
          metricKey="recommendationScore"
          color="#10B981"
          formatValue={(v) => v.toFixed(2)}
        />

        {/* Hub Sites (Degree) */}
        <MetricRankingCard
          title="🏆 Network Hubs"
          subtitle="Most connected sites"
          data={rankedByCentrality?.slice(0, 5) || []}
          metricKey="degreeCentrality"
          color="#A855F7"
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />

        {/* Bridge Sites (Betweenness) */}
        <MetricRankingCard
          title="🌉 Bridge Sites"
          subtitle="Connect different communities"
          data={rankedByBetweenness?.slice(0, 5) || []}
          metricKey="betweennessCentrality"
          color="#4F8EFF"
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />
      </div>

      {/* Experience Diversity Analysis */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-syne font-bold text-white mb-1">🎭 Experience Diversity Ranking</h3>
        <p className="text-xs text-white/40 mb-5">Sites with most diverse neighbouring place types — ideal for multi-experience visitors</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rankedByRecommendation
            ?.filter(n => n.experienceDiversity > 0.3)
            .slice(0, 6)
            .map((n, i) => {
              const node = snaData.nodes.find(x => x.id === n.id);
              const neighborTypes = [...new Set(
                n.neighbours
                  .map(nbId => snaData.nodes.find(x => x.id === nbId)?.placeType)
                  .filter(Boolean)
              )];
              
              return (
                <div key={n.id} className="bg-white/3 rounded-xl p-4 border border-white/5 hover:border-white/12 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{node?.emoji || '📍'}</span>
                      <span className="text-sm font-medium text-white">{n.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white/40">#{i + 1}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {neighborTypes.map(type => (
                      <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                        {type}
                      </span>
                    ))}
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                      style={{ width: `${n.experienceDiversity * 100}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Dynasty communities with tourism metrics */}
      <div>
        <h3 className="font-syne font-bold text-white mb-1">🏘️ Heritage Communities Analysis</h3>
        <p className="text-xs text-white/40 mb-4">Dynasty-based communities with tourism potential scoring</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities?.dynasty?.filter(c => c.size > 0).sort((a, b) => b.cohesion - a.cohesion).map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${c.color}20`, border: `1px solid ${c.color}40` }}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{c.name}</div>
                  <div className="text-xs text-white/40">{c.size} sites · Cohesion: {(c.cohesion * 100).toFixed(0)}%</div>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-3">{c.desc}</p>
              <div className="flex flex-wrap gap-1">
                {c.nodeIds.slice(0, 3).map(nId => {
                  const node = snaData.nodes.find(n => n.id === nId);
                  return node ? (
                    <span key={nId} className="text-xs px-2 py-0.5 rounded-full border"
                      style={{ borderColor: `${c.color}40`, color: c.color, background: `${c.color}10` }}>
                      {node.name.split(' ')[0]}
                    </span>
                  ) : null;
                })}
                {c.nodeIds.length > 3 && (
                  <span className="text-xs text-white/30 self-center pl-1">+{c.nodeIds.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top connections with tourism context */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-syne font-bold text-white mb-1">⚡ Strongest Tourism Connections</h3>
        <p className="text-xs text-white/40 mb-4">Top heritage site pairings optimized for visitor experience</p>
        <div className="space-y-3">
          {topEdges?.slice(0, 6).map((e, i) => (
            <div key={e.id} className="flex items-start gap-4 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/12 transition-all">
              <div className="text-vibrant-gold font-bold text-sm w-5 flex-shrink-0 mt-0.5">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{e.sourceName} ↔ {e.targetName}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {e.connections.map((c, ci) => (
                    <span key={ci} className="text-xs px-2 py-0.5 rounded-full bg-vibrant-gold/10 text-vibrant-gold/80 border border-vibrant-gold/20">
                      {c.label}
                    </span>
                  ))}
                </div>
                {/* NEW: Tourism context */}
                <div className="mt-2 text-xs text-white/30">
                  Distance: {e.distance?.toFixed(1) || '?'} km · Combined weight: {e.weight}
                </div>
              </div>
              <div className="text-xs text-white/35 bg-white/5 px-2 py-1 rounded-lg flex-shrink-0">
                w:{e.weight}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Index */}
      <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/15 rounded-2xl p-5">
        <h4 className="font-syne font-semibold text-green-400 mb-3 flex items-center gap-2">
          <span>♿</span> Accessibility Ranking
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50 mb-3">Most accessible heritage sites</p>
            <div className="space-y-2">
              {snaData.nodes
                ?.filter(n => n.wheelchairAccess || n.accessibility > 0.8)
                .sort((a, b) => (b.accessibility || 0) - (a.accessibility || 0))
                .slice(0, 5)
                .map(n => (
                  <div key={n.id} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">{n.emoji}</span>
                    <span className="text-white">{n.name}</span>
                    <span className="text-xs text-green-300/60 ml-auto">
                      {n.wheelchairAccess ? '♿' : ''} {(n.accessibility * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-3">Sites needing accessibility improvements</p>
            <div className="space-y-2">
              {snaData.nodes
                ?.filter(n => n.accessibility < 0.7)
                .sort((a, b) => (a.accessibility || 0) - (b.accessibility || 0))
                .slice(0, 4)
                .map(n => (
                  <div key={n.id} className="flex items-center gap-2 text-sm">
                    <span className="text-orange-400">{n.emoji}</span>
                    <span className="text-white/70">{n.name}</span>
                    <span className="text-xs text-orange-300/60 ml-auto">
                      {(n.accessibility * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Network summary */}
      <div className="bg-gradient-to-r from-vibrant-gold/8 to-transparent border border-vibrant-gold/15 rounded-2xl p-5">
        <h4 className="font-syne font-semibold text-vibrant-gold mb-3">📐 Network Summary</h4>
        <div className="grid md:grid-cols-3 gap-3 text-sm text-white/60 leading-relaxed">
          <div>
            Most connected: <strong className="text-white">{networkStats.mostCentralNode}</strong>
          </div>
          <div>
            Top bridge: <strong className="text-white">{networkStats.topBridgeNode}</strong>
          </div>
          <div>
            Tourism hub: <strong className="text-white">{networkStats.topTourismHub}</strong>
          </div>
          <div>
            Dominant community: <strong className="text-white">{networkStats.largestCommunity}</strong>
          </div>
          <div>
            Network density: <strong className="text-white">{networkStats.networkDensity}</strong>
          </div>
          <div>
            Circuits available: <strong className="text-white">{networkStats.totalCircuits}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER COMPONENT: Metric Ranking Card
// ─────────────────────────────────────────────────────────────
function MetricRankingCard({ title, subtitle, data, metricKey, color, formatValue }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="font-syne font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/40 mb-4">{subtitle}</p>
      <div className="space-y-3">
        {data.map((n, i) => (
          <div key={n.id} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-white truncate pr-2">{n.name}</span>
                <span className="text-xs text-white/40 flex-shrink-0 font-mono">
                  {formatValue(n[metricKey] || 0)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/8">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((n[metricKey] || 0) * 100, 100)}%`,
                    background: color
                  }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
