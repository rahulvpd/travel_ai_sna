// src/components/chennai/ChennaiSNACircuitExplorer.jsx
// TAB 4 — Tourism Circuit Explorer
// Shows AI-generated circuits with cost, duration, and difficulty

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dynastyHex } from '../../utils/dynastyColors';

export default function ChennaiSNACircuitExplorer({ snaData }) {
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [filterType, setFilterType] = useState('all');

  if (!snaData?.circuits) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
        <div className="text-4xl mb-4">🛤️</div>
        <p className="text-white/50 font-medium mb-2">No circuits available</p>
        <p className="text-white/30 text-sm">Circuit generation requires enhanced SNA data</p>
      </div>
    );
  }

  const filteredCircuits = filterType === 'all'
    ? snaData.circuits
    : snaData.circuits.filter(c => c.type === filterType);

  const circuitTypes = [...new Set(snaData.circuits.map(c => c.type))];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne font-bold text-white text-lg flex items-center gap-2">
            <span>🛤️</span> Tourism Circuits
            <span className="px-2 py-0.5 rounded-full text-xs bg-vibrant-gold/20 text-vibrant-gold">
              {snaData.circuits.length} Available
            </span>
          </h3>
          <p className="text-xs text-white/40 mt-1">
            AI-optimized routes balancing time, distance, and visitor experience
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'all'
                ? 'bg-vibrant-gold text-black'
                : 'text-white/50 hover:text-white'
            }`}
          >
            All
          </button>
          {circuitTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filterType === type
                  ? 'bg-vibrant-gold text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Circuit grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCircuits.map((circuit, index) => (
            <motion.div
              key={circuit.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => setSelectedCircuit(selectedCircuit?.id === circuit.id ? null : circuit)}
              className={`bg-white/5 border rounded-2xl p-5 cursor-pointer transition-all hover:border-white/20 ${
                selectedCircuit?.id === circuit.id
                  ? 'border-vibrant-gold/50 bg-vibrant-gold/5'
                  : 'border-white/10'
              }`}
            >
              {/* Circuit header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 capitalize">
                      {circuit.type}
                    </span>
                    <DifficultyBadge difficulty={circuit.difficulty} />
                  </div>
                  <h4 className="font-semibold text-white">{circuit.name}</h4>
                </div>
                <div className="text-2xl">
                  {circuit.type === 'dynasty' ? '🏛️' : circuit.type === 'geographic' ? '🗺️' : '🛤️'}
                </div>
              </div>

              {/* Theme */}
              <p className="text-xs text-white/50 mb-3">{circuit.theme}</p>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-vibrant-gold">{circuit.nodes?.length || 0}</div>
                  <div className="text-[10px] text-white/40">Places</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-teal-400">{circuit.totalDuration}h</div>
                  <div className="text-[10px] text-white/40">Duration</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-400">{circuit.totalDistance}km</div>
                  <div className="text-[10px] text-white/40">Distance</div>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1">
                {circuit.highlights?.slice(0, 3).map((h, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60 truncate max-w-[120px]">
                    {h}
                  </span>
                ))}
              </div>

              {/* Cost preview */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Estimated Cost</span>
                  <span className="font-mono font-semibold text-green-400">
                    ₹{circuit.estimatedCost?.total?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected circuit detail panel */}
      <AnimatePresence>
        {selectedCircuit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/5 border border-vibrant-gold/30 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-syne font-bold text-xl text-white">{selectedCircuit.name}</h4>
                <p className="text-sm text-white/50 mt-1">{selectedCircuit.description}</p>
              </div>
              <button
                onClick={() => setSelectedCircuit(null)}
                className="text-white/40 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Detailed stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <DetailStat label="Total Places" value={selectedCircuit.nodes?.length} icon="📍" />
              <DetailStat label="Duration" value={`${selectedCircuit.totalDuration} hours`} icon="⏱️" />
              <DetailStat label="Distance" value={`${selectedCircuit.totalDistance} km`} icon="🛣️" />
              <DetailStat label="Best Time" value={selectedCircuit.bestTime} icon="🌅" />
            </div>

            {/* Cost breakdown */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>💰</span> Cost Breakdown
              </h5>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Entry Tickets</span>
                  <span className="text-white font-mono">₹{selectedCircuit.estimatedCost?.tickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Transport</span>
                  <span className="text-white font-mono">₹{selectedCircuit.estimatedCost?.transport || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Food & Beverages</span>
                  <span className="text-white font-mono">₹{selectedCircuit.estimatedCost?.food || 0}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                <span className="text-white font-semibold">Total Estimated</span>
                <span className="text-green-400 font-mono font-bold text-lg">
                  ₹{selectedCircuit.estimatedCost?.total?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Route visualization */}
            <div className="bg-white/5 rounded-xl p-4">
              <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>🗺️</span> Suggested Route
              </h5>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCircuit.nodes?.map((node, i) => (
                  <div key={node.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-lg">{node.emoji}</span>
                      <div>
                        <div className="text-sm text-white">{node.name}</div>
                        <div className="text-xs text-white/40">
                          {node.visitorData?.avgDuration || 1}h · {node.dynasty}
                        </div>
                      </div>
                    </div>
                    {i < selectedCircuit.nodes.length - 1 && (
                      <span className="text-vibrant-gold">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-vibrant-gold text-black font-semibold py-3 rounded-xl hover:bg-vibrant-gold/90 transition-all">
                📥 Export to Itinerary
              </button>
              <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                📤 Share
              </button>
              <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                🖨️ Print
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h4 className="font-syne font-bold text-white mb-4">📊 Circuit Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 text-xs uppercase tracking-wide">
                <th className="pb-3 pr-4">Circuit</th>
                <th className="pb-3 px-4">Places</th>
                <th className="pb-3 px-4">Duration</th>
                <th className="pb-3 px-4">Distance</th>
                <th className="pb-3 px-4">Cost</th>
                <th className="pb-3 px-4">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {snaData.circuits.slice(0, 5).map(circuit => (
                <tr
                  key={circuit.id}
                  onClick={() => setSelectedCircuit(circuit)}
                  className="cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{circuit.type === 'dynasty' ? '🏛️' : '🗺️'}</span>
                      <span className="text-white">{circuit.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/70">{circuit.nodes?.length}</td>
                  <td className="py-3 px-4 text-white/70">{circuit.totalDuration}h</td>
                  <td className="py-3 px-4 text-white/70">{circuit.totalDistance}km</td>
                  <td className="py-3 px-4 text-green-400 font-mono">₹{circuit.estimatedCost?.total?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <DifficultyBadge difficulty={circuit.difficulty} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }) {
  const colors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    High: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[difficulty] || colors.Medium}`}>
      {difficulty}
    </span>
  );
}

function DetailStat({ label, value, icon }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-white font-semibold">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}
