// src/components/chennai/ChennaiSNAInsights.jsx
// TAB 4 — NVIDIA Nemotron AI narrative output

export default function ChennaiSNAInsights({ snaData }) {
  const insights = snaData?.aiInsights;
  const stats = snaData?.networkStats;

  if (!insights) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
      <div className="text-4xl mb-4">🤖</div>
      <p className="text-white/50 font-medium mb-2">NVIDIA AI insights unavailable</p>
      <p className="text-white/30 text-sm mb-1">Add <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">VITE_NVIDIA_API_KEY</code> to your <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">.env</code> file</p>
      <p className="text-white/20 text-xs">Get free key at build.nvidia.com · 1,000 free credits · Nemotron-70B model</p>
    </div>
  );

  const INSIGHT_CARDS = [
    { key: 'networkSummary',     title: 'Network Overview',   icon: '🕸️', color: 'blue' },
    { key: 'dominantCommunity',  title: 'Dominant Community', icon: '👑', color: 'amber' },
    { key: 'hubSiteAnalysis',    title: 'Hub Site Analysis',  icon: '📍', color: 'purple' },
    { key: 'historicalInsight',  title: 'Historical Insight', icon: '🏛️', color: 'teal' },
    { key: 'tourismImplication', title: 'Tourism Implication',icon: '✈️', color: 'green' },
    { key: 'snaConclusion',      title: 'SNA Conclusion',     icon: '🔬', color: 'rose' },
  ];

  const colorMap = {
    blue:  'bg-blue-500/10 border-blue-500/20 text-blue-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    purple:'bg-purple-500/10 border-purple-500/20 text-purple-300',
    teal:  'bg-teal-500/10 border-teal-500/20 text-teal-300',
    green: 'bg-green-500/10 border-green-500/20 text-green-300',
    rose:  'bg-rose-500/10 border-rose-500/20 text-rose-300',
  };

  return (
    <div className="space-y-5">

      {/* Engine badge */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-green-500/12 border border-green-500/25 text-green-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {insights.engine || 'NVIDIA Nemotron-70B'}
        </span>
        <span className="text-white/30">·</span>
        <span className="text-white/30">{stats?.totalNodes} nodes · {stats?.totalEdges} edges analysed</span>
      </div>

      {/* Bridge Sites */}
      {insights.keyBridgeSites?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h4 className="font-syne font-semibold text-white mb-3 flex items-center gap-2">
            🌉 Key Bridge Sites
            <span className="text-xs text-white/30 font-normal">Sites that connect different dynasty communities</span>
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.keyBridgeSites.map((b, i) => (
              <div key={i} className="flex gap-3 bg-white/3 rounded-xl p-3.5 border border-white/5 hover:border-white/12 transition-all">
                <div className="w-2 h-2 rounded-full bg-vibrant-gold mt-1.5 flex-shrink-0 shadow-sm" style={{ boxShadow: '0 0 6px #FFCC00' }} />
                <div>
                  <div className="text-sm font-semibold text-white">{b.site}</div>
                  <div className="text-xs text-white/50 mt-1 leading-relaxed">{b.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {INSIGHT_CARDS.map(card => insights[card.key] && (
          <div key={card.key} className={`border rounded-2xl p-5 ${colorMap[card.color]}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{card.icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest opacity-75">{card.title}</span>
            </div>
            <p className="text-sm leading-relaxed opacity-88">{insights[card.key]}</p>
          </div>
        ))}
      </div>

      {/* Weakly connected */}
      {insights.weaklyConnectedSites?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-white/45 uppercase tracking-widest mb-3">
            ⚠️ Weakly Connected Sites
          </h4>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {insights.weaklyConnectedSites.map((s, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/25 leading-relaxed">
            These sites have fewer connections in the heritage network — representing opportunities for
            deeper cultural research, new heritage trails, and richer tourism narratives.
          </p>
        </div>
      )}

    </div>
  );
}