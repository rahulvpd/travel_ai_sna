// src/services/chennaiSNA.js
// Complete Social Network Analysis engine for Chennai's 26 heritage places
// Uses NVIDIA Nemotron for AI-enhanced insights, falls back to queryAI()
// Cache: 48hr localStorage TTL

import { dynastyHex } from '../utils/dynastyColors.js';
import { queryNvidiaJSON } from './nvidiaService.js';

const SNA_CACHE_KEY = 'chennai_sna_v2';
const TTL = 48 * 60 * 60 * 1000; // 48 hours

// ─────────────────────────────────────────────────────────────
// 26 CHENNAI HERITAGE NODES — real GPS coordinates
// ─────────────────────────────────────────────────────────────
export const CHENNAI_NODES = [
  {
    id: 'marina_beach', name: 'Marina Beach',
    dynasty: 'Natural', period: 'Natural', placeType: 'beach',
    lat: 13.0500, lng: 80.2824,
    significance: 'World\'s second-longest urban beach, a defining geographic and cultural landmark of Chennai.',
    emoji: '🏖️',
  },
  {
    id: 'elliots_beach', name: "Elliot's Beach",
    dynasty: 'Natural', period: 'Natural', placeType: 'beach',
    lat: 13.0069, lng: 80.2706,
    significance: 'Quieter southern beach known for its serene atmosphere and the historic Karl Schmidt Memorial.',
    emoji: '🌊',
  },
  {
    id: 'kapaleeshwarar', name: 'Kapaleeshwarar Temple',
    dynasty: 'Multiple', period: '7th–16th CE', placeType: 'temple',
    lat: 13.0333, lng: 80.2693,
    significance: 'Ancient Shaiva temple in Mylapore with towering Dravidian gopuram, spiritual heart of Chennai.',
    emoji: '🛕',
  },
  {
    id: 'parthasarathy', name: 'Parthasarathy Temple',
    dynasty: 'Pallava', period: '8th CE', placeType: 'temple',
    lat: 13.0604, lng: 80.2785,
    significance: 'One of the oldest Vaishnava temples in Chennai, built by Pallava king Narasimhavarman II.',
    emoji: '🏛️',
  },
  {
    id: 'vadapalani', name: 'Vadapalani Murugan Temple',
    dynasty: 'Post-Independence', period: '19th CE', placeType: 'temple',
    lat: 13.0524, lng: 80.2120,
    significance: 'Prominent Murugan temple in western Chennai, a major pilgrimage centre for Tamil devotees.',
    emoji: '🛕',
  },
  {
    id: 'marundeeswarar', name: 'Marundeeswarar Temple',
    dynasty: 'Pallava', period: 'Pre-7th CE', placeType: 'temple',
    lat: 12.9833, lng: 80.2605,
    significance: 'Ancient Pallava-era Shaiva temple in Thiruvanmiyur, associated with medicinal healing traditions.',
    emoji: '🏛️',
  },
  {
    id: 'fort_st_george', name: 'Fort St. George',
    dynasty: 'British Colonial', period: '1640 CE', placeType: 'fort',
    lat: 13.0802, lng: 80.2868,
    significance: 'First English fortress in India, birthplace of the city of Madras and symbol of colonial power.',
    emoji: '🏰',
  },
  {
    id: 'san_thome', name: 'San Thome Cathedral',
    dynasty: 'British Colonial', period: '1523–1896 CE', placeType: 'religious',
    lat: 13.0340, lng: 80.2786,
    significance: 'Neo-Gothic basilica built over the tomb of Apostle Thomas, one of only three churches worldwide built over an apostle\'s tomb.',
    emoji: '⛪',
  },
  {
    id: 'ripon_building', name: 'Ripon Building',
    dynasty: 'British Colonial', period: '1913 CE', placeType: 'monument',
    lat: 13.0869, lng: 80.2785,
    significance: 'Iconic Indo-Saracenic civic building housing Chennai Corporation, a landmark of colonial governance.',
    emoji: '🏢',
  },
  {
    id: 'madras_high_court', name: 'Madras High Court',
    dynasty: 'British Colonial', period: '1892 CE', placeType: 'monument',
    lat: 13.0785, lng: 80.2847,
    significance: 'Second-largest High Court building in the world, masterpiece of Indo-Saracenic architecture on the seafront.',
    emoji: '⚖️',
  },
  {
    id: 'chepauk_palace', name: 'Chepauk Palace',
    dynasty: 'British Colonial', period: '1768 CE', placeType: 'monument',
    lat: 13.0636, lng: 80.2836,
    significance: 'First Indo-Saracenic building in India, former residence of the Nawabs of Arcot.',
    emoji: '🏯',
  },
  {
    id: 'govt_museum', name: 'Government Museum',
    dynasty: 'British Colonial', period: '1851 CE', placeType: 'museum',
    lat: 13.0699, lng: 80.2580,
    significance: 'Second oldest museum in India, housing the world-class South Indian bronze collection.',
    emoji: '🏺',
  },
  {
    id: 'dakshina_chitra', name: 'DakshinaChitra',
    dynasty: 'Post-Independence', period: '1996 CE', placeType: 'museum',
    lat: 12.8990, lng: 80.2274,
    significance: 'Living museum of South Indian heritage showcasing traditional architecture, crafts, and performing arts.',
    emoji: '🎭',
  },
  {
    id: 'kalakshetra', name: 'Kalakshetra Foundation',
    dynasty: 'Post-Independence', period: '1936 CE', placeType: 'art',
    lat: 12.9987, lng: 80.2484,
    significance: 'Legendary classical arts academy founded by Rukmini Devi, reviving Bharatanatyam and Carnatic music traditions.',
    emoji: '💃',
  },
  {
    id: 'cholamandal', name: "Cholamandal Artists' Village",
    dynasty: 'Post-Independence', period: '1966 CE', placeType: 'art',
    lat: 12.9260, lng: 80.2450,
    significance: 'Asia\'s largest artist colony, founded by progressive painters as a self-sustaining creative community.',
    emoji: '🎨',
  },
  {
    id: 'vandalur_zoo', name: 'Vandalur Zoo',
    dynasty: 'Post-Independence', period: '1985 CE', placeType: 'wildlife',
    lat: 12.8798, lng: 80.0827,
    significance: 'Largest zoological park in India by area, pioneering naturalistic habitat design for wildlife conservation.',
    emoji: '🦁',
  },
  {
    id: 'theosophical', name: 'Theosophical Society',
    dynasty: 'British Colonial', period: '1882 CE', placeType: 'park',
    lat: 13.0006, lng: 80.2663,
    significance: 'Sprawling 270-acre campus housing ancient manuscripts, rare trees including the famous banyan, and interfaith traditions.',
    emoji: '🌳',
  },
  {
    id: 'guindy_park', name: 'Guindy National Park',
    dynasty: 'Natural', period: 'Gazetted 1977', placeType: 'wildlife',
    lat: 13.0067, lng: 80.2206,
    significance: 'One of the smallest national parks in India, a rare urban forest preserving blackbuck and spotted deer.',
    emoji: '🦌',
  },
  {
    id: 'iit_madras', name: 'IIT Madras Campus',
    dynasty: 'Post-Independence', period: '1959 CE', placeType: 'educational',
    lat: 12.9916, lng: 80.2336,
    significance: 'Premier engineering institution embedded within Guindy forest, housing a free-roaming deer population.',
    emoji: '🎓',
  },
  {
    id: 'connemara_library', name: 'Connemara Public Library',
    dynasty: 'British Colonial', period: '1896 CE', placeType: 'educational',
    lat: 13.0699, lng: 80.2580,
    significance: 'One of four national deposit libraries in India, an Indo-Saracenic architectural gem housing rare manuscripts.',
    emoji: '📚',
  },
  {
    id: 'mylapore', name: 'Mylapore Heritage District',
    dynasty: 'Multiple', period: 'Pre-2nd CE', placeType: 'monument',
    lat: 13.0333, lng: 80.2693,
    significance: 'Oldest continuously inhabited neighbourhood in Chennai, referenced by Ptolemy in 2nd century, cultural soul of the city.',
    emoji: '🏘️',
  },
  {
    id: 'george_town', name: 'George Town',
    dynasty: 'British Colonial', period: '1640s CE', placeType: 'market',
    lat: 13.0869, lng: 80.2785,
    significance: 'Historic commercial heart of colonial Madras, a dense labyrinth of wholesale markets and heritage buildings.',
    emoji: '🏪',
  },
  {
    id: 'pondy_bazaar', name: 'Pondy Bazaar & T. Nagar',
    dynasty: 'Post-Independence', period: '1920s CE', placeType: 'market',
    lat: 13.0418, lng: 80.2341,
    significance: 'Chennai\'s busiest retail district, the commercial engine of modern Tamil Nadu\'s shopping culture.',
    emoji: '🛍️',
  },
  {
    id: 'ratna_cafe', name: 'Ratna Cafe',
    dynasty: 'Post-Independence', period: '1948 CE', placeType: 'modern',
    lat: 13.0604, lng: 80.2785,
    significance: 'Iconic 1948 Triplicane restaurant, the cultural embassy of authentic Chennai filter coffee and tiffin tradition.',
    emoji: '☕',
  },
  {
    id: 'anna_library', name: 'Anna Centenary Library',
    dynasty: 'Post-Independence', period: '2010 CE', placeType: 'educational',
    lat: 13.0173, lng: 80.2314,
    significance: 'Largest public library in South Asia, a contemporary architectural landmark housing over 1.2 million volumes.',
    emoji: '📖',
  },
  {
    id: 'valluvar_kottam', name: 'Valluvar Kottam',
    dynasty: 'Post-Independence', period: '1976 CE', placeType: 'monument',
    lat: 13.0553, lng: 80.2423,
    significance: 'Monumental chariot-shaped memorial to Tamil poet Thiruvalluvar, inscribed with all 1,330 Kural couplets.',
    emoji: '🗿',
  },
];

// ─────────────────────────────────────────────────────────────
// EDGE TYPE CONFIG
// ─────────────────────────────────────────────────────────────
export const EDGE_CONFIG = {
  dynasty:    { color: '#FFCC00', label: '👑 Dynasty',     weight: 3, description: 'Same ruling dynasty or cultural lineage' },
  type:       { color: '#00C9B1', label: '🏛️ Place Type',  weight: 2, description: 'Same category of heritage site' },
  geographic: { color: '#4F8EFF', label: '📍 Geographic',  weight: 2, description: 'Within 5km proximity' },
  era:        { color: '#FF6B6B', label: '⏳ Era',          weight: 1, description: 'Same broad historical period' },
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
// BUILD EDGES — 5 typed relationship rules
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

      // Rule 1 — Dynasty
      if (a.dynasty === b.dynasty && a.dynasty !== 'Natural') {
        connections.push({ type: 'dynasty', label: `${a.dynasty} dynasty`, weight: 3 });
      }
      // Rule 2 — Place type
      if (a.placeType === b.placeType) {
        connections.push({ type: 'type', label: `Both ${a.placeType}`, weight: 2 });
      }
      // Rule 3 — Geographic proximity (<5km)
      if (dist < 5) {
        const geoWeight = Math.max(1, 3 - Math.floor(dist));
        connections.push({ type: 'geographic', label: `${dist.toFixed(1)} km apart`, weight: geoWeight });
      }
      // Rule 4 — Same era
      const eraA = getEra(a.period), eraB = getEra(b.period);
      if (eraA === eraB && eraA !== 'Unknown' && eraA !== 'Natural') {
        connections.push({ type: 'era', label: `${eraA} era`, weight: 1 });
      }
      // Rule 5 — Spiritual / religious
      const spiritual = ['temple', 'religious', 'park'];
      if (spiritual.includes(a.placeType) && spiritual.includes(b.placeType)) {
        connections.push({ type: 'spiritual', label: 'Spiritual heritage', weight: 1 });
      }

      if (connections.length > 0) {
        const totalWeight = connections.reduce((s, c) => s + c.weight, 0);
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

  // Degree centrality (normalised)
  const maxDeg = Math.max(...Object.values(m).map(x => x.degree));
  Object.values(m).forEach(x => {
    x.degreeCentrality = maxDeg > 0 ? x.degree / maxDeg : 0;
  });

  // BFS shortest path helper
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

  // Eigenvector centrality — power iteration (20 rounds)
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
// COMMUNITY DETECTION — dynasty-based grouping
// ─────────────────────────────────────────────────────────────
function detectCommunities(nodes) {
  const groups = {};
  nodes.forEach(n => {
    if (!groups[n.dynasty]) groups[n.dynasty] = [];
    groups[n.dynasty].push(n.id);
  });

  const meta = {
    'Pallava':           { color: '#a855f7', icon: '🏛️', desc: 'Rock-cut temples & early Dravidian architecture (6th–9th CE)' },
    'Chola':             { color: '#f59e0b', icon: '🛕', desc: 'Classical Tamil temple tradition & gopuram style (9th–13th CE)' },
    'British Colonial':  { color: '#64748b', icon: '🏰', desc: 'Indo-Saracenic & European colonial architecture (17th–20th CE)' },
    'Post-Independence': { color: '#14b8a6', icon: '🎓', desc: 'Modern Tamil Nadu — institutions, arts & infrastructure (1947+)' },
    'Multiple':          { color: '#ec4899', icon: '⏳', desc: 'Sites spanning multiple dynasties and eras' },
    'Natural':           { color: '#10b981', icon: '🌿', desc: 'Natural formations — beaches, parks & wildlife sanctuaries' },
  };

  return Object.entries(groups).map(([dynasty, nodeIds]) => ({
    id: dynasty.toLowerCase().replace(/\s+/g, '_'),
    name: dynasty, nodeIds, size: nodeIds.length,
    color:  meta[dynasty]?.color  || '#888888',
    icon:   meta[dynasty]?.icon   || '📍',
    desc:   meta[dynasty]?.desc   || `${dynasty} heritage sites`,
  }));
}

// ─────────────────────────────────────────────────────────────
// NVIDIA NEMOTRON — AI-enhanced SNA narrative
// ─────────────────────────────────────────────────────────────
async function getNvidiaInsights(nodes, topEdges) {
  const nodeList = nodes.map(n => `${n.name} (${n.dynasty}, ${n.placeType})`).join(', ');
  const edgeList = topEdges.slice(0, 8).map(e =>
    `${e.sourceName} ↔ ${e.targetName} [${e.connections.map(c => c.label).join(', ')}]`
  ).join('\n');

  const prompt = `You are a world-class Social Network Analysis expert specialising in cultural heritage networks.

Analyse this Chennai heritage network of 26 sites:

NODES: ${nodeList}

STRONGEST CONNECTIONS (top 8):
${edgeList}

Respond ONLY with valid JSON, no markdown fences:
{
  "networkSummary": "2-3 sentence overview of Chennai heritage network structure and density",
  "dominantCommunity": "which dynasty community dominates the network, how many nodes, and why it is central",
  "hubSiteAnalysis": "detailed analysis of the most central hub site — its dynasty, connections, and cultural role",
  "keyBridgeSites": [{"site": "site name", "role": "one precise sentence on why it bridges communities"}],
  "weaklyConnectedSites": ["site names with fewest connections"],
  "historicalInsight": "what the network structure reveals about Chennai's historical development and urban evolution",
  "tourismImplication": "how understanding this SNA network can transform a visitor's heritage tourism experience",
  "snaConclusion": "one powerful, academically grounded conclusion about Chennai's heritage as a network system"
}`;

  // Try NVIDIA Nemotron first
  try {
    const parsed = await queryNvidiaJSON(prompt, undefined, {
      temperature: 0.2,
      max_tokens: 1200,
      reasoning_budget: 4096,
      enable_thinking: true,
    });
    if (parsed) {
      return { ...parsed, engine: 'NVIDIA Proxy' };
    }
  } catch { /* fall through */ }

  // Fallback to existing 7-engine queryAI
  try {
    const { queryAI } = await import('./aiOrchestrator.js');
    const result = await queryAI(prompt);
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ...parsed, engine: result.engine || 'queryAI fallback' };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — computeChennaiSNA()
// ─────────────────────────────────────────────────────────────
export async function computeChennaiSNA() {
  // Cache check
  try {
    const cached = localStorage.getItem(SNA_CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < TTL) {
        console.log('[SNA] Returning cached computation');
        return data;
      }
    }
  } catch { /* ignore */ }

  console.log('[SNA] Computing Chennai heritage network...');

  const nodes      = CHENNAI_NODES;
  const edges      = buildEdges(nodes);
  const metrics    = computeMetrics(nodes, edges);
  const communities = detectCommunities(nodes);
  const topEdges   = [...edges].sort((a, b) => b.weight - a.weight).slice(0, 15);

  const rankedByCentrality  = Object.values(metrics).sort((a, b) => b.weightedDegree - a.weightedDegree);
  const rankedByBetweenness = Object.values(metrics).sort((a, b) => b.betweennessCentrality - a.betweennessCentrality);

  const networkStats = {
    totalNodes:       nodes.length,
    totalEdges:       edges.length,
    averageDegree:    (2 * edges.length / nodes.length).toFixed(2),
    networkDensity:   ((2 * edges.length) / (nodes.length * (nodes.length - 1))).toFixed(4),
    communities:      communities.length,
    largestCommunity: [...communities].sort((a, b) => b.size - a.size)[0]?.name,
    mostCentralNode:  rankedByCentrality[0]?.name,
    topBridgeNode:    rankedByBetweenness[0]?.name,
  };

  // NVIDIA AI insights
  let aiInsights = null;
  try {
    aiInsights = await getNvidiaInsights(nodes, topEdges);
    console.log('[SNA] AI insights:', aiInsights?.engine);
  } catch (err) {
    console.warn('[SNA] AI insights failed:', err.message);
  }

  const result = {
    nodes, edges, metrics, communities, topEdges,
    rankedByCentrality, rankedByBetweenness,
    networkStats, aiInsights,
    computedAt: Date.now(),
  };

  // Cache result
  try {
    localStorage.setItem(SNA_CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }));
  } catch { /* ignore storage errors */ }

  return result;
}
