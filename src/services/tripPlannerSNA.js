import { computeChennaiSNA } from './chennaiSNA.js';
import { queryNvidiaJSON } from './nvidiaService.js';

const CACHE_PREFIX = 'trip_sna_v1_';
const TTL = 30 * 60 * 1000;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getSelectionEntries(selectedPlaceNames) {
  if (!Array.isArray(selectedPlaceNames)) {
    return [];
  }

  return selectedPlaceNames
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item };
      }

      if (item && typeof item === 'object') {
        return item;
      }

      return null;
    })
    .filter(Boolean);
}

function getPlaceLabel(place) {
  return place?.name || place?.title || place?.placeName || '';
}

function getPlaceLat(place) {
  return place?.lat ?? place?.latitude ?? place?.location?.lat ?? null;
}

function getPlaceLng(place) {
  return place?.lng ?? place?.longitude ?? place?.location?.lng ?? null;
}

function matchesNode(node, selection) {
  const selectionName = normalizeText(getPlaceLabel(selection));
  const nodeName = normalizeText(node?.name);

  if (selectionName && nodeName) {
    if (selectionName === nodeName) {
      return true;
    }

    if (selectionName.includes(nodeName) || nodeName.includes(selectionName)) {
      return true;
    }
  }

  const selectionLat = getPlaceLat(selection);
  const selectionLng = getPlaceLng(selection);

  if (Number.isFinite(selectionLat) && Number.isFinite(selectionLng)) {
    return Math.abs(node.lat - selectionLat) < 0.02 && Math.abs(node.lng - selectionLng) < 0.02;
  }

  return false;
}

function extractYear(period) {
  if (!period || period === 'Natural') {
    return 9999;
  }

  const match = String(period).match(/(\d{3,4})/);
  return match ? parseInt(match[1], 10) : 9999;
}

function readCache(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.ts < TTL) {
      return parsed.data;
    }
  } catch {
    return null;
  }

  return null;
}

function writeCache(cacheKey, data) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    return;
  }
}

function parseJsonText(text) {
  if (!text) {
    return null;
  }

  const cleaned = String(text).replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

async function queryFallbackAI(prompt) {
  const { queryAI } = await import('./aiOrchestrator.js');
  const result = await queryAI(prompt);
  return parseJsonText(result?.text);
}

export async function buildTripSubgraph(selectedPlaceNames) {
  const selections = getSelectionEntries(selectedPlaceNames);
  if (selections.length < 2) {
    return null;
  }

  const fullSNA = await computeChennaiSNA();
  if (!fullSNA) {
    return null;
  }

  const selectedNodes = fullSNA.nodes.filter((node) =>
    selections.some((selection) => matchesNode(node, selection))
  );

  if (selectedNodes.length < 2) {
    return null;
  }

  const selectedIds = new Set(selectedNodes.map((node) => node.id));
  const selectedEdges = fullSNA.edges.filter(
    (edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target)
  );

  const selectedMetrics = {};
  selectedNodes.forEach((node) => {
    selectedMetrics[node.id] = fullSNA.metrics[node.id];
  });

  const chronological = [...selectedNodes].sort(
    (a, b) => extractYear(a.period) - extractYear(b.period)
  );

  const relationshipScore = selectedEdges.reduce((sum, edge) => sum + (edge.weight || 0), 0);
  const strongestEdge = [...selectedEdges].sort((a, b) => (b.weight || 0) - (a.weight || 0))[0] || null;

  return {
    nodes: selectedNodes,
    edges: selectedEdges,
    metrics: selectedMetrics,
    chronological,
    relationshipScore,
    strongestEdge,
    totalNodes: selectedNodes.length,
    totalEdges: selectedEdges.length,
    isConnected: selectedEdges.length > 0,
  };
}

export async function analyzeTripWithAI(selectedPlaceNames, subgraph) {
  const selections = getSelectionEntries(selectedPlaceNames);
  if (selections.length < 2) {
    return null;
  }

  const cacheKey = CACHE_PREFIX + selections.map(getPlaceLabel).sort().join('_');
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const placeList = selections.map(getPlaceLabel).filter(Boolean).join(', ');
  const edgeSummary = subgraph?.edges
    ?.slice(0, 5)
    .map((edge) => `${edge.sourceName} <-> ${edge.targetName} [${edge.connections?.[0]?.label || edge.primaryType}]`)
    .join(', ') || 'No direct connections';

  const prompt = `You are an expert heritage tourism analyst for Chennai, Tamil Nadu.

The traveller has selected these places for their trip: ${placeList}

SNA connections found: ${edgeSummary}
Relationship score: ${subgraph?.relationshipScore || 0}
Number of connections: ${subgraph?.totalEdges || 0}

Respond ONLY in valid JSON, no markdown:
{
  "tripTheme": "One compelling theme that unifies all these places",
  "narrativeArc": "2-3 sentences describing the cultural journey these places create together",
  "strongestBond": "The single most powerful connection between any two places and why",
  "hiddenPattern": "What the SNA network reveals about this combination that a normal tourist would miss",
  "suggestedOrder": ["place1", "place2", "place3"],
  "suggestedOrderReason": "Why this order creates the best cultural narrative",
  "dynastySpan": "How many dynasties or eras this trip covers",
  "uniqueInsight": "One surprising insight about this combination of places",
  "pairwiseConnections": [
    {
      "pair": "Place A + Place B",
      "connectionType": "dynasty/geographic/era/spiritual/type",
      "story": "One sentence on why they are linked"
    }
  ]
}`;

  try {
    const nvidia = await queryNvidiaJSON(prompt, undefined, {
      temperature: 0.3,
      max_tokens: 1000,
      reasoning_budget: 4096,
      enable_thinking: true,
    });
    if (nvidia) {
      writeCache(cacheKey, nvidia);
      return nvidia;
    }
  } catch {
    return null;
  }

  try {
    const fallback = await queryFallbackAI(prompt);
    if (fallback) {
      writeCache(cacheKey, fallback);
      return fallback;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getPlacePairRelationship(placeA, placeB) {
  if (!placeA || !placeB) {
    return null;
  }

  const cacheKey = `${CACHE_PREFIX}pair_${normalizeText(placeA)}_${normalizeText(placeB)}`;
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const prompt = `Heritage expert for Chennai Tamil Nadu.
Explain the cultural and historical relationship between "${placeA}" and "${placeB}" in Chennai.
JSON only, no markdown:
{
  "connectionStrength": "strong/moderate/weak",
  "primaryLink": "dynasty/geographic/era/spiritual/architectural/cultural",
  "explanation": "2-3 sentences on how these two places are connected through Chennai heritage",
  "sharedHistory": "One specific shared historical fact or event",
  "visitTogether": "One sentence on why visiting both enriches the experience"
}`;

  try {
    const fallback = await queryFallbackAI(prompt);
    if (fallback) {
      writeCache(cacheKey, fallback);
      return fallback;
    }
  } catch {
    return null;
  }

  return null;
}
