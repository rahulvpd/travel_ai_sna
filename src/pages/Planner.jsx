import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Calendar, ArrowRight, Check, Sparkles, Loader, Utensils, Music, Briefcase, ListTodo, Globe, Save, Share2, Star, Hotel, Clock, Search, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateItinerary as generateGeminiPlan } from '../services/gemini';
import Map from '../components/Map';
import { useLocation } from 'react-router-dom';
import { DISTRICTS } from '../data/districts';
import { itineraryService } from '../services/api';

// Sub-components
import FoodSection from '../components/planner/FoodSection';
import CultureSection from '../components/planner/CultureSection';
import ToolsSection from '../components/planner/ToolsSection';
import GenerativeNetworkMap from '../components/planner/GenerativeNetworkMap';
import TripSNAPanel from '../components/tripplanner/TripSNAPanel';

const interestOptions = [
    { id: 'temples', label: 'Temples', icon: '🛕' },
    { id: 'beaches', label: 'Beaches', icon: '🏖️' },
    { id: 'street-food', label: 'Street Food', icon: '🍜' },
    { id: 'trekking', label: 'Trekking', icon: '🏔️' },
    { id: 'wildlife', label: 'Wildlife', icon: '🐘' },
    { id: 'heritage', label: 'Heritage', icon: '🏰' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'photography', label: 'Photography', icon: '📸' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'waterfalls', label: 'Waterfalls', icon: '💧' },
];

const Planner = () => {
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        destination: '',
        travelers: 2,
        budget: 'Standard',
        interests: [],
        duration: 3
    });

    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // Destination autocomplete
    const filteredDestinations = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return DISTRICTS.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.tagline?.toLowerCase().includes(q)
        ).slice(0, 6);
    }, [searchQuery]);

    // Handle incoming state from Wizard
    useEffect(() => {
        if (location.state?.itinerary) {
            const rawItinerary = location.state.itinerary;
            const groupedDays = [];
            const items = rawItinerary.items || [];
            
            const dayMap = {};
            items.forEach(item => {
                if (!dayMap[item.day]) {
                    dayMap[item.day] = {
                        day: item.day,
                        theme: `Exploring ${rawItinerary.destination}`,
                        activities: []
                    };
                }
                dayMap[item.day].activities.push({
                    time: item.time_of_day,
                    title: item.activity_name,
                    description: item.notes,
                    type: 'attraction',
                    latitude: item.latitude,
                    longitude: item.longitude
                });
            });
            
            Object.keys(dayMap).sort().forEach(d => groupedDays.push(dayMap[d]));
            
            setItinerary({
                ...rawItinerary,
                days: groupedDays
            });
            setStep(2);
            setActiveTab('itinerary');
            
            if (location.state.preferences) {
                setFormData(prev => ({
                    ...prev,
                    ...location.state.preferences
                }));
            }
        } else if (location.state?.preferences) {
            const { destination, travelers, budget, mood, duration, interests } = location.state.preferences;
            setFormData(prev => ({
                ...prev,
                destination: destination || prev.destination,
                travelers: travelers || prev.travelers,
                budget: budget || prev.budget,
                interests: interests || (mood ? mood.split(', ') : prev.interests),
                duration: duration || prev.duration
            }));

            if (destination) {
                setTimeout(() => document.getElementById('generate-btn')?.click(), 500);
            }
        }
    }, [location.state]);

    const toggleInterest = (id) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter(x => x !== id)
                : [...prev.interests, id]
        }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setSaveStatus(null);
        try {
            const response = await itineraryService.generatePlan({
                destination: formData.destination,
                days: formData.duration,
                interests: formData.interests,
                budget: formData.budget,
                travel_style: 'balanced'
            });
            
            const rawItinerary = response.data;
            const groupedDays = [];
            const items = rawItinerary.items || [];
            
            const dayMap = {};
            items.forEach(item => {
                if (!dayMap[item.day]) {
                    dayMap[item.day] = {
                        day: item.day,
                        theme: `Exploring ${rawItinerary.destination}`,
                        activities: []
                    };
                }
                dayMap[item.day].activities.push({
                    time: item.time_of_day,
                    title: item.activity_name,
                    description: item.notes,
                    type: 'attraction',
                    latitude: item.latitude,
                    longitude: item.longitude
                });
            });
            
            Object.keys(dayMap).sort().forEach(d => groupedDays.push(dayMap[d]));
            
            setItinerary({
                ...rawItinerary,
                days: groupedDays
            });
            setStep(2);
            setActiveTab('itinerary');
        } catch (err) {
            console.error("Backend failed, falling back to Gemini service:", err);
            try {
                const fallbackData = await generateGeminiPlan(
                    formData.destination,
                    formData.travelers,
                    formData.budget,
                    formData.interests,
                    formData.duration
                );
                setItinerary(fallbackData);
                setStep(2);
                setActiveTab('itinerary');
            } catch (fallbackErr) {
                setError("Failed to generate itinerary. Please check your connection.");
                console.error(fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToProfile = async () => {
        setIsSaving(true);
        try {
            // Save to localStorage as fallback (Supabase integration coming)
            const saved = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
            saved.push({
                id: Date.now(),
                destination: formData.destination,
                duration: formData.duration,
                createdAt: new Date().toISOString(),
                data: { ...formData, days: itinerary.days }
            });
            localStorage.setItem('saved_itineraries', JSON.stringify(saved));
            setSaveStatus('success');
        } catch (err) {
            console.error("Save Error:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const markers = (itinerary?.days || []).flatMap(day =>
        (day.activities || []).map(act => ({
            lat: act.location?.lat || act.latitude,
            lng: act.location?.lng || act.longitude,
            title: act.title,
            time: act.time,
            rating: act.rating,
            type: act.type
        }))
    ).filter(m => m.lat && m.lng) || [];

    const center = itinerary?.centerCoordinates || (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : null);

    const selectedPlaces = useMemo(() => {
        const seen = new Set();

        return (itinerary?.days || [])
            .flatMap(day => day.activities || [])
            .map(act => {
                const name = act.title || act.name;
                const lat = act.location?.lat || act.latitude;
                const lng = act.location?.lng || act.longitude;
                const key = `${String(name || '').toLowerCase()}|${lat || ''}|${lng || ''}`;

                if (!name || seen.has(key)) {
                    return null;
                }

                seen.add(key);

                return {
                    name,
                    lat,
                    lng,
                    destination: formData.destination,
                };
            })
            .filter(Boolean);
    }, [formData.destination, itinerary]);

    const tabs = [
        { id: 'itinerary', label: 'Plan', icon: ListTodo },
        { id: 'social', label: 'Network', icon: Globe },
        { id: 'food', label: 'Taste', icon: Utensils },
        { id: 'culture', label: 'Culture', icon: Music },
        { id: 'tools', label: 'Tools', icon: Briefcase },
    ];

    // Activity type badge color
    const typeColor = (type) => {
        switch (type) {
            case 'food': return 'border-orange-500/50 text-orange-400 bg-orange-500/10';
            case 'hotel': return 'border-blue-500/50 text-blue-400 bg-blue-500/10';
            case 'shopping': return 'border-pink-500/50 text-pink-400 bg-pink-500/10';
            default: return 'border-vibrant-gold/50 text-vibrant-gold bg-vibrant-gold/10';
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark font-sans text-white overflow-hidden flex flex-col md:flex-row relative">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />

            {/* Left Panel: Content & Form */}
            <div className="w-full md:w-5/12 h-screen overflow-y-auto relative z-10 border-r border-white/10 glass-panel scrollbar-hide">
                <div className="px-8 py-12 md:p-12 max-w-xl mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <span className="text-vibrant-gold font-bold uppercase tracking-widest text-xs mb-2 block glow-gold">AI Planner</span>
                                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
                                        Craft Your <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-gold to-vibrant-pink">Detailed Journey</span>
                                    </h1>
                                </div>

                                <div className="space-y-6 bg-black/20 p-8 rounded-3xl border border-white/10">
                                    {/* Destination with Autocomplete */}
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold uppercase tracking-wider text-white/60">Where to?</label>
                                        <div className="flex items-center border-b border-white/20 py-2 focus-within:border-vibrant-gold transition-colors">
                                            <MapPin className="w-5 h-5 text-vibrant-gold mr-3" />
                                            <input
                                                type="text"
                                                placeholder="e.g. Kodaikanal, Ooty..."
                                                className="bg-transparent outline-none w-full text-xl font-serif text-white placeholder:text-white/20"
                                                value={searchQuery || formData.destination}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    if (!e.target.value) setFormData({ ...formData, destination: '' });
                                                }}
                                            />
                                            {formData.destination && (
                                                <button onClick={() => { setFormData({ ...formData, destination: '' }); setSearchQuery(''); }}>
                                                    <X size={16} className="text-white/40 hover:text-white" />
                                                </button>
                                            )}
                                        </div>
                                        {/* Autocomplete dropdown */}
                                        {searchQuery && !formData.destination && filteredDestinations.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50">
                                                {filteredDestinations.map(d => (
                                                    <button
                                                        key={d.id}
                                                        onClick={() => {
                                                            setFormData({ ...formData, destination: d.name });
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                                                    >
                                                        <img src={d.image} alt={d.name} className="w-10 h-10 rounded-lg object-cover" />
                                                        <div>
                                                            <div className="font-bold text-sm">{d.name}</div>
                                                            <div className="text-xs text-white/40">{d.tagline}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-white/60">Travelers</label>
                                            <div className="flex items-center border-b border-white/20 py-2">
                                                <Users className="w-5 h-5 text-vibrant-gold mr-3" />
                                                <select
                                                    className="bg-transparent outline-none w-full text-xl font-serif text-white cursor-pointer [&>option]:text-black"
                                                    value={formData.travelers}
                                                    onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n} Guests</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-white/60">Budget</label>
                                            <div className="flex items-center border-b border-white/20 py-2">
                                                <Sparkles className="w-5 h-5 text-vibrant-gold mr-3" />
                                                <select
                                                    className="bg-transparent outline-none w-full text-xl font-serif text-white cursor-pointer [&>option]:text-black"
                                                    value={formData.budget}
                                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                >
                                                    <option>Budget</option>
                                                    <option>Standard</option>
                                                    <option>Luxury</option>
                                                    <option>Adventure</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration Slider */}
                                    <div className="space-y-2">
                                        <label className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60">
                                            <span>Duration</span>
                                            <span className="text-vibrant-gold text-base normal-case">{formData.duration} Days</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1" max="14"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-vibrant-gold"
                                        />
                                    </div>

                                    {/* Multi-Select Interest Chips */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                                            Interests <span className="text-vibrant-gold">({formData.interests.length} selected)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {interestOptions.map(chip => {
                                                const isSelected = formData.interests.includes(chip.id);
                                                return (
                                                    <button
                                                        key={chip.id}
                                                        onClick={() => toggleInterest(chip.id)}
                                                        className={`px-3 py-2 rounded-full border text-xs font-medium transition-all inline-flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-vibrant-gold/20 border-vibrant-gold text-vibrant-gold'
                                                            : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                                                            }`}
                                                    >
                                                        <span>{chip.icon}</span> {chip.label}
                                                        {isSelected && <Check size={12} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}



                                <div className="pt-4">
                                    <Button
                                        id="generate-btn"
                                        onClick={handleGenerate}
                                        disabled={!formData.destination || loading}
                                        className="w-full bg-vibrant-gold text-black hover:bg-white transition-all py-6 rounded-xl uppercase tracking-widest text-sm font-bold shadow-[0_0_20px_rgba(255,204,0,0.4)]"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : "Reveal My Plan"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && itinerary && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="border-b border-white/10 pb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-vibrant-gold text-xs font-bold uppercase tracking-widest mb-1">Travel Assistant</div>
                                            <h2 className="text-3xl font-heading text-white">{formData.destination}</h2>
                                            {itinerary.bestTimeToVisit && (
                                                <p className="text-xs text-white/40 mt-1">Best time: {itinerary.bestTimeToVisit}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    alert("Itinerary link copied!");
                                                }}
                                                className="bg-white/10 hover:bg-white/20 border border-white/10 px-3"
                                            >
                                                <Share2 size={14} />
                                            </Button>
                                            <Button
                                                onClick={handleSaveToProfile}
                                                disabled={isSaving || saveStatus === 'success'}
                                                className={`${saveStatus === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20'} border border-white/10 px-3`}
                                            >
                                                {isSaving ? <Loader size={14} className="animate-spin" /> : saveStatus === 'success' ? <Check size={14} /> : <Save size={14} />}
                                            </Button>
                                            <Button onClick={() => setStep(1)} variant="ghost" className="text-white/60 hover:text-white text-sm">Modify</Button>
                                        </div>
                                    </div>

                                    {/* Cost, Green Score & Summary */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            {itinerary.total_cost && (
                                                <span className="text-xs bg-vibrant-gold/10 text-vibrant-gold px-3 py-1.5 rounded-full border border-vibrant-gold/20 flex items-center gap-1.5">
                                                    💰 {itinerary.total_cost}
                                                </span>
                                            )}
                                            {itinerary.green_score && (
                                                <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 flex items-center gap-1.5">
                                                    🌿 Green Score: {itinerary.green_score}%
                                                </span>
                                            )}
                                            <span className="text-xs bg-white/5 text-white/60 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                                                📅 {formData.duration} Days
                                            </span>
                                        </div>
                                        
                                        {itinerary.summary && (
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-sm text-white/70 italic leading-relaxed">
                                                    "{itinerary.summary}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-vibrant-gold text-black shadow-lg scale-[1.05]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <tab.icon size={16} className="mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8 min-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-20">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'itinerary' && (
                                            <motion.div
                                                key="itinerary"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-8"
                                            >
                                                {(itinerary?.days || []).map((day, i) => (
                                                    <div key={i} className="relative pl-8 border-l border-white/10">
                                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-vibrant-gold shadow-[0_0_10px_rgba(255,204,0,0.8)]" />
                                                        <h3 className="text-xl font-heading text-white mb-4">
                                                            Day {day.day}: <span className="text-vibrant-pink">{day.theme}</span>
                                                        </h3>

                                                        {/* Activities */}
                                                        <div className="space-y-3">
                                                            {(day.activities || []).map((act, j) => (
                                                                <div key={j} className="group bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="font-mono text-vibrant-gold text-xs px-2 py-1 bg-vibrant-gold/20 rounded-md">{act.time}</span>
                                                                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${typeColor(act.type)}`}>{act.type}</span>
                                                                        {act.rating && (
                                                                            <span className="text-xs text-yellow-400 flex items-center gap-0.5 ml-auto">
                                                                                <Star size={10} className="fill-yellow-400" /> {act.rating}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="font-bold text-md text-white">{act.title}</h4>
                                                                    <p className="text-white/50 text-sm mt-1">{act.description}</p>
                                                                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                                                                        {act.cost && <span>💰 {act.cost}</span>}
                                                                        {act.duration && <span>⏱️ {act.duration}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Hotel Recommendation */}
                                                        {day.hotel && (
                                                            <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Hotel size={14} className="text-blue-400" />
                                                                    <span className="text-xs font-bold uppercase text-blue-400">Recommended Stay</span>
                                                                </div>
                                                                <h4 className="font-bold text-white">{day.hotel.name}</h4>
                                                                <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                                                                    {day.hotel.rating && <span className="text-yellow-400">⭐ {day.hotel.rating}</span>}
                                                                    {day.hotel.priceRange && <span>{day.hotel.priceRange}</span>}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Restaurant Recommendations */}
                                                        {day.restaurants && day.restaurants.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                <span className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1">
                                                                    <Utensils size={12} /> Where to Eat
                                                                </span>
                                                                {day.restaurants.map((rest, k) => (
                                                                    <div key={k} className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-lg">
                                                                        <div className="flex justify-between items-start">
                                                                            <h5 className="font-bold text-sm text-white">{rest.name}</h5>
                                                                            {rest.rating && <span className="text-xs text-yellow-400">⭐ {rest.rating}</span>}
                                                                        </div>
                                                                        <div className="text-xs text-white/40 mt-1">
                                                                            {rest.cuisine && <span>{rest.cuisine}</span>}
                                                                            {rest.mustTry && <span> • Must try: <span className="text-orange-300">{rest.mustTry}</span></span>}
                                                                            {rest.priceRange && <span> • {rest.priceRange}</span>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Tips */}
                                                {itinerary?.tips && itinerary.tips.length > 0 && (
                                                    <div className="p-5 bg-vibrant-gold/5 border border-vibrant-gold/20 rounded-2xl">
                                                        <h4 className="text-sm font-bold text-vibrant-gold mb-3">💡 Travel Tips</h4>
                                                        <ul className="space-y-2">
                                                            {(itinerary.tips || []).map((tip, i) => (
                                                                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                                    <Check size={14} className="text-vibrant-gold mt-0.5 flex-shrink-0" />
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'social' && (
                                            <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <GenerativeNetworkMap 
                                                    destination={formData.destination} 
                                                    items={(itinerary?.days || []).flatMap(day => day.activities || [])}
                                                    budget={formData.budget}
                                                    travelers={formData.travelers}
                                                    interests={formData.interests}
                                                />
                                            </motion.div>
                                        )}
                                        {activeTab === 'food' && (
                                            <motion.div key="food" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <FoodSection destination={formData.destination} />
                                            </motion.div>
                                        )}
                                        {activeTab === 'culture' && (
                                            <motion.div key="culture" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <CultureSection destination={formData.destination} />
                                            </motion.div>
                                        )}
                                        {activeTab === 'tools' && (
                                            <motion.div key="tools" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <ToolsSection />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="pt-6">
                                    <TripSNAPanel selectedPlaces={selectedPlaces} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Panel: Map */}
            <div className="hidden md:block w-7/12 h-screen relative z-10">
                <div className="absolute inset-0">
                    <Map center={center} markers={markers} showRoutes={true} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default Planner;
