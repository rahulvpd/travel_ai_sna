import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Calendar, ArrowRight, Check, Sparkles, Loader, Utensils, Music, Briefcase, ListTodo, Globe, Save, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateItinerary } from '../services/gemini'; // Import Gemini service
import Map from '../components/Map'; // Import Leaflet Map
import { useLocation } from 'react-router-dom';

// New Integrated Components
import FoodSection from '../components/planner/FoodSection';
import CultureSection from '../components/planner/CultureSection';
import ToolsSection from '../components/planner/ToolsSection';
import SocialDashboard from '../components/planner/SocialDashboard';

const Planner = () => {
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');

    const [formData, setFormData] = useState({
        destination: '',
        travelers: 2,
        budget: 'Standard',
        interests: [],
        duration: 3
    });

    const [apiKeyInput, setApiKeyInput] = useState('');

    // Handle incoming state from Wizard
    useEffect(() => {
        if (location.state?.preferences) {
            const { destination, travelers, budget, mood, duration } = location.state.preferences;
            setFormData(prev => ({
                ...prev,
                destination: destination || prev.destination,
                travelers: travelers || prev.travelers,
                budget: budget || prev.budget,
                interests: mood ? [mood] : prev.interests,
                duration: duration || prev.duration
            }));

            if (destination) {
                setTimeout(() => document.getElementById('generate-btn')?.click(), 500);
            }
        }
    }, [location.state]);

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setSaveStatus(null);
        try {
            const data = await generateItinerary(
                formData.destination,
                formData.travelers,
                formData.budget,
                formData.interests.join(', '),
                formData.duration,
                apiKeyInput
            );
            setItinerary(data);
            setStep(2);
            setActiveTab('itinerary');
        } catch (err) {
            setError("Failed to generate itinerary. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/itineraries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tourism_token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    days: itinerary.days
                })
            });

            if (response.ok) {
                setSaveStatus('success');
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error("Save Error:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const markers = itinerary?.days.flatMap(day =>
        day.activities.map(act => ({
            lat: act.location?.lat,
            lng: act.location?.lng,
            title: act.title,
            description: act.time
        }))
    ).filter(m => m.lat && m.lng) || [];

    const center = itinerary?.centerCoordinates || (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : null);

    const tabs = [
        { id: 'itinerary', label: 'Plan', icon: ListTodo },
        { id: 'social', label: 'Network', icon: Globe },
        { id: 'food', label: 'Taste', icon: Utensils },
        { id: 'culture', label: 'Culture', icon: Music },
        { id: 'tools', label: 'Tools', icon: Briefcase },
    ];

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
                                className="space-y-10"
                            >
                                <div>
                                    <span className="text-vibrant-gold font-bold uppercase tracking-widest text-xs mb-2 block glow-gold">AI Planner</span>
                                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-white text-shadow-lg">
                                        Craft Your <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-gold to-vibrant-pink">Detailed Journey</span>
                                    </h1>
                                </div>

                                <div className="space-y-8 bg-black/20 p-8 rounded-3xl border border-white/10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-white/60">Where to?</label>
                                        <div className="flex items-center border-b border-white/20 py-2 focus-within:border-vibrant-gold transition-colors relative">
                                            <MapPin className="w-5 h-5 text-vibrant-gold mr-3" />
                                            <input
                                                type="text"
                                                placeholder="e.g. Kodaikanal, Ooty..."
                                                className="bg-transparent outline-none w-full text-xl font-serif text-white placeholder:text-white/20"
                                                value={formData.destination}
                                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-white/60">Travelers</label>
                                            <div className="flex items-center border-b border-white/20 py-2">
                                                <Users className="w-5 h-5 text-vibrant-gold mr-3" />
                                                <select
                                                    className="bg-transparent outline-none w-full text-xl font-serif text-white cursor-pointer [&>option]:text-black"
                                                    value={formData.travelers}
                                                    onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 10].map(n => <option key={n} value={n}>{n} Guests</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-white/60">Vibe</label>
                                            <div className="flex items-center border-b border-white/20 py-2">
                                                <Sparkles className="w-5 h-5 text-vibrant-gold mr-3" />
                                                <select
                                                    className="bg-transparent outline-none w-full text-xl font-serif text-white cursor-pointer [&>option]:text-black"
                                                    value={formData.budget}
                                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                >
                                                    <option>Luxury</option>
                                                    <option>Budget</option>
                                                    <option>Adventure</option>
                                                    <option>Relaxed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {!import.meta.env.VITE_GEMINI_API_KEY && (
                                    <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                                        <label className="text-xs font-bold uppercase tracking-wider text-vibrant-pink">Enter Gemini API Key</label>
                                        <input
                                            type="password"
                                            placeholder="Paste your key from Google AI Studio here"
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-vibrant-gold outline-none"
                                            value={apiKeyInput}
                                            onChange={(e) => setApiKeyInput(e.target.value)}
                                        />
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
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="text-vibrant-gold text-xs font-bold uppercase tracking-widest mb-1">Travel Assistant</div>
                                            <h2 className="text-3xl font-heading text-white">{formData.destination}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    const url = window.location.href;
                                                    navigator.clipboard.writeText(url);
                                                    alert("Itinerary link copied to clipboard!");
                                                }}
                                                className="bg-white/10 hover:bg-white/20 border border-white/10 px-4"
                                            >
                                                <Share2 size={16} />
                                            </Button>
                                            <Button
                                                onClick={handleSaveToProfile}
                                                disabled={isSaving || saveStatus === 'success'}
                                                className={`${saveStatus === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20'} border border-white/10 px-4`}
                                            >
                                                {isSaving ? <Loader size={16} className="animate-spin" /> : saveStatus === 'success' ? <Check size={16} /> : <Save size={16} />}
                                            </Button>
                                            <Button onClick={() => setStep(1)} variant="ghost" className="text-white/60 hover:text-white">Modify</Button>
                                        </div>
                                    </div>

                                    {/* Sub-navigation Tabs */}
                                    <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-vibrant-gold text-black shadow-lg scale-[1.05]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <tab.icon size={18} className="mb-1" />
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
                                                {itinerary.days.map((day, i) => (
                                                    <div key={i} className="relative pl-8 border-l border-white/10">
                                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-vibrant-gold shadow-[0_0_10px_rgba(255,204,0,0.8)]" />
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h3 className="text-xl font-heading text-white">Day {day.day}: <span className="text-vibrant-pink">{day.theme}</span></h3>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {day.activities.map((act, j) => (
                                                                <div key={j} className="group cursor-pointer bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                                                    <div className="flex items-center gap-4 mb-2">
                                                                        <span className="font-mono text-vibrant-gold text-xs px-2 py-1 bg-vibrant-gold/20 rounded-md">{act.time}</span>
                                                                        <h4 className="font-bold text-md text-white">{act.title}</h4>
                                                                    </div>
                                                                    <p className="text-white/60 text-sm font-light leading-relaxed">{act.description}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {activeTab === 'social' && (
                                            <motion.div
                                                key="social"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <SocialDashboard />
                                            </motion.div>
                                        )}

                                        {activeTab === 'food' && (
                                            <motion.div
                                                key="food"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <FoodSection destination={formData.destination} />
                                            </motion.div>
                                        )}

                                        {activeTab === 'culture' && (
                                            <motion.div
                                                key="culture"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <CultureSection destination={formData.destination} />
                                            </motion.div>
                                        )}

                                        {activeTab === 'tools' && (
                                            <motion.div
                                                key="tools"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <ToolsSection />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
