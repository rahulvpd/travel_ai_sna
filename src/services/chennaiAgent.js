// src/services/chennaiAgent.js
// Chennai AI Research Agent — uses existing queryAI() from aiOrchestrator.js

import { queryAI } from './aiOrchestrator.js';

const PREFIX = 'chennai_agent_v1_';
const TTL = 24 * 60 * 60 * 1000;

// ── FALLBACK INTELLIGENCE (Static "Deep Research" Data) ───────────────────
// Ensures data is present even if AI services are down or keys are missing.
const FALLBACK_INTEL = {
  "Marina Beach": {
    architectural: {
      primaryStyle: "Indo-Saracenic Promenade",
      era: "British Colonial (1884)",
      builtBy: "Mountstuart Elphinstone Grant Duff",
      structuralFeatures: ["Promenade", "Statues of Tamil scholars", "Triumph of Labour statue"],
      materials: "Sand, granite statues",
      artisticMotifs: "Dravidian and Victorian fusion in nearby buildings",
      uniqueArchitectural: "The second longest urban beach in the world with a continuous heritage promenade."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British Raj",
      keyRulers: [{ ruler: "Grant Duff", period: "1880s", contribution: "Built the promenade" }],
      historicalEvents: ["1908: Freedom struggle meetings", "1968: World Tamil Conference statues installed"],
      colonialHistory: "Developed as a recreational promenade for British elite.",
      livingLegacy: "The statues of Tamil literary giants define the cultural skyline."
    },
    artTraditions: {
      associatedDance: "Street performances",
      associatedMusic: "Political oratory and folk songs",
      festivals: ["Kaanum Pongal (massive gathering)", "Chennai Sangamam"],
      craftTraditions: "Shell crafts",
      literaryConnections: "Featured in countless Tamil novels and films",
      livingTraditions: "Sundal selling, kite flying"
    },
    visitorIntel: {
      bestTimeOfDay: "Sunrise (5:30 AM) or Evening (5:00 PM)",
      bestMonths: "December to February",
      insiderTips: [
        "Visit the lighthouse for a top-down view.",
        "Try the 'Pattani Sundal' from the beach vendors.",
        "Swimming is dangerous and prohibited.",
        "Early morning cricket matches are a cultural spectacle."
      ],
      hiddenSpots: ["Broken Bridge (Adyar estuary end)", "Avvaiyar Statue garden"],
      commonMistakes: ["Swimming deep (strong undercurrents)", "Littering"],
      nearbyEats: ["Buhari Hotel", "Ratna Cafe (Triplicane)"],
      photoSpots: ["Triumph of Labour Statue", "Lighthouse top"],
      accessibilityNotes: "Ramps available at specific entry points (near Gandhi statue)."
    }
  },
  "Kapaleeshwarar Temple": {
    architectural: {
      primaryStyle: "Dravidian",
      era: "16th Century (Rebuilt)",
      builtBy: "Vijayanagara Kings",
      structuralFeatures: ["37m Gopuram", "Temple Tank (Teppakulam)", "Mandapams"],
      materials: "Granite, Stucco",
      artisticMotifs: "Yalis, mythological scenes, 63 Nayanmars",
      uniqueArchitectural: "Classic Dravidian style with a massive tank in an urban setting."
    },
    dynasty: {
      foundingEra: "Pallava (Original)",
      foundingDynasty: "Pallava / Vijayanagara",
      keyRulers: [{ ruler: "Nayanmars", period: "7th Century", contribution: "Sung hymns (Thevaram)" }],
      historicalEvents: ["Destruction by Portuguese (1560s)", "Rebuilding in current site"],
      colonialHistory: "Rebuilt during the colonial era but in traditional style.",
      livingLegacy: "The hub of Saivaite culture in Chennai."
    },
    artTraditions: {
      associatedDance: "Bharatanatyam (Mylapore is a hub)",
      associatedMusic: "Tevaram, Nadaswaram",
      festivals: ["Arubathumoovar (March-April)", "Teppam (Float festival)"],
      craftTraditions: "Garland making, Kolam",
      literaryConnections: "Poompavai Padigam by Sambandar",
      livingTraditions: "Oduvars singing daily, Pradosham rituals"
    },
    visitorIntel: {
      bestTimeOfDay: "Early morning (6 AM) or Evening (6 PM)",
      bestMonths: "Mar-Apr (Festival season) or Dec-Jan",
      insiderTips: [
        "Visit the 'Goshala' (cow shed) inside.",
        "Don't miss the peacock worshipping Shiva sculpture.",
        "Check out the bronze statues of the 63 saints.",
        "Mylai Jannal Kadai nearby for snacks."
      ],
      hiddenSpots: ["Punnai tree shrine", "Quiet pillared halls"],
      commonMistakes: ["Entering with footwear", "Taking photos in the sanctum (forbidden)"],
      nearbyEats: ["Mylai Karpagambal Mess", "Rayar's Mess"],
      photoSpots: ["Gopuram from North Mada Street", "Temple Tank reflection"],
      accessibilityNotes: "Wheelchairs available at entrance."
    }
  },
  "Fort St. George": {
    architectural: {
      primaryStyle: "Military / Colonial",
      era: "17th Century (1640)",
      builtBy: "British East India Company (Francis Day & Andrew Cogan)",
      structuralFeatures: ["Thick bastions", "St. Mary's Church", "Fort Museum"],
      materials: "Brick, mortar, granite",
      artisticMotifs: "Minimalist military utility",
      uniqueArchitectural: "The first British fortress in India."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British East India Company",
      keyRulers: [{ ruler: "Elihu Yale", period: "1687-1692", contribution: "Governor, benefactor of Yale University" }],
      historicalEvents: ["French siege 1746", "Hyder Ali's raids"],
      colonialHistory: "The seat of power for the Madras Presidency for 300 years.",
      livingLegacy: "Still houses the Tamil Nadu Legislative Assembly."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Military bands",
      festivals: ["Republic Day parade nearby"],
      craftTraditions: "Colonial furniture making (historical)",
      literaryConnections: "Mentioned in colonial memoirs",
      livingTraditions: "Political administration"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning (9 AM)",
      bestMonths: "Nov-Feb",
      insiderTips: ["Visit St. Mary's Church, the oldest Anglican church east of Suez.", "The Museum has the best collection of colonial coins and uniforms."],
      hiddenSpots: ["Wellesley House (ruins)", "Old tombstones in churchyard"],
      commonMistakes: ["Going on Friday (Museum closed)", "Carrying cameras into restricted assembly areas"],
      nearbyEats: ["Ambur Star Biryani (Parrys)", "Hotel Saravana Bhavan"],
      photoSpots: ["Moat and ramparts", "St. Mary's Church exterior"],
      accessibilityNotes: "Limited wheelchair access in old buildings."
    }
  },
  "Government Museum (Egmore)": {
    architectural: {
      primaryStyle: "Indo-Saracenic",
      era: "19th Century (1851)",
      builtBy: "British Madras Presidency (Henry Irwin)",
      structuralFeatures: ["Stained glass", "High domes", "Exposed brickwork"],
      materials: "Brick, stone, timber",
      artisticMotifs: "Mughal arches mixed with Victorian gothic",
      uniqueArchitectural: "One of the finest Indo-Saracenic complexes in India."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British Raj",
      keyRulers: [{ ruler: "Edward Balfour", period: "1851", contribution: "First Superintendent" }],
      historicalEvents: ["Establishment of the Bronze Gallery"],
      colonialHistory: "Established to catalogue the wealth of South Indian history.",
      livingLegacy: "Houses the world's best Chola bronzes."
    },
    artTraditions: {
      associatedDance: "Nataraja bronzes depict cosmic dance",
      associatedMusic: "Musical pillars in exhibits",
      festivals: ["Museum week celebrations"],
      craftTraditions: "Bronze casting (Lost wax method documented)",
      literaryConnections: "Research centre for Tamil epigraphy",
      livingTraditions: "Conservation workshops"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning (10 AM)",
      bestMonths: "Any (Indoors)",
      insiderTips: ["The Bronze Gallery is world-class; spend 80% of your time there.", "Don't miss the Amaravati Stupa relics.", "The National Art Gallery building is visually stunning."],
      hiddenSpots: ["Botany section (often quiet)", "Children's museum"],
      commonMistakes: ["Skipping the Bronze gallery", "Coming on Friday (Holiday)"],
      nearbyEats: ["Mathsya (Egmore)", "Sangeetha Veg"],
      photoSpots: ["Museum Theatre exterior", "Entrance archway"],
      accessibilityNotes: "Ramps available for main galleries."
    }
  },
  "Mahabalipuram (Day Trip)": {
    architectural: {
      primaryStyle: "Dravidian Rock-cut",
      era: "7th Century CE",
      builtBy: "Pallava Dynasty",
      structuralFeatures: ["Monolithic chariots (Rathas)", "Bas-reliefs", "Shore Temple"],
      materials: "Granite",
      artisticMotifs: "Elephants, deities, daily life scenes",
      uniqueArchitectural: "Transition from rock-cut to structural temples."
    },
    dynasty: {
      foundingEra: "Pallava",
      foundingDynasty: "Pallava",
      keyRulers: [{ ruler: "Narasimhavarman I (Mamalla)", period: "630-668 CE", contribution: "Commissioned the major monuments" }],
      historicalEvents: ["Visit of Hiuen Tsang", "2004 Tsunami revealing underwater structures"],
      colonialHistory: "Seven Pagodas myth fascinated Europeans.",
      livingLegacy: "Still a center for stone carving artisans."
    },
    artTraditions: {
      associatedDance: "Mamallapuram Dance Festival",
      associatedMusic: "Classical instruments in sculptures",
      festivals: ["Indian Dance Festival (Dec-Jan)"],
      craftTraditions: "Stone carving (GI Tagged)",
      literaryConnections: "Sangam literature references",
      livingTraditions: "Stone sculpting workshops"
    },
    visitorIntel: {
      bestTimeOfDay: "Early Morning (6 AM) for Shore Temple sunrise.",
      bestMonths: "Nov-Feb",
      insiderTips: ["Krishna's Butterball is a fun photo op.", "Visit the Five Rathas first to beat the bus crowds.", "The lighthouse offers a great view of the coast."],
      hiddenSpots: ["Tiger Cave (on the way)", "Mahishasuramardini Cave"],
      commonMistakes: ["Visiting at noon (granite gets hot)", "Ignoring the 'Descent of the Ganges' relief details"],
      nearbyEats: ["Moonrakers", "Gecko Cafe"],
      photoSpots: ["Shore Temple at sunrise", "Arjuna's Penance"],
      accessibilityNotes: "Sandy terrain makes wheelchairs difficult in some areas."
    }
  },
  "San Thome Cathedral Basilica": {
    architectural: {
      primaryStyle: "Neo-Gothic",
      era: "19th Century (1896)",
      builtBy: "British (rebuilding Portuguese original)",
      structuralFeatures: ["High spire (155ft)", "Stained glass windows", "Underground tomb"],
      materials: "Masonry, glass",
      artisticMotifs: "Christian themes, saints",
      uniqueArchitectural: "One of only 3 basilicas in the world built over an Apostle's tomb."
    },
    dynasty: {
      foundingEra: "Portuguese Colonial (Original 1523)",
      foundingDynasty: "Portuguese / British",
      keyRulers: [{ ruler: "St. Thomas", period: "1st Century", contribution: "Apostle of Jesus" }],
      historicalEvents: ["Martyrdom of St. Thomas", "Portuguese settlement of Mylapore"],
      colonialHistory: "Central to the Portuguese 'San Thome de Meliapor'.",
      livingLegacy: "Major pilgrimage site for Christians."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Choir music",
      festivals: ["Feast of St. Thomas (July)", "Christmas"],
      craftTraditions: "None specific",
      literaryConnections: "Accounts of Marco Polo",
      livingTraditions: "Daily mass, pilgrimages"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning or Evening mass",
      bestMonths: "Dec (Christmas) or July",
      insiderTips: ["Visit the museum at the back to see the spear head and relics.", "The underground tomb chapel is very peaceful."],
      hiddenSpots: ["Pole of St. Thomas (behind)", "Museum artefacts"],
      commonMistakes: ["Visiting during service if just sightseeing", "Missing the museum"],
      nearbyEats: ["Sangeetha (Santhome)", "Rayar's Mess (Mylapore nearby)"],
      photoSpots: ["White facade against blue sky", "Stained glass interiors"],
      accessibilityNotes: "Ramps available."
    }
  },
  "Arignar Anna Zoological Park (Vandalur Zoo)": {
    architectural: {
      primaryStyle: "Naturalistic Moat-based",
      era: "Modern (1985)",
      builtBy: "Tamil Nadu Forest Department",
      structuralFeatures: ["Open-air enclosures", "Moat barriers", "Otteri Lake"],
      materials: "Natural terrain",
      artisticMotifs: "Wildlife conservation",
      uniqueArchitectural: "One of South Asia's largest zoos."
    },
    dynasty: {
      foundingEra: "British Colonial (Original 1855)",
      foundingDynasty: "British",
      keyRulers: [{ ruler: "Edward Balfour", period: "1855", contribution: "Founded original zoo" }],
      historicalEvents: ["Shift to Vandalur in 1985"],
      colonialHistory: "Started as People's Park Zoo.",
      livingLegacy: "Conservation breeding programs."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Nature sounds",
      festivals: ["Wildlife Week"],
      craftTraditions: "None",
      literaryConnections: "Modern eco-literature",
      livingTraditions: "Zoo school"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning (9 AM sharp)",
      bestMonths: "Nov-Feb",
      insiderTips: ["Rent a cycle or take the battery car.", "Lion Safari is worth the extra ticket.", "Plastic free zone."],
      hiddenSpots: ["Otteri Lake watchtower", "Nocturnal animal house"],
      commonMistakes: ["Walking the whole way (too big)", "Feeding animals (strict fine)"],
      nearbyEats: ["Zoo canteen (basic)", "Highway restaurants"],
      photoSpots: ["Entrance arch", "White tiger enclosure"],
      accessibilityNotes: "Wheelchairs and battery cars available."
    }
  },
  "Valluvar Kottam": {
    architectural: {
      primaryStyle: "Dravidian Revival",
      era: "Modern (1976)",
      builtBy: "M. Karunanidhi (CM)",
      structuralFeatures: ["39m Stone Chariot", "Large Auditorium", "Kural inscriptions"],
      materials: "Concrete, Granite overlay",
      artisticMotifs: "Temple car replica",
      uniqueArchitectural: "A monument dedicated to a poet, shaped like a temple chariot."
    },
    dynasty: {
      foundingEra: "Post-Independence",
      foundingDynasty: "DMK Government",
      keyRulers: [{ ruler: "M. Karunanidhi", period: "1976", contribution: "Commissioned the monument" }],
      historicalEvents: ["Inauguration by President Fakhruddin Ali Ahmed"],
      colonialHistory: "Built on a reclaimed lake area.",
      livingLegacy: "Symbol of Tamil pride and literature."
    },
    artTraditions: {
      associatedDance: "Cultural events in auditorium",
      associatedMusic: "Tamil music concerts",
      festivals: ["Thiruvalluvar Day (Jan)"],
      craftTraditions: "Handicraft expos often held here",
      literaryConnections: "Thirukkural (1330 couplets inscribed)",
      livingTraditions: "Literary gatherings"
    },
    visitorIntel: {
      bestTimeOfDay: "Late Afternoon / Evening",
      bestMonths: "Jan (Pongal)",
      insiderTips: ["Read the couplets in the corridors.", "Great place for a quiet evening walk.", "Check if a handicraft expo is on."],
      hiddenSpots: ["Roof garden terrace (sometimes open)"],
      commonMistakes: ["Visiting at noon (hot stone)", "Thinking it's a temple (it's a memorial)"],
      nearbyEats: ["Nungambakkam high street cafes", "Eden Veg"],
      photoSpots: ["Front view of the Chariot", "Stairs leading up"],
      accessibilityNotes: "Steps to the main hall, may be difficult."
    }
  },
  "Parthasarathy Temple (Triplicane)": {
    architectural: {
      primaryStyle: "Dravidian",
      era: "8th Century CE",
      builtBy: "Pallavas",
      structuralFeatures: ["Coloured Gopuram", "Mandapams", "Temple Tank"],
      materials: "Granite",
      artisticMotifs: "Vishnu avatars, battle scenes",
      uniqueArchitectural: "Houses 5 avatars of Vishnu."
    },
    dynasty: {
      foundingEra: "Pallava",
      foundingDynasty: "Pallava / Chola / Vijayanagara",
      keyRulers: [{ ruler: "Nandivarman II", period: "8th Century", contribution: "Built original structure" }],
      historicalEvents: ["Battle of Adyar nearby", "Used as barracks by French/British"],
      colonialHistory: "Witnessed colonial wars.",
      livingLegacy: "Divya Desam, rich Vaishnavite tradition."
    },
    artTraditions: {
      associatedDance: "Traditional temple arts",
      associatedMusic: "Divya Prabandham chanting",
      festivals: ["Vaikunta Ekadasi", "Float Festival"],
      craftTraditions: "Flower garlands, prasad making",
      literaryConnections: "Sung by Alvars",
      livingTraditions: "Daily Theertham distribution"
    },
    visitorIntel: {
      bestTimeOfDay: "Early Morning or Evening",
      bestMonths: "Dec-Jan (Vaikunta Ekadasi)",
      insiderTips: ["The 'Puliyodarai' (tamarind rice) prasad is legendary.", "See the main deity's face scars (from Mahabharata war)."],
      hiddenSpots: ["Narasimha shrine (separate entrance)", "Tank steps"],
      commonMistakes: ["Wearing shorts (strict dress code)", "Using phone inside sanctum"],
      nearbyEats: ["Ratna Cafe (Sambar Idli)", "Triplicane mess"],
      photoSpots: ["Temple tank view", "Gopuram from street"],
      accessibilityNotes: "Crowded, some steps."
    }
  },
  "Santhome Beach": {
    architectural: {
      primaryStyle: "Natural / Urban Beach",
      era: "Natural",
      builtBy: "Nature",
      structuralFeatures: ["Sandy shore", "View of Cathedral spire"],
      materials: "Sand",
      artisticMotifs: "None",
      uniqueArchitectural: "Beach backed by a Basilica."
    },
    dynasty: {
      foundingEra: "Natural",
      foundingDynasty: "None",
      keyRulers: [],
      historicalEvents: ["Landing of St. Thomas (legend)"],
      colonialHistory: "Portuguese landing site.",
      livingLegacy: "Local fishing community."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Sea waves",
      festivals: ["None specific"],
      craftTraditions: "Fishing nets mending",
      literaryConnections: "None",
      livingTraditions: "Fishing"
    },
    visitorIntel: {
      bestTimeOfDay: "Sunrise",
      bestMonths: "Nov-Feb",
      insiderTips: ["Much quieter than Marina.", "Good for watching fishermen launch boats."],
      hiddenSpots: ["Old ruins near foreshore (sometimes visible)"],
      commonMistakes: ["Swimming (unsafe)", "Expect facilities (few)"],
      nearbyEats: ["Santhome Inn", "Street corn"],
      photoSpots: ["Cathedral spire from beach", "Fishing boats"],
      accessibilityNotes: "Sand walking."
    }
  },
  "Elliot's Beach (Besant Nagar Beach)": {
    architectural: {
      primaryStyle: "Urban Beach",
      era: "Modern usage",
      builtBy: "Nature / Corporation",
      structuralFeatures: ["Schmidt Memorial", "Promenade"],
      materials: "Sand, Concrete",
      artisticMotifs: "None",
      uniqueArchitectural: "Karl Schmidt Memorial (Danish sailor)."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British",
      keyRulers: [{ ruler: "Edward Elliot", period: "19th Century", contribution: "Governor/Magistrate" }],
      historicalEvents: ["Schmidt's drowning 1930"],
      colonialHistory: "Named after Edward Elliot.",
      livingLegacy: "Popular youth hangout."
    },
    artTraditions: {
      associatedDance: "Zumba on weekends",
      associatedMusic: "Busking sometimes",
      festivals: ["Pongal", "Food festivals"],
      craftTraditions: "Mehendi artists",
      literaryConnections: "Modern Chennai novels",
      livingTraditions: "Evening walks"
    },
    visitorIntel: {
      bestTimeOfDay: "Evening (4 PM onwards)",
      bestMonths: "All year (evenings)",
      insiderTips: ["Try the fried fish stalls.", "Schmidt Memorial is a key landmark.", "Less crowded than Marina."],
      hiddenSpots: ["Cozee restaurant area", "Broken bridge view"],
      commonMistakes: ["Parking on weekends (difficult)", "Littering"],
      nearbyEats: ["Murugan Idli Shop", "Mash"],
      photoSpots: ["Schmidt Memorial", "Sunrise"],
      accessibilityNotes: "Paved promenade available."
    }
  },
  "Guindy National Park": {
    architectural: {
      primaryStyle: "Tropical Dry Evergreen Forest",
      era: "Natural / Protected 1976",
      builtBy: "Nature",
      structuralFeatures: ["Forest canopy", "Snake Park", "Children's Park"],
      materials: "Trees, scrub",
      artisticMotifs: "Nature",
      uniqueArchitectural: "National Park inside a megacity."
    },
    dynasty: {
      foundingEra: "British Colonial (Game Reserve)",
      foundingDynasty: "British",
      keyRulers: [{ ruler: "Gilbert Thomas", period: "1670s", contribution: "Created Guindy Lodge" }],
      historicalEvents: ["Declared National Park 1978"],
      colonialHistory: "Governor's hunting ground.",
      livingLegacy: "Lung of Chennai."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Bird calls",
      festivals: ["Wildlife Week"],
      craftTraditions: "None",
      literaryConnections: "None",
      livingTraditions: "Conservation"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning (9 AM)",
      bestMonths: "Oct-Feb (Migratory birds)",
      insiderTips: ["The Snake Park next door is excellent.", "Spot Blackbucks and Spotted Deer."],
      hiddenSpots: ["Polo ground view", "Forest trails (restricted)"],
      commonMistakes: ["Making noise (scares animals)", "Feeding monkeys"],
      nearbyEats: ["Hot Chips (Adyar)", "IIT Madras canteen (restricted)"],
      photoSpots: ["Deer herds", "Snake park demos"],
      accessibilityNotes: "Paved paths in Children's park."
    }
  },
  "Ripon Building (Chennai Corporation)": {
    architectural: {
      primaryStyle: "Indo-Saracenic / Neoclassical",
      era: "1913",
      builtBy: "Loganatha Mudaliar",
      structuralFeatures: ["White Chunam finish", "Clock tower (Westminster chime)", "Corinthian columns"],
      materials: "Brick, Lime mortar",
      artisticMotifs: "Floral designs, colonial crests",
      uniqueArchitectural: "Stark white Indo-Saracenic, unlike the red brick High Court."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British Raj",
      keyRulers: [{ ruler: "Lord Ripon", period: "1880-1884", contribution: "Father of Local Self-Govt" }],
      historicalEvents: ["Madras Corporation is oldest in India (1688)"],
      colonialHistory: "Seat of municipal power.",
      livingLegacy: "Still the Corporation headquarters."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Westminster chimes",
      festivals: ["Madras Day"],
      craftTraditions: "Lime plastering",
      literaryConnections: "Civic history records",
      livingTraditions: "Civic administration"
    },
    visitorIntel: {
      bestTimeOfDay: "Evening (Lighting)",
      bestMonths: "Any",
      insiderTips: ["Best viewed from outside/evening lights.", "Check out the Victoria Public Hall next door."],
      hiddenSpots: ["Rear garden", "Clock tower mechanism"],
      commonMistakes: ["Trying to enter without work (restricted)", "Missing the Metro station view"],
      nearbyEats: ["Central Station canteens", "Saravana Bhavan"],
      photoSpots: ["Front facade with Metro rail", "Illuminated night view"],
      accessibilityNotes: "Public offices accessible."
    }
  },
  "Cholamandal Artists' Village": {
    architectural: {
      primaryStyle: "Vernacular / Modern",
      era: "1966",
      builtBy: "K.C.S. Paniker",
      structuralFeatures: ["Open studios", "Sculpture garden", "Brick exposed houses"],
      materials: "Brick, terracotta, wood",
      artisticMotifs: "Contemporary Indian art",
      uniqueArchitectural: "Self-sustaining artist commune design."
    },
    dynasty: {
      foundingEra: "Post-Independence",
      foundingDynasty: "Artist Collective",
      keyRulers: [{ ruler: "K.C.S. Paniker", period: "1966", contribution: "Founder" }],
      historicalEvents: ["Madras Art Movement"],
      colonialHistory: "Reaction against colonial art school styles.",
      livingLegacy: "Thriving art community."
    },
    artTraditions: {
      associatedDance: "Performance art",
      associatedMusic: "Chamber concerts",
      festivals: ["Art workshops"],
      craftTraditions: "Painting, Sculpture, Batik",
      literaryConnections: "Art criticism journals",
      livingTraditions: "Artists living and working"
    },
    visitorIntel: {
      bestTimeOfDay: "Late morning",
      bestMonths: "Nov-Feb",
      insiderTips: ["Talk to the artists if they are free.", "The museum shop sells affordable prints.", "Walk the sculpture garden slowly."],
      hiddenSpots: ["Amphitheatre", "Back studios"],
      commonMistakes: ["Rushing through", "Touching sculptures"],
      nearbyEats: ["Shiraz Art Cafe (if open)", "ECR restaurants"],
      photoSpots: ["Sculpture garden", "Entrance arch"],
      accessibilityNotes: "Sandy paths, some ramps."
    }
  },
  "Birla Planetarium & Periyar Science & Technology Centre": {
    architectural: {
      primaryStyle: "Modern / Functional",
      era: "1988",
      builtBy: "Tamil Nadu Govt",
      structuralFeatures: ["Dome", "Science park", "Galleries"],
      materials: "Concrete",
      artisticMotifs: "Science themes",
      uniqueArchitectural: "Geodesic dome structure."
    },
    dynasty: {
      foundingEra: "Modern",
      foundingDynasty: "Govt of TN",
      keyRulers: [],
      historicalEvents: ["Inauguration by President Venkataraman"],
      colonialHistory: "None",
      livingLegacy: "Science education hub."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "None",
      festivals: ["National Science Day"],
      craftTraditions: "Model making",
      literaryConnections: "Science journals",
      livingTraditions: "Sky watch sessions"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning for shows",
      bestMonths: "Any",
      insiderTips: ["Check show timings (English/Tamil) before going.", "The 3D science movie is fun for kids.", "Visit the evolution park outside."],
      hiddenSpots: ["Mirror maze", "Sound park"],
      commonMistakes: ["Missing the English show slot", "Expecting IMAX quality"],
      nearbyEats: ["Kotturpuram cafes", "Adyar Ananda Bhavan"],
      photoSpots: ["Dinosaur models outside", "Rocket model"],
      accessibilityNotes: "Ramps available."
    }
  },
  "Theosophical Society & Adyar Library": {
    architectural: {
      primaryStyle: "Colonial / Eclectic",
      era: "1882",
      builtBy: "Theosophical Society",
      structuralFeatures: ["Headquarters hall", "Shrines of all faiths", "Adyar Library"],
      materials: "Stone, brick, wood",
      artisticMotifs: "Symbols of all religions",
      uniqueArchitectural: "Blend of East and West, set in a forest."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "Theosophical Society",
      keyRulers: [{ ruler: "Annie Besant", period: "Early 20th", contribution: "President, freedom fighter" }, { ruler: "Madame Blavatsky", period: "1880s", contribution: "Founder" }],
      historicalEvents: ["Discovery of J. Krishnamurti"],
      colonialHistory: "Center for occult and religious study.",
      livingLegacy: "Global HQ of Theosophy."
    },
    artTraditions: {
      associatedDance: "Rukmini Devi (Kalakshetra nearby)",
      associatedMusic: "Devotional",
      festivals: ["Annual Convention (Dec)"],
      craftTraditions: "Publishing",
      literaryConnections: "Adyar Library Sanskrit manuscripts",
      livingTraditions: "Quiet contemplation"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning (8:30-10 AM) - Limited hours!",
      bestMonths: "Dec-Jan",
      insiderTips: ["The Great Banyan Tree is the highlight.", "Silence is mandatory.", "Visit the Buddhist shrine near the river."],
      hiddenSpots: ["Zoroastrian temple", "Adyar river bank view"],
      commonMistakes: ["Going when closed (closes mid-day)", "Talking loudly"],
      nearbyEats: ["Adyar cafes", "Grand Sweets"],
      photoSpots: ["Great Banyan Tree", "Headquarters building"],
      accessibilityNotes: "Long walks on dirt paths."
    }
  },
  "Theosophical Society, Adyar": { // Duplicate handling
    architectural: {
      primaryStyle: "Colonial / Eclectic",
      era: "1882",
      builtBy: "Theosophical Society",
      structuralFeatures: ["Headquarters hall", "Shrines of all faiths", "Adyar Library"],
      materials: "Stone, brick, wood",
      artisticMotifs: "Symbols of all religions",
      uniqueArchitectural: "Blend of East and West, set in a forest."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "Theosophical Society",
      keyRulers: [{ ruler: "Annie Besant", period: "Early 20th", contribution: "President" }],
      historicalEvents: ["Home Rule Movement launched here"],
      colonialHistory: "Hub of intellectual thought.",
      livingLegacy: "Ecological paradise."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "None",
      festivals: ["Convention"],
      craftTraditions: "None",
      literaryConnections: "Theosophist journals",
      livingTraditions: "Nature conservation"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning",
      bestMonths: "Winter",
      insiderTips: ["See the Banyan tree.", "Respect the silence."],
      hiddenSpots: ["River view"],
      commonMistakes: ["Checking timings wrong"],
      nearbyEats: ["Adyar"],
      photoSpots: ["Banyan Tree"],
      accessibilityNotes: "Walking required."
    }
  },
  "Luz Church (Portuguese, 1516)": {
    architectural: {
      primaryStyle: "Portuguese Colonial / Baroque",
      era: "1516",
      builtBy: "Portuguese Franciscan Friars",
      structuralFeatures: ["Thick walls", "Baroque ornamentation", "Simple facade"],
      materials: "Laterite, lime",
      artisticMotifs: "Christian symbols, floral reliefs",
      uniqueArchitectural: "Oldest European building in Chennai (Madras)."
    },
    dynasty: {
      foundingEra: "Portuguese",
      foundingDynasty: "Portuguese Empire",
      keyRulers: [{ ruler: "Vasco da Gama", period: "Early 16th", contribution: "Exploration era" }],
      historicalEvents: ["Legend of the 'Light' guiding sailors"],
      colonialHistory: "Built in the forest of Mylapore ('Luz' means Light).",
      livingLegacy: "Active parish church."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Hymns",
      festivals: ["Feast of Our Lady of Light (Aug)"],
      craftTraditions: "None",
      literaryConnections: "Portuguese chronicles",
      livingTraditions: "Daily mass"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning or Evening mass",
      bestMonths: "Aug (Feast)",
      insiderTips: ["It's tucked away, ask locals for directions.", "Look at the ancient relief work inside.", "Very peaceful contrast to Mylapore traffic."],
      hiddenSpots: ["Side altars"],
      commonMistakes: ["Confusing it with San Thome", "Missing the inscription date"],
      nearbyEats: ["Mylapore mess", "Sangeetha"],
      photoSpots: ["Blue and white facade", "Altar"],
      accessibilityNotes: "Small steps."
    }
  },
  "Anna Centenary Library": {
    architectural: {
      primaryStyle: "Contemporary / Green Building",
      era: "2010",
      builtBy: "TN Government (C.N. Raghavendran)",
      structuralFeatures: ["Atrium", "Glass facade", "9 Floors"],
      materials: "Glass, steel, concrete",
      artisticMotifs: "Modernist",
      uniqueArchitectural: "One of Asia's largest libraries, LEED Gold rated."
    },
    dynasty: {
      foundingEra: "Modern",
      foundingDynasty: "DMK Govt",
      keyRulers: [{ ruler: "C.N. Annadurai", period: "Legacy", contribution: "Namesake scholar/CM" }],
      historicalEvents: ["Inauguration 2010"],
      colonialHistory: "None",
      livingLegacy: "Knowledge hub."
    },
    artTraditions: {
      associatedDance: "Auditorium events",
      associatedMusic: "None",
      festivals: ["Book launches"],
      craftTraditions: "None",
      literaryConnections: "Housing 1.2 million books",
      livingTraditions: "Reading culture"
    },
    visitorIntel: {
      bestTimeOfDay: "Afternoon (AC is great)",
      bestMonths: "Summer (escape heat)",
      insiderTips: ["Bring your own laptop/books.", "The Braille section is impressive.", "View from top floors is nice."],
      hiddenSpots: ["Own book reading section", "Food court"],
      commonMistakes: ["Making noise", "Eating in stack areas"],
      nearbyEats: ["Library canteen", "Kotturpuram shops"],
      photoSpots: ["Atrium view", "Exterior"],
      accessibilityNotes: "Fully accessible."
    }
  },
  "Madras High Court": {
    architectural: {
      primaryStyle: "Indo-Saracenic",
      era: "1892",
      builtBy: "J.W. Brassington & Henry Irwin",
      structuralFeatures: ["Red brick", "Minarets", "Domed ceiling"],
      materials: "Brick, terracotta",
      artisticMotifs: "Mughal and Hindu fusion",
      uniqueArchitectural: "Second largest judicial complex in the world after London."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British Raj",
      keyRulers: [{ ruler: "Queen Victoria", period: "1892", contribution: "Reign during construction" }],
      historicalEvents: ["Shelled by SMS Emden in WWI"],
      colonialHistory: "Symbol of British Justice.",
      livingLegacy: "Active High Court."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "None",
      festivals: ["Republic Day"],
      craftTraditions: "Stained glass work",
      literaryConnections: "Legal archives",
      livingTraditions: "Judicial proceedings"
    },
    visitorIntel: {
      bestTimeOfDay: "Weekend morning (Exterior)",
      bestMonths: "Any",
      insiderTips: ["Entry is restricted, bring ID.", "Visit the museum if open.", "Walk around the Parrys corner to see the scale."],
      hiddenSpots: ["Old lighthouse tower inside complex"],
      commonMistakes: ["Taking photos without permission (strict)", "Entering courtrooms"],
      nearbyEats: ["Hotel Saravana Bhavan (Parrys)", "Street food"],
      photoSpots: ["From N.S.C. Bose Road", "Red brick domes"],
      accessibilityNotes: "Crowded, security checks."
    }
  },
  "Armenian Church": {
    architectural: {
      primaryStyle: "Armenian / Colonial",
      era: "1712 / 1772",
      builtBy: "Armenian Merchants",
      structuralFeatures: ["Belfry with 6 bells", "Plastered walls", "Cemetery"],
      materials: "Brick, lime",
      artisticMotifs: "Armenian crosses",
      uniqueArchitectural: "Famous for its bells cast in London."
    },
    dynasty: {
      foundingEra: "Colonial Trade Era",
      foundingDynasty: "Armenian Community",
      keyRulers: [{ ruler: "Khoja Petrus Uscan", period: "18th Century", contribution: "Benefactor" }],
      historicalEvents: ["Armenian trade dominance"],
      colonialHistory: "Remnant of the wealthy Armenian diaspora.",
      livingLegacy: "Quiet heritage site."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Bell ringing",
      festivals: ["Christmas"],
      craftTraditions: "None",
      literaryConnections: "First Armenian journal published here",
      livingTraditions: "Caretaker maintained"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning",
      bestMonths: "Dec",
      insiderTips: ["Ask the caretaker to ring the bells (maybe).", "Read the gravestones for history.", "A quiet oasis in chaotic Parrys."],
      hiddenSpots: ["Belfry tower"],
      commonMistakes: ["Missing the entrance (it's small)", "Going when locked"],
      nearbyEats: ["Burma Bazaar street food", "Parrys restaurants"],
      photoSpots: ["Belfry", "Garden path"],
      accessibilityNotes: "Flat ground."
    }
  },
  "Royapuram Railway Station": {
    architectural: {
      primaryStyle: "Classical Revival / Colonial",
      era: "1856",
      builtBy: "Madras Railway Company",
      structuralFeatures: ["Arched verandahs", "Ionic pillars", "High ceilings"],
      materials: "Brick, plaster",
      artisticMotifs: "Railway utility",
      uniqueArchitectural: "Oldest surviving railway station in the Indian subcontinent."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British Raj",
      keyRulers: [{ ruler: "Lord Harris", period: "1856", contribution: "Inaugurated it" }],
      historicalEvents: ["First train in South India ran from here"],
      colonialHistory: "Original main station of Madras.",
      livingLegacy: "Active suburban station."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Train whistles",
      festivals: ["Railway week"],
      craftTraditions: "None",
      literaryConnections: "Railway history books",
      livingTraditions: "Commuting"
    },
    visitorIntel: {
      bestTimeOfDay: "Daytime",
      bestMonths: "Any",
      insiderTips: ["Look for the heritage plaque.", "It's a working station, watch out for trains.", "Architecture is best seen from the platform."],
      hiddenSpots: ["Old ticket counter arches"],
      commonMistakes: ["Expecting a museum (it's a station)", "Going at night (isolated)"],
      nearbyEats: ["Royapuram mess"],
      photoSpots: ["Station facade", "Arches"],
      accessibilityNotes: "Standard station access."
    }
  },
  "DakshinaChitra Heritage Museum": {
    architectural: {
      primaryStyle: "Vernacular Heritage",
      era: "1996 (Museum)",
      builtBy: "Madras Craft Foundation (Laurie Baker)",
      structuralFeatures: ["Transplanted houses", "Courtyards", "Tile roofs"],
      materials: "Wood, mud, stone, tile",
      artisticMotifs: "South Indian traditional",
      uniqueArchitectural: "Living museum with real dismantled and reassembled houses."
    },
    dynasty: {
      foundingEra: "Modern",
      foundingDynasty: "NGO",
      keyRulers: [{ ruler: "Deborah Thiagarajan", period: "1996", contribution: "Founder" }],
      historicalEvents: ["Preservation of dying architecture"],
      colonialHistory: "None",
      livingLegacy: "Craft preservation."
    },
    artTraditions: {
      associatedDance: "Folk dances (Karakattam, etc)",
      associatedMusic: "Folk music demos",
      festivals: ["Village festivals"],
      craftTraditions: "Pottery, weaving, glass blowing",
      literaryConnections: "Folklore library",
      livingTraditions: "Artisan workshops"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning (10 AM)",
      bestMonths: "Nov-Feb (Cooler for walking)",
      insiderTips: ["Watch the glass blowing demo.", "Buy crafts directly from artisans.", "Eat the traditional thali at the canteen."],
      hiddenSpots: ["Syrian Christian house backwaters view", "Pottery shed"],
      commonMistakes: ["Rushing (needs 3-4 hours)", "Skipping the Chettinad house"],
      nearbyEats: ["On-site canteen", "ECR restaurants"],
      photoSpots: ["Chettinad House courtyard", "Ayyanar horse statues"],
      accessibilityNotes: "Wheelchairs available, some sand paths."
    }
  },
  "Gandhi Mandapam": {
    architectural: {
      primaryStyle: "Dravidian Temple Style",
      era: "1956",
      builtBy: "TN Government",
      structuralFeatures: ["Gopuram-like towers", "Mandapams", "Open grounds"],
      materials: "Stone, concrete",
      artisticMotifs: "Gandhian simplicity",
      uniqueArchitectural: "Memorial built in temple style."
    },
    dynasty: {
      foundingEra: "Post-Independence",
      foundingDynasty: "Congress Govt",
      keyRulers: [{ ruler: "C. Rajagopalachari", period: "1956", contribution: "Inaugurated" }],
      historicalEvents: ["Gandhi's ashes immersed"],
      colonialHistory: "None",
      livingLegacy: "Memorial park."
    },
    artTraditions: {
      associatedDance: "None",
      associatedMusic: "Bhajans",
      festivals: ["Gandhi Jayanti (Oct 2)"],
      craftTraditions: "Khadi spinning demos",
      literaryConnections: "Gandhi's works",
      livingTraditions: "Patriotic events"
    },
    visitorIntel: {
      bestTimeOfDay: "Evening",
      bestMonths: "Oct",
      insiderTips: ["It's very quiet and green.", "Visit the nearby Kamaraj and Rajaji memorials too.", "Good for a peaceful walk."],
      hiddenSpots: ["Museum photos"],
      commonMistakes: ["Expecting a temple", "Missing the other memorials in the complex"],
      nearbyEats: ["Adyar Ananda Bhavan"],
      photoSpots: ["Main Mandapam", "Gardens"],
      accessibilityNotes: "Flat paths."
    }
  },
  "Kalakshetra Foundation": {
    architectural: {
      primaryStyle: "Traditional / Open-air",
      era: "1936",
      builtBy: "Rukmini Devi Arundale",
      structuralFeatures: ["Koothambalam (Theatre)", "Open classrooms", "Banyan trees"],
      materials: "Wood, thatch, brick",
      artisticMotifs: "Natyashastra themes",
      uniqueArchitectural: "Designed to be in harmony with nature."
    },
    dynasty: {
      foundingEra: "British Colonial (Revival era)",
      foundingDynasty: "Theosophical influence",
      keyRulers: [{ ruler: "Rukmini Devi", period: "1936", contribution: "Founder" }],
      historicalEvents: ["Revival of Bharatanatyam"],
      colonialHistory: "Cultural renaissance.",
      livingLegacy: "World's premier dance school."
    },
    artTraditions: {
      associatedDance: "Bharatanatyam",
      associatedMusic: "Carnatic Music",
      festivals: ["Art Festival (Dec)"],
      craftTraditions: "Kalamkari, Saree weaving",
      literaryConnections: "Sanskrit epics",
      livingTraditions: "Daily dance classes"
    },
    visitorIntel: {
      bestTimeOfDay: "Morning prayer (8:30 AM)",
      bestMonths: "Dec (Festival)",
      insiderTips: ["Book the heritage walk.", "Visit the craft shop for authentic sarees.", "Silence is expected in class areas."],
      hiddenSpots: ["Koothambalam theatre", "Weaving unit"],
      commonMistakes: ["Walking into classes without permission", "Missing the prayer"],
      nearbyEats: ["Thiruvanmiyur cafes"],
      photoSpots: ["Koothambalam", "Banyan tree"],
      accessibilityNotes: "Sand paths."
    }
  },
  "M.A. Chidambaram Stadium (Chepauk)": {
    architectural: {
      primaryStyle: "Modern Stadium",
      era: "1916",
      builtBy: "Madras Cricket Club",
      structuralFeatures: ["Stands", "Floodlights", "Wallajah Road End"],
      materials: "Concrete, Steel",
      artisticMotifs: "CSK Yellow",
      uniqueArchitectural: "Open breeze from the sea (historically)."
    },
    dynasty: {
      foundingEra: "British Colonial",
      foundingDynasty: "British",
      keyRulers: [],
      historicalEvents: ["First Ranji match 1934", "Tied Test 1986"],
      colonialHistory: "Oldest cricket club grounds.",
      livingLegacy: "Home of CSK."
    },
    artTraditions: {
      associatedDance: "Cheerleading",
      associatedMusic: "Whistle Podu",
      festivals: ["IPL", "Pongal Test"],
      craftTraditions: "None",
      literaryConnections: "Cricket journalism",
      livingTraditions: "Cricket worship"
    },
    visitorIntel: {
      bestTimeOfDay: "Match day evening",
      bestMonths: "April-May (IPL)",
      insiderTips: ["I, J, K stands have the best atmosphere.", "No bags allowed inside.", "Wear Yellow."],
      hiddenSpots: ["MCC old clubhouse (members only)"],
      commonMistakes: ["Bringing prohibited items", "Buying black tickets"],
      nearbyEats: ["Chepauk stadium food", "Ratna Cafe"],
      photoSpots: ["Pitch view", "Dhoni posters"],
      accessibilityNotes: "Lifts in new stands."
    }
  }
};

function getCached(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    return (Date.now() - ts < TTL) ? value : null;
  } catch { return null; }
}

function setCache(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, ts: Date.now() }));
  } catch (e) { console.error('Cache set ignored', e); }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch { return null; }
}

// ── AGENT 1: Deep Place Intelligence (4 parallel queries) ────────────────
export async function getChennaiPlaceIntelligence(placeName) {
  const cached = getCached(`place_${placeName}`);
  if (cached) return cached;

  // Check Fallback first (Immediate Data)
  if (FALLBACK_INTEL[placeName]) {
     // We can return fallback immediately, or try AI and use fallback on failure.
     // To ensure "data is present" immediately for the user, we'll return fallback
     // but you could also fire-and-forget an update.
     // For now, let's treat fallback as a valid cache hit to save API calls and ensure speed.
     // If you want to force AI, we can do that, but fallback guarantees the user's request.
     const fallback = {
         placeName,
         ...FALLBACK_INTEL[placeName],
         generatedAt: Date.now(),
         isFallback: true
     };
     setCache(`place_${placeName}`, fallback);
     return fallback;
  }

  const [arch, dynastic, arts, visitor] = await Promise.allSettled([

    queryAI(`Architectural historian of South India. Analyse "${placeName}" in Chennai.
    JSON only, no markdown:
    {"primaryStyle":"","era":"","builtBy":"","structuralFeatures":[""],"materials":"","artisticMotifs":"","uniqueFact":""}`),

    queryAI(`Historian of Tamil Nadu. Dynastic history of "${placeName}" in Chennai.
    JSON only, no markdown:
    {"foundingEra":"","foundingDynasty":"","keyRulers":[{"ruler":"","period":"","contribution":""}],"historicalEvents":[""],"colonialHistory":"","livingLegacy":""}`),

    queryAI(`Tamil classical arts expert. Art forms connected to "${placeName}" Chennai.
    JSON only, no markdown:
    {"associatedDance":"","associatedMusic":"","festivals":[""],"craftTraditions":"","literaryConnections":"","livingTraditions":""}`),

    queryAI(`Chennai tourism insider, 20 years experience. Visitor intel for "${placeName}".
    JSON only, no markdown:
    {"bestTimeOfDay":"","bestMonths":"","insiderTips":["","","",""],"hiddenSpots":["",""],"commonMistakes":["",""],"nearbyEats":["",""],"photoSpots":["",""],"accessibilityNotes":""}`)
  ]);

  const result = {
    placeName,
    architectural: arch.status === 'fulfilled' ? safeParseJSON(arch.value.text) : null,
    dynastic: dynastic.status === 'fulfilled' ? safeParseJSON(dynastic.value.text) : null,
    artTraditions: arts.status === 'fulfilled' ? safeParseJSON(arts.value.text) : null,
    visitorIntel: visitor.status === 'fulfilled' ? safeParseJSON(visitor.value.text) : null,
    generatedAt: Date.now()
  };

  setCache(`place_${placeName}`, result);
  return result;
}

// ── FALLBACK TIMELINE (Static Data) ─────────────────────────────────────
const FALLBACK_TIMELINE = {
  timeline: [
    { year: "300 BCE", era: "Sangam Age", event: "Tholkappiyam Grammer", dynasty: "Pre-dynastic", type: "foundation", significance: "Oldest extant Tamil literature" },
    { year: "600 CE", era: "Pallava Era", event: "Shore Temple Construction", dynasty: "Pallava", type: "construction", significance: "Peak of rock-cut architecture" },
    { year: "1523", era: "Colonial", event: "San Thome Established", dynasty: "Portuguese", type: "colonial", significance: "European settlement begins" },
    { year: "1639", era: "British Era", event: "Madras Founded", dynasty: "British Colonial", type: "foundation", significance: "Francis Day buys land for Fort St. George" },
    { year: "1914", era: "WWI", event: "Emden Shelling", dynasty: "British Colonial", type: "conquest", significance: "Only Indian city attacked in WWI" },
    { year: "1969", era: "Independence", event: "Renamed Tamil Nadu", dynasty: "Post-Independence", type: "independence", significance: "Madras State becomes Tamil Nadu" },
    { year: "1996", era: "Modern", event: "Madras becomes Chennai", dynasty: "Modern", type: "modern", significance: "Reclaiming cultural identity" }
  ]
};

// ── AGENT 2: Chennai Historical Timeline ────────────────────────────────
export async function getChennaiTimeline() {
  const cached = getCached('timeline');
  if (cached) return cached;

  try {
    const result = await queryAI(`Historian of Chennai and Tamil Nadu.
    Historical timeline for Chennai, 12 key events from ancient to modern.
    JSON only, no markdown:
    {"timeline":[{"year":"300 BCE","era":"Sangam Age","event":"description","dynasty":"Pre-dynastic","type":"foundation","significance":"why this matters"}]}
    dynasty values: Pallava|Chola|Pandya|Nayak|British Colonial|Post-Independence|Pre-dynastic|Natural
    type values: foundation|construction|conquest|cultural|colonial|independence|modern
    Order oldest to newest.`);

    const parsed = safeParseJSON(result.text);
    if (parsed) {
        setCache('timeline', parsed);
        return parsed;
    }
  } catch (err) {
    console.error("AI Error getting timeline:", err);
  }
  
  // Return fallback if AI fails or returns null
  return FALLBACK_TIMELINE;
}

// ── FALLBACK CONNECTED SITES (Static Data) ──────────────────────────────
const FALLBACK_CONNECTED_SITES = {
  "Marina Beach": {
    connectedSites: [
      { name: "Elliot's Beach", district: "Chennai", connectionType: "Coastal", connectionReason: "Continuation of the Coromandel coast urban beach stretch.", dynasty: "British Colonial", lat: 13.000, lng: 80.274 },
      { name: "Silver Beach", district: "Cuddalore", connectionType: "Colonial", connectionReason: "Second longest beach in the region with colonial history.", dynasty: "British Colonial", lat: 11.748, lng: 79.771 },
      { name: "Dhanushkodi", district: "Ramanathapuram", connectionType: "Natural", connectionReason: "The other extreme end of Tamil Nadu's coastline.", dynasty: "Natural", lat: 9.153, lng: 79.444 }
    ]
  },
  "Kapaleeshwarar Temple": {
    connectedSites: [
      { name: "Brihadeeswarar Temple", district: "Thanjavur", connectionType: "Dravidian Architecture", connectionReason: "The pinnacle of the Dravidian style that evolved from Pallava roots.", dynasty: "Chola", lat: 10.782, lng: 79.131 },
      { name: "Meenakshi Temple", district: "Madurai", connectionType: "Living Tradition", connectionReason: "Shared tradition of grand temple festivals and tank architecture.", dynasty: "Pandya", lat: 9.919, lng: 78.119 },
      { name: "Ekambareswarar Temple", district: "Kanchipuram", connectionType: "Saivaite", connectionReason: "One of the Pancha Bhoota Stalas (Earth), linked by Saivaite tradition.", dynasty: "Pallava", lat: 12.847, lng: 79.699 }
    ]
  },
  "Fort St. George": {
    connectedSites: [
      { name: "Gingee Fort", district: "Villupuram", connectionType: "Military Architecture", connectionReason: "The 'Troy of the East', a key strategic fort often contested by colonial powers.", dynasty: "Nayak", lat: 12.253, lng: 79.417 },
      { name: "Danish Fort", district: "Tharangambadi", connectionType: "Colonial", connectionReason: "Contemporary European colonial fortification on the Coromandel coast.", dynasty: "Danish", lat: 11.026, lng: 79.856 },
      { name: "Vellore Fort", district: "Vellore", connectionType: "Military History", connectionReason: "Site of the first mutiny against the British (1806).", dynasty: "Vijayanagara", lat: 12.923, lng: 79.132 }
    ]
  },
  "Mahabalipuram": {
    connectedSites: [
      { name: "Kanchipuram", district: "Kanchipuram", connectionType: "Dynastic", connectionReason: "The capital of the Pallava dynasty that built Mahabalipuram.", dynasty: "Pallava", lat: 12.818, lng: 79.697 },
      { name: "Sittanavasal", district: "Pudukkottai", connectionType: "Rock-cut Art", connectionReason: "Earlier Jain rock-cut beds and frescoes, a precursor to Pallava art.", dynasty: "Pandya", lat: 10.457, lng: 78.719 },
      { name: "Ellora Caves", district: "Maharashtra", connectionType: "Architectural", connectionReason: "Pan-Indian rock-cut tradition (Kailasa temple resembles Rathas).", dynasty: "Rashtrakuta", lat: 20.026, lng: 75.178 } // Notable connection even if outside TN
    ]
  },
  "San Thome Cathedral Basilica": {
    connectedSites: [
      { name: "Velankanni Church", district: "Nagapattinam", connectionType: "Pilgrimage", connectionReason: "The 'Lourdes of the East', major Christian pilgrimage site in TN.", dynasty: "Colonial", lat: 10.681, lng: 79.843 },
      { name: "St. Thomas Mount", district: "Chennai", connectionType: "Historical", connectionReason: "Site of St. Thomas's martyrdom, linked to the Cathedral tomb.", dynasty: "Portuguese", lat: 13.006, lng: 80.192 },
      { name: "Little Mount", district: "Chennai", connectionType: "Historical", connectionReason: "Hideout of St. Thomas before his martyrdom.", dynasty: "Portuguese", lat: 13.012, lng: 80.224 }
    ]
  },
  "Government Museum (Egmore)": {
    connectedSites: [
      { name: "Saraswathi Mahal Library", district: "Thanjavur", connectionType: "Knowledge", connectionReason: "One of the oldest libraries in Asia, housing similar palm-leaf manuscripts.", dynasty: "Nayak/Maratha", lat: 10.783, lng: 79.138 },
      { name: "DakshinaChitra", district: "Kanchipuram", connectionType: "Cultural Preservation", connectionReason: "Living museum preserving the built heritage of South India.", dynasty: "Modern", lat: 12.814, lng: 80.244 },
      { name: "Gangaikonda Cholapuram", district: "Ariyalur", connectionType: "Artifact Source", connectionReason: "Many Chola bronzes in the museum originate from this region.", dynasty: "Chola", lat: 11.205, lng: 79.447 }
    ]
  }
};

// ── AGENT 3: Chennai Heritage Network ───────────────────────────────────
export async function getChennaiHeritageNetwork(placeName) {
  const cached = getCached(`network_${placeName}`);
  if (cached) return cached;

  // Check Fallback first
  // We can loosely match place names if needed, but exact match is safer for now.
  const fallbackKey = Object.keys(FALLBACK_CONNECTED_SITES).find(k => placeName.includes(k) || k.includes(placeName));
  if (fallbackKey) {
     const fallback = {
         placeName,
         connectedSites: FALLBACK_CONNECTED_SITES[fallbackKey].connectedSites,
         generatedAt: Date.now(),
         isFallback: true
     };
     // Note: We don't cache fallback as 'final' if we want to retry AI later,
     // but for consistency with timeline, we can cache it or just return it.
     // Let's return it immediately to be fast.
     // setCache(`network_${placeName}`, fallback); 
     // Actually, let's try AI, and use fallback on fail.
  }

  try {
    const result = await queryAI(`Heritage expert for Tamil Nadu.
    For "${placeName}" in Chennai, identify 6 connected heritage sites in Tamil Nadu.
    JSON only, no markdown:
    {"connectedSites":[{"name":"","district":"","connectionType":"dynasty/architecture/tradition/era","connectionReason":"one sentence","dynasty":"Pallava/Chola/Pandya/Nayak/British Colonial/Natural/Multiple","period":"","lat":11.0,"lng":79.0}]}`);

    const parsed = safeParseJSON(result.text);
    if (parsed) {
        setCache(`network_${placeName}`, parsed);
        return parsed;
    }
  } catch (err) {
    console.error("AI Error getting heritage network:", err);
  }
  
  if (fallbackKey) {
      return {
         placeName,
         connectedSites: FALLBACK_CONNECTED_SITES[fallbackKey].connectedSites,
         isFallback: true
      };
  }

  return { connectedSites: [] };
}

// ── AGENT 4: Events Calendar ─────────────────────────────────────────────
export async function getChennaiEventsCalendar() {
  const cached = getCached('events_2026');
  if (cached) return cached;

  try {
    const result = await queryAI(`Chennai cultural events expert.
    10 major cultural events in Chennai in 2026 with approximate months.
    JSON only, no markdown:
    {"events":[{"name":"","month":"January","duration":"days","location":"venue/neighbourhood","type":"music/dance/religious/food/film/literary","description":"2 sentences","ticketed":true,"bestFor":""}]}`);

    const parsed = safeParseJSON(result.text);
    if (parsed) setCache('events_2026', parsed);
    return parsed || { events: [] };
  } catch (err) {
    console.error("AI Error getting events:", err);
    return { events: [] };
  }
}

// ── AGENT 5: Neighbourhood Intelligence ─────────────────────────────────
export async function getNeighbourhoodIntelligence(neighbourhood) {
  const cached = getCached(`nbhd_${neighbourhood}`);
  if (cached) return cached;

  try {
    const result = await queryAI(`Chennai urban historian. Intelligence about "${neighbourhood}" neighbourhood Chennai.
    JSON only, no markdown:
    {"historicalOrigin":"","culturalCharacter":"","notableResidents":["",""],"architecturalCharacter":"","foodScene":"","marketCulture":"","festivalsAndRituals":"","modernTransformation":"","mustDoExperiences":["","",""],"bestTimeToVisit":"","localTip":""}`);

    const parsed = safeParseJSON(result.text);
    if (parsed) setCache(`nbhd_${neighbourhood}`, parsed);
    return parsed || null;
  } catch (err) {
    console.error("AI Error getting neighborhood intel:", err);
    return null;
  }
}

// ── AGENT 6: Street Food Intelligence ───────────────────────────────────
export async function getStreetFoodIntelligence(area) {
  const cached = getCached(`food_${area}`);
  if (cached) return cached;

  try {
    const result = await queryAI(`Chennai food historian and street food expert.
    Street food intelligence for "${area}" area of Chennai.
    JSON only, no markdown:
    {"signatureDishes":[{"dish":"","origin":"","bestStall":"","price":"","bestTime":"","ingredients":""}],"historicEateries":[{"name":"","established":"","famousFor":"","historicalNote":""}],"foodWalkRoute":"","dietaryNote":""}`);

    const parsed = safeParseJSON(result.text);
    if (parsed) setCache(`food_${area}`, parsed);
    return parsed || null;
  } catch (err) {
    console.error("AI Error getting street food intel:", err);
    return null;
  }
}
