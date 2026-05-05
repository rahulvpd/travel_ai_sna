// src/services/chennaiSNAMega.js
// Mega-City Social Network Analysis engine for 101 Chennai nodes
// Tuned to handle dense modern + heritage networks

import { queryNvidiaJSON } from './nvidiaService.js';
import { CHENNAI_MEGA_NODES } from '../data/chennaiMegaNodes.js';

const SNA_MEGA_CACHE_KEY = 'chennai_sna_mega_v1';
const TTL = 48 * 60 * 60 * 1000; // 48 hours

// ─────────────────────────────────────────────────────────────
// EDGE TYPE CONFIG (Tuned for Mega Network)
// ─────────────────────────────────────────────────────────────
export const EDGE_CONFIG = {
  dynasty:    { color: '#FFCC00', label: '👑 Era/Dynasty', weight: 3, description: 'Same ruling dynasty or historical era' },
  type:       { color: '#00C9B1', label: '🏛️ Category',   weight: 2, description: 'Same category (e.g. food, mall, temple)' },
  geographic: { color: '#4F8EFF', label: '📍 Geographic',  weight: 2, description: 'Within 2.5km proximity' },
  era:        { color: '#FF6B6B', label: '⏳ Period',      weight: 1, description: 'Same broad historical period' },
  spiritual:  { color: '#A855F7', label: '🕌 Spiritual',   weight: 1, description: 'Both religious or spiritual sites' },
};

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getEra(period) {
  if (!period || period === 'Natural') return 'Natural';
  if (period.includes('BCE') || period.includes('Pre-')) return 'Ancient';
  const match = period.match(/(\d{3,4})/);
  if (match) {
    const y = parseInt(match[1]);
    if (y < 1500) return 'Medieval';
    if (y < 1947) return 'Colonial';
    return 'Modern';
  }
  return 'Unknown';
}

// ─────────────────────────────────────────────────────────────
// BUILD EDGES — Tuned for 100+ Nodes
// ─────────────────────────────────────────────────────────────
function buildEdges(nodes) {
  const edges = [];
  let eid = 0;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const connections = [];
      const dist = haversineKm(a.lat, a.lng, b.lat, b.lng);

      // Rule 1 — Era/Dynasty
      if (a.dynasty === b.dynasty && a.dynasty !== 'Natural') {
        connections.push({ type: 'dynasty', label: `${a.dynasty} era`, weight: 3 });
      }
      // Rule 2 — Place type (Food to Food, Mall to Mall)
      if (a.placeType === b.placeType) {
        connections.push({ type: 'type', label: `Both ${a.placeType}`, weight: 2 });
      }
      // Rule 3 — Geographic proximity (<2.5km to avoid massive hairball with 100 nodes)
      if (dist < 2.5) {
        const geoWeight = Math.max(1, 3 - Math.floor(dist));
        connections.push({ type: 'geographic', label: `${dist.toFixed(1)} km apart`, weight: geoWeight });
      }
      // Rule 4 — Same era broad
      const eraA = getEra(a.period), eraB = getEra(b.period);
      if (eraA === eraB && eraA !== 'Unknown' && eraA !== 'Natural') {
        connections.push({ type: 'era', label: `${eraA} era`, weight: 1 });
      }
      // Rule 5 — Spiritual / religious
      const spiritual = ['temple', 'religious'];
      if (spiritual.includes(a.placeType) && spiritual.includes(b.placeType)) {
        connections.push({ type: 'spiritual', label: 'Spiritual heritage', weight: 1 });
      }

      // Filter out weak edges to keep graph readable
      if (connections.length > 0) {
        const totalWeight = connections.reduce((s, c) => s + c.weight, 0);
        // Only keep edges with weight >= 2 to reduce clutter
        if (totalWeight >= 2) {
            edges.push({
            id: `e${eid++}`,
            source: a.id, target: b.id,
            sourceName: a.name, targetName: b.name,
            connections, weight: totalWeight,
            primaryType: [...connections].sort((x, y) => y.weight - x.weight)[0].type,
            distance: dist,
            });
        }
      }
    }
  }
  return edges;
}

// ─────────────────────────────────────────────────────────────
// SNA METRICS COMPUTATION
// ─────────────────────────────────────────────────────────────
function computeMetrics(nodes, edges) {
  const m = {};
  nodes.forEach(n => {
    m[n.id] = {
      id: n.id, name: n.name, dynasty: n.dynasty, placeType: n.placeType,
      degree: 0, weightedDegree: 0,
      betweenness: 0, betweennessCentrality: 0,
      closeness: 0, degreeCentrality: 0,
      eigenvector: 0, neighbours: [], edgeIds: [],
    };
  });

  edges.forEach(e => {
    m[e.source].degree++;
    m[e.target].degree++;
    m[e.source].weightedDegree += e.weight;
    m[e.target].weightedDegree += e.weight;
    m[e.source].neighbours.push(e.target);
    m[e.target].neighbours.push(e.source);
    m[e.source].edgeIds.push(e.id);
    m[e.target].edgeIds.push(e.id);
  });

  const maxDeg = Math.max(...Object.values(m).map(x => x.degree));
  Object.values(m).forEach(x => {
    x.degreeCentrality = maxDeg > 0 ? x.degree / maxDeg : 0;
  });

  function bfs(start, end) {
    const visited = new Set([start]);
    const queue = [[start]];
    while (queue.length) {
      const path = queue.shift();
      const node = path[path.length - 1];
      if (node === end) return path;
      for (const nb of (m[node]?.neighbours || [])) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push([...path, nb]);
        }
      }
    }
    return null;
  }

  // Betweenness centrality
  nodes.forEach(s => {
    nodes.forEach(t => {
      if (s.id === t.id) return;
      const path = bfs(s.id, t.id);
      if (path && path.length > 2) {
        path.slice(1, -1).forEach(nId => { m[nId].betweenness++; });
      }
    });
  });
  const maxBtw = Math.max(...Object.values(m).map(x => x.betweenness));
  Object.values(m).forEach(x => {
    x.betweennessCentrality = maxBtw > 0 ? x.betweenness / maxBtw : 0;
  });

  // Closeness centrality
  nodes.forEach(n => {
    let total = 0, reach = 0;
    nodes.forEach(o => {
      if (n.id === o.id) return;
      const path = bfs(n.id, o.id);
      if (path) { total += path.length - 1; reach++; }
    });
    m[n.id].closeness = reach > 0 ? reach / total : 0;
  });

  // Eigenvector centrality
  let eig = {};
  nodes.forEach(n => { eig[n.id] = 1.0; });
  for (let iter = 0; iter < 20; iter++) {
    const next = {};
    nodes.forEach(n => {
      next[n.id] = m[n.id].neighbours.reduce((s, nb) => s + eig[nb], 0);
    });
    const norm = Math.sqrt(Object.values(next).reduce((s, v) => s + v * v, 0));
    nodes.forEach(n => { eig[n.id] = norm > 0 ? next[n.id] / norm : 0; });
  }
  nodes.forEach(n => { m[n.id].eigenvector = eig[n.id]; });

  return m;
}

// ─────────────────────────────────────────────────────────────
// COMMUNITY DETECTION
// ─────────────────────────────────────────────────────────────
function detectCommunities(nodes) {
  const groups = {};
  nodes.forEach(n => {
    // For Mega, we might group by PlaceType to show functional zones
    const groupKey = ['food', 'shopping', 'entertainment', 'park', 'beach'].includes(n.placeType) 
        ? 'Modern Tourism' 
        : n.dynasty;

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(n.id);
  });

  const meta = {
    'Pallava':           { color: '#a855f7', icon: '🏛️', desc: 'Ancient rock-cut & structural temples' },
    'Chola':             { color: '#f59e0b', icon: '🛕', desc: 'Classical Tamil temple tradition' },
    'British Colonial':  { color: '#64748b', icon: '🏰', desc: 'Indo-Saracenic & colonial architecture' },
    'Modern Tourism':    { color: '#ec4899', icon: '🛍️', desc: 'Malls, cafes, theme parks & entertainment' },
    'Multiple':          { color: '#3b82f6', icon: '⏳', desc: 'Continuous heritage sites' },
    'Natural':           { color: '#10b981', icon: '🌿', desc: 'Beaches & protected wildlife' },
    'Post-Independence': { color: '#14b8a6', icon: '🎓', desc: 'Modern civic infrastructure & arts' },
  };

  return Object.entries(groups).map(([groupKey, nodeIds]) => ({
    id: groupKey.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: groupKey, nodeIds, size: nodeIds.length,
    color:  meta[groupKey]?.color  || '#888888',
    icon:   meta[groupKey]?.icon   || '📍',
    desc:   meta[groupKey]?.desc   || `${groupKey} spots`,
  }));
}

// ─────────────────────────────────────────────────────────────
// NVIDIA NEMOTRON
// ─────────────────────────────────────────────────────────────
async function getNvidiaInsights(nodes, topEdges) {
  // To avoid token limits with 101 nodes, we only send top hubs and bridges
  const nodeList = nodes.slice(0, 50).map(n => `${n.name} (${n.dynasty}, ${n.placeType})`).join(', ');
  const edgeList = topEdges.slice(0, 10).map(e =>
    `${e.sourceName} ↔ ${e.targetName} [${e.connections.map(c => c.label).join(', ')}]`
  ).join('\n');

  const prompt = `You are a world-class Social Network Analysis expert specialising in urban tourism networks.

Analyse this massive Chennai Mega-City network of 100+ sites (showing top 50 here):
NODES: \${nodeList}

STRONGEST CONNECTIONS (top 10):
\${edgeList}

Respond ONLY with valid JSON, no markdown fences:
{
  "networkSummary": "2-3 sentence overview of how ancient heritage and modern entertainment interlock in Chennai",
  "dominantCommunity": "which functional or historical community dominates this massive network and why",
  "hubSiteAnalysis": "detailed analysis of the most central urban hub connecting multiple eras/functions",
  "keyBridgeSites": [{"site": "site name", "role": "precise sentence on how it bridges heritage with modern leisure"}],
  "weaklyConnectedSites": ["niche or isolated spots"],
  "historicalInsight": "what this massive urban network reveals about Chennai's spatial evolution",
  "tourismImplication": "how mapping everything from 8th-century temples to modern theme parks transforms tourism",
  "snaConclusion": "one powerful conclusion about the duality of Chennai as a traditional and hyper-modern mega-city"
}`;

  try {
    const parsed = await queryNvidiaJSON(prompt, undefined, {
      temperature: 0.2,
      max_tokens: 1200,
      reasoning_budget: 4096,
      enable_thinking: true,
    });
    if (parsed) return { ...parsed, engine: 'NVIDIA Proxy' };
  } catch { /* fall through */ }

  try {
    const { queryAI } = await import('./aiOrchestrator.js');
    const result = await queryAI(prompt);
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    return { ...JSON.parse(cleaned), engine: result.engine || 'queryAI fallback' };
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
// MEGA-CITY CIRCUITS GENERATION
// ─────────────────────────────────────────────────────────────
function nearestNeighborTSP(nodes) {
  if (nodes.length <= 1) return nodes;
  const ordered = [nodes[0]];
  const remaining = nodes.slice(1);
  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIdx = 0, nearestDist = Infinity;
    remaining.forEach((node, idx) => {
      const dist = haversineKm(current.lat, current.lng, node.lat, node.lng);
      if (dist < nearestDist) { nearestDist = dist; nearestIdx = idx; }
    });
    ordered.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }
  return ordered;
}

function generateMegaCircuits(nodes, edges, communities) {
  const circuits = [];
  communities.forEach(community => {
    if (community.size >= 4) {
      // Pick top 8 nodes max for a circuit
      const circuitNodes = community.nodeIds.slice(0, 8).map(id => nodes.find(n => n.id === id)).filter(Boolean);
      const orderedNodes = nearestNeighborTSP(circuitNodes);
      
      let totalDistance = 0;
      for (let i = 0; i < orderedNodes.length - 1; i++) {
        totalDistance += haversineKm(
          orderedNodes[i].lat, orderedNodes[i].lng,
          orderedNodes[i + 1].lat, orderedNodes[i + 1].lng
        );
      }
      
      const totalDuration = orderedNodes.length * 1.5 + (totalDistance / 30);
      
      circuits.push({
        id: `circuit_mega_${community.id}`,
        name: `${community.name} Mega-Circuit`,
        type: 'mega',
        theme: `Explore ${community.name} hotspots`,
        nodes: orderedNodes,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalDuration: Math.round(totalDuration * 10) / 10,
        highlights: orderedNodes.slice(0, 3).map(n => n.name),
        bestTime: 'Morning to Evening',
        estimatedCost: { total: orderedNodes.length * 200 },
        difficulty: totalDuration > 6 ? 'High' : 'Medium',
        description: `A comprehensive journey through the best of ${community.name} in Chennai.`
      });
    }
  });
  return circuits.sort((a, b) => b.nodes.length - a.nodes.length);
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export async function computeChennaiMegaSNA() {
  try {
    const cached = localStorage.getItem(SNA_MEGA_CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < TTL) return data;
    }
  } catch { /* ignore */ }

  console.log('[SNA] Computing Chennai Mega-City network (101 nodes)...');

  const nodes = CHENNAI_MEGA_NODES;
  const edges = buildEdges(nodes);
  const metrics = computeMetrics(nodes, edges);
  const communities = detectCommunities(nodes);
  const circuits = generateMegaCircuits(nodes, edges, communities);
  const topEdges = [...edges].sort((a, b) => b.weight - a.weight).slice(0, 20);

  const rankedByCentrality = Object.values(metrics).sort((a, b) => b.weightedDegree - a.weightedDegree);
  const rankedByBetweenness = Object.values(metrics).sort((a, b) => b.betweennessCentrality - a.betweennessCentrality);

  const networkStats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    averageDegree: (2 * edges.length / nodes.length).toFixed(2),
    networkDensity: ((2 * edges.length) / (nodes.length * (nodes.length - 1))).toFixed(4),
    communities: communities.length,
    largestCommunity: [...communities].sort((a, b) => b.size - a.size)[0]?.name,
    mostCentralNode: rankedByCentrality[0]?.name,
    topBridgeNode: rankedByBetweenness[0]?.name,
  };

  let aiInsights = null;
  try {
    aiInsights = await getNvidiaInsights(rankedByCentrality.slice(0, 50), topEdges);
  } catch (err) {
    console.warn('[SNA MEGA] AI insights failed:', err.message);
  }

  const result = {
    nodes, edges, metrics, communities, circuits, topEdges,
    rankedByCentrality, rankedByBetweenness,
    networkStats, aiInsights,
    computedAt: Date.now(),
  };

  try {
    localStorage.setItem(SNA_MEGA_CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }));
  } catch { /* ignore */ }

  return result;
}
