import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Calendar, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Planner = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState(null);

    const [formData, setFormData] = useState({
        destination: '',
        travelers: 2,
        budget: 'Standard'
    });

    const generateItinerary = () => {
        setLoading(true);
        setTimeout(() => {
            setItinerary(MOCK_ITINERARY);
            setLoading(false);
            setStep(2);
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-bg-stone font-sans text-heritage-dark overflow-hidden flex flex-col md:flex-row">

            {/* Left Panel: Image (Ooty) */}
            <div className="w-full md:w-5/12 h-[30vh] md:h-screen relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1548685913-fe78d6badd69?q=80&w=2670&auto=format&fit=crop"
                    alt="Ooty Hills"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-heritage-dark/30" />
                <div className="absolute bottom-12 left-12 text-white p-6 max-w-md">
                    <div className="w-12 h-1 bg-heritage-gold mb-4" />
                    <h2 className="font-serif text-3xl md:text-4xl italic mb-2">"To travel is to live."</h2>
                    <p className="opacity-90 font-light">Discover the untouched beauty of the Nilgiris.</p>
                </div>
            </div>

            {/* Right Panel: Content */}
            <div className="w-full md:w-7/12 h-screen overflow-y-auto bg-bg-stone relative">
                <div className="px-8 py-12 md:p-24 max-w-2xl mx-auto">

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <span className="text-heritage-terracotta font-bold uppercase tracking-widest text-xs mb-2 block">AI Planner</span>
                                    <h1 className="font-heading text-4xl font-bold text-heritage-dark">Plan Your Tamil Nadu Escape</h1>
                                </div>

                                <div className="space-y-8">
                                    {/* Input Group */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-heritage-dark/60">Destination</label>
                                        <div className="flex items-center border-b-2 border-heritage-dark/10 py-2 focus-within:border-heritage-terracotta transition-colors">
                                            <MapPin className="w-5 h-5 text-heritage-terracotta mr-3" />
                                            <input
                                                type="text"
                                                placeholder="e.g. Kodaikanal"
                                                className="bg-transparent outline-none w-full text-xl font-serif text-heritage-dark placeholder:text-heritage-dark/30"
                                                value={formData.destination}
                                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Input Group */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-heritage-dark/60">Travelers</label>
                                            <div className="flex items-center border-b-2 border-heritage-dark/10 py-2">
                                                <Users className="w-5 h-5 text-heritage-terracotta mr-3" />
                                                <select
                                                    className="bg-transparent outline-none w-full text-xl font-serif text-heritage-dark cursor-pointer"
                                                    value={formData.travelers}
                                                    onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                                                >
                                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-heritage-dark/60">Style</label>
                                            <div className="flex items-center border-b-2 border-heritage-dark/10 py-2">
                                                <Check className="w-5 h-5 text-heritage-terracotta mr-3" />
                                                <select
                                                    className="bg-transparent outline-none w-full text-xl font-serif text-heritage-dark cursor-pointer"
                                                    value={formData.budget}
                                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                >
                                                    <option>Pilgrimage</option>
                                                    <option>Leisure</option>
                                                    <option>Adventure</option>
                                                    <option>Heritage</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <Button
                                        onClick={generateItinerary}
                                        disabled={!formData.destination || loading}
                                        className="w-full bg-heritage-dark text-heritage-gold hover:bg-heritage-terracotta hover:text-white transition-all py-5 rounded-none uppercase tracking-widest text-sm font-bold shadow-xl"
                                    >
                                        {loading ? "Crafting Journey..." : "View Your Itinerary"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && itinerary && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="flex items-center justify-between mb-12 border-b border-heritage-dark/10 pb-6">
                                    <div>
                                        <div className="text-heritage-terracotta text-xs font-bold uppercase tracking-widest mb-1">Your Yatra</div>
                                        <h2 className="text-4xl font-serif text-heritage-dark">{formData.destination}</h2>
                                    </div>
                                    <Button onClick={() => setStep(1)} variant="ghost" className="text-heritage-dark/60 hover:text-heritage-dark">Modify</Button>
                                </div>

                                <div className="space-y-12">
                                    {itinerary.days.map((day, i) => (
                                        <div key={i} className="relative pl-10 border-l border-heritage-dark/20">
                                            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-heritage-terracotta ring-4 ring-bg-stone" />
                                            <h3 className="text-2xl font-serif text-heritage-dark mb-6">Day {day.day}: {day.theme}</h3>
                                            <div className="space-y-6">
                                                {day.activities.map((act, j) => (
                                                    <div key={j} className="group cursor-pointer">
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <span className="font-mono text-heritage-terracotta text-sm">{act.time}</span>
                                                            <h4 className="font-bold text-lg group-hover:text-heritage-terracotta transition-colors">{act.title}</h4>
                                                        </div>
                                                        <p className="text-heritage-dark/70 font-light leading-relaxed">{act.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Disclaimer Footer */}
                    <div className="mt-20 border-t border-heritage-dark/10 pt-6 text-xs text-heritage-dark/40 uppercase tracking-widest text-center">
                        Official Tourism Partner Design Concept
                    </div>
                </div>
            </div>

        </div>
    );
};

const MOCK_ITINERARY = {
    days: [
        {
            day: 1,
            theme: "Nature's Embrace",
            activities: [
                { time: "08:00", title: "Botanical Garden Walk", description: "Start your day amidst exotic flora and the morning mist." },
                { time: "11:00", title: "Ooty Boat House", description: "A serene boat ride across the lake surrounded by eucalyptus trees." },
                { time: "16:00", title: "Doddabetta Peak", description: "Witness the sunset from the highest point in the Nilgiris." }
            ]
        },
        {
            day: 2,
            theme: "Colonial Charm",
            activities: [
                { time: "09:00", title: "Toy Train Journey", description: "UNESCO World Heritage ride through tunnels and bridges." },
                { time: "13:00", title: "Tea Factory Visit", description: "Learn the art of tea making and taste fresh Nilgiri tea." }
            ]
        }
    ]
};

export default Planner;
