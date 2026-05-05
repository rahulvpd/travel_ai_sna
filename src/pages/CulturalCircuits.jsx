import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Sparkles, ChevronDown, ChevronUp, Moon, Users, Scissors, ArrowRight, Globe } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { CULTURAL_CIRCUITS, STRATEGIC_PILLARS, TN_CIVILISATION_FACTS } from '../data/culturalCircuits';
import CircuitsSNASection from '../components/circuits/CircuitsSNASection';

const CulturalCircuits = () => {
    const [activeCircuit, setActiveCircuit] = useState(null);
    const [activeTab, setActiveTab] = useState('crafts');

    const toggleCircuit = (id) => {
        setActiveCircuit(activeCircuit === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
            <ParticleBackground />
            <div className="fixed inset-0 bg-gradient-to-br from-amber-900/15 via-black to-purple-900/15 pointer-events-none" />
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-24 relative z-10">

                {/* ── HERO HEADER ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400 uppercase tracking-[0.3em]">Living Classical Civilisation</span>
                    </div>

                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Tamil Nadu Isn't Just{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-vibrant-gold to-vibrant-pink">
                            a Destination
                        </span>
                    </h1>

                    <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed mb-4">
                        It is a{' '}
                        <span className="text-vibrant-gold font-semibold">2,500-year-old living civilisation</span>
                        {' '}where temples built a millennium ago still receive daily worshippers, where classical languages are still spoken by 75 million people, and where ancient crafts are still exported to the world.
                    </p>
                    <p className="text-white/40 text-sm max-w-2xl mx-auto italic">
                        "Tamil Nadu doesn't lack tourism assets. It lacks strategic positioning." — The Living Civilisation Framework
                    </p>
                </motion.div>

                {/* ── CIVILISATION STATS ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-20"
                >
                    {TN_CIVILISATION_FACTS.map((fact, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * i }}
                            className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-vibrant-gold/30 transition-colors"
                        >
                            <div className="text-3xl font-heading font-bold text-vibrant-gold">
                                <AnimatedCounter end={fact.value} suffix={fact.suffix} duration={2} />
                            </div>
                            <div className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{fact.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── STRATEGIC PILLARS ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-4xl md:text-5xl text-glow-gold mb-3">Strategic Positioning</h2>
                        <p className="text-white/50">Moving from scattered promotion to identity branding</p>
                    </div>
                    <div className="grid md:grid-cols-5 gap-4">
                        {STRATEGIC_PILLARS.map((pillar, i) => (
                            <motion.div
                                key={pillar.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-vibrant-gold/30 transition-all group"
                            >
                                <div className="text-3xl mb-3">{pillar.icon}</div>
                                <h3 className="font-bold text-sm text-white mb-2 group-hover:text-vibrant-gold transition-colors">{pillar.title}</h3>
                                <p className="text-white/50 text-xs leading-relaxed mb-3">{pillar.description}</p>
                                <div className="text-xs font-bold text-vibrant-gold border-t border-white/10 pt-2">{pillar.stat}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Integrated Heritage SNA Graph View */}
                    <div className="mt-12">
                        <CircuitsSNASection />
                    </div>
                </motion.div>

                {/* ── CULTURAL CIRCUITS ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-4xl md:text-5xl text-glow-gold mb-3">8 Depth Circuits</h2>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Each circuit is a thematic 5–10 day immersion into one thread of the Tamil civilisation story — not a checklist, but a <em>journey of understanding</em>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {CULTURAL_CIRCUITS.map((circuit, i) => (
                            <motion.div
                                key={circuit.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                className="rounded-2xl overflow-hidden border border-white/10 hover:border-vibrant-gold/20 transition-all"
                            >
                                {/* Circuit Header */}
                                <button
                                    onClick={() => toggleCircuit(circuit.id)}
                                    className="w-full flex items-center gap-4 p-5 bg-white/5 hover:bg-white/8 transition-colors text-left"
                                >
                                    <span className="text-4xl flex-shrink-0">{circuit.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-1">
                                            <h3 className="font-heading text-xl font-bold text-white">{circuit.name}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${circuit.badgeColor}`}>
                                                {circuit.places.length} Sites
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-sm italic">"{circuit.tagline}"</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                                            <span className="flex items-center gap-1"><Clock size={11} /> {circuit.duration}</span>
                                            <span className="flex items-center gap-1"><MapPin size={11} /> Best: {circuit.bestTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-white/40">
                                        {activeCircuit === circuit.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </button>

                                {/* Circuit Expanded Detail */}
                                <AnimatePresence>
                                    {activeCircuit === circuit.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 bg-black/30 border-t border-white/10 space-y-6">

                                                {/* Civilisation Context */}
                                                <div className={`bg-gradient-to-r ${circuit.color} bg-opacity-10 rounded-xl p-4 border border-white/10`}>
                                                    <p className="text-white/80 text-sm leading-relaxed italic">
                                                        🏛️ {circuit.civilisationalTheme}
                                                    </p>
                                                </div>

                                                {/* Places */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Circuit Route</h4>
                                                    <div className="space-y-3">
                                                        {circuit.places.map((place, pi) => (
                                                            <div key={pi} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                                                                <span className="w-6 h-6 rounded-full bg-vibrant-gold/20 text-vibrant-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{pi + 1}</span>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-sm text-white">{place.name}</span>
                                                                        <span className="text-[10px] text-white/40 flex items-center gap-0.5"><MapPin size={9} />{place.district}</span>
                                                                    </div>
                                                                    <p className="text-white/50 text-xs mt-0.5">{place.highlight}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tabs: Crafts / Night / Diaspora / Economy */}
                                                <div>
                                                    <div className="flex gap-2 mb-4 flex-wrap">
                                                        {[
                                                            { key: 'crafts', icon: <Scissors size={12} />, label: 'Craft Economy' },
                                                            { key: 'night', icon: <Moon size={12} />, label: 'Night Economy' },
                                                            { key: 'diaspora', icon: <Globe size={12} />, label: 'Diaspora Angle' },
                                                            { key: 'impact', icon: <Users size={12} />, label: 'Economic Impact' },
                                                        ].map(tab => (
                                                            <button
                                                                key={tab.key}
                                                                onClick={() => setActiveTab(tab.key)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeTab === tab.key ? 'bg-vibrant-gold text-black border-vibrant-gold' : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}
                                                            >
                                                                {tab.icon} {tab.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
                                                        {activeTab === 'crafts' && <p>🧵 {circuit.craftConnect}</p>}
                                                        {activeTab === 'night' && <p>🌙 {circuit.nightExperience}</p>}
                                                        {activeTab === 'diaspora' && <p>✈️ {circuit.diasporaAngle}</p>}
                                                        {activeTab === 'impact' && <p>📊 {circuit.economicImpact}</p>}
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <div className="flex items-center justify-between">
                                                    <Link
                                                        to={`/planner?circuit=${circuit.id}`}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-vibrant-gold text-black font-bold rounded-xl text-sm hover:bg-yellow-400 transition-colors"
                                                    >
                                                        Plan This Circuit <ArrowRight size={14} />
                                                    </Link>
                                                    <span className="text-white/30 text-xs">
                                                        {circuit.duration} · {circuit.places.length} sites · Starting from {circuit.places[0].district}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── CLOSING MANIFESTO ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center py-16 border-t border-white/10"
                >
                    <h2 className="font-heading text-4xl md:text-5xl text-glow-gold mb-6">
                        Tourism as Economic Infrastructure
                    </h2>
                    <p className="text-white/60 text-lg max-w-3xl mx-auto leading-relaxed mb-6">
                        Tourism in Tamil Nadu doesn't have to replace manufacturing. It can <strong className="text-vibrant-gold">amplify it</strong>.
                        It can circulate local wealth. It can strengthen rural economies. The question is not{' '}
                        <em>"How do we promote more?"</em> — it is{' '}
                        <strong className="text-vibrant-pink">"How do we position smarter?"</strong>
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/explore" className="px-8 py-3 bg-vibrant-gold text-black font-bold rounded-full hover:bg-yellow-400 transition-colors">
                            Explore All Districts
                        </Link>
                        <Link to="/planner" className="px-8 py-3 border border-vibrant-gold text-vibrant-gold font-bold rounded-full hover:bg-vibrant-gold/10 transition-colors">
                            Plan Your Circuit
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CulturalCircuits;
