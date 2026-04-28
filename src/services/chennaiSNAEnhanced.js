// src/services/chennaiSNAEnhanced.js
// Advanced Social Network Analysis for Chennai Heritage Tourism
// Includes: Temporal Analysis, Multi-Layer Networks, Tourism-Specific Metrics

import { dynastyHex } from '../utils/dynastyColors.js';
import { queryNvidiaJSON } from './nvidiaService.js';

const ENHANCED_CACHE_KEY = 'chennai_sna_enhanced_v3';
const TTL = 48 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// TOURISM-SPECIFIC NODE ATTRIBUTES
// ─────────────────────────────────────────────────────────────
export const CHENNAI_ENHANCED_NODES = [
  {
    id: 'marina_beach',
    name: 'Marina Beach',
    dynasty: 'Natural',
    period: 'Natural',
    placeType: 'beach',
    lat: 13.0500,
    lng: 80.2824,
    significance: "World's second-longest urban beach, a defining geographic and cultural landmark of Chennai.",
    emoji: '🏖️',
    visitorData: {
      dailyAverage: 50000,
      seasonalPeak: 100000,
      bestVisitTime: ['05:00-07:00', '17:00-19:00'],
      avgDuration: 2.5,
      ticketPrice: 0,
      capacity: 50000
    },
    amenities: ['parking', 'food_stalls', 'lifeguard', 'toilets'],
    accessibility: 0.9,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'elliots_beach',
    name: "Elliot's Beach",
    dynasty: 'Natural',
    period: 'Natural',
    placeType: 'beach',
    lat: 13.0069,
    lng: 80.2706,
    significance: 'Quieter southern beach known for its serene atmosphere and the historic Karl Schmidt Memorial.',
    emoji: '🌊',
    visitorData: {
      dailyAverage: 8000,
      seasonalPeak: 20000,
      bestVisitTime: ['06:00-08:00', '17:30-19:30'],
      avgDuration: 1.5,
      ticketPrice: 0,
      capacity: 10000
    },
    amenities: ['parking', 'cafes'],
    accessibility: 0.85,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'kapaleeshwarar',
    name: 'Kapaleeshwarar Temple',
    dynasty: 'Multiple',
    period: '7th–16th CE',
    placeType: 'temple',
    lat: 13.0333,
    lng: 80.2693,
    significance: 'Ancient Shaiva temple in Mylapore with towering Dravidian gopuram, spiritual heart of Chennai.',
    emoji: '🛕',
    visitorData: {
      dailyAverage: 10000,
      seasonalPeak: 50000,
      bestVisitTime: ['06:00-08:00', '17:00-19:00'],
      avgDuration: 1.5,
      ticketPrice: 0,
      capacity: 8000
    },
    amenities: ['parking', 'prasad_shop', 'shoe_stand'],
    accessibility: 0.7,
    photographyAllowed: false,
    wheelchairAccess: false,
    festivals: ['Arupathimoovar', 'Panguni Peruvizha']
  },
  {
    id: 'parthasarathy',
    name: 'Parthasarathy Temple',
    dynasty: 'Pallava',
    period: '8th CE',
    placeType: 'temple',
    lat: 13.0604,
    lng: 80.2785,
    significance: 'One of the oldest Vaishnava temples in Chennai, built by Pallava king Narasimhavarman II.',
    emoji: '🏛️',
    visitorData: {
      dailyAverage: 5000,
      seasonalPeak: 25000,
      bestVisitTime: ['06:00-09:00', '18:00-20:30'],
      avgDuration: 1,
      ticketPrice: 0,
      capacity: 5000
    },
    amenities: ['parking', 'prasad_shop'],
    accessibility: 0.75,
    photographyAllowed: false,
    wheelchairAccess: false
  },
  {
    id: 'vadapalani',
    name: 'Vadapalani Murugan Temple',
    dynasty: 'Post-Independence',
    period: '19th CE',
    placeType: 'temple',
    lat: 13.0524,
    lng: 80.2120,
    significance: 'Prominent Murugan temple in western Chennai, a major pilgrimage centre for Tamil devotees.',
    emoji: '🛕',
    visitorData: {
      dailyAverage: 15000,
      seasonalPeak: 80000,
      bestVisitTime: ['05:30-08:00', '18:00-21:00'],
      avgDuration: 1.5,
      ticketPrice: 0,
      capacity: 12000
    },
    amenities: ['parking', 'prasad_shop', 'wedding_hall'],
    accessibility: 0.85,
    photographyAllowed: false,
    wheelchairAccess: true
  },
  {
    id: 'marundeeswarar',
    name: 'Marundeeswarar Temple',
    dynasty: 'Pallava',
    period: 'Pre-7th CE',
    placeType: 'temple',
    lat: 12.9833,
    lng: 80.2605,
    significance: 'Ancient Pallava-era Shaiva temple in Thiruvanmiyur, associated with medicinal healing traditions.',
    emoji: '🏛️',
    visitorData: {
      dailyAverage: 3000,
      seasonalPeak: 15000,
      bestVisitTime: ['06:00-09:00', '17:30-20:00'],
      avgDuration: 1,
      ticketPrice: 0,
      capacity: 4000
    },
    amenities: ['parking'],
    accessibility: 0.7,
    photographyAllowed: false,
    wheelchairAccess: false
  },
  {
    id: 'fort_st_george',
    name: 'Fort St. George',
    dynasty: 'British Colonial',
    period: '1640 CE',
    placeType: 'fort',
    lat: 13.0802,
    lng: 80.2868,
    significance: 'First English fortress in India, birthplace of the city of Madras and symbol of colonial power.',
    emoji: '🏰',
    visitorData: {
      dailyAverage: 2000,
      seasonalPeak: 5000,
      bestVisitTime: ['09:30-12:00', '14:00-16:30'],
      avgDuration: 2,
      ticketPrice: 25,
      capacity: 2000
    },
    amenities: ['parking', 'guide_service', 'museum'],
    accessibility: 0.8,
    photographyAllowed: true,
    wheelchairAccess: true,
    museums: ['Fort Museum', 'St. Mary\'s Church']
  },
  {
    id: 'san_thome',
    name: 'San Thome Cathedral',
    dynasty: 'British Colonial',
    period: '1523–1896 CE',
    placeType: 'religious',
    lat: 13.0340,
    lng: 80.2786,
    significance: "Neo-Gothic basilica built over the tomb of Apostle Thomas, one of only three churches worldwide built over an apostle's tomb.",
    emoji: '⛪',
    visitorData: {
      dailyAverage: 3000,
      seasonalPeak: 10000,
      bestVisitTime: ['06:00-08:00', '17:00-19:00'],
      avgDuration: 1,
      ticketPrice: 0,
      capacity: 3000
    },
    amenities: ['parking', 'gift_shop'],
    accessibility: 0.85,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'ripon_building',
    name: 'Ripon Building',
    dynasty: 'British Colonial',
    period: '1913 CE',
    placeType: 'monument',
    lat: 13.0869,
    lng: 80.2785,
    significance: 'Iconic Indo-Saracenic civic building housing Chennai Corporation, a landmark of colonial governance.',
    emoji: '🏢',
    visitorData: {
      dailyAverage: 500,
      seasonalPeak: 2000,
      bestVisitTime: ['10:00-17:00'],
      avgDuration: 0.5,
      ticketPrice: 0,
      capacity: 500
    },
    amenities: ['exterior_view_only'],
    accessibility: 0.6,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'madras_high_court',
    name: 'Madras High Court',
    dynasty: 'British Colonial',
    period: '1892 CE',
    placeType: 'monument',
    lat: 13.0785,
    lng: 80.2847,
    significance: 'Second-largest High Court building in the world, masterpiece of Indo-Saracenic architecture on the seafront.',
    emoji: '⚖️',
    visitorData: {
      dailyAverage: 1000,
      seasonalPeak: 3000,
      bestVisitTime: ['10:00-16:00'],
      avgDuration: 0.75,
      ticketPrice: 0,
      capacity: 1000
    },
    amenities: ['exterior_view', 'photography_point'],
    accessibility: 0.5,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'chepauk_palace',
    name: 'Chepauk Palace',
    dynasty: 'British Colonial',
    period: '1768 CE',
    placeType: 'monument',
    lat: 13.0636,
    lng: 80.2836,
    significance: 'First Indo-Saracenic building in India, former residence of the Nawabs of Arcot.',
    emoji: '🏯',
    visitorData: {
      dailyAverage: 300,
      seasonalPeak: 1000,
      bestVisitTime: ['10:00-17:00'],
      avgDuration: 0.5,
      ticketPrice: 0,
      capacity: 300
    },
    amenities: ['exterior_view'],
    accessibility: 0.5,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'govt_museum',
    name: 'Government Museum',
    dynasty: 'British Colonial',
    period: '1851 CE',
    placeType: 'museum',
    lat: 13.0699,
    lng: 80.2580,
    significance: 'Second oldest museum in India, housing the world-class South Indian bronze collection.',
    emoji: '🏺',
    visitorData: {
      dailyAverage: 1500,
      seasonalPeak: 5000,
      bestVisitTime: ['10:00-16:30'],
      avgDuration: 3,
      ticketPrice: 100,
      capacity: 2000
    },
    amenities: ['parking', 'guide_service', 'cafeteria', 'gift_shop'],
    accessibility: 0.85,
    photographyAllowed: true,
    wheelchairAccess: true,
    galleries: ['Bronze Gallery', 'Archaeology', 'Anthropology', 'Numismatics']
  },
  {
    id: 'dakshina_chitra',
    name: 'DakshinaChitra',
    dynasty: 'Post-Independence',
    period: '1996 CE',
    placeType: 'museum',
    lat: 12.8990,
    lng: 80.2274,
    significance: 'Living museum of South Indian heritage showcasing traditional architecture, crafts, and performing arts.',
    emoji: '🎭',
    visitorData: {
      dailyAverage: 800,
      seasonalPeak: 3000,
      bestVisitTime: ['10:00-17:00'],
      avgDuration: 4,
      ticketPrice: 150,
      capacity: 1500
    },
    amenities: ['parking', 'guide_service', 'cafeteria', 'craft_shops', 'workshops'],
    accessibility: 0.8,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'kalakshetra',
    name: 'Kalakshetra Foundation',
    dynasty: 'Post-Independence',
    period: '1936 CE',
    placeType: 'art',
    lat: 12.9987,
    lng: 80.2484,
    significance: 'Legendary classical arts academy founded by Rukmini Devi, reviving Bharatanatyam and Carnatic music traditions.',
    emoji: '💃',
    visitorData: {
      dailyAverage: 500,
      seasonalPeak: 5000,
      bestVisitTime: ['09:00-17:00'],
      avgDuration: 2,
      ticketPrice: 0,
      capacity: 1000
    },
    amenities: ['parking', 'performance_hall', 'craft_center'],
    accessibility: 0.75,
    photographyAllowed: true,
    wheelchairAccess: true,
    performances: ['Bharatanatyam', 'Carnatic Music', 'Koothu']
  },
  {
    id: 'cholamandal',
    name: "Cholamandal Artists' Village",
    dynasty: 'Post-Independence',
    period: '1966 CE',
    placeType: 'art',
    lat: 12.9260,
    lng: 80.2450,
    significance: "Asia's largest artist colony, founded by progressive painters as a self-sustaining creative community.",
    emoji: '🎨',
    visitorData: {
      dailyAverage: 200,
      seasonalPeak: 1000,
      bestVisitTime: ['10:00-17:00'],
      avgDuration: 2,
      ticketPrice: 50,
      capacity: 500
    },
    amenities: ['parking', 'gallery', 'cafe'],
    accessibility: 0.7,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'vandalur_zoo',
    name: 'Vandalur Zoo',
    dynasty: 'Post-Independence',
    period: '1985 CE',
    placeType: 'wildlife',
    lat: 12.8798,
    lng: 80.0827,
    significance: 'Largest zoological park in India by area, pioneering naturalistic habitat design for wildlife conservation.',
    emoji: '🦁',
    visitorData: {
      dailyAverage: 5000,
      seasonalPeak: 25000,
      bestVisitTime: ['09:00-16:00'],
      avgDuration: 5,
      ticketPrice: 100,
      capacity: 20000
    },
    amenities: ['parking', 'food_court', 'safari', 'battery_car'],
    accessibility: 0.75,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'theosophical',
    name: 'Theosophical Society',
    dynasty: 'British Colonial',
    period: '1882 CE',
    placeType: 'park',
    lat: 13.0006,
    lng: 80.2663,
    significance: 'Sprawling 270-acre campus housing ancient manuscripts, rare trees including the famous banyan, and interfaith traditions.',
    emoji: '🌳',
    visitorData: {
      dailyAverage: 300,
      seasonalPeak: 2000,
      bestVisitTime: ['08:00-11:00', '15:00-17:00'],
      avgDuration: 2,
      ticketPrice: 0,
      capacity: 3000
    },
    amenities: ['parking', 'library', 'gardens'],
    accessibility: 0.8,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'guindy_park',
    name: 'Guindy National Park',
    dynasty: 'Natural',
    period: 'Gazetted 1977',
    placeType: 'wildlife',
    lat: 13.0067,
    lng: 80.2206,
    significance: 'One of the smallest national parks in India, a rare urban forest preserving blackbuck and spotted deer.',
    emoji: '🦌',
    visitorData: {
      dailyAverage: 2000,
      seasonalPeak: 8000,
      bestVisitTime: ['06:00-09:00', '16:00-18:00'],
      avgDuration: 2,
      ticketPrice: 50,
      capacity: 5000
    },
    amenities: ['parking', 'nature_trails'],
    accessibility: 0.7,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'iit_madras',
    name: 'IIT Madras Campus',
    dynasty: 'Post-Independence',
    period: '1959 CE',
    placeType: 'educational',
    lat: 12.9916,
    lng: 80.2336,
    significance: 'Premier engineering institution embedded within Guindy forest, housing a free-roaming deer population.',
    emoji: '🎓',
    visitorData: {
      dailyAverage: 200,
      seasonalPeak: 1000,
      bestVisitTime: ['09:00-17:00'],
      avgDuration: 2,
      ticketPrice: 0,
      capacity: 500
    },
    amenities: ['guided_tours'],
    accessibility: 0.8,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'connemara_library',
    name: 'Connemara Public Library',
    dynasty: 'British Colonial',
    period: '1896 CE',
    placeType: 'educational',
    lat: 13.0699,
    lng: 80.2580,
    significance: 'One of four national deposit libraries in India, an Indo-Saracenic architectural gem housing rare manuscripts.',
    emoji: '📚',
    visitorData: {
      dailyAverage: 1000,
      seasonalPeak: 3000,
      bestVisitTime: ['10:00-17:00'],
      avgDuration: 1.5,
      ticketPrice: 0,
      capacity: 1000
    },
    amenities: ['reading_rooms', 'reference_section'],
    accessibility: 0.75,
    photographyAllowed: false,
    wheelchairAccess: true
  },
  {
    id: 'mylapore',
    name: 'Mylapore Heritage District',
    dynasty: 'Multiple',
    period: 'Pre-2nd CE',
    placeType: 'monument',
    lat: 13.0333,
    lng: 80.2693,
    significance: 'Oldest continuously inhabited neighbourhood in Chennai, referenced by Ptolemy in 2nd century, cultural soul of the city.',
    emoji: '🏘️',
    visitorData: {
      dailyAverage: 15000,
      seasonalPeak: 75000,
      bestVisitTime: ['06:00-10:00', '17:00-20:00'],
      avgDuration: 3,
      ticketPrice: 0,
      capacity: 20000
    },
    amenities: ['walking_tours', 'food_stalls', 'temples'],
    accessibility: 0.65,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'george_town',
    name: 'George Town',
    dynasty: 'British Colonial',
    period: '1640s CE',
    placeType: 'market',
    lat: 13.0869,
    lng: 80.2785,
    significance: 'Historic commercial heart of colonial Madras, a dense labyrinth of wholesale markets and heritage buildings.',
    emoji: '🏪',
    visitorData: {
      dailyAverage: 50000,
      seasonalPeak: 100000,
      bestVisitTime: ['10:00-18:00'],
      avgDuration: 2,
      ticketPrice: 0,
      capacity: 100000
    },
    amenities: ['markets', 'street_food'],
    accessibility: 0.5,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'pondy_bazaar',
    name: 'Pondy Bazaar & T. Nagar',
    dynasty: 'Post-Independence',
    period: '1920s CE',
    placeType: 'market',
    lat: 13.0418,
    lng: 80.2341,
    significance: "Chennai's busiest retail district, the commercial engine of modern Tamil Nadu's shopping culture.",
    emoji: '🛍️',
    visitorData: {
      dailyAverage: 100000,
      seasonalPeak: 250000,
      bestVisitTime: ['10:00-21:00'],
      avgDuration: 3,
      ticketPrice: 0,
      capacity: 250000
    },
    amenities: ['shopping', 'food_court', 'parking'],
    accessibility: 0.7,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'ratna_cafe',
    name: 'Ratna Cafe',
    dynasty: 'Post-Independence',
    period: '1948 CE',
    placeType: 'modern',
    lat: 13.0604,
    lng: 80.2785,
    significance: 'Iconic 1948 Triplicane restaurant, the cultural embassy of authentic Chennai filter coffee and tiffin tradition.',
    emoji: '☕',
    visitorData: {
      dailyAverage: 2000,
      seasonalPeak: 5000,
      bestVisitTime: ['06:00-11:00', '16:00-21:00'],
      avgDuration: 0.75,
      ticketPrice: 0,
      capacity: 150
    },
    amenities: ['dining', 'takeaway'],
    accessibility: 0.7,
    photographyAllowed: true,
    wheelchairAccess: false
  },
  {
    id: 'anna_library',
    name: 'Anna Centenary Library',
    dynasty: 'Post-Independence',
    period: '2010 CE',
    placeType: 'educational',
    lat: 13.0173,
    lng: 80.2314,
    significance: 'Largest public library in South Asia, a contemporary architectural landmark housing over 1.2 million volumes.',
    emoji: '📖',
    visitorData: {
      dailyAverage: 3000,
      seasonalPeak: 8000,
      bestVisitTime: ['09:00-20:00'],
      avgDuration: 2,
      ticketPrice: 0,
      capacity: 5000
    },
    amenities: ['reading_rooms', 'digital_library', 'cafeteria'],
    accessibility: 0.95,
    photographyAllowed: true,
    wheelchairAccess: true
  },
  {
    id: 'valluvar_kottam',
    name: 'Valluvar Kottam',
    dynasty: 'Post-Independence',
    period: '1976 CE',
    placeType: 'monument',
    lat: 13.0553,
    lng: 80.2423,
    significance: 'Monumental chariot-shaped memorial to Tamil poet Thiruvalluvar, inscribed with all 1,330 Kural couplets.',
    emoji: '🗿',
    visitorData: {
      dailyAverage: 500,
      seasonalPeak: 3000,
      bestVisitTime: ['09:00-17:00'],
      avgDuration: 1,
      ticketPrice: 0,
      capacity: 1000
    },
    amenities: ['parking', 'auditorium'],
    accessibility: 0.75,
    photographyAllowed: true,
    wheelchairAccess: true
  }
];

// ─────────────────────────────────────────────────────────────
// EDGE TYPE CONFIGURATION (Enhanced)
// ─────────────────────────────────────────────────────────────
export const ENHANCED_EDGE_CONFIG = {
  dynasty: { color: '#FFCC00', label: '👑 Dynasty', weight: 3, description: 'Same ruling dynasty or cultural lineage' },
  type: { color: '#00C9B1', label: '🏛️ Place Type', weight: 2, description: 'Same category of heritage site' },
  geographic: { color: '#4F8EFF', label: '📍 Geographic', weight: 2, description: 'Within 5km proximity' },
  era: { color: '#FF6B6B', label: '⏳ Era', weight: 1, description: 'Same broad historical period' },
  spiritual: { color: '#A855F7', label: '🕌 Spiritual', weight: 1, description: 'Both religious or spiritual sites' },
  temporal: { color: '#10B981', label: '⏱️ Temporal', weight: 2, description: 'Can be visited together efficiently' },
  cultural: { color: '#EC4899', label: '🎭 Cultural', weight: 1.5, description: 'Shared cultural events or traditions' },
  visitorFlow: { color: '#F59E0B', label: '👥 Visitor Flow', weight: 2.5, description: 'Commonly visited together by tourists' }
};

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
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
// ADVANCED EDGE BUILDING
// ─────────────────────────────────────────────────────────────
function buildEnhancedEdges(nodes) {
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

      // Rule 6 — Temporal compatibility (NEW)
      const temporalScore = calculateTemporalCompatibility(a, b, dist);
      if (temporalScore > 0) {
        connections.push({ type: 'temporal', label: 'Good for same-day visit', weight: temporalScore });
      }

      // Rule 7 — Cultural connection (NEW)
      const culturalScore = calculateCulturalConnection(a, b);
      if (culturalScore > 0) {
        connections.push({ type: 'cultural', label: 'Shared cultural context', weight: culturalScore });
      }

      if (connections.length > 0) {
        const totalWeight = connections.reduce((s, c) => s + c.weight, 0);
        edges.push({
          id: `e${eid++}`,
          source: a.id,
          target: b.id,
          sourceName: a.name,
          targetName: b.name,
          connections,
          weight: totalWeight,
          primaryType: [...connections].sort((x, y) => y.weight - x.weight)[0].type,
          distance: dist
        });
      }
    }
  }
  return edges;
}

function calculateTemporalCompatibility(a, b, dist) {
  if (!a.visitorData || !b.visitorData) return 0;
  
  const totalDuration = a.visitorData.avgDuration + b.visitorData.avgDuration;
  const travelTime = dist / 30; // Assuming 30 km/h average speed
  
  // If both can be visited in under 6 hours total (including travel)
  if (totalDuration + travelTime <= 6) {
    return 2;
  }
  return 0;
}

function calculateCulturalConnection(a, b) {
  let score = 0;
  
  // Check for shared festivals
  if (a.festivals && b.festivals) {
    const sharedFestivals = a.festivals.filter(f => b.festivals.includes(f));
    score += sharedFestivals.length * 0.5;
  }
  
  // Check for shared heritage type
  const heritageTypes = {
    temple: ['temple', 'religious'],
    colonial: ['fort', 'monument'],
    modern: ['museum', 'art', 'educational']
  };
  
  for (const [, types] of Object.entries(heritageTypes)) {
    if (types.includes(a.placeType) && types.includes(b.placeType)) {
      score += 0.5;
    }
  }
  
  return score;
}

// ─────────────────────────────────────────────────────────────
// ADVANCED SNA METRICS
// ─────────────────────────────────────────────────────────────
function computeEnhancedMetrics(nodes, edges) {
  const m = {};
  
  nodes.forEach(n => {
    m[n.id] = {
      id: n.id,
      name: n.name,
      dynasty: n.dynasty,
      placeType: n.placeType,
      degree: 0,
      weightedDegree: 0,
      betweenness: 0,
      betweennessCentrality: 0,
      closeness: 0,
      degreeCentrality: 0,
      eigenvector: 0,
      neighbours: [],
      edgeIds: [],
      // NEW: Tourism-specific metrics
      tourismCentrality: 0,
      experienceDiversity: 0,
      accessibilityIndex: 0,
      visitorPopularity: 0,
      recommendationScore: 0
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

  // Degree centrality (normalized)
  const maxDeg = Math.max(...Object.values(m).map(x => x.degree));
  Object.values(m).forEach(x => {
    x.degreeCentrality = maxDeg > 0 ? x.degree / maxDeg : 0;
  });

  // BFS for shortest paths
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
      if (path) {
        total += path.length - 1;
        reach++;
      }
    });
    m[n.id].closeness = reach > 0 ? reach / total : 0;
  });

  // Eigenvector centrality — power iteration
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

  // NEW: Tourism-specific metrics
  nodes.forEach(n => {
    const node = n;
    const metrics = m[n.id];
    
    // Tourism Centrality: weighted degree + visitor popularity
    const visitorNorm = node.visitorData ? 
      node.visitorData.dailyAverage / Math.max(...nodes.map(x => x.visitorData?.dailyAverage || 1)) : 0;
    metrics.tourismCentrality = (metrics.degreeCentrality * 0.4) + (visitorNorm * 0.6);
    
    // Experience Diversity: variety of place types in neighborhood
    const neighborTypes = new Set(
      metrics.neighbours
        .map(nbId => nodes.find(x => x.id === nbId)?.placeType)
        .filter(Boolean)
    );
    const typeCount = neighborTypes.size;
    const totalTypes = new Set(nodes.map(x => x.placeType)).size;
    metrics.experienceDiversity = typeCount / totalTypes;
    
    // Accessibility Index
    metrics.accessibilityIndex = (node.accessibility || 0.5) * metrics.degreeCentrality;
    
    // Visitor Popularity (normalized)
    metrics.visitorPopularity = visitorNorm;
    
    // Recommendation Score (combined)
    metrics.recommendationScore = (
      metrics.tourismCentrality * 0.3 +
      metrics.experienceDiversity * 0.2 +
      metrics.betweennessCentrality * 0.2 +
      metrics.closeness * 0.15 +
      (node.accessibility || 0.5) * 0.15
    );
  });

  return m;
}

// ─────────────────────────────────────────────────────────────
// COMMUNITY DETECTION (Enhanced)
// ─────────────────────────────────────────────────────────────
function detectEnhancedCommunities(nodes, metrics) {
  const dynastyGroups = {};
  const typeGroups = {};
  const eraGroups = {};

  nodes.forEach(n => {
    // Dynasty groups
    if (!dynastyGroups[n.dynasty]) dynastyGroups[n.dynasty] = [];
    dynastyGroups[n.dynasty].push(n.id);

    // Type groups
    if (!typeGroups[n.placeType]) typeGroups[n.placeType] = [];
    typeGroups[n.placeType].push(n.id);

    // Era groups
    const era = getEra(n.period);
    if (!eraGroups[era]) eraGroups[era] = [];
    eraGroups[era].push(n.id);
  });

  const meta = {
    'Pallava': { color: '#a855f7', icon: '🏛️', desc: 'Rock-cut temples & early Dravidian architecture (6th–9th CE)' },
    'Chola': { color: '#f59e0b', icon: '🛕', desc: 'Classical Tamil temple tradition & gopuram style (9th–13th CE)' },
    'British Colonial': { color: '#64748b', icon: '🏰', desc: 'Indo-Saracenic & European colonial architecture (17th–20th CE)' },
    'Post-Independence': { color: '#14b8a6', icon: '🎓', desc: 'Modern Tamil Nadu — institutions, arts & infrastructure (1947+)' },
    'Multiple': { color: '#ec4899', icon: '⏳', desc: 'Sites spanning multiple dynasties and eras' },
    'Natural': { color: '#10b981', icon: '🌿', desc: 'Natural formations — beaches, parks & wildlife sanctuaries' },
  };

  const dynastyCommunities = Object.entries(dynastyGroups).map(([dynasty, nodeIds]) => ({
    id: dynasty.toLowerCase().replace(/\s+/g, '_'),
    name: dynasty,
    type: 'dynasty',
    nodeIds,
    size: nodeIds.length,
    color: meta[dynasty]?.color || '#888888',
    icon: meta[dynasty]?.icon || '📍',
    desc: meta[dynasty]?.desc || `${dynasty} heritage sites`,
    cohesion: calculateCommunityCohesion(nodeIds, metrics)
  }));

  const typeCommunities = Object.entries(typeGroups).map(([type, nodeIds]) => ({
    id: type.toLowerCase(),
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type: 'placeType',
    nodeIds,
    size: nodeIds.length,
    color: getTypeColor(type),
    icon: getTypeIcon(type),
    desc: `${type} sites in Chennai`,
    cohesion: calculateCommunityCohesion(nodeIds, metrics)
  }));

  return {
    dynasty: dynastyCommunities.filter(c => c.size > 0).sort((a, b) => b.size - a.size),
    type: typeCommunities.filter(c => c.size > 0).sort((a, b) => b.size - a.size),
    all: [...dynastyCommunities, ...typeCommunities]
  };
}

function calculateCommunityCohesion(nodeIds, metrics) {
  if (nodeIds.length < 2) return 1;
  
  let internalConnections = 0;
  let totalPossible = nodeIds.length * (nodeIds.length - 1) / 2;
  
  nodeIds.forEach((id, i) => {
    const neighbours = metrics[id]?.neighbours || [];
    nodeIds.slice(i + 1).forEach(otherId => {
      if (neighbours.includes(otherId)) {
        internalConnections++;
      }
    });
  });
  
  return internalConnections / totalPossible;
}

function getTypeColor(type) {
  const colors = {
    temple: '#FFD700',
    beach: '#00CED1',
    fort: '#8B4513',
    museum: '#9370DB',
    monument: '#CD853F',
    religious: '#FF6B6B',
    art: '#FF69B4',
    wildlife: '#228B22',
    park: '#32CD32',
    educational: '#4169E1',
    market: '#FF8C00',
    modern: '#708090'
  };
  return colors[type] || '#888888';
}

function getTypeIcon(type) {
  const icons = {
    temple: '🛕',
    beach: '🏖️',
    fort: '🏰',
    museum: '🏛️',
    monument: '🗿',
    religious: '⛪',
    art: '🎨',
    wildlife: '🦁',
    park: '🌳',
    educational: '📚',
    market: '🛍️',
    modern: '🏢'
  };
  return icons[type] || '📍';
}

// ─────────────────────────────────────────────────────────────
// TOURISM CIRCUITS GENERATION
// ─────────────────────────────────────────────────────────────
function generateTourismCircuits(nodes, edges, communities) {
  const circuits = [];
  
  // Generate circuits based on dynasty communities
  communities.dynasty.forEach(community => {
    if (community.size >= 2) {
      const circuitNodes = community.nodeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
      
      // Calculate optimal order (nearest neighbor TSP)
      const orderedNodes = nearestNeighborTSP(circuitNodes);
      
      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;
      
      for (let i = 0; i < orderedNodes.length - 1; i++) {
        totalDistance += haversineKm(
          orderedNodes[i].lat, orderedNodes[i].lng,
          orderedNodes[i + 1].lat, orderedNodes[i + 1].lng
        );
      }
      
      orderedNodes.forEach(n => {
        totalDuration += n.visitorData?.avgDuration || 1;
      });
      
      // Add travel time
      totalDuration += totalDistance / 30; // 30 km/h average
      
      circuits.push({
        id: `circuit_${community.id}`,
        name: `${community.name} Heritage Circuit`,
        type: 'dynasty',
        theme: generateCircuitTheme(community, orderedNodes),
        nodes: orderedNodes,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalDuration: Math.round(totalDuration * 10) / 10,
        highlights: orderedNodes.slice(0, 3).map(n => n.name),
        bestTime: determineBestTime(orderedNodes),
        estimatedCost: calculateCircuitCost(orderedNodes),
        difficulty: calculateDifficulty(totalDuration, orderedNodes.length),
        description: generateCircuitDescription(community, orderedNodes)
      });
    }
  });

  // Generate geographic circuits (clusters)
  const geoCircuits = generateGeographicCircuits(nodes, edges);
  circuits.push(...geoCircuits);

  return circuits.sort((a, b) => b.nodes.length - a.nodes.length);
}

function nearestNeighborTSP(nodes) {
  if (nodes.length <= 1) return nodes;
  
  const ordered = [nodes[0]];
  const remaining = nodes.slice(1);
  
  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    
    remaining.forEach((node, idx) => {
      const dist = haversineKm(current.lat, current.lng, node.lat, node.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });
    
    ordered.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }
  
  return ordered;
}

function generateGeographicCircuits(nodes, edges) {
  const circuits = [];
  
  // Define geographic zones
  const zones = [
    { name: 'Central Chennai', filter: n => n.lat > 13.04 && n.lat < 13.10 && n.lng > 80.24 && n.lng < 80.30 },
    { name: 'South Chennai', filter: n => n.lat < 13.00 && n.lng > 80.20 },
    { name: 'East Coast', filter: n => n.lng > 80.26 && (n.placeType === 'beach' || n.placeType === 'park') },
    { name: 'Heritage Core', filter: n => n.placeType === 'temple' || n.placeType === 'religious' }
  ];
  
  zones.forEach(zone => {
    const zoneNodes = nodes.filter(zone.filter);
    if (zoneNodes.length >= 2) {
      const orderedNodes = nearestNeighborTSP(zoneNodes);
      
      let totalDistance = 0;
      for (let i = 0; i < orderedNodes.length - 1; i++) {
        totalDistance += haversineKm(
          orderedNodes[i].lat, orderedNodes[i].lng,
          orderedNodes[i + 1].lat, orderedNodes[i + 1].lng
        );
      }
      
      circuits.push({
        id: `circuit_${zone.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: `${zone.name} Circuit`,
        type: 'geographic',
        theme: `Explore ${zone.name}'s highlights`,
        nodes: orderedNodes,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalDuration: Math.round(orderedNodes.reduce((sum, n) => sum + (n.visitorData?.avgDuration || 1), 0) + totalDistance / 30),
        highlights: orderedNodes.slice(0, 3).map(n => n.name),
        bestTime: determineBestTime(orderedNodes),
        estimatedCost: calculateCircuitCost(orderedNodes),
        difficulty: calculateDifficulty(orderedNodes.reduce((sum, n) => sum + (n.visitorData?.avgDuration || 1), 0), orderedNodes.length),
        description: `A curated tour of ${zone.name} featuring ${orderedNodes.length} key attractions.`
      });
    }
  });
  
  return circuits;
}

function generateCircuitTheme(community, nodes) {
  const types = [...new Set(nodes.map(n => n.placeType))];
  const dynasty = community.name;
  
  if (types.length === 1) {
    return `${dynasty} ${types[0]} heritage`;
  }
  return `${dynasty} heritage and culture`;
}

function determineBestTime(nodes) {
  const types = nodes.map(n => n.placeType);
  
  if (types.includes('beach')) return 'Early morning or sunset';
  if (types.includes('temple')) return 'Morning hours (6-9 AM)';
  if (types.includes('museum')) return 'Weekday afternoons';
  if (types.includes('wildlife')) return 'Early morning or late afternoon';
  return 'Morning or evening';
}

function calculateCircuitCost(nodes) {
  let totalCost = 0;
  nodes.forEach(n => {
    totalCost += n.visitorData?.ticketPrice || 0;
  });
  
  // Add estimated transport cost (₹15 per km)
  let totalDistance = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    totalDistance += haversineKm(nodes[i].lat, nodes[i].lng, nodes[i + 1].lat, nodes[i + 1].lng);
  }
  
  const transportCost = totalDistance * 15;
  const foodCost = nodes.length * 150; // ₹150 per place for food/beverages
  
  return {
    tickets: totalCost,
    transport: Math.round(transportCost),
    food: foodCost,
    total: Math.round(totalCost + transportCost + foodCost)
  };
}

function calculateDifficulty(totalDuration, placeCount) {
  if (totalDuration > 8 || placeCount > 5) return 'High';
  if (totalDuration > 5 || placeCount > 3) return 'Medium';
  return 'Easy';
}

function generateCircuitDescription(community, nodes) {
  const placeNames = nodes.slice(0, 3).map(n => n.name).join(', ');
  const moreCount = nodes.length - 3;
  
  return `Explore ${community.name}'s heritage through ${nodes.length} significant sites including ${placeNames}${moreCount > 0 ? ` and ${moreCount} more` : ''}. This circuit offers insights into ${community.desc.toLowerCase()}.`;
}

// ─────────────────────────────────────────────────────────────
// TOURISM INSIGHTS GENERATION
// ─────────────────────────────────────────────────────────────
async function generateTourismInsights(nodes, edges, metrics, circuits) {
  const topHubs = Object.values(metrics)
    .sort((a, b) => b.tourismCentrality - a.tourismCentrality)
    .slice(0, 5);
  
  const topBridges = Object.values(metrics)
    .sort((a, b) => b.betweennessCentrality - a.betweennessCentrality)
    .slice(0, 5);
  
  const underutilized = Object.values(metrics)
    .filter(m => {
      const node = nodes.find(n => n.id === m.id);
      const expectedVisitors = m.degreeCentrality * 50000;
      const actualVisitors = node?.visitorData?.dailyAverage || 0;
      return actualVisitors < expectedVisitors * 0.7;
    })
    .sort((a, b) => b.degreeCentrality - a.degreeCentrality);

  const prompt = `You are a world-class tourism analyst specializing in Social Network Analysis for urban heritage destinations.

Analyze this Chennai heritage tourism network:

TOP HUBS (by tourism centrality):
${topHubs.map(h => `- ${h.name}: centrality=${h.tourismCentrality.toFixed(3)}, degree=${h.degree}`).join('\n')}

TOP BRIDGE SITES (by betweenness):
${topBridges.map(b => `- ${b.name}: betweenness=${b.betweennessCentrality.toFixed(3)}`).join('\n')}

TOURISM CIRCUITS:
${circuits.slice(0, 5).map(c => `- ${c.name}: ${c.nodes.length} sites, ${c.totalDuration}hrs, ₹${c.estimatedCost.total}`).join('\n')}

UNDERUTILIZED SITES:
${underutilized.slice(0, 3).map(u => `- ${u.name}: high potential but low visitors`).join('\n')}

Respond ONLY with valid JSON, no markdown fences:
{
  "networkOverview": "2-3 sentence summary of Chennai's heritage tourism network structure",
  "tourismHubsAnalysis": "Analysis of the top tourism hubs and their role in visitor flow",
  "circuitRecommendations": ["3-4 specific circuit recommendations for different visitor types"],
  "infrastructurePriorities": [{"site": "site name", "priority": "HIGH/MEDIUM/LOW", "recommendation": "specific improvement"}],
  "marketingInsights": {"primaryFocus": "where to focus marketing", "crossPromotion": "which sites to bundle"},
  "developmentOpportunities": ["2-3 underutilized sites with development potential"],
  "seasonalStrategies": {"peakSeason": "strategy for peak months", "offSeason": "strategy for lean months"},
  "snaTourismConclusion": "one powerful conclusion about using SNA for tourism development"
}`;

  try {
    const parsed = await queryNvidiaJSON(prompt, undefined, {
      temperature: 0.2,
      max_tokens: 1500,
      reasoning_budget: 4096,
      enable_thinking: true,
    });
    
    if (parsed) {
      return { ...parsed, engine: 'NVIDIA Nemotron-70B' };
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback to queryAI
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
// MAIN EXPORT — computeEnhancedChennaiSNA()
// ─────────────────────────────────────────────────────────────
export async function computeEnhancedChennaiSNA() {
  // Cache check
  try {
    const cached = localStorage.getItem(ENHANCED_CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < TTL) {
        console.log('[Enhanced SNA] Returning cached computation');
        return data;
      }
    }
  } catch {
    // ignore
  }

  console.log('[Enhanced SNA] Computing Chennai heritage network...');

  const nodes = CHENNAI_ENHANCED_NODES;
  const edges = buildEnhancedEdges(nodes);
  const metrics = computeEnhancedMetrics(nodes, edges);
  const communities = detectEnhancedCommunities(nodes, metrics);
  const circuits = generateTourismCircuits(nodes, edges, communities);
  const topEdges = [...edges].sort((a, b) => b.weight - a.weight).slice(0, 15);

  const rankedByCentrality = Object.values(metrics).sort((a, b) => b.weightedDegree - a.weightedDegree);
  const rankedByBetweenness = Object.values(metrics).sort((a, b) => b.betweennessCentrality - a.betweennessCentrality);
  const rankedByTourismCentrality = Object.values(metrics).sort((a, b) => b.tourismCentrality - a.tourismCentrality);
  const rankedByRecommendation = Object.values(metrics).sort((a, b) => b.recommendationScore - a.recommendationScore);

  const networkStats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    averageDegree: (2 * edges.length / nodes.length).toFixed(2),
    networkDensity: ((2 * edges.length) / (nodes.length * (nodes.length - 1))).toFixed(4),
    communities: communities.dynasty.length,
    largestCommunity: [...communities.dynasty].sort((a, b) => b.size - a.size)[0]?.name,
    mostCentralNode: rankedByCentrality[0]?.name,
    topBridgeNode: rankedByBetweenness[0]?.name,
    topTourismHub: rankedByTourismCentrality[0]?.name,
    topRecommendation: rankedByRecommendation[0]?.name,
    totalCircuits: circuits.length
  };

  // AI tourism insights
  let tourismInsights = null;
  try {
    tourismInsights = await generateTourismInsights(nodes, edges, metrics, circuits);
    console.log('[Enhanced SNA] AI tourism insights:', tourismInsights?.engine);
  } catch (err) {
    console.warn('[Enhanced SNA] AI tourism insights failed:', err.message);
  }

  const result = {
    nodes,
    edges,
    metrics,
    communities,
    circuits,
    topEdges,
    rankedByCentrality,
    rankedByBetweenness,
    rankedByTourismCentrality,
    rankedByRecommendation,
    networkStats,
    tourismInsights,
    computedAt: Date.now()
  };

  // Cache result
  try {
    localStorage.setItem(ENHANCED_CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }));
  } catch {
    // ignore storage errors
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// ITINERARY PLANNING WITH ENHANCED SNA
// ─────────────────────────────────────────────────────────────
export function planItineraryWithSNA(preferences) {
  const {
    duration = 8,
    interests = [],
    startLocation = 'central',
    mustVisit = [],
    avoid = [],
    transportMode = 'auto',
    visitorType = 'general'
  } = preferences;

  // This would be called with actual SNA data
  // Returns suggested itinerary with SNA insights
  
  return {
    suggestedPlaces: [],
    route: [],
    totalDuration: 0,
    totalDistance: 0,
    snaInsights: {
      theme: '',
      cohesion: 0,
      hiddenConnections: [],
      recommendations: []
    }
  };
}

export function analyzeItinerarySubgraph(placeNames, snaData) {
  if (!snaData || placeNames.length < 2) return null;

  const selectedNodes = snaData.nodes.filter(n =>
    placeNames.some(pn => 
      n.name.toLowerCase().includes(pn.toLowerCase()) ||
      pn.toLowerCase().includes(n.name.toLowerCase())
    )
  );

  if (selectedNodes.length < 2) return null;

  const selectedIds = new Set(selectedNodes.map(n => n.id));
  
  const selectedEdges = snaData.edges.filter(e =>
    selectedIds.has(e.source) && selectedIds.has(e.target)
  );

  const subgraphMetrics = {};
  selectedNodes.forEach(n => {
    subgraphMetrics[n.id] = {
      ...snaData.metrics[n.id],
      neighboursInSubgraph: snaData.metrics[n.id].neighbours.filter(nb => selectedIds.has(nb))
    };
  });

  const internalConnections = selectedEdges.length;
  const possibleConnections = selectedNodes.length * (selectedNodes.length - 1) / 2;
  const cohesion = possibleConnections > 0 ? internalConnections / possibleConnections : 0;

  // Calculate route efficiency
  let totalDistance = 0;
  for (let i = 0; i < selectedNodes.length - 1; i++) {
    totalDistance += haversineKm(
      selectedNodes[i].lat, selectedNodes[i].lng,
      selectedNodes[i + 1].lat, selectedNodes[i + 1].lng
    );
  }

  // Calculate total duration
  const totalDuration = selectedNodes.reduce((sum, n) => 
    sum + (n.visitorData?.avgDuration || 1), 0
  ) + (totalDistance / 30); // Add travel time

  return {
    nodes: selectedNodes,
    edges: selectedEdges,
    metrics: subgraphMetrics,
    cohesion,
    internalConnections,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration: Math.round(totalDuration * 10) / 10,
    snaInsights: {
      theme: detectItineraryTheme(selectedNodes, selectedEdges),
      cohesion,
      connectedDynasties: [...new Set(selectedNodes.map(n => n.dynasty))],
      connectedTypes: [...new Set(selectedNodes.map(n => n.placeType))],
      strongConnections: selectedEdges.filter(e => e.weight >= 4).map(e => ({
        from: e.sourceName,
        to: e.targetName,
        reasons: e.connections.map(c => c.label)
      }))
    }
  };
}

function detectItineraryTheme(nodes, edges) {
  const types = nodes.map(n => n.placeType);
  const dynasties = nodes.map(n => n.dynasty);

  if (types.every(t => t === 'temple')) return 'Temple Trail';
  if (types.includes('beach') && types.includes('park')) return 'Nature & Relaxation';
  if (dynasties.every(d => d === 'British Colonial')) return 'Colonial Heritage';
  if (dynasties.every(d => d === 'Pallava' || d === 'Chola')) return 'Ancient Dravidian';
  
  return 'Chennai Heritage Explorer';
}
