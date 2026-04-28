// src/components/chennai/ChennaiSNATourismInsights.jsx
// TAB 5 — AI Tourism Development Insights
// Shows: Network Overview, Circuit Recommendations, Infrastructure Priorities, Marketing Insights

export default function ChennaiSNATourismInsights({ snaData }) {
  const insights = snaData?.tourismInsights;
  const stats = snaData?.networkStats;

  if (!insights) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <p className="text-white/50 font-medium mb-2">AI Tourism Insights Unavailable</p>
        <p className="text-white/30 text-sm mb-4">
          Add <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">VITE_NVIDIA_API_KEY</code> to your{' '}
          <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">.env</code> file
        </p>
        <p className="text-white/20 text-xs">
          Get free key at build.nvidia.com · 1,000 free credits · Nemotron-70B model
        </p>
      </div>
    );
  }

  const INSIGHT_CARDS = [
    { key: 'networkOverview', title: 'Network Overview', icon: '🕸️', color: 'blue' },
    { key: 'tourismHubsAnalysis', title: 'Tourism Hubs Analysis', icon: '📍', color: 'purple' },
    { key: 'developmentOpportunities', title: 'Development Opportunities', icon: '🏗️', color: 'amber' },
    { key: 'snaTourismConclusion', title: 'SNA Tourism Conclusion', icon: '🔬', color: 'rose' }
  ];

  const colorMap = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
    green: 'bg-green-500/10 border-green-500/20 text-green-300',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-300'
  };

  return (
    <div className="space-y-6">
      {/* Engine badge */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-green-500/12 border border-green-500/25 text-green-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {insights.engine || 'NVIDIA Nemotron-70B'}
        </span>
        <span className="text-white/30">·</span>
        <span className="text-white/30">
          {stats?.totalNodes} nodes · {stats?.totalEdges} edges · {stats?.totalCircuits} circuits
        </span>
      </div>

      {/* Circuit Recommendations */}
      {insights.circuitRecommendations?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-syne font-semibold text-white mb-3 flex items-center gap-2">
            🛤️ Recommended Circuits for Different Visitors
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.circuitRecommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 bg-white/3 rounded-xl p-4 border border-white/5 hover:border-white/12 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vibrant-gold to-vibrant-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure Priorities */}
      {insights.infrastructurePriorities?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-syne font-semibold text-white mb-3 flex items-center gap-2">
            🏗️ Infrastructure Development Priorities
          </h3>
          <div className="space-y-3">
            {insights.infrastructurePriorities.map((item, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.site}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>
                <p className="text-sm text-white/60">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketing Insights */}
      {insights.marketingInsights && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="font-syne font-semibold text-white mb-3 flex items-center gap-2">
              📢 Primary Marketing Focus
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {insights.marketingInsights.primaryFocus}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h4 className="font-syne font-semibold text-white mb-3 flex items-center gap-2">
              🤝 Cross-Promotion Opportunities
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {insights.marketingInsights.crossPromotion}
            </p>
          </div>
        </div>
      )}

      {/* Seasonal Strategies */}
      {insights.seasonalStrategies && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/15 rounded-2xl p-5">
            <h4 className="font-syne font-semibold text-orange-300 mb-2 flex items-center gap-2">
              ☀️ Peak Season Strategy
            </h4>
            <p className="text-sm text-white/60 leading-relaxed">
              {insights.seasonalStrategies.peakSeason}
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/15 rounded-2xl p-5">
            <h4 className="font-syne font-semibold text-blue-300 mb-2 flex items-center gap-2">
              🌧️ Off-Season Strategy
            </h4>
            <p className="text-sm text-white/60 leading-relaxed">
              {insights.seasonalStrategies.offSeason}
            </p>
          </div>
        </div>
      )}

      {/* Main insight cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {INSIGHT_CARDS.map(card =>
          insights[card.key] && (
            <div key={card.key} className={`border rounded-2xl p-5 ${colorMap[card.color]}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{card.icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest opacity-75">
                  {card.title}
                </span>
              </div>
              <p className="text-sm leading-relaxed opacity-88">
                {Array.isArray(insights[card.key])
                  ? insights[card.key].join(', ')
                  : insights[card.key]}
              </p>
            </div>
          )
        )}
      </div>

      {/* Underutilized Sites from SNA Data */}
      {snaData?.rankedByRecommendation && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-syne font-semibold text-white mb-1 flex items-center gap-2">
            💎 Hidden Gems — High Value, Lower Crowds
          </h3>
          <p className="text-xs text-white/40 mb-4">
            Sites with high SNA recommendation scores but often overlooked by tourists
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {snaData.rankedByRecommendation
              .filter((n, i) => i >= 5 && i < 11)
              .map(n => {
                const node = snaData.nodes.find(x => x.id === n.id);
                return (
                  <div key={n.id} className="bg-white/3 rounded-xl p-4 border border-white/5 hover:border-white/12 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{node?.emoji || '📍'}</span>
                      <span className="text-sm font-medium text-white">{n.name}</span>
                    </div>
                    <div className="text-xs text-white/50 mb-2">{node?.significance?.slice(0, 80)}...</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Score: {n.recommendationScore.toFixed(2)}</span>
                      <span className="text-vibrant-gold">{node?.dynasty}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      <div className="bg-gradient-to-r from-vibrant-gold/10 to-transparent border border-vibrant-gold/20 rounded-2xl p-6">
        <h3 className="font-syne font-semibold text-vibrant-gold mb-4 flex items-center gap-2">
          🎯 Key Takeaways for Tourism Development
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-vibrant-gold mt-0.5">1.</span>
              <p className="text-white/70">
                <strong className="text-white">Focus on Bridge Sites:</strong> Improve infrastructure at sites that connect different heritage communities (high betweenness) to enhance tourist flow across the network.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-vibrant-gold mt-0.5">2.</span>
              <p className="text-white/70">
                <strong className="text-white">Circuit Marketing:</strong> Promote dynasty-based circuits as themed packages to encourage multi-site visits and deeper cultural engagement.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-vibrant-gold mt-0.5">3.</span>
              <p className="text-white/70">
                <strong className="text-white">Cross-Promote Connected Sites:</strong> Use SNA connections to create joint ticketing and bundled experiences for sites with high edge weights.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-vibrant-gold mt-0.5">4.</span>
              <p className="text-white/70">
                <strong className="text-white">Develop Hidden Gems:</strong> Invest in accessibility and marketing for high-potential but underutilized sites to distribute visitor pressure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const colors = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    MEDIUM: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[priority] || colors.MEDIUM}`}>
      {priority}
    </span>
  );
}
