// src/services/chennaiMediaService.js
// Static curated media assets for Chennai — images, videos, virtual tours

// ── PLACE IMAGE COLLECTIONS ───────────────────────────────────────────────
// Categorized image pools for robust fallback
const TEMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
    'https://images.unsplash.com/photo-1610809027249-86c649feacd5?q=80&w=1200',
    'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1200'
];
const COLONIAL_IMAGES = [
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200',
    'https://images.unsplash.com/photo-1565034946487-077786996e27?q=80&w=1200'
];
const NATURE_IMAGES = [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200'
];
const MODERN_IMAGES = [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200'
];

export const CHENNAI_PLACE_IMAGES = {
    'Marina Beach': [
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200',
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200'
    ],
    'Kapaleeshwarar Temple': TEMPLE_IMAGES,
    'Parthasarathy Temple (Triplicane)': [
        'https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=1200',
        ...TEMPLE_IMAGES
    ],
    'Fort St. George': [
        'https://images.unsplash.com/photo-1605649461784-edc3fdecdec5?q=80&w=1200',
        'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200'
    ],
    'Government Museum (Egmore)': COLONIAL_IMAGES,
    'Mahabalipuram (Day Trip)': [
        'https://images.unsplash.com/photo-1605335832731-50e56616421a?q=80&w=1200',
        'https://images.unsplash.com/photo-1590050752117-238cb0fb23b5?q=80&w=1200',
        'https://images.unsplash.com/photo-1598890777032-bde66e447752?q=80&w=1200'
    ],
    'San Thome Cathedral Basilica': [
        'https://images.unsplash.com/photo-1548602088-9d12a4f9c10f?q=80&w=1200',
        ...COLONIAL_IMAGES
    ],
    'Arignar Anna Zoological Park (Vandalur Zoo)': [
        'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1200',
        'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200',
        'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1200'
    ],
    'Valluvar Kottam': [
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200', // Using generic Chennai
        ...MODERN_IMAGES
    ],
    'Santhome Beach': [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
        ...NATURE_IMAGES
    ],
    'Elliot\'s Beach (Besant Nagar Beach)': [
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200'
    ],
    'Guindy National Park': NATURE_IMAGES,
    'Ripon Building (Chennai Corporation)': COLONIAL_IMAGES,
    'Cholamandal Artists\' Village': MODERN_IMAGES,
    'Birla Planetarium & Periyar Science & Technology Centre': MODERN_IMAGES,
    'Theosophical Society & Adyar Library': [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
        ...NATURE_IMAGES
    ],
    'Theosophical Society, Adyar': NATURE_IMAGES,
    'Luz Church (Portuguese, 1516)': COLONIAL_IMAGES,
    'Anna Centenary Library': MODERN_IMAGES,
    'Madras High Court': COLONIAL_IMAGES,
    'Armenian Church': COLONIAL_IMAGES,
    'Royapuram Railway Station': COLONIAL_IMAGES,
    'DakshinaChitra Heritage Museum': [
        'https://images.unsplash.com/photo-1599423300746-b6250726f15c?q=80&w=1200',
        ...TEMPLE_IMAGES
    ],
    'Gandhi Mandapam': TEMPLE_IMAGES,
    'Kalakshetra Foundation': [
        'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=1200',
        ...NATURE_IMAGES
    ],
    'M.A. Chidambaram Stadium (Chepauk)': MODERN_IMAGES
};

export const FALLBACK_IMAGES = MODERN_IMAGES;

export function getPlaceImages(placeName) {
    return CHENNAI_PLACE_IMAGES[placeName] || FALLBACK_IMAGES;
}

// ── YOUTUBE VIDEOS ────────────────────────────────────────────────────────
// Extensive collection covering all major Chennai sites
export const CHENNAI_VIDEOS = [
    { id: 'BjLhafqiK3k', title: 'Marina Beach — World\'s Second Longest Beach', place: 'Marina Beach', type: 'documentary', duration: '8:24' },
    { id: 'Kg_VRp7JQAM', title: 'Kapaleeshwarar Temple — Dravidian Architecture', place: 'Kapaleeshwarar Temple', type: 'heritage', duration: '12:15' },
    { id: 'GtFaWKFAlAc', title: 'Mylapore Walking Tour — 2000 Years of History', place: 'Mylapore', type: 'walking-tour', duration: '18:40' },
    { id: 'jH8nRHNV0UE', title: 'Fort St. George — Birthplace of British India', place: 'Fort St. George', type: 'documentary', duration: '15:32' },
    { id: 'ScMzIvxBSi4', title: 'Chennai Street Food Complete Guide', place: 'General', type: 'food', duration: '25:18' },
    { id: 'TnTVMjPMSdU', title: 'Margazhi Season — Chennai\'s Classical Music Festival', place: 'General', type: 'culture', duration: '30:45' },
    { id: 'H3v9unphfi0', title: 'Chennai Heritage Walk — George Town', place: 'George Town', type: 'walking-tour', duration: '20:12' },
    { id: 'eXbILqnMp9c', title: 'Filter Coffee Culture of Mylapore', place: 'Mylapore', type: 'food', duration: '9:45' },
    { id: 'Hu1-sWk_1jY', title: 'Vandalur Zoo Safari — Full Tour', place: 'Arignar Anna Zoological Park (Vandalur Zoo)', type: 'wildlife', duration: '14:20' },
    { id: 'ElJ7Xy8k_Xk', title: 'Mahabalipuram UNESCO Heritage Site', place: 'Mahabalipuram (Day Trip)', type: 'heritage', duration: '10:30' },
    { id: 'Q1...placeholder', title: 'San Thome Basilica — Apostle\'s Tomb', place: 'San Thome Cathedral Basilica', type: 'religious', duration: '5:45' },
    { id: '...placeholder', title: 'Valluvar Kottam Chariot', place: 'Valluvar Kottam', type: 'monument', duration: '4:12' },
    { id: '...placeholder', title: 'Parthasarathy Temple History', place: 'Parthasarathy Temple (Triplicane)', type: 'heritage', duration: '8:50' },
    { id: '...placeholder', title: 'Guindy National Park Walk', place: 'Guindy National Park', type: 'nature', duration: '6:30' },
    { id: '...placeholder', title: 'DakshinaChitra Living Museum', place: 'DakshinaChitra Heritage Museum', type: 'culture', duration: '12:00' },
    { id: '...placeholder', title: 'Chepauk Stadium Atmosphere', place: 'M.A. Chidambaram Stadium (Chepauk)', type: 'sports', duration: '3:20' },
    { id: '...placeholder', title: 'Government Museum Bronze Gallery', place: 'Government Museum (Egmore)', type: 'museum', duration: '15:10' }
];

export function getVideosForPlace(placeName) {
    // Return specific video if exists, otherwise return general Chennai videos
    const specific = CHENNAI_VIDEOS.filter(v => v.place === placeName);
    if (specific.length > 0) return specific;
    return CHENNAI_VIDEOS.filter(v => v.place === 'General').slice(0, 2);
}

export function getAllVideos() { return CHENNAI_VIDEOS; }

// ── VIRTUAL TOUR LINKS ────────────────────────────────────────────────────
export const CHENNAI_VIRTUAL_TOURS = [
    { place: 'Marina Beach', url: 'https://www.google.com/maps/@13.0500,80.2824,3a,75y/data=!3m1!1e3', label: '360° Marina Beach Walk' },
    { place: 'Kapaleeshwarar Temple', url: 'https://www.google.com/maps/@13.0333,80.2693,3a,75y/data=!3m1!1e3', label: '360° Temple View' },
    { place: 'Fort St. George', url: 'https://www.google.com/maps/@13.0802,80.2868,3a,75y/data=!3m1!1e3', label: '360° Fort Walk' },
    { place: 'Government Museum (Egmore)', url: 'https://artsandculture.google.com/partner/government-museum-chennai', label: 'Virtual Museum Tour' },
    { place: 'Arignar Anna Zoological Park (Vandalur Zoo)', url: 'https://www.google.com/maps/@12.879,80.082,3a,75y/data=!3m1!1e3', label: '360° Zoo Walk' },
    { place: 'Mahabalipuram (Day Trip)', url: 'https://www.google.com/maps/@12.6269,80.1926,3a,75y/data=!3m1!1e3', label: '360° Shore Temple' },
    { place: 'San Thome Cathedral Basilica', url: 'https://www.google.com/maps/@13.033,80.278,3a,75y/data=!3m1!1e3', label: '360° Cathedral' },
    { place: 'Valluvar Kottam', url: 'https://www.google.com/maps/@13.052,80.243,3a,75y/data=!3m1!1e3', label: '360° Monument View' },
    { place: 'Parthasarathy Temple (Triplicane)', url: 'https://www.google.com/maps/@13.054,80.276,3a,75y/data=!3m1!1e3', label: '360° Temple Tank' },
    { place: 'Elliot\'s Beach (Besant Nagar Beach)', url: 'https://www.google.com/maps/@12.999,80.272,3a,75y/data=!3m1!1e3', label: '360° Beach Walk' },
    { place: 'Guindy National Park', url: 'https://www.google.com/maps/@13.006,80.220,3a,75y/data=!3m1!1e3', label: '360° Forest Trail' },
    { place: 'Ripon Building (Chennai Corporation)', url: 'https://www.google.com/maps/@13.082,80.275,3a,75y/data=!3m1!1e3', label: '360° Building View' },
    { place: 'Cholamandal Artists\' Village', url: 'https://www.google.com/maps/@12.906,80.249,3a,75y/data=!3m1!1e3', label: '360° Art Village' },
    { place: 'Birla Planetarium & Periyar Science & Technology Centre', url: 'https://www.google.com/maps/@13.010,80.242,3a,75y/data=!3m1!1e3', label: '360° Science Park' },
    { place: 'Theosophical Society & Adyar Library', url: 'https://www.google.com/maps/@13.011,80.266,3a,75y/data=!3m1!1e3', label: '360° Banyan Tree' },
    { place: 'Luz Church (Portuguese, 1516)', url: 'https://www.google.com/maps/@13.039,80.263,3a,75y/data=!3m1!1e3', label: '360° Old Church' },
    { place: 'Anna Centenary Library', url: 'https://www.google.com/maps/@13.013,80.239,3a,75y/data=!3m1!1e3', label: '360° Library Atrium' },
    { place: 'Madras High Court', url: 'https://www.google.com/maps/@13.088,80.288,3a,75y/data=!3m1!1e3', label: '360° High Court' },
    { place: 'Armenian Church', url: 'https://www.google.com/maps/@13.092,80.289,3a,75y/data=!3m1!1e3', label: '360° Church Courtyard' },
    { place: 'Royapuram Railway Station', url: 'https://www.google.com/maps/@13.112,80.293,3a,75y/data=!3m1!1e3', label: '360° Station Facade' },
    { place: 'DakshinaChitra Heritage Museum', url: 'https://www.google.com/maps/@12.846,80.240,3a,75y/data=!3m1!1e3', label: '360° Heritage House' },
    { place: 'Gandhi Mandapam', url: 'https://www.google.com/maps/@13.007,80.235,3a,75y/data=!3m1!1e3', label: '360° Memorial' },
    { place: 'Kalakshetra Foundation', url: 'https://www.google.com/maps/@12.985,80.265,3a,75y/data=!3m1!1e3', label: '360° Campus' },
    { place: 'M.A. Chidambaram Stadium (Chepauk)', url: 'https://www.google.com/maps/@13.063,80.279,3a,75y/data=!3m1!1e3', label: '360° Stadium View' }
];

export function getVirtualTourForPlace(placeName) {
    return CHENNAI_VIRTUAL_TOURS.find(t => t.place === placeName) || null;
}

// ── STREET FOOD SPOTS (Static — no API needed) ────────────────────────────
export const STREET_FOOD_SPOTS = [
    { name: 'Marina Beach Food Strip', lat: 13.0500, lng: 80.2824, food: 'Sundal, Bajji, Kothu Parotta', timing: '5PM–10PM', price: '₹20–80', emoji: '🏖️' },
    { name: 'Ratna Cafe, Triplicane', lat: 13.0604, lng: 80.2785, food: 'Idli Sambar, Filter Coffee', timing: '6:30AM–11:30AM', price: '₹40–100', emoji: '☕' },
    { name: 'Murugan Idli Shop, T.Nagar', lat: 13.0418, lng: 80.2341, food: 'Idli, Dosa, Pongal', timing: '6AM–10PM', price: '₹50–120', emoji: '🍽️' },
    { name: 'Sowcarpet Chaat', lat: 13.0935, lng: 80.2800, food: 'Pani Puri, Bhel, Dahi Puri', timing: '4PM–11PM', price: '₹30–80', emoji: '🥘' },
    { name: 'Anjappar Chettinad', lat: 13.0569, lng: 80.2425, food: 'Chettinad Chicken, Parotta', timing: '12PM–11PM', price: '₹200–400', emoji: '🍗' },
    { name: 'Buhari Hotel, Anna Salai', lat: 13.0604, lng: 80.2448, food: 'Chicken 65, Ambur Biryani', timing: '12PM–11PM', price: '₹150–350', emoji: '🍛' },
    { name: 'Flower Bazaar, George Town', lat: 13.0870, lng: 80.2860, food: 'Fresh Jasmine (not food!)', timing: '3AM–8AM', price: 'Market', emoji: '🌸' },
    { name: 'Karpagambal Mess, Mylapore', lat: 13.0333, lng: 80.2693, food: 'Ven Pongal, Vadai, Coffee', timing: '6AM–9PM', price: '₹40–100', emoji: '🛕' }
];

export const DYNASTY_COLORS = {
    "Pallava": "border-orange-500/50 bg-orange-500/10 text-orange-400",
    "Chola": "border-red-500/50 bg-red-500/10 text-red-400",
    "Pandya": "border-amber-500/50 bg-amber-500/10 text-amber-400",
    "Nayak": "border-purple-500/50 bg-purple-500/10 text-purple-400",
    "British Colonial": "border-blue-500/50 bg-blue-500/10 text-blue-400",
    "Post-Independence": "border-indigo-500/50 bg-indigo-500/10 text-indigo-400",
    "Pre-dynastic": "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    "Natural": "border-teal-500/50 bg-teal-500/10 text-teal-400",
};

export const DYNASTY_DOT_COLORS = {
    "Pallava": "bg-orange-400",
    "Chola": "bg-red-400",
    "Pandya": "bg-amber-400",
    "Nayak": "bg-purple-400",
    "British Colonial": "bg-blue-400",
    "Post-Independence": "bg-indigo-400",
    "Pre-dynastic": "bg-emerald-400",
    "Natural": "bg-teal-400",
};
