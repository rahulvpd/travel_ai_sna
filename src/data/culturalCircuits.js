/**
 * Tamil Nadu — Living Classical Civilisation
 * Cultural Circuit Data
 *
 * Strategic Framework based on:
 * "Tamil Nadu doesn't lack tourism assets. It lacks strategic positioning."
 * — Moving from destination marketing to IDENTITY BRANDING
 * — Depth-based cultural circuits over scattered promotion
 * — Crafts + manufacturing pride integrated into tourism
 * — Night economy + experiential layering for longer stays
 *
 * Source context: tn.gov.in | britannica.com | tamilnaduarchives.tn.gov.in
 */

export const CULTURAL_CIRCUITS = [
    {
        id: 'chola-heartland',
        name: 'Chola Heartland Circuit',
        tagline: 'Walk the empire that ruled the seas',
        civilisationalTheme: 'The Chola Empire (300 BCE – 1279 CE) was one of the longest-ruling dynasties in world history. Their temples are not ruins — they are still consecrated, still worshipped.',
        icon: '🏛️',
        color: 'from-amber-600 to-orange-800',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        duration: '5–7 days',
        bestTime: 'Nov – Feb',
        places: [
            { name: 'Brihadeeswarar Temple', district: 'Thanjavur', highlight: 'UNESCO World Heritage — shadow never falls on ground at noon', coord: { lat: 10.78, lng: 79.13 } },
            { name: 'Gangaikonda Cholapuram', district: 'Ariyalur', highlight: 'Twin UNESCO Chola masterpiece, Rajendra Chola\'s forgotten capital', coord: { lat: 11.20, lng: 79.45 } },
            { name: 'Airavatesvara Temple, Darasuram', district: 'Mayiladuthurai', highlight: 'Third Great Living Chola Temple — musical steps that produce notes when struck', coord: { lat: 11.02, lng: 79.36 } },
            { name: 'Nataraja Temple, Chidambaram', district: 'Cuddalore', highlight: 'Cosmic dance of Shiva — the most theologically complex temple in Hinduism', coord: { lat: 11.40, lng: 79.69 } },
            { name: 'Kallanai Dam', district: 'Tiruchirappalli', highlight: '2000-year-old Karikala Chola dam — world\'s oldest functioning irrigation dam', coord: { lat: 10.85, lng: 78.84 } },
        ],
        craftConnect: 'Thanjavur Painting (Tanjore Art) — still practiced by master craftsmen in Thanjavur town',
        nightExperience: 'Brihadeeswarar light-and-sound show; Thanjavur classical music sabhas',
        diasporaAngle: 'The Chola navy reached Cambodia, Indonesia and Vietnam — explore your ancestral empire',
        economicImpact: 'This circuit supports 400+ temple craftsmen, silk weavers and bronze casters along the route',
    },
    {
        id: 'silk-and-scripture',
        name: 'Silk & Scripture Circuit',
        tagline: 'Where every thread tells a thousand-year story',
        civilisationalTheme: 'Kanchipuram has been a centre of Sanskrit scholarship, Tamil devotion, and silk weaving for 2000 years. It is one of India\'s seven sacred cities — and a living manufacturing hub.',
        icon: '🧵',
        color: 'from-purple-700 to-indigo-900',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        duration: '3–4 days',
        bestTime: 'Oct – Mar',
        places: [
            { name: 'Kamakshi Amman Temple', district: 'Kancheepuram', highlight: 'One of the three Shakti Peethas of South India', coord: { lat: 12.83, lng: 79.70 } },
            { name: 'Kailasanathar Temple', district: 'Kancheepuram', highlight: 'Oldest Pallava sandstone temple (8th century) — architectural DNA of Dravidian style', coord: { lat: 12.83, lng: 79.69 } },
            { name: 'Silk Weavers\' Quarter, Kanchipuram', district: 'Kancheepuram', highlight: 'Watch master weavers create UNESCO-level silk on handlooms passed down 10 generations', coord: { lat: 12.84, lng: 79.71 } },
            { name: 'Mahabalipuram Shore Temple', district: 'Chengalpattu', highlight: 'UNESCO World Heritage — Pallava port city sculptures facing the Bay of Bengal', coord: { lat: 12.62, lng: 80.19 } },
            { name: 'Vedanthangal Bird Sanctuary', district: 'Chengalpattu', highlight: "India's oldest bird sanctuary — 40,000+ migratory birds from Siberia and Central Asia", coord: { lat: 12.53, lng: 79.88 } },
        ],
        craftConnect: 'Kanchipuram Silk — GI-tagged handloom weaving with real gold zari thread; factory visits available',
        nightExperience: 'Mahabalipuram beach sculpture walk by moonlight; Kanchipuram temple lamp festivals',
        diasporaAngle: 'Kanchipuram silk is worn at Tamil weddings worldwide — trace the craft back to its birthplace',
        economicImpact: 'This circuit directly supports 5,000+ silk weaver families in Kanchipuram',
    },
    {
        id: 'temple-sea-trail',
        name: 'Temple & Sea Trail',
        tagline: 'Where devotion meets the deep blue',
        civilisationalTheme: 'Tamil Nadu\'s eastern coast is a 1,000-km spiritual highway where ancient temples face the Bay of Bengal — each one a different chapter in the living civilisation story.',
        icon: '🌊',
        color: 'from-blue-700 to-teal-900',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        duration: '6–8 days',
        bestTime: 'Oct – Mar',
        places: [
            { name: 'Marina Beach', district: 'Chennai', highlight: "World's 2nd longest urban beach (12 km) — not just sand but a living public commons", coord: { lat: 13.06, lng: 80.28 } },
            { name: 'Pichavaram Mangrove Forest', district: 'Cuddalore', highlight: "World's 2nd largest mangrove ecosystem — kayak through the 'forest in the sea'", coord: { lat: 11.43, lng: 79.77 } },
            { name: 'Velankanni Basilica', district: 'Nagapattinam', highlight: "India's 'Lourdes of the East' — 16th century Marian shrine, millions of pilgrims annually", coord: { lat: 10.68, lng: 79.85 } },
            { name: 'Rameswaram Temple', district: 'Ramanathapuram', highlight: 'Char Dham pilgrimage site — longest temple corridor in India (1212 m)', coord: { lat: 9.29, lng: 79.32 } },
            { name: 'Kanyakumari', district: 'Kanyakumari', highlight: 'Southernmost tip of India — three oceans meet, sunrise and sunset from same point', coord: { lat: 8.08, lng: 77.55 } },
        ],
        craftConnect: 'Nagapattinam Bronze casting (Panchaloka) — same technique used by Chola artisans 1000 years ago',
        nightExperience: 'Rameswaram midnight abhishekam; Kanyakumari sunrise ritual; Pamban bridge nocturnal train crossing',
        diasporaAngle: "Rameswaram's Pamban Bridge was India's first sea bridge — Tamil engineering marvel of 1914",
        economicImpact: 'Coast circuit revitalises fishing communities, boat builders, and temple craft economies',
    },
    {
        id: 'western-ghats-wilderness',
        name: 'Western Ghats Wilderness Circuit',
        tagline: "Earth's ancient lungs — and Tamil Nadu's coolest secret",
        civilisationalTheme: 'The Western Ghats (a UNESCO World Heritage biodiversity hotspot) form the spine of Tamil Nadu\'s ecological heritage. Ancient tribes, medicinal traditions, and tea cultures have coexisted here for millennia.',
        icon: '🌿',
        color: 'from-green-700 to-emerald-900',
        badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
        duration: '5–7 days',
        bestTime: 'Sep – Mar',
        places: [
            { name: 'Ooty (Nilgiri Mountain Railway)', district: 'Nilgiris', highlight: 'UNESCO World Heritage railway — the toy train through tea gardens is a civilisational experience', coord: { lat: 11.41, lng: 76.69 } },
            { name: 'Kodaikanal', district: 'Dindigul', highlight: "Princess of Hill Stations — set on a 2133m shola plateau, India's only man-made star-shaped lake", coord: { lat: 10.23, lng: 77.49 } },
            { name: 'Meghamalai', district: 'Theni', highlight: "The 'Cloud Mountains' at 1500m — walk literally above the clouds, tigers below", coord: { lat: 9.95, lng: 77.39 } },
            { name: 'Mudumalai Tiger Reserve', district: 'Nilgiris', highlight: "Part of the Nilgiri Biosphere Reserve — largest elephant population in Asia", coord: { lat: 11.56, lng: 76.64 } },
            { name: 'Courtallam Falls', district: 'Tenkasi', highlight: "The 'Spa of South India' — medicinal waterfall waters infused with Western Ghats herbs", coord: { lat: 8.93, lng: 77.27 } },
        ],
        craftConnect: 'Toda tribal embroidery (Nilgiris) — geometric art form of the indigenous Toda people, GI-tagged',
        nightExperience: 'Valparai night jeep safaris; Ooty bonfire evenings; Meghamalai cloud sunrise',
        diasporaAngle: 'Nilgiri tea — sold globally under brands like Twinings — taste it at origin',
        economicImpact: 'Tribal artisan economy: Toda embroidery, Irula honey, Kurumba bamboo crafts',
    },
    {
        id: 'chettinad-craft-cuisine',
        name: 'Chettinad Craft & Cuisine Circuit',
        tagline: 'An empire built on trade — now preserved in food, stone and tile',
        civilisationalTheme: 'The Nattukotai Chettiars were 19th-century merchant-bankers who built palatial mansions importing Burmese teak, Italian marble, Belgian crystal and Athangudi tiles. They left a culinary legacy that is now globally sought.',
        icon: '🏺',
        color: 'from-red-800 to-rose-900',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
        duration: '3–4 days',
        bestTime: 'Nov – Mar',
        places: [
            { name: 'Kanadukathan Palace', district: 'Sivaganga', highlight: '1902 Chettinad mansion with Burmese teak doors, Italian marble and Belgian mirrors', coord: { lat: 10.08, lng: 78.84 } },
            { name: 'Athangudi Tile Workshop', district: 'Sivaganga', highlight: 'Watch artisans make the famous hand-pressed cement tiles using century-old techniques', coord: { lat: 9.94, lng: 78.77 } },
            { name: 'Sittanavasal Cave', district: 'Pudukkottai', highlight: '2nd century Jain cave frescoes — pre-Ajanta paintings of extraordinary quality', coord: { lat: 10.48, lng: 78.71 } },
            { name: 'Chettinad Cuisine Trail', district: 'Sivaganga', highlight: 'Multi-sensory experience: spice markets, village cooking lessons, century-old recipes', coord: { lat: 10.02, lng: 78.78 } },
            { name: 'Pillayarpatti Rock Temple', district: 'Sivaganga', highlight: '7th century rock-cut Ganesha temple — active pilgrimage site inside a living boulder', coord: { lat: 9.98, lng: 78.44 } },
        ],
        craftConnect: 'Athangudi tiles, Kandangi sarees, Chettinad knive-making — all craft-to-market industries still alive',
        nightExperience: 'Heritage home stays in Chettiar mansions; traditional Chettinad dinner on banana leaf',
        diasporaAngle: 'Chettinad cuisine is served in restaurants from Singapore to Dubai — experience the authentic original',
        economicImpact: 'Heritage mansion restoration supports local masons, tile artisans, and antique traders',
    },
    {
        id: 'spiritual-fire-circuit',
        name: 'Spiritual Fire Circuit',
        tagline: 'The Pancha Bhoota Stalams — five temples, five elements, one eternal truth',
        civilisationalTheme: 'Ancient Tamil Shaivite philosophy encoded the five classical elements (earth, water, fire, air, space) into five sacred temples across Tamil Nadu. All are still active, daily-worshipped sites of a 1500+ year living tradition.',
        icon: '🔥',
        color: 'from-orange-700 to-red-900',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        duration: '7–10 days',
        bestTime: 'Nov – Mar',
        places: [
            { name: 'Annamalaiyar Temple (Fire)', district: 'Tiruvannamalai', highlight: 'Arunachala Hill — 14km Girivalam full moon walk draws 3 million pilgrims monthly', coord: { lat: 12.23, lng: 79.07 } },
            { name: 'Ekambareswarar Temple (Earth)', district: 'Kancheepuram', highlight: 'Sacred mango tree is 3,500 years old — the oldest living arboreal temple witness in India', coord: { lat: 12.84, lng: 79.70 } },
            { name: 'Jambukeswarar Temple (Water)', district: 'Tiruchirappalli', highlight: 'Shivalingam partially submerged in an eternally flowing spring — on Srirangam island', coord: { lat: 10.85, lng: 78.69 } },
            { name: 'Srikalahasti (air/wind)', district: 'Cross-border, Andhra', highlight: 'Air element Shivalingam — flame inside the sanctum flickers from an invisible divine breeze', coord: { lat: 13.75, lng: 79.70 } },
            { name: 'Chidambaram (Space/Akasha)', district: 'Cuddalore', highlight: "The 'Chidambara Rahasyam' — the most philosophically profound concept in Hindu architecture: the void", coord: { lat: 11.40, lng: 79.69 } },
        ],
        craftConnect: 'Tiruvannamalai Dhoop (incense) making; sacred ash (vibhuti) production; rudraksha bead craft',
        nightExperience: 'Girivalam by torchlight at Tiruvannamalai; Chidambaram Thillai Deekshadars midnight ritual',
        diasporaAngle: 'The Pancha Bhoota philosophy pre-dates Greek classical elements by 500 years',
        economicImpact: 'Pilgrimage circuits sustain temple town economies of over 2 million people',
    },
    {
        id: 'bronze-and-bronze',
        name: 'Art & Bronze Legacy Circuit',
        tagline: 'The masters who taught the world to cast bronze',
        civilisationalTheme: 'Chola bronze casting (lost-wax / Panchaloka method) is considered the pinnacle of world bronze art. The Nataraja figure at Chidambaram inspired the CERN particle physics sculpture. This art is still alive in Tamil Nadu.',
        icon: '⚜️',
        color: 'from-yellow-700 to-amber-900',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        duration: '4–5 days',
        bestTime: 'Oct – Mar',
        places: [
            { name: 'Government Museum (Bronze Gallery)', district: 'Chennai', highlight: "World's finest collection of Chola bronzes including the Nataraja — est. 1851", coord: { lat: 13.07, lng: 80.26 } },
            { name: 'Swamimalai Bronze Craft Village', district: 'Thanjavur', highlight: 'Active bronze casting village — same lost-wax technique for 1000 years, watch masters work', coord: { lat: 10.95, lng: 79.35 } },
            { name: 'Thanjavur Art Palace Museum', district: 'Thanjavur', highlight: "Maratha-era palace housing Tanjore paintings, musical instruments, and royal artefacts", coord: { lat: 10.79, lng: 79.14 } },
            { name: 'Cholamandal Artists\' Village', district: 'Chennai', highlight: "India's largest self-supporting artists' commune since 1966 — contemporary Tamil art", coord: { lat: 12.95, lng: 80.26 } },
            { name: 'Mahabalipuram Sculpture School', district: 'Chengalpattu', highlight: 'Government School of Sculpture — ancient stone carving techniques taught to new generations', coord: { lat: 12.61, lng: 80.19 } },
        ],
        craftConnect: 'Buy authentic Swamimalai bronzes (GI-tagged), Tanjore paintings, stone carvings directly from artisans',
        nightExperience: 'Cholamandal evening art walks; Mahabalipuram shore temple moonlight sculpture tour',
        diasporaAngle: 'The Nataraja bronze at CERN Geneva was gifted by India — a symbol of quantum physics meeting ancient wisdom',
        economicImpact: 'Craft circuit connects 3,000+ artisan families; average income ₹25,000-60,000/month when tourism active',
    },
    {
        id: 'sangam-literature-trail',
        name: 'Sangam Literature & Language Trail',
        tagline: "The world's oldest surviving classical language — still spoken by 75 million people",
        civilisationalTheme: "Tamil is one of the world's two oldest living classical languages (alongside Sanskrit). The Sangam literature (300 BCE – 300 CE) describes landscapes, love, war and ocean trade that are archaeologically verified today.",
        icon: '📜',
        color: 'from-teal-700 to-cyan-900',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        duration: '4–5 days',
        bestTime: 'Oct – Mar',
        places: [
            { name: 'Valluvar Kottam', district: 'Chennai', highlight: "Monument to Thiruvalluvar — author of the Tirukkural (300 BCE), one of humanity's greatest ethical texts", coord: { lat: 13.05, lng: 80.24 } },
            { name: 'Tamil Nadu Archives', district: 'Chennai', highlight: 'Oldest archives in South Asia — palm-leaf manuscripts, colonial records, and Sangam-era documents', coord: { lat: 13.07, lng: 80.25 } },
            { name: 'Madurai (Athens of the East)', district: 'Madurai', highlight: 'Site of the ancient Sangam academies — where Sangam poetry was composed and debated', coord: { lat: 9.92, lng: 78.12 } },
            { name: 'Poompuhar (ancient Kaveripattinam)', district: 'Nagapattinam', highlight: "Submerged Chola port city — the Sangam literature's 'city of the sea', archaeological excavations ongoing", coord: { lat: 11.10, lng: 79.84 } },
            { name: 'Thiruvalluvar Statue, Kanyakumari', district: 'Kanyakumari', highlight: '133-foot statue in the ocean — each foot represents one chapter of the Tirukkural', coord: { lat: 8.08, lng: 77.55 } },
        ],
        craftConnect: 'Kolam art (floor drawing), Kattaikuttu folk theatre, Bharatanatyam — all rooted in Sangam-era traditions',
        nightExperience: 'Madurai Meenakshi temple night processions; Kanyakumari full-moon ocean meditation',
        diasporaAngle: "The Tamil diaspora of 80 million people globally are guardians of the world's oldest surviving classical culture",
        economicImpact: "Cultural tourism along this trail supports Tamil's classical arts: Bharatanatyam, Carnatic music, temple architecture",
    },
];

/**
 * Tamil Nadu strategic positioning pillars
 * Based on "Tamil Nadu as Living Classical Civilisation" framework
 */
export const STRATEGIC_PILLARS = [
    {
        id: 'identity',
        icon: '🏛️',
        title: 'Identity, Not Just Destination',
        description: 'Tamil Nadu is not a set of attractions — it is a 2,500-year-old living civilisation. Every visit is participation in an unbroken cultural continuum.',
        stat: '2,500+ years of unbroken civilisation',
    },
    {
        id: 'circuits',
        icon: '🗺️',
        title: 'Depth Circuits, Not Scatter Tourism',
        description: 'Instead of hopping between disconnected spots, our circuits create immersive 5–10 day thematic journeys that build cultural understanding and lengthen stays.',
        stat: '8 curated depth circuits',
    },
    {
        id: 'crafts',
        icon: '🧵',
        title: 'Crafts + Manufacturing Pride',
        description: 'From Kanchipuram silk to Swamimalai bronze — Tamil Nadu\'s craft economy is NOT a relic. It is a living, GI-tagged, globally-exported manufacturing heritage.',
        stat: '12 GI-tagged Tamil Nadu crafts',
    },
    {
        id: 'diaspora',
        icon: '✈️',
        title: 'Diaspora as Cultural Ambassadors',
        description: '80 million Tamil diaspora globally are the most powerful tourism advocates. Their visits are homecomings — emotional, deep, and high-spending.',
        stat: '80M global Tamil diaspora',
    },
    {
        id: 'night',
        icon: '🌙',
        title: 'Night Economy & Experiential Layering',
        description: 'Temple night rituals, classical music sabhas, heritage dinners and moon-lit walks extend stays beyond 2-day visits to week-long immersions.',
        stat: '3x longer average stay in circuit tourism',
    },
];

/**
 * Key Tamil Nadu civilisation facts for AI context and UI display
 */
export const TN_CIVILISATION_FACTS = [
    { label: 'Years of Civilisation', value: 2500, suffix: '+' },
    { label: 'UNESCO Sites', value: 4, suffix: '' },
    { label: 'Tamil Diaspora', value: 80, suffix: 'M' },
    { label: 'GI-Tagged Crafts', value: 12, suffix: '' },
    { label: 'Ancient Temples', value: 38000, suffix: '+' },
    { label: 'Annual Pilgrims', value: 100, suffix: 'M+' },
];

export default CULTURAL_CIRCUITS;
