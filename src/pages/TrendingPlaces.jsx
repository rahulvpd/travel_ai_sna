import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Star, Flame, Gem, Loader, Sparkles, ArrowRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ui/ParticleBackground';
import { getTrendingPlaces, getHiddenGems } from '../services/aiOrchestrator';
import { DISTRICTS } from '../data/districts';

// Map trending place names to district data for images
const findDistrictImage = (name) => {
    const d = DISTRICTS.find(d =>
        d.name.toLowerCase() === name.toLowerCase() ||
        d.bestPlace?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(d.name.toLowerCase())
    );
    return d?.image || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop';
};

const findDistrictId = (name) => {
    const d = DISTRICTS.find(d =>
        d.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(d.name.toLowerCase())
    );
    return d?.id || '';
};

const REGIONS = ['All', 'North', 'South', 'Central', 'West', 'East'];

const categoryColors = {
  'Festival': 'bg-vibrant-pink text-white',
  'Nature': 'bg-green-500 text-white',
  'Heritage': 'bg-vibrant-gold text-black',
  'Heritage & AI': 'bg-gradient-to-r from-vibrant-gold to-vibrant-pink text-black',
  'Beach': 'bg-blue-500 text-white',
  'Hill Station': 'bg-purple-500 text-white',
  'Spiritual': 'bg-orange-500 text-white',
  'Adventure': 'bg-red-500 text-white',
};

// Static fallback — always available
const buildStaticFallback = () =>
  DISTRICTS
  .filter(d => d.safetyScore >= 4.5)
  .sort((a, b) => {
    if (a.id === 'chn') return -1;
    if (b.id === 'chn') return 1;
    if (a.trending && !b.trending) return -1;
    if (!a.trending && b.trending) return 1;
    return b.safetyScore - a.safetyScore;
  })
  .slice(0, 12)
  .map(d => ({
    name: d.name,
    district: d.name,
    region: d.region || 'Central',
    trendReason: d.trendReason || d.tagline || `Top destination in Tamil Nadu`,
    category: d.id === 'chn' ? 'Heritage & AI' : 'Heritage',
    civilisationalAngle: d.description?.slice(0, 80) + '...',
    summary: d.description || `${d.name} is a must-visit destination in Tamil Nadu.`,
    bestFor: 'All travelers',
    rating: d.safetyScore,
  }));

const TrendingPlaces = () => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUsingFallback, setIsUsingFallback] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [showGems, setShowGems] = useState(false);
    const [gems, setGems] = useState([]);
    const [gemsLoading, setGemsLoading] = useState(false);
    const [selectedGemDistrict, setSelectedGemDistrict] = useState('');

    useEffect(() => {
        loadTrending();
    }, []);

const loadTrending = async () => {
    setLoading(true);
    setIsUsingFallback(false);
    try {
      const aiData = await getTrendingPlaces();
      if (aiData && aiData.length > 0) {
        // Ensure Chennai is always included
        const chennaiDistrict = DISTRICTS.find(d => d.id === 'chn');
        const hasChennai = aiData.some(p => p.name === 'Chennai' || p.district === 'Chennai');
        let data = [...aiData];
        if (!hasChennai && chennaiDistrict) {
          data = [{
            name: 'Chennai',
            district: 'Chennai',
            region: 'East',
            trendReason: chennaiDistrict.trendReason || 'Margazhi Music Season & Heritage Walks',
            category: 'Heritage & AI',
            civilisationalAngle: '2,000 years of unbroken civilisational continuity with AI-powered heritage network analysis',
            summary: chennaiDistrict.description?.slice(0, 150) || 'The living gateway to South India\'s ancient soul.',
            bestFor: 'All travelers',
            rating: chennaiDistrict.safetyScore || 4.6,
          }, ...data];
        }
        setTrending(data);
      } else {
        // AI returned empty (e.g. JSON parse fail after 429 quota)
        setTrending(buildStaticFallback());
        setIsUsingFallback(true);
      }
    } catch {
      // All engines failed — use static data silently
      setTrending(buildStaticFallback());
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

    const loadGems = async (districtName) => {
        setSelectedGemDistrict(districtName);
        setGemsLoading(true);
        try {
            const data = await getHiddenGems(districtName);
            setGems(data);
        } catch {
            setGems([]);
        } finally {
            setGemsLoading(false);
        }
    };

    const filtered = selectedRegion === 'All'
        ? trending
        : trending.filter(p => p.region === selectedRegion);

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
            <ParticleBackground />
            <div className="fixed inset-0 bg-gradient-to-br from-orange-900/20 via-black/60 to-red-900/20 pointer-events-none" />

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                        <span className="text-sm font-medium text-orange-400 tracking-wider uppercase">Live Trend Analysis</span>
                    </div>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 text-glow-gold">
                        Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-vibrant-pink">Right Now</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        AI-curated top destinations across Tamil Nadu based on season, festivals, weather, and traveler buzz.
                    </p>
                </motion.div>

                {/* Fallback Banner */}
                {isUsingFallback && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs max-w-lg mx-auto"
                    >
                        <Database className="w-3.5 h-3.5 text-amber-400/70" />
                        <span>AI quota reached — showing curated local data. <button onClick={loadTrending} className="text-amber-400/80 hover:text-amber-300 underline ml-1">Retry AI</button></span>
                    </motion.div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    {REGIONS.map(region => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${selectedRegion === region
                                ? 'bg-vibrant-gold text-black border-vibrant-gold shadow-[0_0_15px_rgba(255,204,0,0.3)]'
                                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowGems(!showGems)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${showGems
                            ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                            : 'border-white/15 text-white/70 hover:border-purple-400 hover:text-purple-300'
                            }`}
                    >
                        <Gem size={14} /> Hidden Gems
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">
                        <Loader className="w-12 h-12 text-vibrant-gold animate-spin mx-auto mb-4" />
                        <p className="text-white/60">AI is analyzing trending destinations...</p>
                    </div>
                ) : (
                    <>
                        {/* Trending Grid */}
                        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((place, idx) => (
                                    <motion.div
                                        key={place.name}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative rounded-3xl overflow-hidden border border-white/10 bg-glass-white backdrop-blur-sm hover:border-vibrant-gold/30 transition-all cursor-pointer shadow-xl"
                                    >
                                        {/* Image */}
                                        <div className="h-52 relative overflow-hidden">
                                            <img
                                                src={findDistrictImage(place.district || place.name)}
                                                alt={place.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Category Badge */}
                                            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${categoryColors[place.category] || 'bg-white/20 text-white'}`}>
                                                {place.category}
                                            </span>

                                            {/* Trend Badge */}
                                            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-orange-500/90 rounded-full">
                                                <TrendingUp size={12} />
                                                <span className="text-[10px] font-bold">TRENDING</span>
                                            </div>

                                            {/* Rating */}
                                            {place.rating && (
                                                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                    <Star size={12} className="text-vibrant-gold fill-vibrant-gold" />
                                                    <span className="text-xs font-bold">{place.rating}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-heading text-xl font-bold group-hover:text-vibrant-gold transition-colors">{place.name}</h3>
                                            </div>

                                            <div className="flex items-center gap-1 text-white/50 text-xs mb-3">
                                                <MapPin size={12} />
                                                <span>{place.district || place.name}, {place.region}</span>
                                            </div>

                                            <p className="text-white/60 text-sm line-clamp-2 mb-3">{place.summary}</p>

                                            {/* Trend Reason */}
                                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
                                                <Sparkles size={12} className="text-orange-400 flex-shrink-0" />
                                                <span className="text-orange-300 text-xs">{place.trendReason}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{place.bestFor}</span>
                                                <Link
                                                    to={`/explore/${findDistrictId(place.district || place.name) || place.name.toLowerCase()}`}
                                                    className="flex items-center gap-1 text-vibrant-gold text-xs font-bold hover:underline"
                                                >
                                                    Explore <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filtered.length === 0 && (
                            <div className="text-center py-16 text-white/40">
                                <p className="text-lg">No trending places found for this region.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Hidden Gems Section */}
                <AnimatePresence>
                    {showGems && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="font-heading text-4xl text-glow-gold flex items-center justify-center gap-3">
                                    <Gem className="text-purple-400" /> Hidden Gems Explorer
                                </h2>
                                <p className="text-white/60 mt-2">Select a district to discover its best-kept secrets</p>
                            </div>

                            {/* District Selector */}
                            <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-4xl mx-auto">
                                {DISTRICTS.slice(0, 20).map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => loadGems(d.name)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedGemDistrict === d.name
                                            ? 'bg-purple-600 text-white border-purple-500'
                                            : 'border-white/10 text-white/60 hover:border-purple-400 hover:text-white'
                                            }`}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                            </div>

                            {/* Gems Results */}
                            {gemsLoading ? (
                                <div className="text-center py-12">
                                    <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                                    <p className="text-white/60 text-sm">Discovering hidden gems in {selectedGemDistrict}...</p>
                                </div>
                            ) : gems.length > 0 && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gems.map((gem, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-6 rounded-2xl bg-purple-900/20 border border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-all"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <Gem size={16} className="text-purple-400" />
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase tracking-wider">
                                                    {gem.type}
                                                </span>
                                                <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold ${gem.crowd === 'Low' ? 'bg-green-500/20 text-green-300' : gem.crowd === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {gem.crowd} Crowd
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-lg mb-2">{gem.name}</h4>
                                            <p className="text-white/60 text-sm mb-3">{gem.description}</p>
                                            <div className="text-xs text-white/40 space-y-1">
                                                <p>📍 {gem.howToReach}</p>
                                                <p>🕐 Best: {gem.bestTime}</p>
                                                <p>💡 {gem.tip}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TrendingPlaces;
