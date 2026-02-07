import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, DollarSign, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';

const TripPlanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ... existing state ...
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        mood: 'spiritual',
        duration: 3,
        budget: 'medium',
        travelers: 2
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const moods = [
        { id: 'spiritual', label: 'Spiritual', icon: '🙏', desc: 'Temples & Peace' },
        { id: 'adventure', label: 'Adventure', icon: 'hiking', desc: 'Trekking & Nature' },
        { id: 'relax', label: 'Relaxing', icon: 'Umbrella', desc: 'Beaches & Spas' },
        { id: 'culture', label: 'Cultural', icon: 'Landmark', desc: 'History & Art' },
    ];

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const generateItinerary = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            navigate('/itinerary', { state: { preferences } });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-bg-dark text-white relative overflow-hidden">
            <ParticleBackground />

            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />

            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10 flex flex-col items-center justify-center min-h-[80vh]">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-vibrant-gold" />
                        <span className="text-sm font-medium text-vibrant-gold tracking-wider uppercase">AI Travel Assistant</span>
                    </div>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 text-glow-gold">
                        Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-gold to-vibrant-orange">Perfect Yatra</span>
                    </h1>
                </motion.div>

                {/* Wizard Card */}
                <div className="w-full max-w-4xl bg-glass-white backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px]">

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                        <motion.div
                            className="h-full bg-vibrant-gold box-shadow-glow"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 h-full flex flex-col justify-center"
                            >
                                <h2 className="text-3xl font-heading text-center">What's your travel mood?</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {moods.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => {
                                                setPreferences({ ...preferences, mood: m.id });
                                                nextStep();
                                            }}
                                            className={`p-6 rounded-2xl border transition-all duration-300 text-left group ${preferences.mood === m.id ? 'border-vibrant-gold bg-vibrant-gold/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                                        >
                                            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{m.icon === 'hiking' ? '🥾' : m.icon === 'Umbrella' ? '🏖️' : m.icon === 'Landmark' ? '🏛️' : '🙏'}</span>
                                            <h3 className="text-xl font-bold mb-1">{m.label}</h3>
                                            <p className="text-sm text-white/50">{m.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto h-full flex flex-col justify-center"
                            >
                                <h2 className="text-3xl font-heading text-center">Budget & Duration</h2>

                                <div className="space-y-8">
                                    <div>
                                        <label className="flex justify-between text-white/80 mb-4 font-medium">
                                            <span>Duration (Days)</span>
                                            <span className="text-vibrant-gold text-xl font-bold">{preferences.duration} Days</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1" max="15"
                                            value={preferences.duration}
                                            onChange={(e) => setPreferences({ ...preferences, duration: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-vibrant-gold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/80 mb-4 font-medium">Budget Range</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['low', 'medium', 'high'].map((b) => (
                                                <button
                                                    key={b}
                                                    onClick={() => setPreferences({ ...preferences, budget: b })}
                                                    className={`py-4 rounded-xl border font-bold capitalize transition-all ${preferences.budget === b ? 'bg-vibrant-gold text-black border-vibrant-gold' : 'border-white/10 text-white hover:bg-white/5'}`}
                                                >
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-8">
                                    <button onClick={prevStep} className="px-6 py-3 text-white/60 hover:text-white transition-colors">Back</button>
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                                    >
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto text-center h-full flex flex-col justify-center"
                            >
                                <h2 className="text-3xl font-heading mb-6">Who is traveling?</h2>

                                <div className="flex items-center justify-center gap-8 mb-10">
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, travelers: Math.max(1, p.travelers - 1) }))}
                                        className="w-16 h-16 rounded-full border border-white/20 text-3xl hover:bg-white/10 transition-colors"
                                    >
                                        -
                                    </button>
                                    <div className="text-center">
                                        <span className="text-6xl font-heading font-bold text-vibrant-gold block">{preferences.travelers}</span>
                                        <span className="text-white/60 uppercase tracking-widest text-sm">Travelers</span>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, travelers: p.travelers + 1 }))}
                                        className="w-16 h-16 rounded-full border border-white/20 text-3xl hover:bg-white/10 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={generateItinerary}
                                    disabled={isGenerating}
                                    className="w-full py-5 bg-gradient-to-r from-vibrant-gold to-vibrant-orange text-black font-bold text-xl rounded-2xl shadow-[0_0_30px_rgba(255,204,0,0.4)] hover:shadow-[0_0_50px_rgba(255,204,0,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                            Crafting Plan...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6 animate-pulse" /> Generate My Plan
                                        </>
                                    )}
                                </button>
                                <button onClick={prevStep} className="mt-4 text-white/40 hover:text-white text-sm">Go Back</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TripPlanner;
