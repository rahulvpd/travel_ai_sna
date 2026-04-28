// src/components/chennai/ChennaiSNAHeatMap.jsx
// Heat Map Integration for Chennai Heritage Network
// Visitor density, popularity, and network metrics visualization

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────
// HEAT MAP CONFIGURATION
// ─────────────────────────────────────────────────────────────
const HEAT_MAP_TYPES = {
  visitorDensity: {
    name: 'Visitor Density',
    icon: '👥',
    color: '#FF6B00',
    description: 'Simulated visitor concentration at each site',
    gradient: ['from-green-500', 'via-yellow-500', 'to-red-500']
  },
  popularity: {
    name: 'Tourism Popularity',
    icon: '⭐',
    color: '#FFCC00',
    description: 'Overall visitor popularity and ratings',
    gradient: ['from-blue-500', 'via-purple-500', 'to-pink-500']
  },
  centrality: {
    name: 'Network Centrality',
    icon: '🕸️',
    color: '#4F8EFF',
    description: 'Importance in the heritage network',
    gradient: ['from-teal-500', 'via-blue-500', 'to-indigo-500']
  },
  accessibility: {
    name: 'Accessibility Score',
    icon: '♿',
    color: '#10B981',
    description: 'Ease of access and visitor facilities',
    gradient: ['from-orange-500', 'via-yellow-500', 'to-green-500']
  },
  recommendation: {
    name: 'Recommendation Score',
    icon: '💎',
    color: '#A855F7',
    description: 'AI recommendation strength',
    gradient: ['from-pink-500', 'via-purple-500', 'to-indigo-500']
  }
};

// ─────────────────────────────────────────────────────────────
// HEAT CELL COMPONENT
// ─────────────────────────────────────────────────────────────
function HeatCell({ node, value, maxValue, type, onClick, isSelected }) {
  const intensity = value / maxValue;
  const opacity = 0.2 + intensity * 0.8;
  
  const typeConfig = HEAT_MAP_TYPES[type];
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onClick(node)}
      className={`relative cursor-pointer rounded-lg p-3 border transition-all ${
        isSelected 
          ? 'border-white ring-2 ring-white/50' 
          : 'border-white/10 hover:border-white/30'
      }`}
      style={{
        backgroundColor: `rgba(${hexToRgb(typeConfig.color)}, ${opacity})`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{node.emoji}</span>
        <span className="text-xs font-medium text-white truncate flex-1">
          {node.name.split(' ').slice(0, 2).join(' ')}
        </span>
      </div>
      
      {/* Intensity bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${intensity * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: typeConfig.color }}
        />
      </div>
      
      {/* Value display */}
      <div className="mt-1 text-[10px] text-white/50">
        {type === 'visitorDensity' ? `${Math.round(value * 1000)}` : value.toFixed(2)}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg" />
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEAT MAP GRID
// ─────────────────────────────────────────────────────────────
function HeatMapGrid({ snaData, heatType, selectedNode, onSelectNode }) {
  const heatData = useMemo(() => {
    if (!snaData?.nodes || !snaData?.metrics) return [];
    
    return snaData.nodes.map(node => {
      const metrics = snaData.metrics[node.id] || {};
      let value = 0;
      
      switch (heatType) {
        case 'visitorDensity':
          value = (node.visitorData?.dailyAverage || 1000) / 100000;
          break;
        case 'popularity':
          value = metrics.visitorPopularity || 0;
          break;
        case 'centrality':
          value = (metrics.degreeCentrality || 0) * 0.5 + 
                  (metrics.betweennessCentrality || 0) * 0.3 +
                  (metrics.eigenvector || 0) * 0.2;
          break;
        case 'accessibility':
          value = node.accessibility || 0.5;
          break;
        case 'recommendation':
          value = metrics.recommendationScore || 0;
          break;
        default:
          value = metrics.degreeCentrality || 0;
      }
      
      return { node, value };
    }).sort((a, b) => b.value - a.value);
  }, [snaData, heatType]);

  const maxValue = useMemo(() => {
    return Math.max(...heatData.map(d => d.value), 1);
  }, [heatData]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {heatData.map(({ node, value }) => (
        <HeatCell
          key={node.id}
          node={node}
          value={value}
          maxValue={maxValue}
          type={heatType}
          onClick={onSelectNode}
          isSelected={selectedNode?.id === node.id}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEAT MAP LEGEND
// ─────────────────────────────────────────────────────────────
function HeatMapLegend({ type, maxValue }) {
  const config = HEAT_MAP_TYPES[type];
  
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <div className="text-sm font-semibold text-white">{config.name}</div>
            <div className="text-xs text-white/40">{config.description}</div>
          </div>
        </div>
      </div>
      
      {/* Gradient legend */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/50">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
      </div>
      
      {/* Scale info */}
      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
        Max value: {type === 'visitorDensity' ? Math.round((maxValue || 1) * 1000) : (maxValue || 1).toFixed(3)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SELECTED NODE DETAIL PANEL
// ─────────────────────────────────────────────────────────────
function SelectedNodePanel({ node, snaData, heatType }) {
  if (!node) return null;
  
  const metrics = snaData?.metrics?.[node.id] || {};
  const typeConfig = HEAT_MAP_TYPES[heatType];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/90 backdrop-blur rounded-2xl p-5 border border-white/10"
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${typeConfig.color}30` }}
        >
          {node.emoji}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-lg">{node.name}</h4>
          <p className="text-xs text-white/50">{node.dynasty} · {node.placeType}</p>
        </div>
      </div>
      
      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/40 mb-1">Connections</div>
          <div className="text-xl font-bold text-white">{metrics.degree || 0}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/40 mb-1">Centrality</div>
          <div className="text-xl font-bold text-white">
            {((metrics.degreeCentrality || 0) * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/40 mb-1">Accessibility</div>
          <div className="text-xl font-bold text-white">
            {((node.accessibility || 0.5) * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/40 mb-1">Recommendation</div>
          <div className="text-xl font-bold text-white">
            {((metrics.recommendationScore || 0)).toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Visitor data */}
      {node.visitorData && (
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="text-xs text-white/40 mb-2">Visitor Statistics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-white/50">Daily Avg:</span>{' '}
              <span className="text-white">{node.visitorData.dailyAverage?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-white/50">Peak:</span>{' '}
              <span className="text-white">{node.visitorData.seasonalPeak?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-white/50">Avg Duration:</span>{' '}
              <span className="text-white">{node.visitorData.avgDuration}h</span>
            </div>
            <div>
              <span className="text-white/50">Best Time:</span>{' '}
              <span className="text-white">{node.visitorData.bestVisitTime?.[0]}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Significance */}
      {node.significance && (
        <p className="text-xs text-white/60 leading-relaxed">
          {node.significance}
        </p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTION
// ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChennaiSNAHeatMap({ snaData }) {
  const [heatType, setHeatType] = useState('visitorDensity');
  const [selectedNode, setSelectedNode] = useState(null);

  const typeConfig = HEAT_MAP_TYPES[heatType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-white text-lg flex items-center gap-2">
            <span>🗺️</span> Heat Map Analysis
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Visualize different metrics across Chennai's heritage network
          </p>
        </div>
      </div>

      {/* Heat type selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(HEAT_MAP_TYPES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setHeatType(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              heatType === key
                ? 'text-white shadow-lg'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
            style={{
              backgroundColor: heatType === key ? config.color : undefined
            }}
          >
            <span>{config.icon}</span>
            <span>{config.name}</span>
          </button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Heat map grid */}
        <div className="md:col-span-2">
          <HeatMapGrid
            snaData={snaData}
            heatType={heatType}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Legend */}
          <HeatMapLegend type={heatType} maxValue={snaData?.networkStats?.maxHeatValue || 1} />
          
          {/* Selected node details */}
          {selectedNode && (
            <SelectedNodePanel 
              node={selectedNode} 
              snaData={snaData}
              heatType={heatType}
            />
          )}
        </div>
      </div>

      {/* Statistics summary */}
      {snaData?.networkStats && (
        <div className="grid grid-cols-4 gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
          {[
            { label: 'Total Sites', value: snaData.networkStats.totalNodes, icon: '📍' },
            { label: 'Connections', value: snaData.networkStats.totalEdges, icon: '🔗' },
            { label: 'Avg Links', value: snaData.networkStats.averageDegree, icon: '📊' },
            { label: 'Density', value: snaData.networkStats.networkDensity, icon: '🕸️' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-white">
                {typeof stat.value === 'number' ? (stat.value < 1 ? stat.value.toFixed(3) : stat.value) : stat.value || 0}
              </div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
