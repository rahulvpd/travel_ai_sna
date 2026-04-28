import { computeChennaiSNA, EDGE_CONFIG } from './chennaiSNA.js';
import { queryNvidiaJSON } from './nvidiaService.js';
import { dynastyHex } from '../utils/dynastyColors.js';

const PREFIX = 'trip_intel_v2_';
const TTL = 20 * 60 * 1000;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeNames(selectedNames) {
  if (!Array.isArray(selectedNames)) {
    return [];
  }

  return selectedNames
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      return item?.name || item?.title || item?.placeName || item?.place_name || '';
    })
    .filter(Boolean);
}

function parseJsonText(text) {
  if (!text) {
    return null;
  }

  const cleaned = String(text).replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

function readCache(cacheKey) {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < TTL) {
      return parsed.d;
    }
  } catch {
    return null;
  }

  return null;
}

function writeCache(cacheKey, data) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ d: data, ts: Date.now() }));
  } catch {
    return;
  }
}

function extractYear(period) {
  if (!period || period === 'Natural') {
    return 2000;
  }

  const match = String(period).match(/(\d{3,4})/);
  return match ? parseInt(match[1], 10) : 2000;
}

function bfsPath(startId, endId, adjacency) {
  const visited = new Set([startId]);
  const queue = [[startId]];

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === endId) {
      return path;
    }

    for (const neighbour of adjacency[node] || []) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([...path, neighbour]);
      }
    }
  }

  return null;
}

function computeSubgraphMetrics(nodes, edges) {
  const ids = nodes.map((node) => node.id);
  const adjacency = {};
  const weightedAdjacency = {};

  ids.forEach((id) => {
    adjacency[id] = [];
    weightedAdjacency[id] = {};
  });

  edges.forEach((edge) => {
    adjacency[edge.source].push(edge.target);
    adjacency[edge.target].push(edge.source);
    weightedAdjacency[edge.source][edge.target] = edge.weight;
    weightedAdjacency[edge.target][edge.source] = edge.weight;
  });

  const metrics = {};
  ids.forEach((id) => {
    metrics[id] = {
      id,
      degree: 0,
      weightedDegree: 0,
      degreeCentrality: 0,
      betweenness: 0,
      betweennessCentrality: 0,
      closeness: 0,
      eigenvector: 0,
      clusteringCoeff: 0,
      neighbours: adjacency[id],
    };
  });

  edges.forEach((edge) => {
    metrics[edge.source].degree += 1;
    metrics[edge.target].degree += 1;
    metrics[edge.source].weightedDegree += edge.weight;
    metrics[edge.target].weightedDegree += edge.weight;
  });

  const maxDegree = Math.max(...ids.map((id) => metrics[id].degree), 1);
  ids.forEach((id) => {
    metrics[id].degreeCentrality = metrics[id].degree / maxDegree;
  });

  ids.forEach((sourceId) => {
    ids.forEach((targetId) => {
      if (sourceId === targetId) {
        return;
      }

      const path = bfsPath(sourceId, targetId, adjacency);
      if (path && path.length > 2) {
        path.slice(1, -1).forEach((midpoint) => {
          metrics[midpoint].betweenness += 1;
        });
      }
    });
  });

  const maxBetweenness = Math.max(...ids.map((id) => metrics[id].betweenness), 1);
  ids.forEach((id) => {
    metrics[id].betweennessCentrality = metrics[id].betweenness / maxBetweenness;
  });

  ids.forEach((id) => {
    let totalDistance = 0;
    let reachable = 0;

    ids.forEach((otherId) => {
      if (id === otherId) {
        return;
      }

      const path = bfsPath(id, otherId, adjacency);
      if (path) {
        totalDistance += path.length - 1;
        reachable += 1;
      }
    });

    metrics[id].closeness = reachable > 0 ? reachable / totalDistance : 0;
  });

  let eigenvector = {};
  ids.forEach((id) => {
    eigenvector[id] = 1;
  });

  for (let index = 0; index < 20; index += 1) {
    const next = {};
    ids.forEach((id) => {
      next[id] = adjacency[id].reduce((sum, neighbour) => sum + eigenvector[neighbour], 0);
    });

    const norm = Math.sqrt(Object.values(next).reduce((sum, value) => sum + value * value, 0)) || 1;
    ids.forEach((id) => {
      eigenvector[id] = next[id] / norm;
    });
  }

  ids.forEach((id) => {
    metrics[id].eigenvector = eigenvector[id];
  });

  ids.forEach((id) => {
    const neighbours = adjacency[id];
    if (neighbours.length < 2) {
      metrics[id].clusteringCoeff = 0;
      return;
    }

    let triangles = 0;
    neighbours.forEach((a) => {
      neighbours.forEach((b) => {
        if (a !== b && adjacency[a]?.includes(b)) {
          triangles += 1;
        }
      });
    });

    metrics[id].clusteringCoeff = triangles / (neighbours.length * (neighbours.length - 1));
  });

  return metrics;
}

async function queryFallbackAI(prompt) {
  const { queryAI } = await import('./aiOrchestrator.js');
  const result = await queryAI(prompt);
  return parseJsonText(result?.text);
}

export async function buildTripSubgraph(selectedNames) {
  const names = normalizeNames(selectedNames);
  if (names.length < 2) {
    return null;
  }

  const fullSNA = await computeChennaiSNA();
  if (!fullSNA) {
    return null;
  }

  const normalized = names.map(normalizeText);
  const nodes = fullSNA.nodes.filter((node) => {
    const nodeName = normalizeText(node.name);
    return normalized.some((name) => nodeName.includes(name) || name.includes(nodeName));
  });

  if (nodes.length < 2) {
    return null;
  }

  const ids = new Set(nodes.map((node) => node.id));
  const edges = fullSNA.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  const metrics = computeSubgraphMetrics(nodes, edges);

  const byTime = [...nodes].sort((a, b) => extractYear(a.period) - extractYear(b.period));
  const dynastyCount = {};
  const edgeTypeCount = {};

  nodes.forEach((node) => {
    dynastyCount[node.dynasty] = (dynastyCount[node.dynasty] || 0) + 1;
  });

  edges.forEach((edge) => {
    edgeTypeCount[edge.primaryType] = (edgeTypeCount[edge.primaryType] || 0) + 1;
  });

  const maxPossible = (nodes.length * (nodes.length - 1)) / 2;
  const density = maxPossible > 0 ? edges.length / maxPossible : 0;
  const weightScore = edges.reduce((sum, edge) => sum + edge.weight, 0);
  const relationshipScore = Math.round(Math.min(density * 50 + weightScore * 2, 100));

  const byDegree = [...nodes].sort((a, b) => metrics[b.id].degree - metrics[a.id].degree);
  const byBetweenness = [...nodes].sort((a, b) => metrics[b.id].betweenness - metrics[a.id].betweenness);
  const byCloseness = [...nodes].sort((a, b) => metrics[b.id].closeness - metrics[a.id].closeness);
  const byEigenvector = [...nodes].sort((a, b) => metrics[b.id].eigenvector - metrics[a.id].eigenvector);
  const byClustering = [...nodes].sort((a, b) => metrics[b.id].clusteringCoeff - metrics[a.id].clusteringCoeff);

  const pairs = [];
  nodes.forEach((nodeA, index) => {
    nodes.slice(index + 1).forEach((nodeB) => {
      const edge = edges.find(
        (candidate) =>
          (candidate.source === nodeA.id && candidate.target === nodeB.id) ||
          (candidate.source === nodeB.id && candidate.target === nodeA.id)
      );

      pairs.push({
        nodeA,
        nodeB,
        edge: edge || null,
        connected: !!edge,
        weight: edge?.weight || 0,
        connectionTypes: edge?.connections?.map((connection) => connection.type) || [],
      });
    });
  });

  return {
    nodes,
    edges,
    metrics,
    byTime,
    dynastyCount,
    edgeTypeCount,
    density,
    relationshipScore,
    pairs,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    byDegree,
    byBetweenness,
    byCloseness,
    byEigenvector,
    byClustering,
    strongestEdge: [...edges].sort((a, b) => b.weight - a.weight)[0] || null,
    hubNode: byDegree[0] || null,
    bridgeNode: byBetweenness[0] || null,
    isolatedNode: [...nodes].sort((a, b) => metrics[a.id].degree - metrics[b.id].degree)[0] || null,
  };
}

export async function generateTripNarrative(selectedNames, subgraph) {
  const names = normalizeNames(selectedNames);
  if (names.length < 2 || !subgraph) {
    return null;
  }

  const cacheKey = PREFIX + 'narr_' + [...names].sort().join('|');
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const nodeList = names.join(', ');
  const edgeSummary = subgraph.edges
    .slice(0, 6)
    .map((edge) => `${edge.sourceName}<->${edge.targetName}[${edge.connections?.[0]?.label || edge.primaryType}]`)
    .join(', ');
  const dynasties = Object.entries(subgraph.dynastyCount)
    .map(([dynasty, count]) => `${dynasty}(${count})`)
    .join(', ');
  const hub = subgraph.hubNode?.name || 'unknown';
  const bridge = subgraph.bridgeNode?.name || 'unknown';

  const prompt = `You are an expert AI heritage tourism analyst for Chennai, Tamil Nadu.
Traveller selected: ${nodeList}
SNA connections: ${edgeSummary || 'No direct connections'}
Dynasty spread: ${dynasties}
Network hub site: ${hub}
Bridge site: ${bridge}
Relationship score: ${subgraph.relationshipScore}/100
Network density: ${(subgraph.density * 100).toFixed(0)}%

Give deep real-time SNA-based tourism analysis. JSON only, no markdown:
{
  "tripTheme": "One iconic theme name max 5 words",
  "tagline": "One punchy line under 12 words",
  "narrative": "3 sentences - cultural story these places tell together using SNA insights",
  "eraSpan": "Time span covered e.g. 1400 years",
  "dominantDynasty": "Which dynasty dominates",
  "hiddenPattern": "SNA-derived insight a normal tourist would never discover",
  "uniqueExperience": "What makes this exact combination irreplaceable",
  "snaCentralPlace": "${hub} - explain its centrality in this subgraph",
  "snaBridgePlace": "${bridge} - explain why it bridges communities",
  "weakLink": "Which place feels disconnected from others and why",
  "suggestedOrder": [{"place":"name","reason":"SNA-justified reason for this position"}],
  "tripMood": "contemplative/adventurous/spiritual/historical/artistic/colonial",
  "bestTimeOfDay": "morning/afternoon/evening",
  "networkInsight": "What the ${(subgraph.density * 100).toFixed(0)}% density tells about this trip",
  "aiConfidence": "high/medium"
}`;

  try {
    const nvidiaResult = await queryNvidiaJSON(prompt, undefined, {
      temperature: 0.3,
      max_tokens: 1400,
      reasoning_budget: 4096,
      enable_thinking: true,
    });
    if (nvidiaResult) {
      writeCache(cacheKey, nvidiaResult);
      return nvidiaResult;
    }
  } catch {
    // Fall through to queryAI.
  }

  try {
    const fallbackResult = await queryFallbackAI(prompt);
    if (fallbackResult) {
      writeCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  } catch {
    return null;
  }

  return null;
}

export async function analyzePlacePair(placeA, placeB, edgeData) {
  if (!placeA || !placeB) {
    return null;
  }

  const cacheKey = PREFIX + `pair_${[placeA, placeB].sort().join('_')}`;
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const connectionSummary = edgeData
    ? `SNA connections: ${edgeData.connections.map((connection) => connection.label).join(', ')} (weight: ${edgeData.weight})`
    : 'No direct SNA edge between these places';

  const prompt = `Chennai heritage expert. Bond analysis: "${placeA}" and "${placeB}". ${connectionSummary}
JSON only:
{
  "bondStrength":"strong/moderate/weak/isolated",
  "bondScore":5,
  "primaryLink":"dynasty/geographic/era/spiritual/architectural",
  "story":"2 sentences - historical story connecting them",
  "sharedFact":"One specific shared historical fact or person",
  "contrast":"What makes them interestingly different",
  "visitInsight":"One tactical insight for visiting both same day",
  "foodLink":"One food that links both places culturally"
}`;

  try {
    const fallbackResult = await queryFallbackAI(prompt);
    if (fallbackResult) {
      writeCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  } catch {
    return null;
  }

  return null;
}

export { EDGE_CONFIG, dynastyHex };
