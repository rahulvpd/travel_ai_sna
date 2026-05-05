import axios from 'axios';

// ── Production-ready API URL (reads from VITE_API_URL in production) ──────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  register: (email, password, fullName) =>
    api.post('/auth/register', { email, password, full_name: fullName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// ── Places (database-backed — replaces static districts.js) ──────────────
export const placeService = {
  getPlaces: (district) => api.get(`/api/places/districts/${district}`),
  getAllDistricts: () => api.get('/api/places/districts'),
  searchPlaces: (query) => api.get(`/api/places/search?q=${encodeURIComponent(query)}`),
  getPlaceById: (id) => api.get(`/api/places/${id}`),
};

// ── Itinerary ────────────────────────────────────────────────────────────
export const itineraryService = {
  generatePlan: (params) => api.post('/api/itinerary/generate', params),
  getHistory: () => api.get('/api/itinerary/list'),
  getById: (id) => api.get(`/api/itinerary/${id}`),
  save: (data) => api.post('/api/itinerary/save', data),
  update: (id, data) => api.put(`/api/itinerary/${id}`, data),
  delete: (id) => api.delete(`/api/itinerary/${id}`),
};

// ── AI Orchestration (all keys secured server-side) ──────────────────────
export const aiService = {
  // General-purpose AI query (7-engine fallback)
  query: (prompt) => api.post('/ai/query', { prompt }),

  // NVIDIA Nemotron for structured JSON analysis
  nvidiaChat: (params) => api.post('/ai/nvidia/chat', params),

  // Place-specific AI endpoints
  getPlaceHistory: (placeName) => api.post('/ai/place-history', { place_name: placeName }),
  getPlaceUniqueness: (placeName) => api.post('/ai/place-uniqueness', { place_name: placeName }),
  getPlaceDetails: (placeName) => api.post('/ai/place-details', { place_name: placeName }),

  // Gemini content proxy (replaces direct frontend SDK call)
  geminiGenerate: (messages) => api.post('/ai/gemini/generate', { messages }),

  // Discovery & translation
  getTrendingPlaces: () => api.get('/ai/trending-places'),
  getHiddenGems: (districtName) => api.post('/ai/hidden-gems', { district_name: districtName }),
  translateToTamil: (phrases) => api.post('/ai/translate-tamil', { phrases }),

  // Budget estimation
  estimateBudget: (destination, duration, travelers, budgetLevel) =>
    api.post('/ai/budget-estimate', { destination, duration, travelers, budget_level: budgetLevel }),
};

// ── ML Predictions ───────────────────────────────────────────────────────
export const predictionService = {
  predictVisitors: (placeName, options = {}) =>
    api.post('/ai/predict/visitors', { place_name: placeName, ...options }),
  predictVisitorFlow: (placeName, hoursAhead = 12) =>
    api.post('/ai/predict/visitors', { place_name: placeName, hours_ahead: hoursAhead }),
  predictNetworkEvolution: (years = 5) =>
    api.get(`/ai/predict/network?years=${years}`),
};

// ── Graph / SNA (Neo4j backend) ──────────────────────────────────────────
export const graphService = {
  getCentrality: () => api.get('/api/graph/centrality'),
  getCommunities: () => api.get('/api/graph/communities'),
  getInsights: () => api.get('/api/graph/insights'),
  getNodes: () => api.get('/api/graph/nodes'),
};

// ── Dynamic Pricing ──────────────────────────────────────────────────────
export const pricingService = {
  getTransportPrice: (mode, distanceKm, crowdPercentage = 50) =>
    api.post('/ai/pricing/transport', { mode, distance_km: distanceKm, crowd_percentage: crowdPercentage }),
  getTicketPrice: (attractionName, tier = 'moderate', isForeign = false, crowdPercentage = 50) =>
    api.post('/ai/pricing/ticket', { attraction_name: attractionName, tier, is_foreign: isForeign, crowd_percentage: crowdPercentage }),
  getBudgetBreakdown: (destination, days, travelers = 1, budgetLevel = 'moderate') =>
    api.post('/ai/pricing/budget', { destination, days, travelers, budget_level: budgetLevel }),
};

// ── Language & Translation (Sarvam AI via Backend) ───────────────────────
export const sarvamService = {
  translate: (text, targetLang = 'ta-IN') =>
    api.post('/ai/sarvam/translate', { text, target_lang: targetLang }),
  textToSpeech: (text, langCode = 'ta-IN') =>
    api.post('/ai/sarvam/tts', { text, lang_code: langCode }),
  transliterate: (text) =>
    api.post('/ai/sarvam/transliterate', { text }),
};

// ── WebSocket Helper ─────────────────────────────────────────────────────
export const getWebSocketUrl = (path = '/ws/visitors') => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsBase = import.meta.env.VITE_WS_URL || `${wsProtocol}//localhost:8000`;
  return `${wsBase}${path}`;
};

export default api;