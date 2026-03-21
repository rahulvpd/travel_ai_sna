import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Cloud, Users, Navigation, Share2, Download, ArrowRight, Sun, Loader } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';
import { generateItinerary } from '../services/gemini';

const ItineraryGenerator = () => {
    const location = useLocation();
    const preferences = location.state?.preferences || {
        destination: 'Madurai',
        mood: 'spiritual',
        duration: 3,
        budget: 'Standard',
        travelers: 2
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itineraryData, setItineraryData] = useState(null);
    const [selectedDay, setSelectedDay] = useState(1);

    // Generate itinerary on mount
    useEffect(() => {
        const fetchItinerary = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await generateItinerary(
                    preferences.destination || 'Madurai',
                    preferences.travelers || 2,
                    preferences.budget || 'Standard',
                    preferences.mood || 'spiritual',
                    preferences.duration || 3
                );
                setItineraryData(data);
            } catch (err) {
                setError("Failed to generate itinerary. Showing sample data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchItinerary();
    }, [preferences.destination, preferences.duration, preferences.travelers, preferences.budget, preferences.mood]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-transparent text-white relative font-sans flex items-center justify-center">
                <ParticleBackground />
                <Navbar />
                <div className="text-center">
                    <Loader className="w-12 h-12 text-vibrant-gold animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-heading">Crafting Your Perfect Journey...</h2>
                    <p className="text-white/60 mt-2">Our AI is preparing a personalized itinerary for {preferences.destination}</p>
                </div>
            </div>
        );
    }

    // Error state (will show mock data)
    const itinerary = itineraryData?.days || [];
    const destination = preferences.destination || 'Madurai';

    return (
        <div className="min-h-screen bg-transparent text-white relative font-sans">
            <ParticleBackground />
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />

            <Navbar />

            <div className="relative pt-32 pb-10 container mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <span className="text-vibrant-gold uppercase tracking-widest text-sm font-bold block mb-2">Your AI-Crafted Journey</span>
                    <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 text-glow-gold">{destination}: Discover Tamil Nadu</h1>
                    <div className="flex justify-center gap-4 text-white/60 text-sm">
                        <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{preferences.mood} Vibes</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{preferences.duration} Days</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{preferences.travelers} Travelers</span>
                    </div>
                    {error && (
                        <p className="text-yellow-400 text-sm mt-2 bg-yellow-500/10 py-2 px-4 rounded-lg inline-block">{error}</p>
                    )}
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-8 pb-20">

                    {/* Sidebar: Day Selector & Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Travel AI Metrics Widget */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Cloud size={100} /></div>
                            <h3 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                Cognitive Metrics
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                    <div>
                                        <div className="text-white/50 text-[10px] mb-0.5 uppercase tracking-wide">Environmental Stress (ESI)</div>
                                        <div className="text-xl font-bold text-white">{itineraryData?.travelAIMetrics?.esiScore || 24}<span className="text-xs text-white/40 ml-1">/100</span></div>
                                    </div>
                                    <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Low Friction</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <div className="text-white/50 text-[10px] mb-1 uppercase tracking-wide">Eco-Score</div>
                                        <div className="text-2xl font-bold text-vibrant-gold mb-1">{itineraryData?.travelAIMetrics?.ecoScore || 'A'}</div>
                                    </div>
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <div className="text-white/50 text-[10px] mb-1 uppercase tracking-wide">Fatigue Index</div>
                                        <div className="text-2xl font-bold text-vibrant-pink mb-1">{itineraryData?.travelAIMetrics?.fatigueIndex || 4}<span className="text-xs text-white/40">/10</span></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Day Selector */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-glass-white backdrop-blur-md border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="font-heading text-xl mb-4 text-white">Your Itinerary</h3>
                            <div className="space-y-3">
                                {itinerary.map((day) => (
                                    <button
                                        key={day.day}
                                        onClick={() => setSelectedDay(day.day)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${selectedDay === day.day ? 'bg-vibrant-gold text-black border-vibrant-gold shadow-[0_0_15px_rgba(255,204,0,0.3)]' : 'border-white/5 bg-white/5 hover:bg-white/10 text-white'}`}
                                    >
                                        <div className="text-left">
                                            <span className="block font-bold text-sm">Day {day.day}</span>
                                            <span className="text-xs opacity-70 group-hover:opacity-100">Explore Madurai</span>
                                        </div>
                                        <ArrowRight size={16} className={`transform transition-transform ${selectedDay === day.day ? 'translate-x-1' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content: Timeline */}
                    <div className="lg:col-span-8">
                        <motion.div
                            key={selectedDay}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-glass-white backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[600px] relative"
                        >
                            <h2 className="font-heading text-3xl mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-full bg-vibrant-gold/20 flex items-center justify-center text-vibrant-gold text-lg font-bold border border-vibrant-gold/30">{selectedDay}</span>
                                Day {selectedDay} Schedule
                                <span className="ml-auto flex items-center gap-2 text-sm font-normal text-yellow-400/80 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
                                    <Sun size={14} className="text-yellow-400" /> Warm & Sunny
                                </span>
                            </h2>

                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-vibrant-gold before:via-white/10 before:to-transparent">
                                {(itinerary[selectedDay - 1]?.activities || []).map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative group"
                                    >
                                        {/* Timeline Node */}
                                        <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full border-2 border-bg-dark bg-vibrant-gold shadow-[0_0_10px_rgba(255,204,0,0.6)] z-10 group-hover:scale-125 transition-transform" />

                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all hover:translate-x-1 duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-vibrant-gold font-mono text-sm flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                                                    <Clock size={12} /> {item.time}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${item.type === 'food' ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-blue-500/50 text-blue-400 bg-blue-500/10'}`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-bold mb-3 text-white">{item.title}</h4>

                                            <div className="flex gap-3 pt-2 border-t border-white/5">
                                                <button className="text-xs flex items-center gap-1.5 text-white/50 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">
                                                    <Navigation size={12} /> Navigate
                                                </button>
                                                <button className="text-xs flex items-center gap-1.5 text-white/50 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">
                                                    <Share2 size={12} /> Share
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Download Button */}
                            <div className="mt-10 pt-6 border-t border-white/10 text-center">
                                <button className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-xl text-white/70 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all group">
                                    <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                                    Download Offline Itinerary
                                </button>
                            </div>

                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItineraryGenerator;
