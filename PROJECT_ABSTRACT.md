# TravelAI Tamil Nadu — Full Project Abstract & Technical Specification

**Version:** 2.0 | **Date:** March 2026 | **Platform:** React 19 + Vite 7 SPA

---

## 1. Executive Summary

**TravelAI Tamil Nadu** is a full-stack, AI-powered tourism intelligence platform designed to be the most comprehensive digital guide to Tamil Nadu's 38 districts. The application fuses a real-time, multi-engine Artificial Intelligence orchestration pipeline with the world's most detailed curated tourism dataset for the Indian state of Tamil Nadu, covering everything from 2,500-year-old civilisational heritage sites to modern IT parks, hospitals, and hidden gems. It is built for modern travellers who demand cultural depth, historical accuracy, and practical intelligence — not just generic travel tips.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND — React 19 SPA                      │
│  ┌───────────┐  ┌──────────────┐  ┌───────────────────────────────┐ │
│  │ React     │  │ React Router │  │ Framer Motion + Tailwind CSS  │ │
│  │ 19.2.0    │  │ v7.13.0      │  │ (Animations + Design System)  │ │
│  └───────────┘  └──────────────┘  └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                     SERVICES LAYER (Client-Side)                     │
│  ┌───────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ AI Orchestrator           │  │ PlaceDataService                 │ │
│  │  ├─ Gemini 2.0 Flash      │  │  ├─ Gemini 2.0 Flash (Prompt)   │ │
│  │  ├─ Groq/Llama 4 Scout    │  │  ├─ Official Seed Data (Chennai) │ │
│  │  └─ HuggingFace Fallback  │  │  └─ 24hr localStorage Cache      │ │
│  └───────────────────────────┘  └──────────────────────────────────┘ │
│  ┌───────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Sarvam AI (Translation)   │  │ Dual Map Services                │ │
│  │  └─ Indic Language NLP    │  │  ├─ Ola Maps (MapLibre GL)       │ │
│  └───────────────────────────┘  │  └─ OpenStreetMap (Leaflet v1.9) │ │
│                                  └──────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                    DATA LAYER ("districts.js")                       │
│   38-District Knowledge Base | ~1,350 lines | Curated from:         │
│   chennai.nic.in | tamilnadutourism.tn.gov.in | incredibleindia.org │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Technical Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | Core UI framework (uses concurrent features) |
| **Vite** | 7.2.4 | Build tool and HMR dev server |
| **React Router DOM** | 7.13.0 | Client-side routing (14 pages) |
| **Framer Motion** | 12.34.0 | Page transitions, scroll animations |
| **Tailwind CSS** | 3.4.17 | Utility-first design system |
| **Lucide React** | 0.563.0 | Icon library (30+ icons used) |
| **Three.js / R3F** | Fiber 9.5 | 3D animated background on Landing Page |
| **MapLibre GL** | 5.19.0 | Ola Maps vector tile renderer |
| **Leaflet** | 1.9.4 | OpenStreetMap tile renderer (free, no API key) |
| **React CountUp** | 6.5.3 | Animated numerical counters for statistics |
| **Axios** | 1.13.5 | HTTP client for backend API calls |

---

## 4. AI Architecture — 3-Engine Orchestration Pipeline

The core intelligence of TravelAI is its **fault-tolerant, 3-engine AI pipeline** in `aiOrchestrator.js`. Every AI query is routed through a priority-based fallback chain:

```
User Query
    │
    ▼
[Engine 1] Google Gemini 2.0 Flash ──────── (Highest quality, priority 1)
    │ 429/Error
    ▼
[Engine 2] Groq API + Llama 4 Scout 17B ─── (Fast inference, priority 2)
    │ Error
    ▼
[Engine 3] HuggingFace + Llama-3-8B ──────── (Free tier fallback, priority 3)
    │
    ▼
LocalStorage Cache (24-hour TTL, keyed by query hash)
```

### AI Functions Exported:
| Function | Description |
|---|---|
| `queryAI(prompt)` | Main fallback chain query |
| `queryMultiAI(prompt)` | Parallel multi-engine consensus query |
| `getPlaceHistory(name)` | Returns archaeological/dynastic context |
| `getPlaceUniqueness(name)` | Returns "what makes this place unlike anywhere else" |
| `getHiddenGems(name)` | Returns 6+ non-tourist, insider discoveries |
| `getChennaiTourismInsights(focus)` | Chennai-specific deep dive (Culture/History/Food/Festivals) |
| `generateTripPlan(params)` | Full itinerary generation with day-by-day breakdown |
| `generateBudgetEstimate(params)` | AI-powered cost breakdown by category |
| `translateToTamil(phrase)` | Tamil phrase translation with pronunciation guide |

### AI Caching Strategy:
All results are cached in `localStorage` with a 24-hour TTL using a versioned key pattern (`travelai_v3_{query_hash}`). This eliminates redundant API calls and makes the app functional offline for recently viewed destinations.

---

## 5. Application Pages (14 Routes)

| Route | Page Component | Key Function |
|---|---|---|
| `/` | `LandingPage.jsx` | Hero, animated 3D background (Three.js/R3F), search, trending destinations |
| `/destinations` | `Destinations.jsx` | Filterable grid of all 38 TN districts |
| `/destinations/:id` | `DestinationDetails.jsx` | Per-district deep dive: AI insights, maps, places, food, hotels, and full infrastructure data |
| `/planner` | `TripPlanner.jsx` | AI-powered trip planning form with multi-day itinerary generation |
| `/itinerary` | `Planner.jsx` | Extended itinerary builder and manager |
| `/itinerary/generate` | `ItineraryGenerator.jsx` | Standalone, PDF-ready itinerary generator |
| `/trending` | `TrendingPlaces.jsx` | Live trending destinations with social signal analysis |
| `/circuits` | `CulturalCircuits.jsx` | Pre-built cultural and heritage tour circuits across TN |
| `/food` | `FoodFinder.jsx` | AI food recommendation engine by region and cuisine preference |
| `/culture` | `CultureHub.jsx` | Cultural events calendar, Carnatic music season, temple festivals |
| `/tools` | `TravelTools.jsx` | 6 utilities: Weather, Budget, Packing List, Translation, Emergency Info, Safety |
| `/login` | `Login.jsx` | User authentication (AuthContext) |
| `/signup` | `Signup.jsx` | User registration |
| `/gemini-demo` | `GeminiDemo.jsx` | Live Gemini API demonstration interface |

---

## 6. Data Layer — districts.js Knowledge Base

The `districts.js` file (~1,350 lines, ~92 KB) is the project's **static knowledge backbone**. It contains hand-curated, source-verified data for all 38 Tamil Nadu districts using a structured schema.

### Data Schema per District (Chennai — most complete example):

| Category | Sub-fields |
|---|---|
| **Core** | `id`, `name`, `tagline`, `region`, `image`, `coordinates`, `bestTime`, `weather` |
| **Statistics** | 6 animated numerical facts (Marina length, monuments, annual tourists, etc.) |
| **Places** | 25+ entries with `name`, `category`, `emoji`, `description`, `historicalFact`, `timings`, `entryFee`, `rating`, `tips` |
| **Cultural Insights** | 11 deep ethnographic paragraphs |
| **Festivals** | 10 major events with description and month |
| **Hidden Gems** | 12+ entries with `crowd` rating and insider `tips` |
| **Food Guide** | 14 specific dishes with exact restaurant recommendations |
| **Practical Info** | Airport, transport options, best areas to stay, safety tips |
| **Infrastructure** | `petrolPumps`, `transportHubs`, `malls`, `markets`, `hospitals`, `itParks`, `education` |
| **Hotels** | 7 curated stays (Luxury → Budget) |
| **Entertainment** | 5 venues (cinema, amusement parks, boating) |

### Data Sources Referenced:
- `chennai.nic.in` — Official NIC Chennai portal
- `tamilnadutourism.tn.gov.in` — Official TN Tourism
- `incredibleindia.org` — Government of India tourism portal
- `britannica.com/place/Tamil-Nadu` — Historical verification
- `tamilnaduarchives.tn.gov.in` — Archaeological/historical context

---

## 7. Mapping System

### Ola Maps (Primary)
- **SDK:** MapLibre GL v5.19.0
- **Style API:** `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=...`
- **API Key Injection:** Embedded in style URL AND `transformRequest` callback to cover all tile fetch types
- **Features:** Custom animated marker, popup, navigation controls, Ola Maps attribution

### OpenStreetMap (Secondary — Free Fallback)
- **SDK:** Leaflet v1.9.4 (dynamically imported via `import('leaflet')`)
- **Tile Source:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Cost:** Zero — no API key required
- **Marker Cleanup:** Async `isDestroyed` guard prevents "container already initialized" errors on tab switches

---

## 8. External APIs & Environment Variables

| Variable | API | Purpose |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Google Gemini 2.0 Flash | Primary AI engine for all travel content |
| `VITE_GROQ_API_KEY` | Groq Cloud (Llama 4 Scout) | Secondary AI engine — ultra-fast inference |
| `VITE_GROQ_MODEL` | Configurable | Defaults to `meta-llama/llama-4-scout-17b-16e-instruct` |
| `VITE_HF_API_URL` | HuggingFace Inference | Fallback AI — `Meta-Llama-3-8B-Instruct` |
| `VITE_OLA_MAPS_API_KEY` | Ola Maps API | Vector map rendering for India |
| `VITE_OLA_CLIENT_ID` | Ola OAuth | Client credentials for Ola services |
| `VITE_OLA_CLIENT_SECRET` | Ola OAuth | Client secret for Ola services |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JS API | (Optional — replaced by Leaflet/OSM in map component) |
| `VITE_SARVAM_API_KEY` | Sarvam AI | Indic language NLP for Tamil translation |

---

## 9. Key UI/UX Design Decisions

- **Dark Glassmorphism Theme**: Dark background (`#0a0a0f`) with `bg-white/5` glass cards, `border-white/10` borders, and `backdrop-blur-xl` throughout
- **Color System**: `vibrant-gold` (#FFCC00), `vibrant-pink` (#FF0080), `vibrant-orange` (#FF6B00) for accent hierarchy
- **Animated Background**: A reactive Three.js particle field renders on the landing page using `@react-three/fiber` and `@react-three/drei`
- **Animated Counters**: `AnimatedCounter.jsx` (backed by `react-countup`) shows district statistics entering the viewport
- **Font Stack**: `Outfit` (body), `Syne` (headings), `Clash Display` (hero headlines) — all loaded via Google Fonts + Fontshare CDN
- **ARIA & Semantic HTML**: Unique IDs on all interactive elements; `<button>`, `<nav>`, `<main>` semantic HTML throughout

---

## 10. Chennai — Special Extended Module

Chennai receives a dedicated AI explorer section beyond the standard destination template:

1. **AI Explorer Tabs**: Four dynamic tabs — `Culture`, `Festivals`, `Food`, `Heritage` — each triggering `getChennaiTourismInsights(focus)` via the AI pipeline
2. **Animated Numerical Stats**: 6 counters (Year Founded: 1639, Beach: 13 km, Monuments: 150+, etc.)
3. **25+ Curated Places**: From Marina Beach to Cholamandal Artists' Village — full article-style entries
4. **10 Major Festivals**: Detailed descriptions of Margazhi, Pongal, Arupathumoovar, etc.
5. **12 Hidden Gems**: Including insider tips for Theosophical Society, Higginbothams, Vivekananda House
6. **Infrastructure Dashboard**: Hospitals (Apollo, MGM, Sankara Nethralaya), IT Parks (TIDEL, SIPCOT), Education (IIT Madras, Anna University), Markets (Pondy Bazaar, Ritchie Street, Koyambedu)

---

## 11. TravelTools Module — 6 AI-Powered Utilities

| Tool | Technology | Output |
|---|---|---|
| **Weather** | Realtime weather API | Temperature, humidity, forecast |
| **Budget Estimator** | Gemini AI | Detailed cost breakdown by accommodation, food, transport |
| **Packing List** | Gemini AI | Climate-context-aware packing checklist |
| **Tamil Translator** | Sarvam AI → Gemini AI (fallback) | Romanized Tamil + pronunciation guide |
| **Emergency Info** | Static + AI | Hospital, police, embassy contacts per district |
| **Safety Tips** | Gemini AI | Destination-specific safety guidelines |

---

## 12. Build & Deployment Configuration

| Config | Value |
|---|---|
| **Build Tool** | Vite 7.2.4 |
| **Output Dir** | `dist/` |
| **Module Type** | ES Modules (`"type": "module"`) |
| **CSS Processing** | PostCSS + Autoprefixer + Tailwind |
| **Lint** | ESLint 9 with `react-hooks` and `react-refresh` plugins |
| **Deployment Target** | Vercel (`vercel.json` configured) |
| **Docker Support** | `docker-compose.yml` present for containerized backend |

---

## 13. Performance & Caching

- **Client-Side Caching**: All AI responses cached in `localStorage` for 24 hours to minimize API quota usage
- **Dynamic Imports**: Leaflet loaded via `import('leaflet')` (code-split, not in main bundle)
- **Image Optimization**: All images sourced from Unsplash CDN with `?q=80&w=800` parameters for quality/size balance
- **Vite Bundling**: Uses Rollup-based chunking; chunk size warning threshold at default (500 KB)

---

## 14. Future Scope

- Migrate AI calls to a FastAPI + PostgreSQL backend (architecture already scaffolded in `/backend`)
- Integrate **Sarvam AI** for full Tamil-language interface option
- Add **real-time hotel price comparison** via agoda/booking API
- Implement **user profiles and saved itineraries** with database persistence
- Build a **Progressive Web App (PWA)** layer for full offline access

---

*Generated from comprehensive analysis of all source files in `c:\Users\HP\Desktop\tourism`*
*Data curated from official TN government sources: tn.gov.in, tamilnadutourism.tn.gov.in, chennai.nic.in*
