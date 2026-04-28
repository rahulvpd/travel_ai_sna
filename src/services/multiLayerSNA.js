// src/services/multiLayerSNA.js
// Multi-Layer Network Analysis for Chennai Heritage
// Combines heritage, transport, visitor flow, and cultural event layers

import { dynastyHex } from '../utils/dynastyColors';

const CACHE_KEY = 'chennai_multilayer_sna_v1';
const TTL = 48 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// NETWORK LAYER DEFINITIONS
// ─────────────────────────────────────────────────────────────
export const LAYER_TYPES = {
  heritage: {
    name: 'Heritage Network',
    icon: '🏛️',
    color: '#FFCC00',
    weight: 0.35,
    description: 'Historical and dynastic connections between sites'
  },
  transport: {
    name: 'Transport Network',
    icon: '🚇',
    color: '#4F8EFF',
    weight: 0.20,
    description: 'Metro, bus, and road connectivity between sites'
  },
  visitorFlow: {
    name: 'Visitor Flow',
    icon: '👥',
    color: '#FF6B00',
    weight: 0.25,
    description: 'Actual tourist movement patterns'
  },
  culturalEvents: {
    name: 'Cultural Events',
    icon: '🎭',
    color: '#A855F7',
    weight: 0.20,
    description: 'Shared festivals and cultural connections'
  }
};

// ─────────────────────────────────────────────────────────────
// TRANSPORT LAYER DATA
// ─────────────────────────────────────────────────────────────
const TRANSPORT_NODES = [
  { id: 'chennai_central', name: 'Chennai Central Railway', type: 'railway', lat: 13.0836, lng: 80.2744 },
  { id: 'chennai_egmore', name: 'Chennai Egmore', type: 'railway', lat: 13.0748, lng: 80.2602 },
  { id: 't_nagar_bus', name: 'T. Nagar Bus Terminus', type: 'bus', lat: 13.0418, lng: 80.2341 },
  { id: 'cmbt', name: 'CMBT (Koyambedu)', type: 'bus', lat: 13.0687, lng: 80.2034 },
  { id: 'airport', name: 'Chennai Airport', type: 'airport', lat: 12.9941, lng: 80.1709 },
  { id: 'metro_central', name: 'Central Metro', type: 'metro', lat: 13.0836, lng: 80.2744 },
  { id: 'metro_anna', name: 'Anna Nagar Metro', type: 'metro', lat: 13.0878, lng: 80.2125 },
];

// Transport connections (simplified)
const TRANSPORT_EDGES = [
  { source: 'chennai_central', target: 'chennai_egmore', type: 'railway', time: 15 },
  { source: 'chennai_central', target: 'cmbt', type: 'road', time: 45 },
  { source: 't_nagar_bus', target: 'cmbt', type: 'bus', time: 30 },
  { source: 'airport', target: 'chennai_central', type: 'road', time: 60 },
  { source: 'metro_central', target: 'metro_anna', type: 'metro', time: 20 },
];

// ─────────────────────────────────────────────────────────────
// CULTURAL EVENTS LAYER
// ─────────────────────────────────────────────────────────────
const CULTURAL_EVENTS = {
  'Pongal': {
    month: 'January',
    sites: ['kapaleeshwarar', 'parthasarathy', 'vadapalani'],
    description: 'Harvest festival celebrated across Tamil temples'
  },
  'Arupathimoovar': {
    month: 'March-April',
    sites: ['kapaleeshwarar', 'mylapore'],
    description: '63 Nayanmar festival at Mylapore'
  },
  'Margazhi': {
    month: 'December-January',
    sites: ['kapaleeshwarar', 'parthasarathy', 'kalakshetra'],
    description: 'Music and dance season'
  },
  'Chithirai': {
    month: 'April-May',
    sites: ['kapaleeshwarar', 'parthasarathy'],
    description: 'Temple car festival'
  },
  'Independence Day': {
    month: 'August',
    sites: ['fort_st_george', 'marina_beach'],
    description: 'National celebration'
  },
  'Chennai Sangamam': {
    month: 'January',
    sites: ['marina_beach', 'elliots_beach', 'guindy_park'],
    description: 'Art and cultural festival'
  }
};

// ─────────────────────────────────────────────────────────────
// COMPUTE MULTI-LAYER NETWORK
// ─────────────────────────────────────────────────────────────
export function computeMultiLayerNetwork(heritageSNA) {
  if (!heritageSNA) return null;

  const layers = {
    heritage: computeHeritageLayer(heritageSNA),
    transport: computeTransportLayer(heritageSNA),
    visitorFlow: computeVisitorFlowLayer(heritageSNA),
    culturalEvents: computeCulturalEventsLayer(heritageSNA)
  };

  // Compute combined metrics
  const combinedMetrics = computeCombinedMetrics(layers, heritageSNA);

  // Find cross-layer connections
  const crossLayerConnections = findCrossLayerConnections(layers);

  return {
    layers,
    combinedMetrics,
    crossLayerConnections,
    summary: generateLayerSummary(layers, combinedMetrics),
    computedAt: Date.now()
  };
}

// ─────────────────────────────────────────────────────────────
// LAYER COMPUTATIONS
// ─────────────────────────────────────────────────────────────
function computeHeritageLayer(sna) {
  return {
    nodes: sna.nodes || [],
    edges: sna.edges || [],
    metrics: sna.metrics || {},
    weight: LAYER_TYPES.heritage.weight,
    stats: {
      totalNodes: sna.nodes?.length || 0,
      totalEdges: sna.edges?.length || 0,
      avgConnectivity: calculateAvgConnectivity(sna.edges)
    }
  };
}

function computeTransportLayer(sna) {
  // Find nearest transport node for each heritage site
  const transportConnections = (sna.nodes || []).map(heritageNode => {
    const nearestTransport = findNearestTransport(heritageNode);
    return {
      heritageSite: heritageNode.id,
      nearestTransport: nearestTransport?.id,
      distance: nearestTransport?.distance || 999,
      accessibility: nearestTransport ? 1 / (nearestTransport.distance + 1) : 0
    };
  });

  return {
    nodes: TRANSPORT_NODES,
    edges: TRANSPORT_EDGES,
    connections: transportConnections,
    weight: LAYER_TYPES.transport.weight,
    stats: {
      totalStations: TRANSPORT_NODES.length,
      avgAccessibility: transportConnections.reduce((sum, c) => sum + c.accessibility, 0) / transportConnections.length
    }
  };
}

function computeVisitorFlowLayer(sna) {
  // Simulate visitor flow based on popularity and proximity
  const flowEdges = [];
  const nodes = sna.nodes || [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      
      // Calculate flow probability
      const popularityA = a.visitorData?.dailyAverage || 1000;
      const popularityB = b.visitorData?.dailyAverage || 1000;
      
      const distance = calculateDistance(a.lat, a.lng, b.lat, b.lng);
      const flowProbability = (popularityA + popularityB) / (100000 * (distance + 1));
      
      if (flowProbability > 0.1) {
        flowEdges.push({
          source: a.id,
          target: b.id,
          flow: Math.round(flowProbability * 100),
          distance: Math.round(distance * 10) / 10
        });
      }
    }
  }

  return {
    nodes: nodes,
    edges: flowEdges.sort((a, b) => b.flow - a.flow).slice(0, 30),
    weight: LAYER_TYPES.visitorFlow.weight,
    stats: {
      totalFlows: flowEdges.length,
      topFlow: flowEdges[0]?.flow || 0
    }
  };
}

function computeCulturalEventsLayer(sna) {
  // Create nodes and edges based on shared events
  const eventNodes = (sna.nodes || []).map(node => ({
    ...node,
    events: Object.entries(CULTURAL_EVENTS)
      .filter(([_, event]) => event.sites.some(s => node.id.includes(s) || node.name.toLowerCase().includes(s)))
      .map(([name, event]) => ({ name, ...event }))
  }));

  // Create edges between sites sharing events
  const eventEdges = [];
  for (let i = 0; i < eventNodes.length; i++) {
    for (let j = i + 1; j < eventNodes.length; j++) {
      const eventsA = eventNodes[i].events.map(e => e.name);
      const eventsB = eventNodes[j].events.map(e => e.name);
      const shared = eventsA.filter(e => eventsB.includes(e));
      
      if (shared.length > 0) {
        eventEdges.push({
          source: eventNodes[i].id,
          target: eventNodes[j].id,
          sharedEvents: shared,
          strength: shared.length / Object.keys(CULTURAL_EVENTS).length
        });
      }
    }
  }

  return {
    nodes: eventNodes,
    edges: eventEdges,
    events: CULTURAL_EVENTS,
    weight: LAYER_TYPES.culturalEvents.weight,
    stats: {
      totalEvents: Object.keys(CULTURAL_EVENTS).length,
      connectionsWithSharedEvents: eventEdges.length
    }
  };
}

// ─────────────────────────────────────────────────────────────
// COMBINED METRICS
// ─────────────────────────────────────────────────────────────
function computeCombinedMetrics(layers, sna) {
  const combined = {};
  
  (sna.nodes || []).forEach(node => {
    const heritageMetric = layers.heritage.metrics?.[node.id]?.degreeCentrality || 0;
    const transportMetric = layers.transport.connections?.find(c => c.heritageSite === node.id)?.accessibility || 0;
    const visitorMetric = (node.visitorData?.dailyAverage || 1000) / 100000;
    const culturalMetric = layers.culturalEvents.nodes?.find(n => n.id === node.id)?.events?.length || 0 / Object.keys(CULTURAL_EVENTS).length;

    combined[node.id] = {
      heritageScore: heritageMetric,
      transportScore: transportMetric,
      visitorScore: visitorMetric,
      culturalScore: culturalMetric,
      multiLayerScore: 
        heritageMetric * LAYER_TYPES.heritage.weight +
        transportMetric * LAYER_TYPES.transport.weight +
        visitorMetric * LAYER_TYPES.visitorFlow.weight +
        culturalMetric * LAYER_TYPES.culturalEvents.weight
    };
  });

  return combined;
}

function findCrossLayerConnections(layers) {
  const connections = [];

  // Heritage <-> Transport
  layers.transport.connections?.forEach(conn => {
    if (conn.nearestTransport) {
      connections.push({
        type: 'heritage-transport',
        source: conn.heritageSite,
        target: conn.nearestTransport,
        strength: conn.accessibility
      });
    }
  });

  return connections;
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────
function findNearestTransport(heritageNode) {
  let nearest = null;
  let minDistance = Infinity;

  TRANSPORT_NODES.forEach(transport => {
    const distance = calculateDistance(
      heritageNode.lat, heritageNode.lng,
      transport.lat, transport.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...transport, distance };
    }
  });

  return nearest;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateAvgConnectivity(edges) {
  if (!edges || edges.length === 0) return 0;
  const totalWeight = edges.reduce((sum, e) => sum + (e.weight || 1), 0);
  return totalWeight / edges.length;
}

function generateLayerSummary(layers, combinedMetrics) {
  const topMultiLayer = Object.entries(combinedMetrics)
    .sort((a, b) => b[1].multiLayerScore - a[1].multiLayerScore)
    .slice(0, 5);

  return {
    topSites: topMultiLayer.map(([id, scores]) => ({
      id,
      score: scores.multiLayerScore,
      breakdown: scores
    })),
    layerStats: {
      heritage: layers.heritage.stats,
      transport: layers.transport.stats,
      visitorFlow: layers.visitorFlow.stats,
      culturalEvents: layers.culturalEvents.stats
    }
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export async function getMultiLayerSNA(heritageSNA) {
  // Check cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < TTL) {
        return data;
      }
    }
  } catch {}

  const result = computeMultiLayerNetwork(heritageSNA);

  // Cache result
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }));
  } catch {}

  return result;
}
