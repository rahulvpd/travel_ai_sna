import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, DollarSign, Clock, Users, ArrowRight, ArrowLeft, Sparkles, MapPin, Check, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';
import { DISTRICTS } from '../data/districts';
import { itineraryService } from '../services/api';

const TripPlanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [preferences, setPreferences] = useState({
        destination: '',
        moods: [],           // multi-select moods
        interests: [],       // multi-select interests
        duration: 3,
        budget: 'medium',
        travelers: 2,
        travelStyle: 'couple'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Destination autocomplete from districts data
    const filteredDestinations = useMemo(() => {
        if (!searchQuery || searchQuery.length < 1) return DISTRICTS.slice(0, 8);
        const q = searchQuery.toLowerCase();
        return DISTRICTS.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.tagline?.toLowerCase().includes(q) ||
            d.bestPlace?.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [searchQuery]);

    const moods = [
        { id: 'spiritual', label: 'Spiritual', icon: '🙏', desc: 'Temples & Peace' },
        { id: 'adventure', label: 'Adventure', icon: '🥾', desc: 'Trekking & Nature' },
        { id: 'relax', label: 'Relaxing', icon: '🏖️', desc: 'Beaches & Spas' },
        { id: 'culture', label: 'Cultural', icon: '🏛️', desc: 'History & Art' },
        { id: 'foodie', label: 'Foodie', icon: '🍛', desc: 'Culinary Journey' },
        { id: 'romantic', label: 'Romantic', icon: '💕', desc: 'Couple Getaway' },
    ];

    const interestChips = [
        { id: 'temples', label: 'Temples', icon: '🛕' },
        { id: 'beaches', label: 'Beaches', icon: '🏖️' },
        { id: 'food', label: 'Street Food', icon: '🍜' },
        { id: 'trekking', label: 'Trekking', icon: '🏔️' },
        { id: 'wildlife', label: 'Wildlife', icon: '🐘' },
        { id: 'shopping', label: 'Shopping', icon: '🛍️' },
        { id: 'photography', label: 'Photography', icon: '📸' },
        { id: 'heritage', label: 'Heritage', icon: '🏰' },
        { id: 'wellness', label: 'Wellness & Spa', icon: '🧘' },
        { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
        { id: 'waterfalls', label: 'Waterfalls', icon: '💧' },
        { id: 'boating', label: 'Boating', icon: '🚤' },
    ];

    const travelStyles = [
        { id: 'solo', label: 'Solo', icon: '🎒' },
        { id: 'couple', label: 'Couple', icon: '💑' },
        { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
        { id: 'group', label: 'Friends', icon: '👯' },
    ];

    const toggleArrayItem = (key, itemId) => {
        setPreferences(prev => {
            const arr = prev[key];
            return {
                ...prev,
                [key]: arr.includes(itemId) ? arr.filter(x => x !== itemId) : [...arr, itemId]
            };
        });
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const generateItinerary = async () => {
        setIsGenerating(true);
        try {
            const response = await itineraryService.generatePlan({
                destination: preferences.destination,
                days: preferences.duration,
                interests: preferences.interests,
                budget: preferences.budget,
                travel_style: preferences.travelStyle
            });
            
            setIsGenerating(false);
            const itineraryData = response.data;
            navigate('/planner', {
                state: {
                    itinerary: itineraryData,
                    preferences: preferences
                }
            });
        } catch (error) {
            console.error('Failed to generate plan:', error);
            // Fallback for demo if backend is not running
            setTimeout(() => {
                setIsGenerating(false);
                navigate('/planner', {
                    state: {
                        preferences: {
                            ...preferences,
                            mood: preferences.moods.join(', '),
                        }
                    }
                });
            }, 1000);
        }
    };

    const totalSteps = 5;

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
            <ParticleBackground />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    {user && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vibrant-gold/10 border border-vibrant-gold/20 mb-4 backdrop-blur-md">
                            <Users className="w-4 h-4 text-vibrant-gold" />
                            <span className="text-sm font-medium text-vibrant-gold">Welcome back, {user.name || user.email}!</span>
                        </div>
                    )}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-vibrant-gold animate-pulse" />
                        <span className="text-sm font-medium text-vibrant-gold tracking-wider uppercase">Travel AI Core Active</span>
                    </div>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 text-glow-gold">
                        Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-gold to-vibrant-orange">Route Optimisation</span>
                    </h1>
                </motion.div>

                {/* Wizard Card */}
                <div className="w-full max-w-4xl bg-glass-white backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[550px]">

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                        <motion.div
                            className="h-full bg-gradient-to-r from-vibrant-gold to-vibrant-pink"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Step Indicator */}
                    <div className="flex justify-center gap-2 mb-8">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-vibrant-gold scale-110' : 'bg-white/20'}`} />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: Destination with Autocomplete */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-heading text-center">Where do you want to go?</h2>
                                <p className="text-center text-white/50 text-sm">Search from 38 districts of Tamil Nadu</p>

                                <div className="relative max-w-lg mx-auto">
                                    <div className="flex items-center bg-black/30 border border-white/20 rounded-2xl px-5 py-4 focus-within:border-vibrant-gold transition-colors">
                                        <Search className="w-5 h-5 text-vibrant-gold mr-3 flex-shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Madurai, Ooty, Chennai..."
                                            className="bg-transparent outline-none w-full text-xl text-white placeholder:text-white/20"
                                            value={searchQuery || preferences.destination}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                if (!e.target.value) setPreferences({ ...preferences, destination: '' });
                                            }}
                                            autoFocus
                                        />
                                        {preferences.destination && (
                                            <Check className="w-5 h-5 text-green-400 ml-2" />
                                        )}
                                    </div>

                                    {/* Autocomplete Dropdown */}
                                    {searchQuery && !preferences.destination && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute top-full mt-2 left-0 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar"
                                        >
                                            {filteredDestinations.map(d => (
                                                <button
                                                    key={d.id}
                                                    onClick={() => {
                                                        setPreferences({ ...preferences, destination: d.name });
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                                                >
                                                    <img src={d.image} alt={d.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-white">{d.name}</div>
                                                        <div className="text-xs text-white/50">{d.tagline} • {d.bestPlace}</div>
                                                    </div>
                                                    {d.safetyScore && (
                                                        <span className="ml-auto text-xs text-vibrant-gold bg-vibrant-gold/10 px-2 py-1 rounded-full">{d.safetyScore}★</span>
                                                    )}
                                                </button>
                                            ))}
                                            {filteredDestinations.length === 0 && (
                                                <div className="p-4 text-center text-white/40 text-sm">No destinations found. Try another name.</div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="text-center pt-4">
                                    <button
                                        onClick={nextStep}
                                        disabled={!preferences.destination}
                                        className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-vibrant-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Travel Mood (Multi-Select) */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-heading text-center">What's your travel mood?</h2>
                                <p className="text-center text-white/50 text-sm">Select one or more vibes</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {moods.map((m) => {
                                        const isSelected = preferences.moods.includes(m.id);
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => toggleArrayItem('moods', m.id)}
                                                className={`p-5 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden ${isSelected
                                                    ? 'border-vibrant-gold bg-vibrant-gold/10 shadow-[0_0_15px_rgba(255,204,0,0.2)]'
                                                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2">
                                                        <Check size={14} className="text-vibrant-gold" />
                                                    </div>
                                                )}
                                                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{m.icon}</span>
                                                <h3 className="text-lg font-bold mb-0.5">{m.label}</h3>
                                                <p className="text-xs text-white/50">{m.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="px-6 py-3 text-white/60 hover:text-white transition-colors inline-flex items-center gap-2">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={preferences.moods.length === 0}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-vibrant-gold transition-colors disabled:opacity-30 inline-flex items-center gap-2"
                                    >
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Interests (Multi-Select Chips) */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-heading text-center">What excites you?</h2>
                                <p className="text-center text-white/50 text-sm">Pick as many activities as you like</p>

                                <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                                    {interestChips.map(chip => {
                                        const isSelected = preferences.interests.includes(chip.id);
                                        return (
                                            <motion.button
                                                key={chip.id}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => toggleArrayItem('interests', chip.id)}
                                                className={`px-5 py-3 rounded-full border text-sm font-medium transition-all duration-300 inline-flex items-center gap-2 ${isSelected
                                                    ? 'bg-vibrant-gold/20 border-vibrant-gold text-vibrant-gold shadow-[0_0_10px_rgba(255,204,0,0.15)]'
                                                    : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <span>{chip.icon}</span> {chip.label}
                                                {isSelected && <Check size={14} />}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {preferences.interests.length > 0 && (
                                    <p className="text-center text-vibrant-gold text-sm">{preferences.interests.length} selected</p>
                                )}

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="px-6 py-3 text-white/60 hover:text-white transition-colors inline-flex items-center gap-2">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-vibrant-gold transition-colors inline-flex items-center gap-2"
                                    >
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Budget & Duration */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                <h2 className="text-3xl font-heading text-center">Budget & Duration</h2>

                                {/* Duration Slider */}
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                                    <label className="flex justify-between text-white/80 mb-4 font-medium">
                                        <span className="flex items-center gap-2"><Clock size={16} className="text-vibrant-gold" /> Duration</span>
                                        <span className="text-vibrant-gold text-2xl font-bold">{preferences.duration} <span className="text-base font-normal text-white/50">Days</span></span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1" max="14"
                                        value={preferences.duration}
                                        onChange={(e) => setPreferences({ ...preferences, duration: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-vibrant-gold"
                                    />
                                    <div className="flex justify-between text-xs text-white/30 mt-2">
                                        <span>1 Day</span>
                                        <span>1 Week</span>
                                        <span>2 Weeks</span>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-white/80 mb-4 font-medium flex items-center gap-2">
                                        <DollarSign size={16} className="text-vibrant-gold" /> Budget Range
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'low', label: 'Budget', desc: '₹500-2K/day', icon: '💰' },
                                            { id: 'medium', label: 'Standard', desc: '₹2K-5K/day', icon: '💎' },
                                            { id: 'high', label: 'Luxury', desc: '₹5K+/day', icon: '👑' },
                                        ].map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => setPreferences({ ...preferences, budget: b.id })}
                                                className={`py-5 rounded-2xl border font-bold transition-all text-center ${preferences.budget === b.id
                                                    ? 'bg-vibrant-gold text-black border-vibrant-gold shadow-[0_0_20px_rgba(255,204,0,0.3)]'
                                                    : 'border-white/10 text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <span className="text-2xl block mb-1">{b.icon}</span>
                                                <span className="block text-sm">{b.label}</span>
                                                <span className="block text-xs opacity-60 mt-1">{b.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="px-6 py-3 text-white/60 hover:text-white transition-colors inline-flex items-center gap-2">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-vibrant-gold transition-colors inline-flex items-center gap-2"
                                    >
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Travel Style + Travelers + Generate */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto text-center"
                            >
                                <h2 className="text-3xl font-heading">Who is traveling?</h2>

                                {/* Travel Style */}
                                <div className="grid grid-cols-4 gap-3">
                                    {travelStyles.map(ts => (
                                        <button
                                            key={ts.id}
                                            onClick={() => setPreferences({ ...preferences, travelStyle: ts.id })}
                                            className={`py-4 rounded-2xl border transition-all ${preferences.travelStyle === ts.id
                                                ? 'border-vibrant-gold bg-vibrant-gold/10'
                                                : 'border-white/10 hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-2xl block mb-1">{ts.icon}</span>
                                            <span className="text-xs font-bold">{ts.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Travelers Counter */}
                                <div className="flex items-center justify-center gap-8">
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, travelers: Math.max(1, p.travelers - 1) }))}
                                        className="w-14 h-14 rounded-full border border-white/20 text-2xl hover:bg-white/10 transition-colors"
                                    >-</button>
                                    <div className="text-center">
                                        <span className="text-5xl font-heading font-bold text-vibrant-gold block">{preferences.travelers}</span>
                                        <span className="text-white/60 uppercase tracking-widest text-xs">Travelers</span>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, travelers: Math.min(20, p.travelers + 1) }))}
                                        className="w-14 h-14 rounded-full border border-white/20 text-2xl hover:bg-white/10 transition-colors"
                                    >+</button>
                                </div>

                                {/* Summary */}
                                <div className="bg-black/30 rounded-2xl p-5 text-left border border-white/10">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-vibrant-gold mb-3">Trip Summary</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-white/40">Destination:</span> <span className="font-medium">{preferences.destination}</span></div>
                                        <div><span className="text-white/40">Duration:</span> <span className="font-medium">{preferences.duration} Days</span></div>
                                        <div><span className="text-white/40">Moods:</span> <span className="font-medium">{preferences.moods.length > 0 ? preferences.moods.join(', ') : 'Any'}</span></div>
                                        <div><span className="text-white/40">Budget:</span> <span className="font-medium capitalize">{preferences.budget}</span></div>
                                    </div>
                                    {preferences.interests.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/5 text-sm">
                                            <span className="text-white/40">Interests:</span>{' '}
                                            <span className="font-medium">{preferences.interests.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={generateItinerary}
                                    disabled={isGenerating}
                                    className="w-full py-5 bg-gradient-to-r from-vibrant-gold to-vibrant-orange text-black font-bold text-xl rounded-2xl shadow-[0_0_30px_rgba(255,204,0,0.4)] hover:shadow-[0_0_50px_rgba(255,204,0,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                            Generating Your Trip...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6 animate-pulse" /> Generate AI Travel Plan
                                        </>
                                    )}
                                </button>

                                <button onClick={prevStep} className="text-white/40 hover:text-white text-sm inline-flex items-center gap-1">
                                    <ArrowLeft size={14} /> Go Back
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TripPlanner;
