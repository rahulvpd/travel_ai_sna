import { GoogleGenerativeAI } from "@google/generative-ai";

const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Cache results in localStorage
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(`place_cache_${key}`);
    if (cached) {
      const data = JSON.parse(cached);
      // Cache for 24 hours
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data.value;
      }
    }
  } catch { console.error('Cache read error ignored'); }
  return null;
};

const setCachedData = (key, value) => {
  try {
    localStorage.setItem(`place_cache_${key}`, JSON.stringify({
      value,
      timestamp: Date.now()
    }));
  } catch { console.error('Cache save error ignored'); }
};

const TN_CIVILISATION_CONTEXT = `
Tamil Nadu is not just a state — it is one of Earth's oldest LIVING civilisations, with an unbroken cultural heritage spanning over 2,500 years.

KEY HISTORICAL FACTS:
- Three great ancient dynasties shaped Tamil Nadu: Chera, Chola, Pandya
- The Chola Empire (300 BCE – 1279 CE) was one of the longest-ruling empires in world history
- Tamil is one of the world's oldest classical languages (Sangam period 300 BCE)
- UNESCO World Heritage Sites: Great Living Chola Temples and Mahabalipuram
- Official government reference: https://www.tn.gov.in
- Archives reference: https://tamilnaduarchives.tn.gov.in
- District URLs: https://[district].nic.in

NARRATIVE TONE: "Tamil Nadu is a living civilisation" — frame descriptions around heritage, unbroken traditions, and ancient crafts.
`;

export const fetchPlaceDetails = async (placeName, userApiKey) => {
  const apiKey = userApiKey || ENV_API_KEY;
  // BUST CACHE: Using v2 key so old non-civilisational data is wiped
  const cacheKey = `v3_${placeName.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  if (!apiKey) return getDefaultPlaceData(placeName);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `${TN_CIVILISATION_CONTEXT}

You are a Tamil Nadu tourism expert and cultural historian. Provide REAL, ACCURATE data for "${placeName}" in Tamil Nadu, India. 
Do not treat this as a standard tourist checklist. Frame your descriptions highlighting its role in Tamil Nadu's living civilisation.

**RULES**: Only include REAL places that exist on Google Maps. No fabrication. Use the official district NIC URL data.

Return ONLY valid JSON:
{
  "name": "${placeName}",
  "civilisationalTagline": "A powerful 4-7 word tagline reflecting its living heritage",
  "description": "2-3 sentence rich description framing the place as part of Tamil Nadu's 2500-year living civilisation.",
  "highlights": ["Top cultural/historical attraction 1", "Top attraction 2", "Experience 3"],
  "bestTimeToVisit": "Month - Month",
  "averageTemp": "25°C",
  "nearestAirport": "Airport name (distance km)",
  "hotels": [
    {
      "name": "Real Hotel/Heritage Stay Name",
      "rating": 4.5,
      "priceRange": "₹2000-5000/night",
      "type": "Budget|Mid-Range|Heritage Luxury",
      "amenities": ["WiFi", "Pool"],
      "location": { "lat": 0.0, "lng": 0.0 }
    }
  ],
  "restaurants": [
    {
      "name": "Real Restaurant Name",
      "cuisine": "Authentic Local Cuisine",
      "rating": 4.3,
      "mustTry": "Signature traditional dish",
      "priceRange": "₹150-400/person",
      "location": { "lat": 0.0, "lng": 0.0 }
    }
  ],
  "attractions": [
    {
      "name": "Real Place Name",
      "type": "Temple|Monument|Nature|Craft Village|Market",
      "rating": 4.6,
      "entryFee": "Free or ₹amount",
      "timings": "6 AM - 8 PM",
      "description": "One-line civilisational/historical context",
      "location": { "lat": 0.0, "lng": 0.0 }
    }
  ],
  "mustTryFood": ["Traditional Dish 1", "Dish 2", "Dish 3"],
  "safetyTips": ["Tip 1", "Tip 2"],
  "travelTip": "One practical travel tip",
  "craftEconomy": "What local craft/manufacturing tradition is alive here?",
  "festivals": [
    {
      "name": "Local Festival Name",
      "description": "Deep civilisational significance of this festival",
      "month": "Month of celebration"
    }
  ],
  "culturalInsights": [
    "Fascinating cultural fact 1",
    "Living tradition fact 2"
  ]
}

Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    const data = JSON.parse(text);
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("PlaceDataService Error:", error);
    return getDefaultPlaceData(placeName);
  }
};

// ─── SEEDED DATA from Official Government Sources ───
// Source: https://chennai.nic.in/tourism/
const OFFICIAL_SEED_DATA = {
  'chennai': {
    name: 'Chennai',
    civilisationalTagline: "The living gateway to South India's ancient soul",
    description: "Chennai (formerly Madras) is not just a colonial city — it is built on ancient Pallava and Chola settlements documented in 1st-century CE Sangam literature. Today, it stands as the vibrant cultural capital of Tamil Nadu, where 2,000-year-old temple traditions coexist with one of India's largest modern automobile and IT hubs.",
    highlights: ["Marina Beach (World's 2nd longest urban beach)", "Kapaleeshwarar Temple (8th-century Pallava architecture)", "Government Museum Bronze Gallery (Chola masterpiece collection)", "Fort St. George (1644 colonial heritage)"],
    bestTimeToVisit: "November - February",
    averageTemp: "28°C",
    nearestAirport: "Chennai International Airport (Meenambakkam)",
    craftEconomy: "Classical arts (Carnatic music & Bharatanatyam) and Kanchipuram silk retail hub",
    hotels: [
      { name: 'ITC Grand Chola', rating: 4.8, priceRange: '₹12,000-25,000/night', type: 'Heritage Luxury', amenities: ['Pool', 'Spa', 'Fine Dining', 'WiFi'], location: { lat: 13.01, lng: 80.22 } },
      { name: 'Taj Coromandel', rating: 4.7, priceRange: '₹8,000-18,000/night', type: 'Luxury', amenities: ['Pool', 'Gym', 'WiFi'], location: { lat: 13.06, lng: 80.24 } },
      { name: 'Mylapore Heritage Homestay', rating: 4.5, priceRange: '₹3,000-6,000/night', type: 'Mid-Range', amenities: ['Traditional Food', 'AC', 'WiFi'], location: { lat: 13.03, lng: 80.26 } }
    ],
    restaurants: [
      { name: 'Murugan Idli Shop', cuisine: 'Authentic Local Cuisine', rating: 4.6, mustTry: 'Ghee Podi Idli & Filter Coffee', priceRange: '₹80-200/person', location: { lat: 13.04, lng: 80.25 } },
      { name: 'Southern Spice (Taj)', cuisine: 'Premium South Indian', rating: 4.8, mustTry: 'Meen Varuval (Fish Fry)', priceRange: '₹2000-4000/person', location: { lat: 13.06, lng: 80.24 } },
      { name: 'Mylai Karpagambal Mess', cuisine: 'Traditional Vegetarian', rating: 4.5, mustTry: 'Keerai Vadai (served on banana leaf)', priceRange: '₹100-200/person', location: { lat: 13.03, lng: 80.26 } }
    ],
    attractions: [
      { name: 'Marina Beach', type: 'Beach', rating: 4.7, entryFee: 'Free', timings: '24 hours', description: "12 km unbroken coastline. A living public commons where fishermen still cast nets as they have for millennia.", location: { lat: 13.05, lng: 80.28 } },
      { name: 'Kapaleeshwarar Temple', type: 'Temple', rating: 4.8, entryFee: 'Free', timings: '5 AM - 12 PM, 4 PM - 9 PM', description: "8th-century Dravidian masterpiece dedicated to Shiva. The epicenter of the living Arupathumoovar festival.", location: { lat: 13.03, lng: 80.26 } },
      { name: 'Government Museum (Bronze Gallery)', type: 'Museum', rating: 4.6, entryFee: '₹15', timings: '9:30 AM - 5 PM (Closed Fridays)', description: "Holds the world's most comprehensive collection of Chola dynasty bronzes, including the cosmic Nataraja.", location: { lat: 13.07, lng: 80.25 } },
      { name: 'Fort St. George', type: 'Monument', rating: 4.5, entryFee: '₹15', timings: '9 AM - 5 PM', description: "Built in 1644, the first British fortress in India. Now houses the Tamil Nadu legislature.", location: { lat: 13.08, lng: 80.28 } },
      { name: 'Valluvar Kottam', type: 'Monument', rating: 4.3, entryFee: 'Free', timings: '8 AM - 6 PM', description: "A temple chariot monument honoring Thiruvalluvar, author of the 2000-year-old Tamil ethical text, Tirukkural.", location: { lat: 13.05, lng: 80.24 } }
    ],
    images: [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200", // Kapaleeshwarar
      "https://images.unsplash.com/photo-1581403264188-d42173e3a6a1?q=80&w=1200", // Marina Beach
      "https://images.unsplash.com/photo-1594950294723-93d3b764cbac?q=80&w=1200", // Government Museum area
      "https://images.unsplash.com/photo-1627883907106-ccc38084a4ec?q=80&w=1200"  // Central Station Heritage
    ],
    mustTryFood: ['Filter Coffee (Kumbakonam Degree)', 'Ghee Podi Idli', 'Chettinad Chicken Curry', 'Marina Beach Nethili Fry', 'Jigarthanda'],
    safetyTips: ['Do not swim at Marina Beach — strong undercurrents are extremely dangerous', 'Dress modestly (shoulders/knees covered) when visiting active temples like Kapaleeshwarar'],
    travelTip: 'Visit the Mylapore temple tanks at 6 AM to hear live Carnatic vocal practice and witness the drawing of daily Kolams (rice-flour street art).',
    festivals: [
      {
        name: "Margazhi Music & Dance Festival",
        description: "The world's largest cultural event spanning December-January, where over 1,500 classical Carnatic music and Bharatanatyam dance performances happen across the city's sabhas.",
        month: "Dec - Jan"
      },
      {
        name: "Arupathumoovar Festival",
        description: "A colossal procession honoring the 63 Nayanmars (Saiva saints) at the Kapaleeshwarar Temple, drawing hundreds of thousands of devotees in a vibrant display of living devotion.",
        month: "March - April"
      },
      {
        name: "Pongal",
        description: "The traditional four-day Tamil harvest festival, celebrated with freshly harvested rice boiled in milk, traditional jallikattu (bull-taming), and elaborate kolams (rice-flour art).",
        month: "January"
      }
    ],
    culturalInsights: [
      "Chennai is the cradle of the South Indian film industry (Kollywood), a massive cultural force that often dictates the state's politics.",
      "The 'Kacheri' (classical music concert) culture in Chennai is unmatched globally, acting as a living preservation of ancient poetic texts set to intricate ragas.",
      "Kolam drawing is a daily morning ritual by women across the city, acting as both an offering to deities to invite prosperity and as food for ants."
    ],
    numberInsights: [
      { label: "Years of Heritage", value: 2000, prefix: "", suffix: "+" },
      { label: "City Founded", value: 1639, prefix: "", suffix: " CE" },
      { label: "Beach Length", value: 12, prefix: "", suffix: " km" },
      { label: "Daily Pilgrims (Mylapore)", value: 50, prefix: "", suffix: "K+" }
    ]
  }
};

const getDefaultPlaceData = (placeName) => {
  const key = placeName.toLowerCase().replace(/\s+/g, '');
  // Return official seed data if available
  if (OFFICIAL_SEED_DATA[key]) return OFFICIAL_SEED_DATA[key];

  return {
    name: placeName,
    description: `${placeName} is a beautiful destination in Tamil Nadu, known for its rich cultural heritage and stunning landscapes.`,
    highlights: ['Local Temples', 'Cultural Sites', 'Traditional Cuisine'],
    bestTimeToVisit: 'October - March',
    averageTemp: '28°C',
    hotels: [
      { name: `${placeName} Heritage Hotel`, rating: 4.3, priceRange: '₹2000-4000/night', type: 'Mid-Range' },
      { name: `${placeName} Budget Stay`, rating: 4.0, priceRange: '₹800-1500/night', type: 'Budget' },
    ],
    restaurants: [
      { name: 'Local Thali Restaurant', cuisine: 'South Indian', rating: 4.2, mustTry: 'Meals Thali', priceRange: '₹100-250/person' },
    ],
    attractions: [
      { name: `${placeName} Main Temple`, type: 'Temple', rating: 4.5, entryFee: 'Free', timings: '6 AM - 8 PM' },
    ],
    mustTryFood: ['Idli Sambar', 'Dosa', 'Filter Coffee'],
    safetyTips: ['Carry water bottles', 'Respect local customs'],
    travelTip: 'Best explored early morning to avoid heat.'
  };
};

export default { fetchPlaceDetails };

