// src/components/chennai/ChennaiSNAMultiLayerView.jsx
// Multi-Layer Network Visualization
// Heritage + Transport + Visitor Flow + Cultural Events

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LAYER_TYPES } from '../../services/multiLayerSNA';

// ─────────────────────────────────────────────────────────────
// LAYER TOGGLE COMPONENT
// ─────────────────────────────────────────────────────────────
function LayerToggle({ layers, activeLayers, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(LAYER_TYPES).map(([key, config]) => {
        const isActive = activeLayers.includes(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              isActive
                ? 'text-white shadow-lg'
                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
            }`}
            style={{
              backgroundColor: isActive ? config.color : undefined,
              opacity: layers[key] ? 1 : 0.4
            }}
            disabled={!layers[key]}
          >
            <span>{config.icon}</span>
            <span>{config.name}</span>
            {isActive && (
              <span className="text-xs opacity-75">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LAYER STAT CARD
// ─────────────────────────────────────────────────────────────
function LayerStatCard({ layerKey, config, stats, isSelected, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/10 border-white/30'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
      style={{
        borderColor: isSelected ? config.color : undefined
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: `${config.color}30` }}
        >
          {config.icon}
        </div>
        <div>
          <div className="font-semibold text-white text-sm">{config.name}</div>
          <div className="text-xs text-white/40">Weight: {(config.weight * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(stats).slice(0, 4).map(([key, value]) => (
            <div key={key} className="bg-white/5 rounded-lg p-2">
              <div className="text-white/40 text-[10px] capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div 
                className="font-semibold text-white"
                style={{ color: config.color }}
              >
                {typeof value === 'number' ? value.toFixed(2) : value}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MULTI-LAYER NODE DISPLAY
// ─────────────────────────────────────────────────────────────
function MultiLayerNodeDisplay({ node, combinedMetrics, activeLayers }) {
  if (!node || !combinedMetrics) return null;

  const metrics = combinedMetrics[node.id];
  if (!metrics) return null;

  return (
    <div className="bg-black/90 backdrop-blur rounded-2xl p-5 border border-white/10">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{node.emoji}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-lg">{node.name}</h4>
          <p className="text-xs text-white/50">{node.dynasty} · {node.placeType}</p>
        </div>
      </div>

      {/* Layer scores */}
      <div className="space-y-3">
        <h5 className="text-xs text-white/40 uppercase tracking-wide">Layer Contributions</h5>
        
        {activeLayers.map(layerKey => {
          const config = LAYER_TYPES[layerKey];
          const score = metrics[`${layerKey.replace(/([A-Z])/g, (_, c) => c.toLowerCase())}Score`];
          const scoreKey = layerKey === 'heritage' ? 'heritageScore' :
                          layerKey === 'transport' ? 'transportScore' :
                          layerKey === 'visitorFlow' ? 'visitorScore' :
                          'culturalScore';
          
          return (
            <div key={layerKey} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ backgroundColor: `${config.color}30` }}
              >
                {config.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">{config.name}</span>
                  <span className="text-white font-mono">
                    {(metrics[scoreKey] * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(metrics[scoreKey] || 0) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combined score */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/60">Multi-Layer Score</span>
          <span className="text-2xl font-bold text-white">
            {(metrics.multiLayerScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOP SITES BY MULTI-LAYER SCORE
// ─────────────────────────────────────────────────────────────
function TopMultiLayerSites({ summary, snaData, onSelectSite }) {
  if (!summary?.topSites) return null;

  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 className="font-syne font-semibold text-white mb-4 flex items-center gap-2">
        <span>🏆</span> Top Sites by Multi-Layer Score
      </h4>
      <div className="space-y-3">
        {summary.topSites.slice(0, 7).map((site, idx) => {
          const node = snaData?.nodes?.find(n => n.id === site.id);
          return (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectSite(node)}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-vibrant-gold/20 text-vibrant-gold flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {node?.name || site.id}
                </div>
                <div className="text-xs text-white/40">
                  Score: {(site.score * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-lg">{node?.emoji}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChennaiSNAMultiLayerView({ snaData, multiLayerData }) {
  const [activeLayers, setActiveLayers] = useState(['heritage', 'visitorFlow']);
  const [selectedLayer, setSelectedLayer] = useState('heritage');
  const [selectedNode, setSelectedNode] = useState(null);

  const handleLayerToggle = (layerKey) => {
    setActiveLayers(prev => 
      prev.includes(layerKey)
        ? prev.filter(k => k !== layerKey)
        : [...prev, layerKey]
    );
  };

  if (!multiLayerData) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-white/50">Computing multi-layer network...</p>
        </div>
      </div>
    );
  }

  const { layers, combinedMetrics, summary } = multiLayerData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-white text-lg flex items-center gap-2">
            <span>📊</span> Multi-Layer Network
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Combine heritage, transport, visitor flow, and cultural event layers
          </p>
        </div>
      </div>

      {/* Layer toggles */}
      <LayerToggle
        layers={layers}
        activeLayers={activeLayers}
        onToggle={handleLayerToggle}
      />

      {/* Main grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Layer stats */}
        <div className="space-y-4">
          {Object.entries(LAYER_TYPES).map(([key, config]) => (
            <LayerStatCard
              key={key}
              layerKey={key}
              config={config}
              stats={layers[key]?.stats}
              isSelected={selectedLayer === key}
              onClick={() => setSelectedLayer(key)}
            />
          ))}
        </div>

        {/* Center: Visualization placeholder */}
        <div className="md:col-span-1">
          <div className="h-[500px] bg-white/5 rounded-2xl border border-white/10 p-6 overflow-hidden relative">
            {/* Layer visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div 
                  className="text-6xl mb-4"
                  style={{ opacity: activeLayers.includes(selectedLayer) ? 1 : 0.3 }}
                >
                  {LAYER_TYPES[selectedLayer].icon}
                </div>
                <div className="text-lg font-semibold text-white mb-2">
                  {LAYER_TYPES[selectedLayer].name}
                </div>
                <div className="text-sm text-white/50">
                  {activeLayers.includes(selectedLayer) 
                    ? `${layers[selectedLayer]?.nodes?.length || 0} nodes · ${layers[selectedLayer]?.edges?.length || 0} connections`
                    : 'Layer not active'
                  }
                </div>
              </div>
            </div>

            {/* Active layers indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex gap-2 justify-center">
                {activeLayers.map(layerKey => (
                  <div
                    key={layerKey}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: LAYER_TYPES[layerKey].color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top sites and selected node */}
        <div className="space-y-4">
          <TopMultiLayerSites
            summary={summary}
            snaData={snaData}
            onSelectSite={setSelectedNode}
          />
          
          {selectedNode && (
            <MultiLayerNodeDisplay
              node={selectedNode}
              combinedMetrics={combinedMetrics}
              activeLayers={activeLayers}
            />
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
        {Object.entries(summary?.layerStats || {}).map(([layerKey, stats]) => {
          const config = LAYER_TYPES[layerKey];
          if (!config) return null;
          
          return (
            <div key={layerKey} className="text-center">
              <div className="text-xl mb-1">{config.icon}</div>
              <div className="text-xs text-white/40 capitalize">{layerKey}</div>
              {stats && Object.entries(stats).slice(0, 1).map(([k, v]) => (
                <div key={k} className="text-sm font-semibold text-white">
                  {typeof v === 'number' ? v.toFixed(1) : v}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
