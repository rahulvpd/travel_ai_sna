import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, Share2, Heart, Hotel, Utensils, Camera, Navigation, Sun, Shield, ExternalLink, ChevronLeft, Loader, BookOpen, Sparkles, Gem, History, Fingerprint, Train, Fuel, ShoppingBag, Ticket, Hospital, Building2, GraduationCap, Store } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BookingForm from '../components/booking/BookingForm';
import OlaMap from '../components/ui/OlaMap';
import { fetchPlaceDetails } from '../services/PlaceDataService';
import { getPlaceHistory, getPlaceUniqueness, getHiddenGems, getChennaiTourismInsights } from '../services/aiOrchestrator';
import GoogleMap from '../components/ui/GoogleMap';
import { DISTRICTS } from '../data/districts';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// ── CHENNAI v4.0 IMPORTS ──────────────────────────────────────────────────
import ChennaiPlaceGallery from '../components/chennai/ChennaiPlaceGallery';
import ChennaiVideoSection from '../components/chennai/ChennaiVideoSection';
import ChennaiPlaceKnowledgePanel from '../components/chennai/ChennaiPlaceKnowledgePanel';
import ChennaiPlaceFilterBar from '../components/chennai/ChennaiPlaceFilterBar';
import ChennaiHistoricalTimeline from '../components/chennai/ChennaiHistoricalTimeline';
import ChennaiEventsCalendar from '../components/chennai/ChennaiEventsCalendar';
import ChennaiStreetFoodMap from '../components/chennai/ChennaiStreetFoodMap';
import ChennaiConnectedSitesMap from '../components/chennai/ChennaiConnectedSitesMap';
import { getAllVideos } from '../services/chennaiMediaService';
import { translateWithSarvam } from '../services/sarvam';
import { computeChennaiSNA } from '../services/chennaiSNA';
import ChennaiSNAGraph from '../components/chennai/ChennaiSNAGraph';
import ChennaiSNAForceGraph from '../components/chennai/ChennaiSNAForceGraph';
import ChennaiSNADashboard from '../components/chennai/ChennaiSNADashboard';
import ChennaiSNAInsights from '../components/chennai/ChennaiSNAInsights';
import ChennaiSNAMegaSection from '../components/chennai/ChennaiSNAMegaSection';
import ChennaiSNASection from '../components/chennai/ChennaiSNASection';
import ChennaiSNAEnhancedSection from '../components/chennai/ChennaiSNAEnhancedSection';
import ChennaiSNAPhase2Section from '../components/chennai/ChennaiSNAPhase2Section';

const DestinationDetails = () => {
    const { id } = useParams();
    const [isSaved, setIsSaved] = useState(false);
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
    const [placeData, setPlaceData] = useState(null);
    const [loadingExtra, setLoadingExtra] = useState(false);
    const [activeAITab, setActiveAITab] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [uniqueData, setUniqueData] = useState(null);
    const [gemsData, setGemsData] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [mapProvider, setMapProvider] = useState('ola');

    // CHENNAI SPECIFIC STATE
    const [chennaiFocus, setChennaiFocus] = useState('culture');
    const [chennaiInsightsData, setChennaiInsightsData] = useState(null);
    const [loadingChennai, setLoadingChennai] = useState(false);

  // CHENNAI SNA STATE
  const [snaData, setSnaData] = useState(null);
  const [activeSnaTab, setActiveSnaTab] = useState('map'); // map, graph, metrics, insights
  const [snaMode, setSnaMode] = useState('mega'); // basic, enhanced, mega

    // Translation State for Chennai Insights
    const [tamilMode, setTamilMode] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [tamilTranslations, setTamilTranslations] = useState({});

    const handleTranslateToggle = async () => {
        if (tamilMode) {
            setTamilMode(false);
            return;
        }
        if (tamilTranslations[chennaiFocus]) {
            setTamilMode(true);
            return;
        }
        setIsTranslating(true);
        try {
            const titleP = translateWithSarvam(chennaiInsightsData.title);
            const secretP = chennaiInsightsData.localSecret ? translateWithSarvam(chennaiInsightsData.localSecret) : Promise.resolve(null);
            const bestTimeP = chennaiInsightsData.bestTimeToExperience ? translateWithSarvam(chennaiInsightsData.bestTimeToExperience) : Promise.resolve(null);

            const highlightsP = Promise.all(chennaiInsightsData.highlights.map(async h => ({
                ...h,
                name: await translateWithSarvam(h.name) || h.name,
                description: await translateWithSarvam(h.description) || h.description
            })));

            const [titleTr, secretTr, bestTimeTr, newHighlights] = await Promise.all([titleP, secretP, bestTimeP, highlightsP]);

            setTamilTranslations(prev => ({
                ...prev,
                [chennaiFocus]: {
                    ...chennaiInsightsData,
                    title: titleTr || chennaiInsightsData.title,
                    localSecret: secretTr || chennaiInsightsData.localSecret,
                    highlights: newHighlights,
                    bestTimeToExperience: bestTimeTr || chennaiInsightsData.bestTimeToExperience
                }
            }));
            setTamilMode(true);
        } catch (e) { console.error('Translation error', e); }
        setIsTranslating(false);
    };

    const activeInsightsData = tamilMode && tamilTranslations[chennaiFocus]
        ? tamilTranslations[chennaiFocus]
        : chennaiInsightsData;

    // CHENNAI v4.0 STATE
    const isChennaiPage = id === 'chn';
    const [dynastyFilter, setDynastyFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [expandedPlaceId, setExpandedPlaceId] = useState(null);

    // SNA FETCH EFFECT
    useEffect(() => {
        if (isChennaiPage && !snaData) {
            computeChennaiSNA().then(setSnaData).catch(err => console.error("SNA Error:", err));
        }
    }, [isChennaiPage, snaData]);
    const [connectedSitesPlace, setConnectedSitesPlace] = useState(null);

    // Data Dictionary
    const destinationsData = {
        1: {
            name: 'Madurai', tagline: 'The Athens of the East',
            description: 'Madurai is one of the oldest living cities in the world. Known for the majestic Meenakshi Amman Temple, it is a city that never sleeps, vibrant with culture, history, and devotion.',
            image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2670&auto=format&fit=crop',
            price: 2500, rating: 4.8, reviews: 1240,
            images: [
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        2: {
            name: 'Thanjavur', tagline: 'Rice Bowl of Tamil Nadu',
            description: 'Home to the Great Living Chola Temples, Thanjavur is a hub of art, architecture, and culture. The Brihadeeswarar Temple is a marvel of engineering and devotion.',
            image: 'https://images.unsplash.com/photo-1627894006066-b4528dc9052b?q=80&w=2670&auto=format&fit=crop',
            price: 2200, rating: 4.9, reviews: 890,
            images: [
                'https://images.unsplash.com/photo-1599136152766-3d7c588523b0?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1627894006066-b4528dc9052b?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        },
        3: {
            name: 'Mahabalipuram', tagline: 'Stone Carvings & Shore Temples',
            description: 'A UNESCO World Heritage site known for its rock-cut temples and shore temple.',
            image: 'https://images.unsplash.com/photo-1621327017866-26795b87702f?q=80&w=2670&auto=format&fit=crop',
            price: 3000, rating: 4.7, reviews: 1560,
            images: [
                'https://images.unsplash.com/photo-1621327017866-26795b87702f?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        },
        4: {
            name: 'Ooty', tagline: 'Queen of Hill Stations',
            description: 'Famous for its tea gardens, pleasant weather, and the Nilgiri Mountain Railway.',
            image: 'https://images.unsplash.com/photo-1548685122-f6b97645f629?q=80&w=2670&auto=format&fit=crop',
            price: 4500, rating: 4.6, reviews: 2100,
            images: [
                'https://images.unsplash.com/photo-1548685122-f6b97645f629?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        5: {
            name: 'Kodaikanal', tagline: 'Princess of Hill Stations',
            description: 'Known for its star-shaped lake and misty cliffs. Kodaikanal offers a serene retreat with beautiful waterfalls and treks.',
            image: 'https://images.unsplash.com/photo-1596707328599-28c0c1969a59?q=80&w=2670&auto=format&fit=crop',
            price: 4000, rating: 4.7, reviews: 1800,
            images: [
                'https://images.unsplash.com/photo-1596707328599-28c0c1969a59?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        6: {
            name: 'Yercaud', tagline: 'Jewel of the South',
            description: 'A quiet and pristine hill station in the Shevaroy Hills.',
            image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=2574&auto=format&fit=crop',
            price: 3500, rating: 4.5, reviews: 650,
            images: [
                'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        7: {
            name: 'Dhanushkodi', tagline: 'Ghost Town & Mystic Beach',
            description: 'The last land of India, where the Indian Ocean meets the Bay of Bengal.',
            image: 'https://images.unsplash.com/photo-1616853610260-84524c552026?q=80&w=2670&auto=format&fit=crop',
            price: 3200, rating: 4.9, reviews: 950,
            images: [
                'https://images.unsplash.com/photo-1616853610260-84524c552026?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        },
        8: {
            name: 'Pondicherry', tagline: 'French Riviera of the East',
            description: 'A former French colony with a unique blend of Tamil and French culture.',
            image: 'https://images.unsplash.com/photo-1582915293040-349929235d25?q=80&w=2670&auto=format&fit=crop',
            price: 5000, rating: 4.7, reviews: 2500,
            images: [
                'https://images.unsplash.com/photo-1582915293040-349929235d25?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        9: {
            name: 'Kanyakumari', tagline: 'Tip of India',
            description: 'The southernmost tip of mainland India. Famous for spectacular sunrises and the Vivekananda Rock Memorial.',
            image: 'https://images.unsplash.com/photo-1598322634336-d446927d3536?q=80&w=2670&auto=format&fit=crop',
            price: 2800, rating: 4.6, reviews: 2200,
            images: [
                'https://images.unsplash.com/photo-1598322634336-d446927d3536?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        }
    };

    // Try to find from districts data by string ID, fallback to numeric ID
    const districtMatch = DISTRICTS.find(d => d.id === id);

    // Backend enrichment: merge DB attractions into static district data
    const [backendAttractions, setBackendAttractions] = useState(null);
    useEffect(() => {
        if (!districtMatch?.name) return;
        const fetchBackendData = async () => {
            try {
                const { placeService } = await import('../services/api');
                const res = await placeService.getPlaces(districtMatch.name);
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setBackendAttractions(res.data);
                }
            } catch (err) {
                console.debug('Backend places API unavailable, using static districts.js');
            }
        };
        fetchBackendData();
    }, [districtMatch?.name]);

    const destination = districtMatch
        ? { ...destinationsData[1], name: districtMatch.name, tagline: districtMatch.tagline, description: districtMatch.description, image: districtMatch.image, rating: districtMatch.safetyScore, reviews: Math.floor(Math.random() * 2000 + 500), price: Math.floor(Math.random() * 3000 + 2000), images: [districtMatch.image] }
        : (destinationsData[id] || destinationsData[1]);

    const isChennai = destination?.name === 'Chennai';

    useEffect(() => {
        if (!isChennai) return;
        const loadChennaiData = async () => {
            setLoadingChennai(true);
            setTamilMode(false);
            try {
                const data = await getChennaiTourismInsights(chennaiFocus);
                setChennaiInsightsData(data);
            } catch (err) {
                console.error("Failed to load Chennai insights", err);
            } finally {
                setLoadingChennai(false);
            }
        };
        loadChennaiData();
    }, [isChennai, chennaiFocus]);

    // Load AI content on tab click
    const loadAITab = async (tab) => {
        if (activeAITab === tab) { setActiveAITab(null); return; }
        setActiveAITab(tab);
        setAiLoading(true);
        try {
            if (tab === 'history' && !historyData) {
                const data = await getPlaceHistory(destination.name);
                setHistoryData(data);
            } else if (tab === 'unique' && !uniqueData) {
                const data = await getPlaceUniqueness(destination.name);
                setUniqueData(data);
            } else if (tab === 'gems' && !gemsData) {
                const data = await getHiddenGems(districtMatch?.name || destination.name);
                setGemsData(data);
            }
        } catch (err) {
            console.error('AI tab load error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    // Fetch AI-powered place details
    useEffect(() => {
        const loadPlaceData = async () => {
            setLoadingExtra(true);
            try {
                const data = await fetchPlaceDetails(destination.name);
                setPlaceData(data);
            } catch (err) {
                console.error('Failed to load place data:', err);
            } finally {
                setLoadingExtra(false);
            }
        };
        loadPlaceData();
    }, [destination.name]);

    const aiTabs = [
        { id: 'insights', label: 'Deep Insights', icon: <Sparkles size={16} />, color: 'text-vibrant-gold' },
        { id: 'history', label: 'Story', icon: <BookOpen size={16} />, color: 'text-vibrant-gold' },
        { id: 'unique', label: 'Unique', icon: <Camera size={16} />, color: 'text-vibrant-pink' },
        { id: 'gems', label: 'Hidden Gems', icon: <MapPin size={16} />, color: 'text-teal-400' },
    ];

    return (
        <div className="min-h-screen bg-transparent text-white relative">

            {/* HERO SECTION */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-black/30" />

                {/* Back Button */}
                <Link to="/explore" className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-black/60 transition-colors">
                    <ChevronLeft size={18} /> <span className="text-sm font-medium">Back</span>
                </Link>

                <div className="absolute bottom-0 left-0 p-10 container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="text-vibrant-gold font-bold tracking-widest uppercase mb-2 block">{destination.tagline}</span>
                        <h1 className="font-heading text-7xl md:text-9xl font-bold mb-4 text-glow-gold">{destination.name}</h1>
                        <div className="flex items-center gap-6 text-white/80 flex-wrap">
                            <span className="flex items-center gap-2"><MapPin size={20} className="text-vibrant-pink" /> Tamil Nadu, India</span>
                            <span className="flex items-center gap-2"><Star size={20} className="text-vibrant-gold fill-vibrant-gold" /> {destination.rating} ({destination.reviews} Reviews)</span>
                            {placeData?.bestTimeToVisit && (
                                <span className="flex items-center gap-2"><Sun size={20} className="text-yellow-400" /> Best: {placeData.bestTimeToVisit}</span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="container mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-3 gap-16">

                    {/* LEFT: Info */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                            <h2 className="font-heading text-4xl mb-6">About the Destination</h2>

                            {placeData?.civilisationalTagline ? (
                                <div className="mb-6 p-4 rounded-xl bg-vibrant-gold/10 border border-vibrant-gold/20 backdrop-blur-sm">
                                    <span className="text-vibrant-gold font-bold text-lg italic flex items-center gap-2">
                                        <Sparkles size={20} /> "{placeData.civilisationalTagline}"
                                    </span>
                                </div>
                            ) : (
                                <span className="text-vibrant-gold font-bold tracking-widest uppercase mb-4 block">{destination.tagline}</span>
                            )}

                            <p className="text-xl text-white/70 leading-relaxed font-light">
                                {placeData?.description || destination.description}
                            </p>

                            {placeData?.craftEconomy && (
                                <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                                    <span className="text-2xl mt-1">🧵</span>
                                    <div>
                                        <h4 className="text-purple-300 font-bold text-sm mb-1">Living Craft Economy</h4>
                                        <p className="text-white/70 text-sm leading-relaxed">{placeData.craftEconomy}</p>
                                    </div>
                                </div>
                            )}

                            {placeData?.highlights && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {placeData.highlights.map((h, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-vibrant-gold/10 border border-vibrant-gold/20 rounded-full text-sm text-vibrant-gold">{h}</span>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Interactive Maps */}
                        {districtMatch?.coordinates && (
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-heading text-3xl flex items-center gap-2"><MapPin size={24} className="text-vibrant-gold" /> Location</h3>
                                    <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                                        <button onClick={() => setMapProvider('ola')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mapProvider === 'ola' ? 'bg-vibrant-gold text-black' : 'text-white/60 hover:text-white'}`}>Ola Maps</button>
                                        <button onClick={() => setMapProvider('google')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mapProvider === 'google' ? 'bg-green-500 text-white' : 'text-white/60 hover:text-white'}`}>OpenStreetMap</button>
                                    </div>
                                </div>

                                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black/50">
                                    {mapProvider === 'ola' ? (
                                        <OlaMap
                                            center={[districtMatch.coordinates.lat, districtMatch.coordinates.lng]}
                                            title={destination.name}
                                            zoom={12}
                                        />
                                    ) : (
                                        <GoogleMap
                                            center={{ lat: districtMatch.coordinates.lat, lng: districtMatch.coordinates.lng }}
                                            title={destination.name}
                                            zoom={12}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* EXCLUSIVE CHENNAI TOURISM INSIGHTS */}
                        {isChennai && (
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-8 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <h3 className="font-heading text-3xl mb-2 flex items-center gap-3 relative z-10"><Sparkles className="text-blue-400" /> Chennai Exclusive Explorer</h3>
                                <p className="text-blue-200/70 text-sm mb-6 relative z-10">AI-Powered Deep Dive into Chennai's Living Civilisation</p>

                                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                    {['culture', 'festivals', 'food', 'heritage', 'architecture', 'dynasty'].map(focus => (
                                        <button
                                            key={focus}
                                            onClick={() => setChennaiFocus(focus)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all border ${chennaiFocus === focus ? 'bg-blue-500/20 border-blue-400 text-blue-300' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {focus === 'architecture' ? '🏛️ Architecture' : focus === 'dynasty' ? '👑 Dynasty' : focus}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative z-10 min-h-[200px]">
                                    {loadingChennai || isTranslating ? (
                                        <div className="flex flex-col items-center justify-center py-10">
                                            <Loader className="animate-spin text-blue-400 mb-4" size={32} />
                                            <p className="text-blue-300/60 text-sm">
                                                {isTranslating ? 'Translating to Tamil with Sarvam AI...' : 'Curating insights from Gemini & local archives...'}
                                            </p>
                                        </div>
                                    ) : activeInsightsData ? (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center flex-wrap gap-4">
                                                <h4 className="text-2xl font-bold text-white">{activeInsightsData.title}</h4>
                                                <button
                                                    onClick={handleTranslateToggle}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/20 rounded-full transition-colors text-sm font-medium"
                                                >
                                                    <span className={!tamilMode ? 'text-white' : 'text-white/50'}>EN</span>
                                                    <span className="text-white/30">|</span>
                                                    <span className={tamilMode ? 'text-yellow-400' : 'text-white/50'}>தமிழ்</span>
                                                </button>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {(activeInsightsData.highlights || []).map((h, i) => (
                                                    <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl hover:border-blue-500/30 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className={`font-bold text-blue-300 text-lg ${tamilMode ? 'font-tamil' : ''}`}>{h.name}</h5>
                                                            <span className="text-xs px-2 py-1 bg-white/10 rounded uppercase tracking-wider">{h.type}</span>
                                                        </div>
                                                        <p className={`text-white/70 text-sm leading-relaxed ${tamilMode ? 'font-tamil' : ''}`}>{h.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                {activeInsightsData.localSecret && (
                                                    <div className="bg-purple-900/40 p-4 rounded-xl border border-purple-500/30">
                                                        <span className="text-purple-300 text-xs font-bold uppercase tracking-widest block mb-1">Local Secret</span>
                                                        <p className={`text-white/90 text-sm ${tamilMode ? 'font-tamil' : ''}`}>{activeInsightsData.localSecret}</p>
                                                    </div>
                                                )}
                                                {activeInsightsData.bestTimeToExperience && (
                                                    <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-500/30">
                                                        <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest block mb-1">Best Time to Experience</span>
                                                        <p className={`text-white/90 text-sm ${tamilMode ? 'font-tamil' : ''}`}>{activeInsightsData.bestTimeToExperience}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ CITY STATISTICS ═══ */}
                        {districtMatch?.statistics?.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">📊 {districtMatch.name} at a Glance</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {districtMatch.statistics.map((stat, i) => (
                                        <div key={i} className="text-center p-5 bg-gradient-to-br from-vibrant-gold/10 to-transparent border border-vibrant-gold/20 rounded-2xl">
                                            <div className="text-[11px] text-white/50 uppercase tracking-widest mb-2">{stat.label}</div>
                                            <div className="text-3xl font-bold text-vibrant-gold">
                                                <AnimatedCounter end={parseInt(stat.value) || 0} suffix={stat.suffix || ''} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ ALL PLACES / ATTRACTIONS ═══ */}
                        {districtMatch?.places?.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">
                                    <Navigation size={24} className="text-vibrant-gold" /> Places to Visit in {districtMatch.name}
                                </h3>
                                <div className="grid gap-5">
                                    {districtMatch.places.map((place, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            viewport={{ once: true }}
                                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-vibrant-gold/30 transition-all duration-300 group"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-3xl mt-0.5 flex-shrink-0">{place.emoji}</span>
                                                    <div>
                                                        <Link
                                                            to={`/explore/${id}/${place.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-lg text-white group-hover:text-vibrant-gold transition-colors hover:underline"
                                                        >
                                                            {place.name}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className="text-xs px-2 py-0.5 bg-vibrant-gold/10 text-vibrant-gold border border-vibrant-gold/20 rounded-full font-bold">{place.category}</span>
                                                            {place.entryFee && <span className="text-xs text-green-400 font-bold">{place.entryFee}</span>}
                                                            {place.rating && <span className="text-xs text-yellow-400 flex items-center gap-1"><Star size={11} className="fill-yellow-400" />{place.rating}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-white/65 text-sm leading-relaxed mb-3">{place.description}</p>
                                            {place.historicalFact && (
                                                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 mb-3">
                                                    <p className="text-amber-300 text-xs leading-relaxed"><span className="font-bold">📜 Historical Fact: </span>{place.historicalFact}</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/45">
                                                {place.timings && <span>🕐 {place.timings}</span>}
                                                {place.bestTimeToVisit && <span>☀️ Best: {place.bestTimeToVisit}</span>}
                                                {place.location && <span className="md:col-span-2">📍 {place.location}</span>}
                                                {place.tips && (
                                                    <span className="md:col-span-2 text-teal-300/80">💡 Tip: {place.tips}</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ MUST-TRY FOOD (from static data) ═══ */}
                        {districtMatch?.mustTryFood?.length > 0 && !
                            placeData?.mustTryFood && (
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                    <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">🍛 Must-Try Food in {districtMatch.name}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {districtMatch.mustTryFood.map((food, i) => (
                                            <span key={i} className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-300 text-sm hover:bg-orange-500/20 transition-colors cursor-default">
                                                {food}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                        {/* ═══ PRACTICAL INFO ═══ */}
                        {districtMatch?.practicalInfo && (
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">🗺️ Practical Travel Guide</h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* Transport */}
                                    {districtMatch.practicalInfo.transport && (
                                        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5">
                                            <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">🚌 Getting Around</h4>
                                            <ul className="space-y-2">
                                                {districtMatch.practicalInfo.transport.map((t, i) => (
                                                    <li key={i} className="text-sm text-white/60 flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span>{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Stay */}
                                    {districtMatch.practicalInfo.bestAreaToStay && (
                                        <div className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-5">
                                            <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">🏨 Where to Stay</h4>
                                            <ul className="space-y-2">
                                                {districtMatch.practicalInfo.bestAreaToStay.map((s, i) => (
                                                    <li key={i} className="text-sm text-white/60 flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Airport */}
                                    {districtMatch.practicalInfo.nearestAirport && (
                                        <div className="bg-teal-500/5 border border-teal-500/15 rounded-2xl p-4 md:col-span-2">
                                            <span className="text-teal-300 font-bold text-sm">✈️ Nearest Airport: </span>
                                            <span className="text-white/60 text-sm">{districtMatch.practicalInfo.nearestAirport}</span>
                                        </div>
                                    )}
                                    {/* Safety Tips */}
                                    {districtMatch.practicalInfo.safetyTips && (
                                        <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5 md:col-span-2">
                                            <h4 className="font-bold text-green-300 mb-3 flex items-center gap-2"><Shield size={14} /> Safety Tips</h4>
                                            <ul className="grid md:grid-cols-2 gap-2">
                                                {districtMatch.practicalInfo.safetyTips.map((tip, i) => (
                                                    <li key={i} className="text-sm text-white/60 flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Image Gallery with Lightbox */}
                        <div>
                            <h3 className="font-heading text-3xl mb-6 mt-12 flex items-center gap-2"><Camera size={24} className="text-vibrant-gold" /> Gallery</h3>
                            <div className="space-y-4">
                                <img
                                    src={(placeData?.images || destination?.images || [])[activeGalleryIdx] || destination?.image}
                                    className="w-full h-[400px] object-cover rounded-2xl border border-white/10"
                                    alt="Gallery main"
                                />
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {(placeData?.images || destination?.images || []).map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            onClick={() => setActiveGalleryIdx(i)}
                                            className={`rounded-xl cursor-pointer w-full h-24 object-cover transition-all duration-300 ${activeGalleryIdx === i ? 'ring-2 ring-vibrant-gold scale-105' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                                            alt={`Gallery ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Must-Try Food */}
                                {placeData?.mustTryFood && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">
                                            🍛 Must-Try Food
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {placeData.mustTryFood.map((food, i) => (
                                                <span key={i} className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-300 text-sm">
                                                    {food}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Nearby Hotels */}
                                {(placeData?.hotels?.length > 0 || loadingExtra) && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">
                                            <Hotel size={24} className="text-blue-400" /> Where to Stay
                                        </h3>
                                        {loadingExtra ? (
                                            <div className="flex items-center gap-3 text-white/40 py-8">
                                                <Loader size={20} className="animate-spin" /> Loading hotel recommendations...
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {(placeData?.hotels || []).map((hotel, i) => (
                                                    <div key={i} className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 hover:bg-blue-500/10 transition-colors">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-lg text-white">{hotel.name}</h4>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-yellow-400 text-sm flex items-center gap-1">
                                                                        <Star size={14} className="fill-yellow-400" /> {hotel.rating}
                                                                    </span>
                                                                    {hotel.type && (
                                                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{hotel.type}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-vibrant-gold font-bold">{hotel.priceRange}</span>
                                                        </div>
                                                        {hotel.amenities && (
                                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                                {hotel.amenities.map((a, j) => (
                                                                    <span key={j} className="text-xs bg-white/5 text-white/50 px-2 py-1 rounded-md">{a}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Nearby Restaurants */}
                                {(placeData?.restaurants || loadingExtra) && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">
                                            <Utensils size={24} className="text-orange-400" /> Where to Eat
                                        </h3>
                                        {loadingExtra ? (
                                            <div className="flex items-center gap-3 text-white/40 py-8">
                                                <Loader size={20} className="animate-spin" /> Loading restaurant recommendations...
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {placeData.restaurants.map((rest, i) => (
                                                    <div key={i} className="bg-orange-500/5 border border-orange-500/15 rounded-2xl p-5 hover:bg-orange-500/10 transition-colors">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-lg text-white">{rest.name}</h4>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-yellow-400 text-sm flex items-center gap-1">
                                                                        <Star size={14} className="fill-yellow-400" /> {rest.rating}
                                                                    </span>
                                                                    <span className="text-xs text-white/40">{rest.cuisine}</span>
                                                                </div>
                                                            </div>
                                                            {rest.priceRange && <span className="text-white/50 text-sm">{rest.priceRange}</span>}
                                                        </div>
                                                        {rest.mustTry && (
                                                            <div className="mt-2 text-sm text-orange-300">
                                                                ✨ Must try: {rest.mustTry}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Attractions */}
                                {placeData?.attractions && placeData.attractions.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h3 className="font-heading text-3xl mb-6 flex items-center gap-2">
                                            <Navigation size={24} className="text-vibrant-gold" /> Must-Visit Attractions
                                        </h3>
                                        <div className="grid gap-4">
                                            {placeData.attractions.map((attr, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-white">{attr.name}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-yellow-400 text-sm flex items-center gap-1">
                                                                    <Star size={14} className="fill-yellow-400" /> {attr.rating}
                                                                </span>
                                                                <span className="text-xs bg-vibrant-gold/10 text-vibrant-gold px-2 py-0.5 rounded-full">{attr.type}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            <div className="text-vibrant-gold">{attr.entryFee}</div>
                                                            {attr.timings && <div className="text-white/40 text-xs mt-1">{attr.timings}</div>}
                                                        </div>
                                                    </div>
                                                    {attr.description && <p className="text-sm text-white/50 mt-2">{attr.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Curated Hotels (from districtMatch) */}
                                {districtMatch?.hotels?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h3 className="font-heading text-3xl mb-6 flex items-center gap-2 mt-12">
                                            <Hotel size={24} className="text-blue-400" /> Curated Stays
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {districtMatch.hotels.map((hotel, i) => (
                                                <div key={i} className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 hover:bg-blue-500/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-lg text-white">{hotel.name}</h4>
                                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{hotel.category}</span>
                                                    </div>
                                                    <p className="text-xs text-vibrant-gold mb-2 flex items-center gap-1"><MapPin size={12} /> {hotel.location}</p>
                                                    <p className="text-sm text-white/60 leading-relaxed">{hotel.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Entertainment (from districtMatch) */}
                                {districtMatch?.entertainment?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h3 className="font-heading text-3xl mb-6 flex items-center gap-2 mt-12">
                                            <Ticket size={24} className="text-purple-400" /> Entertainment & Leisure
                                        </h3>
                                        <div className="grid gap-4">
                                            {districtMatch.entertainment.map((ent, i) => (
                                                <div key={i} className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5 hover:bg-purple-900/20 transition-colors">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-bold text-lg text-white">{ent.name}</h4>
                                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{ent.type}</span>
                                                    </div>
                                                    <p className="text-sm text-white/60">{ent.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ═══ AI-POWERED INSIGHTS ═══ */}
                                <div className="mt-16">
                                    <h2 className="font-heading text-3xl mb-6 flex items-center gap-3">
                                        <Sparkles className="text-vibrant-gold" /> AI-Powered Insights
                                    </h2>
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {aiTabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => loadAITab(tab.id)}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${activeAITab === tab.id
                                                    ? `bg-white/10 ${tab.color} border-${tab.color.split('-')[1]}-500/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                                                    : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {tab.icon} {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {activeAITab && (
                                            <motion.div
                                                key={activeAITab}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                                            >
                                                {aiLoading ? (
                                                    <div className="flex flex-col items-center py-12">
                                                        <Loader className="w-8 h-8 text-vibrant-gold animate-spin mb-3" />
                                                        <p className="text-white/60 text-sm">AI is researching {destination.name}...</p>
                                                        <p className="text-white/30 text-xs mt-1">Using Gemini + Groq/Llama 4 + HuggingFace</p>
                                                    </div>
                                                ) : activeAITab === 'insights' && placeData ? (
                                                    <div className="space-y-8">
                                                        {/* Deep Insights Tab (New) */}
                                                        <div>
                                                            <h3 className="font-heading text-2xl text-vibrant-gold mb-6 flex items-center gap-2">
                                                                <Sparkles className="text-yellow-400" /> Deep Civilisational Insights
                                                            </h3>
                                                            {(historyData?.numberInsights?.length > 0 || placeData?.numberInsights?.length > 0) && (
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-white/10 mb-6 pb-6">
                                                                    {(historyData?.numberInsights || placeData?.numberInsights || []).map((insight, i) => (
                                                                        <div key={i} className="text-center p-2 bg-black/20 rounded-xl border border-white/5">
                                                                            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{insight.label}</div>
                                                                            <div className="text-2xl font-bold text-vibrant-gold">
                                                                                <AnimatedCounter end={parseInt(insight.value) || 0} prefix={insight.prefix || ''} suffix={insight.suffix || ''} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {(placeData?.culturalInsights || districtMatch?.culturalInsights)?.length > 0 && (
                                                            <div>
                                                                <h4 className="font-bold text-vibrant-pink text-lg mb-4 flex items-center gap-2">🎭 Living Culture — {districtMatch?.name}</h4>
                                                                <ul className="space-y-3">
                                                                    {(placeData?.culturalInsights || districtMatch?.culturalInsights || []).map((insight, i) => (
                                                                        <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                                                            <span className="text-vibrant-gold mt-1">✦</span>
                                                                            <p className="text-white/80 leading-relaxed text-sm font-light">{insight}</p>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {(placeData?.festivals || districtMatch?.festivals)?.length > 0 && (
                                                            <div>
                                                                <h4 className="font-bold text-yellow-400 text-lg mb-4 flex items-center gap-2">🪔 Major Festivals</h4>
                                                                <div className="grid gap-4">
                                                                    {(placeData?.festivals || districtMatch?.festivals || []).map((festival, i) => (
                                                                        <div key={i} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4 rounded-xl border border-yellow-500/20">
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <h5 className="font-bold text-yellow-300">{festival.name}</h5>
                                                                                <span className="text-xs font-bold px-2 py-1 bg-black/30 rounded-full text-white/70">{festival.month}</span>
                                                                            </div>
                                                                            <p className="text-sm text-white/70 leading-relaxed">{festival.description}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : activeAITab === 'history' && historyData ? (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                                            <h3 className="font-heading text-2xl text-vibrant-gold">{historyData.title || `History of ${destination.name}`}</h3>
                                                            {historyData.era && <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{historyData.era}</span>}
                                                        </div>

                                                        {historyData.dynasties?.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {historyData.dynasties.map((d, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-300 font-bold">{d}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {historyData.timeline?.length > 0 && (
                                                            <div className="space-y-3 border-l-2 border-vibrant-gold/30 pl-4">
                                                                {historyData.timeline.map((item, i) => (
                                                                    <div key={i}>
                                                                        <span className="text-vibrant-gold font-bold text-sm">{item.year}</span>
                                                                        <p className="text-white/70 text-sm">{item.event}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="text-white/70 leading-relaxed whitespace-pre-line">{historyData.narrative}</p>
                                                        {historyData.civilisationalSignificance && (
                                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                                <span className="text-blue-300 font-bold text-sm">🏛️ Civilisational Significance:</span>
                                                                <p className="text-white/80 text-sm mt-1">{historyData.civilisationalSignificance}</p>
                                                            </div>
                                                        )}
                                                        {historyData.livingTradition && (
                                                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                                                                <span className="text-2xl">🕯️</span>
                                                                <div>
                                                                    <span className="text-green-400 font-bold text-sm">Still Alive Today:</span>
                                                                    <p className="text-white/80 text-sm mt-1">{historyData.livingTradition}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {historyData.funFact && (
                                                            <div className="bg-vibrant-gold/10 border border-vibrant-gold/20 rounded-xl p-4">
                                                                <span className="text-vibrant-gold font-bold text-sm">💡 Did You Know?</span>
                                                                <p className="text-white/80 text-sm mt-1">{historyData.funFact}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : activeAITab === 'unique' && uniqueData ? (
                                                    <div className="space-y-6">
                                                        {uniqueData.tagline && <p className="text-xl text-vibrant-pink font-light italic">"{uniqueData.tagline}"</p>}
                                                        {uniqueData.civilisationalRole && (
                                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                                                <span className="text-amber-300 font-bold text-sm">🏺 Role in Tamil Civilisation:</span>
                                                                <p className="text-white/80 text-sm mt-1">{uniqueData.civilisationalRole}</p>
                                                            </div>
                                                        )}
                                                        {uniqueData.uniqueFeatures?.length > 0 && (
                                                            <div className="grid gap-4">
                                                                {uniqueData.uniqueFeatures.map((f, i) => (
                                                                    <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                                                        <span className="text-3xl">{f.icon || '✨'}</span>
                                                                        <div>
                                                                            <h4 className="font-bold text-white">{f.title}</h4>
                                                                            <p className="text-white/60 text-sm">{f.description}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {uniqueData.livingCulture && (
                                                            <div className="flex gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                                <span className="text-2xl flex-shrink-0">🪔</span>
                                                                <div>
                                                                    <h4 className="font-bold text-green-400 text-sm mb-1">Living Culture — Still Practiced Today</h4>
                                                                    <p className="text-white/70 text-sm">{uniqueData.livingCulture}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {uniqueData.bestKeptSecrets?.length > 0 && (
                                                            <div>
                                                                <h4 className="font-bold text-sm text-purple-400 uppercase tracking-wider mb-3">🤫 Best-Kept Secrets</h4>
                                                                <ul className="space-y-2">
                                                                    {uniqueData.bestKeptSecrets.map((s, i) => (
                                                                        <li key={i} className="text-white/70 text-sm flex items-start gap-2"><Gem size={14} className="text-purple-400 mt-0.5 flex-shrink-0" /> {s}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {uniqueData.photographySpots?.length > 0 && (
                                                            <div>
                                                                <h4 className="font-bold text-sm text-blue-400 uppercase tracking-wider mb-3">📸 Photography Spots</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {uniqueData.photographySpots.map((s, i) => (
                                                                        <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">{s}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {uniqueData.bestExperience && (
                                                            <div className="bg-vibrant-pink/10 border border-vibrant-pink/20 rounded-xl p-4">
                                                                <span className="text-vibrant-pink font-bold text-sm">🌟 Must-Do Experience:</span>
                                                                <p className="text-white/80 text-sm mt-1">{uniqueData.bestExperience}</p>
                                                            </div>
                                                        )}
                                                        {uniqueData.whatBooksWontTellYou && (
                                                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                                                <span className="text-purple-300 font-bold text-sm">📖 What Travel Books Won't Tell You:</span>
                                                                <p className="text-white/80 text-sm mt-1">{uniqueData.whatBooksWontTellYou}</p>
                                                            </div>
                                                        )}
                                                        {uniqueData.localTip && (
                                                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                                                <span className="text-green-400 font-bold text-sm">🗣️ Local Tip:</span>
                                                                <p className="text-white/80 text-sm mt-1">{uniqueData.localTip}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : activeAITab === 'gems' && gemsData?.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {gemsData.map((gem, i) => (
                                                            <div key={i} className="p-5 bg-purple-900/10 border border-purple-500/20 rounded-xl hover:bg-purple-900/20 transition-colors">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Gem size={16} className="text-purple-400" />
                                                                    <h4 className="font-bold text-white">{gem.name}</h4>
                                                                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded uppercase">{gem.type}</span>
                                                                    {gem.crowd && <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${gem.crowd === 'Low' ? 'bg-green-500/20 text-green-300' : gem.crowd === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{gem.crowd} Crowd</span>}
                                                                </div>
                                                                <p className="text-white/60 text-sm mb-2">{gem.description}</p>
                                                                {gem.historicalNote && (
                                                                    <p className="text-amber-300/70 text-xs italic mb-2 flex items-start gap-1"><span>📜</span>{gem.historicalNote}</p>
                                                                )}
                                                                <div className="text-xs text-white/40 space-y-1">
                                                                    {gem.howToReach && <p>📍 {gem.howToReach}</p>}
                                                                    {gem.bestTime && <p>🕐 Best: {gem.bestTime}</p>}
                                                                    {gem.tip && <p>💡 {gem.tip}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-white/40 text-center py-8">No data available yet. Try again.</p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* RIGHT: Booking Card */}
                            <div className="relative">
                                <div className="sticky top-32 space-y-6">
                                    {/* Price & Actions */}
                                    <div className="flex justify-between items-center">
                                        <div className="text-3xl font-bold text-white">₹{destination.price}<span className="text-base font-normal text-white/60"> / person</span></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsSaved(!isSaved)} className={`p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors ${isSaved ? 'text-vibrant-pink' : 'text-white'}`}>
                                                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                                            </button>
                                            <button className="p-3 rounded-full border border-white/10 hover:bg-white/10 text-white transition-colors">
                                                <Share2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <BookingForm destinationName={destination.name} pricePerPerson={destination.price} />

                                    {/* Quick Info */}
                                    {placeData && (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                                            <h4 className="font-bold text-sm uppercase tracking-widest text-vibrant-gold">Quick Info</h4>
                                            {placeData.bestTimeToVisit && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/40">Best Time</span>
                                                    <span>{placeData.bestTimeToVisit}</span>
                                                </div>
                                            )}
                                            {placeData.averageTemp && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/40">Temperature</span>
                                                    <span>{placeData.averageTemp}</span>
                                                </div>
                                            )}
                                            {placeData.nearestAirport && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/40">Nearest Airport</span>
                                                    <span className="text-right text-xs">{placeData.nearestAirport}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Safety Tips */}
                                    {placeData?.safetyTips && (
                                        <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5">
                                            <h4 className="font-bold text-sm uppercase tracking-widest text-green-400 flex items-center gap-2 mb-3">
                                                <Shield size={14} /> Safety Tips
                                            </h4>
                                            <ul className="space-y-2">
                                                {placeData.safetyTips.map((tip, i) => (
                                                    <li key={i} className="text-sm text-white/60">{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Infrastructure & Transport */}
                                    {districtMatch?.infrastructure && (
                                        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 space-y-6">
                                            {districtMatch.infrastructure.transportHubs && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-3">
                                                        <Train size={14} /> Major Transport Hubs
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {districtMatch.infrastructure.transportHubs.map((hub, i) => (
                                                            <li key={i} className="text-sm text-white/70">
                                                                <span className="text-white font-medium">{hub.name}</span>
                                                                <div className="text-xs text-blue-300 mt-0.5">{hub.type} • {hub.location}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {districtMatch.infrastructure.petrolPumps && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-orange-400 flex items-center gap-2 mb-3">
                                                        <Fuel size={14} /> Notable Fuel Stations
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {districtMatch.infrastructure.petrolPumps.map((pump, i) => (
                                                            <li key={i} className="text-xs text-white/60 border-l-2 border-orange-500/30 pl-2">{pump}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {districtMatch.infrastructure.malls && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-vibrant-pink flex items-center gap-2 mb-3">
                                                        <ShoppingBag size={14} /> Popular Malls
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {districtMatch.infrastructure.malls.map((mall, i) => (
                                                            <li key={i} className="text-sm text-white/70">
                                                                <span className="text-white font-medium block">{mall.name}</span>
                                                                <span className="text-xs text-white/40">{mall.location}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {districtMatch.infrastructure.markets && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-[#FF5A5F] flex items-center gap-2 mb-3">
                                                        <Store size={14} /> Iconic Markets
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {districtMatch.infrastructure.markets.map((market, i) => (
                                                            <li key={i} className="text-sm text-white/70">
                                                                <span className="text-white font-medium block">{market.name}</span>
                                                                <span className="text-xs text-[#FF5A5F]/70">{market.location}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {districtMatch.infrastructure.hospitals && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-3">
                                                        <Hospital size={14} /> Major Hospitals
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {districtMatch.infrastructure.hospitals.map((hospital, i) => (
                                                            <li key={i} className="text-sm text-white/70">
                                                                <span className="text-white font-medium block">{hospital.name}</span>
                                                                <span className="text-xs text-emerald-300">{hospital.location}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {districtMatch.infrastructure.education && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-purple-400 flex items-center gap-2 mb-3">
                                                        <GraduationCap size={14} /> Educational Hubs
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {districtMatch.infrastructure.education.map((edu, i) => (
                                                            <li key={i} className="text-sm text-white/70">
                                                                <span className="text-white font-medium block">{edu.name}</span>
                                                                <span className="text-xs text-purple-300">{edu.location}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {districtMatch.infrastructure.itParks && (
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-widest text-teal-300 flex items-center gap-2 mb-3">
                                                        <Building2 size={14} /> Prominent IT Parks
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {districtMatch.infrastructure.itParks.map((park, i) => (
                                                            <li key={i} className="text-sm text-white/70">
                                                                <span className="text-white font-medium block">{park.name}</span>
                                                                <span className="text-xs text-teal-200">{park.location}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Plan Trip CTA */}
                                    <Link
                                        to="/trip-planner"
                                        className="block w-full text-center py-4 bg-gradient-to-r from-vibrant-gold to-vibrant-orange text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-[0_0_25px_rgba(255,204,0,0.3)]"
                                    >
                                        🗺️ Plan a Trip Here
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ── CHENNAI v4.0 SECTIONS — guarded, appended after all existing content ── */}
            {isChennaiPage && (() => {
                const districtMatch = DISTRICTS.find(d => d.id === 'chn');
                const allPlaces = districtMatch?.places || [];
                const filteredPlaces = allPlaces.filter(p => {
                    const dynastyMatch = !dynastyFilter || p.dynasty === dynastyFilter;
                    const typeMatch = !typeFilter || p.placeType === typeFilter;
                    return dynastyMatch && typeMatch;
                });
                const availableDynasties = [...new Set(allPlaces.map(p => p.dynasty).filter(Boolean))];
                const availableTypes = [...new Set(allPlaces.map(p => p.placeType).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 space-y-8">

      {/* ── SNA HERITAGE NETWORK — FIRST SECTION ── */}
      {/* Toggle between Basic, Enhanced, and Mega SNA */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 uppercase tracking-widest">SNA Mode:</span>
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setSnaMode('basic')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                snaMode === 'basic'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              📊 Basic
            </button>
            <button
              onClick={() => setSnaMode('enhanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                snaMode === 'enhanced'
                  ? 'bg-vibrant-gold text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              ✨ Enhanced
            </button>
            <button
              onClick={() => setSnaMode('mega')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                snaMode === 'mega'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              🌍 Mega-City
            </button>
          </div>
        </div>
        {snaMode === 'enhanced' && (
          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
            🆕 Tourism Metrics + Circuits
          </span>
        )}
        {snaMode === 'mega' && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            🏙️ 100+ Urban Nodes Loaded
          </span>
        )}
      </div>

      {/* Conditional SNA Section Rendering */}
      {snaMode === 'mega' ? (
        <ChennaiSNAMegaSection />
      ) : snaMode === 'enhanced' ? (
        <ChennaiSNAEnhancedSection />
      ) : (
        <ChennaiSNASection />
      )}

      {/* Phase 2 Section - Advanced Visualizations */}
      {snaMode === 'enhanced' && (
        <ChennaiSNAPhase2Section />
      )}



                        {/* SECTION A: Dynasty & Type Filter */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-1">Explore by Era & Type</h2>
                            <p className="text-white/50 text-sm mb-5">Filter Chennai's 2,000 years of heritage</p>
                            <ChennaiPlaceFilterBar
                                activeDynasty={dynastyFilter}
                                activeType={typeFilter}
                                onDynastyChange={setDynastyFilter}
                                onTypeChange={setTypeFilter}
                                availableDynasties={availableDynasties}
                                availableTypes={availableTypes}
                            />
                        </div>

                        {/* SECTION B: Knowledge Panels */}
                        <div>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white">Discover the Places</h2>
                                <p className="text-white/50 text-sm mt-1">Tap any place to explore its full story</p>
                            </div>
                            {filteredPlaces.length === 0 && (
                                <p className="text-white/30 text-sm text-center py-8">No places match the selected filters</p>
                            )}
                            <div className="space-y-3">
                                {filteredPlaces.map(place => (
                                    <ChennaiPlaceKnowledgePanel
                                        key={place.name}
                                        place={place}
                                        isExpanded={expandedPlaceId === place.name}
                                        onToggle={() => setExpandedPlaceId(
                                            expandedPlaceId === place.name ? null : place.name
                                        )}
                                        onConnectedSites={() => setConnectedSitesPlace(place.name)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* SECTION C: Historical Timeline */}
                        <ChennaiHistoricalTimeline />

                        {/* SECTION D: Video Documentary Section */}
                        <ChennaiVideoSection videos={getAllVideos()} />

                        {/* SECTION E: Events Calendar */}
                        <ChennaiEventsCalendar />

                        {/* SECTION F: Street Food Map */}
                        <ChennaiStreetFoodMap />

                        {/* SECTION G: Connected Sites Map (modal, conditional) */}
                        <AnimatePresence>
                            {connectedSitesPlace && (
                                <ChennaiConnectedSitesMap
                                    placeName={connectedSitesPlace}
                                    onClose={() => setConnectedSitesPlace(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                );
            })()}

            <Footer />
        </div>
    );
};

export default DestinationDetails;
