import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Phone, Languages, DollarSign, Briefcase, AlertTriangle,
    Cloud, Calculator, MapPin, Loader, Check, Sparkles, ChevronDown
} from 'lucide-react';
import ParticleBackground from '../components/ui/ParticleBackground';
import { getSmartPackingList, estimateBudget, translateToTamil, getWeather } from '../services/aiOrchestrator';
import { translateWithSarvam } from '../services/sarvam';
import { DISTRICTS } from '../data/districts';

const TOOLS = [
    { id: 'weather', label: 'Live Weather', icon: <Cloud size={20} />, color: 'from-blue-500 to-cyan-400' },
    { id: 'budget', label: 'Budget Estimator', icon: <Calculator size={20} />, color: 'from-green-500 to-emerald-400' },
    { id: 'packing', label: 'AI Packing List', icon: <Briefcase size={20} />, color: 'from-purple-500 to-pink-400' },
    { id: 'translator', label: 'Tamil Translator', icon: <Languages size={20} />, color: 'from-orange-500 to-yellow-400' },
    { id: 'emergency', label: 'Emergency Info', icon: <Phone size={20} />, color: 'from-red-500 to-rose-400' },
    { id: 'safety', label: 'Safety Tips', icon: <Shield size={20} />, color: 'from-teal-500 to-green-400' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TravelTools = () => {
    const [activeTool, setActiveTool] = useState(null);
    const [loading, setLoading] = useState(false);

    // Weather state
    const [weatherDest, setWeatherDest] = useState('');
    const [weatherData, setWeatherData] = useState(null);

    // Budget state
    const [budgetForm, setBudgetForm] = useState({ destination: '', duration: 3, travelers: 2, level: 'Mid-Range' });
    const [budgetResult, setBudgetResult] = useState(null);

    // Packing state
    const [packingForm, setPackingForm] = useState({ destination: '', duration: 5, month: MONTHS[new Date().getMonth()] });
    const [packingList, setPackingList] = useState(null);

    // Translator state
    const [translatorPhrases, setTranslatorPhrases] = useState('');
    const [translations, setTranslations] = useState(null);

    // Task handlers
    const handleWeather = async () => {
        const dist = DISTRICTS.find(d => d.name.toLowerCase() === weatherDest.toLowerCase());
        if (!dist?.coordinates) return;
        setLoading(true);
        try {
            const data = await getWeather(dist.coordinates.lat, dist.coordinates.lng);
            setWeatherData(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleBudget = async () => {
        setLoading(true);
        try {
            const data = await estimateBudget(budgetForm.destination, budgetForm.duration, budgetForm.travelers, budgetForm.level);
            setBudgetResult(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handlePacking = async () => {
        setLoading(true);
        try {
            const data = await getSmartPackingList(packingForm.destination, packingForm.duration, packingForm.month);
            setPackingList(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleTranslate = async () => {
        if (!translatorPhrases.trim()) return;
        setLoading(true);
        try {
            const phrases = translatorPhrases.split('\n').filter(p => p.trim());

            // Try Sarvam translation first
            const sarvamPromises = phrases.map(async (p) => {
                try {
                    const t = await translateWithSarvam(p);
                    if (t) return { english: p, tamil: t, pronunciation: 'Translated via Sarvam API', usage: 'Direct Translation' };
                } catch (e) { console.error('Translation skipped', e); }
                return null;
            });
            const sarvamResults = await Promise.all(sarvamPromises);

            // If any failed or Sarvam API key mostly missing, fallback to AI Orchestrator
            const needsFallback = sarvamResults.some(r => r === null);
            let finalResults = sarvamResults;

            if (needsFallback) {
                const fallbackData = await translateToTamil(phrases);
                finalResults = phrases.map((p, i) => sarvamResults[i] || fallbackData.find(d => d.english === p) || { english: p, tamil: 'Translation Error', pronunciation: '', usage: '' });
            }

            setTranslations(finalResults);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const emergencyNumbers = [
        { service: 'Police', number: '100', desc: 'Emergency police assistance' },
        { service: 'Ambulance', number: '108', desc: '24/7 medical emergency' },
        { service: 'Fire', number: '101', desc: 'Fire emergency services' },
        { service: 'Women Helpline', number: '181', desc: 'Women safety helpline' },
        { service: 'Tourist Helpline', number: '1363', desc: 'Ministry of Tourism' },
        { service: 'TNSTC Bus Enquiry', number: '0422-2432444', desc: 'TN State Transport' },
        { service: 'IRCTC Rail', number: '139', desc: 'Railway enquiry & PNR' },
        { service: 'Road Assistance', number: '1033', desc: 'Highway emergency' },
    ];

    const safetyTips = [
        { title: 'Temple Etiquette', tips: ['Remove footwear before entering', 'Cover shoulders and knees', 'Photography may be restricted in inner sanctums', 'Walk clockwise around temples'] },
        { title: 'General Safety', tips: ['Keep copies of ID and tickets', 'Stay hydrated — carry water bottles', 'Use licensed taxis or Ola/Uber', 'Avoid isolated areas after dark'] },
        { title: 'Food & Health', tips: ['Drink bottled water only', 'Street food is generally safe at busy stalls', 'Carry basic medicines (paracetamol, ORS)', 'Sunscreen is essential — TN sun is intense'] },
        { title: 'Money Tips', tips: ['UPI (Google Pay, PhonePe) works everywhere', 'Carry some cash for small shops', 'ATMs are widely available in cities', 'Bargaining is expected at markets'] },
    ];

    // Render common select for destinations
    const DestinationSelect = ({ value, onChange }) => (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm appearance-none cursor-pointer focus:border-vibrant-gold/50 focus:outline-none transition-colors"
            >
                <option value="">Select Destination</option>
                {DISTRICTS.map(d => (
                    <option key={d.id} value={d.name} className="bg-gray-900">{d.name}</option>
                ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
            <ParticleBackground />

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-vibrant-gold animate-pulse" />
                        <span className="text-sm font-medium text-vibrant-gold tracking-wider uppercase">AI-Powered Tools</span>
                    </div>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 text-glow-gold">
                        Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-gold to-vibrant-pink">Toolkit</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Real-time weather, AI budget estimator, smart packing lists, and Tamil translator — all powered by multi-AI.
                    </p>
                </motion.div>

                {/* Tool Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                    {TOOLS.map((tool, idx) => (
                        <motion.button
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                            className={`relative p-5 rounded-2xl border text-center transition-all group ${activeTool === tool.id
                                ? 'border-vibrant-gold bg-vibrant-gold/10 shadow-[0_0_25px_rgba(255,204,0,0.2)]'
                                : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.color} mb-3`}>
                                {tool.icon}
                            </div>
                            <p className="text-sm font-bold">{tool.label}</p>
                        </motion.button>
                    ))}
                </div>

                {/* Active Tool Panel */}
                <AnimatePresence mode="wait">
                    {activeTool && (
                        <motion.div
                            key={activeTool}
                            initial={{ opacity: 0, height: 0, y: 20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                        >
                            {/* ═══ LIVE WEATHER ═══ */}
                            {activeTool === 'weather' && (
                                <div>
                                    <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                        <Cloud className="text-blue-400" /> Live Weather (Open-Meteo)
                                    </h2>
                                    <div className="flex gap-3 mb-6">
                                        <DestinationSelect value={weatherDest} onChange={setWeatherDest} />
                                        <button onClick={handleWeather} disabled={!weatherDest || loading}
                                            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-blue-400 transition-colors flex items-center gap-2">
                                            {loading ? <Loader size={16} className="animate-spin" /> : <Cloud size={16} />} Check
                                        </button>
                                    </div>
                                    {weatherData && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                                                    <p className="text-3xl font-bold">{weatherData.current.temp}°C</p>
                                                    <p className="text-sm text-white/60">Temperature</p>
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                                                    <p className="text-3xl font-bold">{weatherData.current.humidity}%</p>
                                                    <p className="text-sm text-white/60">Humidity</p>
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                                                    <p className="text-3xl font-bold">{weatherData.current.windSpeed}</p>
                                                    <p className="text-sm text-white/60">Wind km/h</p>
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                                                    <p className="text-lg font-bold">{weatherData.current.condition}</p>
                                                    <p className="text-sm text-white/60">Condition</p>
                                                </div>
                                            </div>
                                            {weatherData.forecast?.length > 0 && (
                                                <div>
                                                    <h3 className="font-bold text-sm uppercase tracking-wider text-white/40 mb-3">5-Day Forecast</h3>
                                                    <div className="grid grid-cols-5 gap-3">
                                                        {(weatherData.forecast || []).map((day, i) => (
                                                            <div key={i} className="bg-white/5 rounded-xl p-3 text-center text-sm">
                                                                <p className="text-white/40 text-xs">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                                                                <p className="font-bold my-1">{day.maxTemp}° / {day.minTemp}°</p>
                                                                <p className="text-xs text-white/50">{day.condition}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ BUDGET ESTIMATOR ═══ */}
                            {activeTool === 'budget' && (
                                <div>
                                    <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                        <Calculator className="text-green-400" /> AI Budget Estimator
                                    </h2>
                                    <div className="grid md:grid-cols-4 gap-3 mb-6">
                                        <DestinationSelect value={budgetForm.destination} onChange={v => setBudgetForm(p => ({ ...p, destination: v }))} />
                                        <div className="relative">
                                            <select value={budgetForm.duration} onChange={e => setBudgetForm(p => ({ ...p, duration: +e.target.value }))}
                                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:border-vibrant-gold/50 focus:outline-none">
                                                {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(d => <option key={d} value={d} className="bg-gray-900">{d} Days</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select value={budgetForm.travelers} onChange={e => setBudgetForm(p => ({ ...p, travelers: +e.target.value }))}
                                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:border-vibrant-gold/50 focus:outline-none">
                                                {[1, 2, 3, 4, 5, 6].map(t => <option key={t} value={t} className="bg-gray-900">{t} Traveler{t > 1 ? 's' : ''}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select value={budgetForm.level} onChange={e => setBudgetForm(p => ({ ...p, level: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:border-vibrant-gold/50 focus:outline-none">
                                                {['Budget', 'Mid-Range', 'Luxury'].map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                        </div>
                                    </div>
                                    <button onClick={handleBudget} disabled={!budgetForm.destination || loading}
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-green-400 transition-colors mb-6 flex items-center gap-2">
                                        {loading ? <Loader size={16} className="animate-spin" /> : <Calculator size={16} />} Estimate Budget
                                    </button>
                                    {budgetResult && (
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                                                    <p className="text-3xl font-bold text-green-400">{budgetResult.totalEstimate}</p>
                                                    <p className="text-sm text-white/60">Total Estimate</p>
                                                </div>
                                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                                                    <p className="text-3xl font-bold text-green-400">{budgetResult.perDay}</p>
                                                    <p className="text-sm text-white/60">Per Day</p>
                                                </div>
                                            </div>
                                            {budgetResult.breakdown && (
                                                <div className="space-y-3">
                                                    {Object.entries(budgetResult.breakdown).map(([key, val]) => (
                                                        <div key={key} className="flex justify-between items-center bg-white/5 rounded-xl p-4">
                                                            <div>
                                                                <p className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                                <p className="text-xs text-white/40">{val.suggestion}</p>
                                                            </div>
                                                            <span className="text-green-400 font-bold">{val.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {budgetResult.moneySavingTips?.length > 0 && (
                                                <div className="bg-vibrant-gold/10 border border-vibrant-gold/20 rounded-xl p-5">
                                                    <h4 className="font-bold text-sm text-vibrant-gold mb-3">💡 Money-Saving Tips</h4>
                                                    <ul className="space-y-2">
                                                        {(budgetResult.moneySavingTips || []).map((tip, i) => (
                                                            <li key={i} className="text-sm text-white/70 flex gap-2"><Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" /> {tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ AI PACKING LIST ═══ */}
                            {activeTool === 'packing' && (
                                <div>
                                    <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                        <Briefcase className="text-purple-400" /> AI Smart Packing List
                                    </h2>
                                    <div className="grid md:grid-cols-3 gap-3 mb-6">
                                        <DestinationSelect value={packingForm.destination} onChange={v => setPackingForm(p => ({ ...p, destination: v }))} />
                                        <div className="relative">
                                            <select value={packingForm.duration} onChange={e => setPackingForm(p => ({ ...p, duration: +e.target.value }))}
                                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:border-vibrant-gold/50 focus:outline-none">
                                                {[1, 2, 3, 4, 5, 7, 10, 14].map(d => <option key={d} value={d} className="bg-gray-900">{d} Days</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select value={packingForm.month} onChange={e => setPackingForm(p => ({ ...p, month: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:border-vibrant-gold/50 focus:outline-none">
                                                {MONTHS.map(m => <option key={m} value={m} className="bg-gray-900">{m}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                        </div>
                                    </div>
                                    <button onClick={handlePacking} disabled={!packingForm.destination || loading}
                                        className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-purple-400 transition-colors mb-6 flex items-center gap-2">
                                        {loading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Packing List
                                    </button>
                                    {packingList && (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(packingList).map(([category, items]) => (
                                                <div key={category} className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5">
                                                    <h4 className="font-bold capitalize text-purple-300 mb-3 text-sm uppercase tracking-wider">
                                                        {category === 'doNotForget' ? '⚠️ Do Not Forget' : category === 'culturalEtiquette' ? '🙏 Cultural Etiquette' : `📦 ${category}`}
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {(Array.isArray(items) ? items : []).map((item, i) => (
                                                            <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                                                                <Check size={12} className="text-purple-400 flex-shrink-0" /> {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ TAMIL TRANSLATOR ═══ */}
                            {activeTool === 'translator' && (
                                <div>
                                    <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                        <Languages className="text-orange-400" /> Tamil Travel Translator
                                    </h2>
                                    <p className="text-white/50 text-sm mb-4">Enter phrases (one per line) to translate to Tamil with pronunciation:</p>
                                    <textarea
                                        value={translatorPhrases}
                                        onChange={e => setTranslatorPhrases(e.target.value)}
                                        placeholder={"Hello\nWhere is the temple?\nHow much does this cost?\nThank you\nI need help"}
                                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm h-32 resize-none mb-4 focus:border-vibrant-gold/50 focus:outline-none placeholder-white/20"
                                    />
                                    <button onClick={handleTranslate} disabled={!translatorPhrases.trim() || loading}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-400 transition-colors mb-6 flex items-center gap-2">
                                        {loading ? <Loader size={16} className="animate-spin" /> : <Languages size={16} />} Translate
                                    </button>
                                    {translations && (
                                        <div className="space-y-3">
                                            {translations.map((t, i) => (
                                                <div key={i} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-white font-bold">{t.english}</p>
                                                            <p className="text-orange-300 text-lg mt-1">{t.tamil}</p>
                                                            <p className="text-white/50 text-sm italic">{t.pronunciation}</p>
                                                        </div>
                                                        <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded">{t.usage}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ EMERGENCY INFO ═══ */}
                            {activeTool === 'emergency' && (
                                <div>
                                    <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                        <Phone className="text-red-400" /> Emergency Contacts — Tamil Nadu
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {emergencyNumbers.map((item, i) => (
                                            <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-xl p-5 flex justify-between items-center hover:bg-red-500/10 transition-colors">
                                                <div>
                                                    <h4 className="font-bold">{item.service}</h4>
                                                    <p className="text-xs text-white/40">{item.desc}</p>
                                                </div>
                                                <a href={`tel:${item.number}`} className="text-2xl font-bold text-red-400 hover:text-red-300 transition-colors">
                                                    {item.number}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ═══ SAFETY TIPS ═══ */}
                            {activeTool === 'safety' && (
                                <div>
                                    <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                                        <Shield className="text-teal-400" /> Safety & Travel Tips
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {safetyTips.map((section, i) => (
                                            <div key={i} className="bg-teal-500/5 border border-teal-500/15 rounded-xl p-5">
                                                <h4 className="font-bold text-teal-300 mb-3">{section.title}</h4>
                                                <ul className="space-y-2">
                                                    {section.tips.map((tip, j) => (
                                                        <li key={j} className="text-sm text-white/70 flex gap-2 items-start">
                                                            <Check size={14} className="text-teal-400 flex-shrink-0 mt-0.5" /> {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Loading overlay */}
                            {loading && (
                                <div className="flex flex-col items-center py-12">
                                    <Loader className="w-10 h-10 text-vibrant-gold animate-spin mb-3" />
                                    <p className="text-white/60 text-sm">AI is processing your request...</p>
                                    <p className="text-white/30 text-xs mt-1">Using Gemini + Groq/Llama 4 + HuggingFace</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TravelTools;
