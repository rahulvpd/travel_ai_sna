// src/components/chennai/ChennaiPlaceKnowledgePanel.jsx
// Expandable deep knowledge card for Chennai heritage places

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, MapPin, Clock, Ticket, Lightbulb, Loader2, Map } from 'lucide-react';
import { DYNASTY_COLORS } from '../../services/chennaiMediaService';
import { getChennaiPlaceIntelligence } from '../../services/chennaiAgent';
import ChennaiTamilNameBadge from './ChennaiTamilNameBadge';
import ChennaiAudioGuide from './ChennaiAudioGuide';
import ChennaiPlaceGallery from './ChennaiPlaceGallery';
import HeritageGraphView from './HeritageGraphView';
import { Link } from 'react-router-dom';
const BEST_LIGHT_LABELS = { morning: '🌅 Golden', evening: '🌇 Dusk', afternoon: '☀️ Afternoon', night: '🌙 Night', any: '🕐 Any time' };

export default function ChennaiPlaceKnowledgePanel({ place, isExpanded, onToggle, onConnectedSites }) {
    const [aiData, setAiData] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiLoaded, setAiLoaded] = useState(false);

    const loadAI = async (e) => {
        e.stopPropagation();
        if (aiLoaded) return;
        setAiLoading(true);
        try {
            const data = await getChennaiPlaceIntelligence(place.name);
            setAiData(data);
        } catch { /* ignore */ }
        setAiLoading(false);
        setAiLoaded(true);
    };

    const dynastyClass = DYNASTY_COLORS[place.dynasty] || 'bg-white/10 text-white/60 border-white/20';

    return (
        <motion.div
            layout
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden"
        >
            {/* Collapsed header */}
            <div
                className="cursor-pointer select-none p-4 flex items-start gap-3"
                onClick={onToggle}
            >
                <span className="text-2xl flex-shrink-0">{place.emoji || '📍'}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">{place.name}</h3>
                            {!isExpanded && <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{place.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {place.rating && (
                                <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
                                    <Star className="w-3 h-3 fill-yellow-400" />{place.rating}
                                </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </div>
                    </div>

                    {/* Category badge */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {place.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                                {place.category}
                            </span>
                        )}
                        {place.dynasty && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dynastyClass}`}>
                                {place.dynasty}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* Gallery */}
                            <ChennaiPlaceGallery placeName={place.name} />

                            {/* Tamil Name Badge + Audio */}
                            <div className="flex items-start justify-between gap-3">
                                <ChennaiTamilNameBadge placeName={place.name} />
                                <ChennaiAudioGuide text={place.significance || place.description} placeName={place.name} />
                            </div>

                            {/* Historical Context block */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Historical Context</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {place.builtBy && (
                                        <div>
                                            <p className="text-white/40 text-xs">Built By</p>
                                            <p className="text-white font-medium">{place.builtBy}</p>
                                        </div>
                                    )}
                                    {place.period && (
                                        <div>
                                            <p className="text-white/40 text-xs">Period</p>
                                            <p className="text-white font-medium">{place.period}</p>
                                        </div>
                                    )}
                                    {place.architecturalStyle && (
                                        <div className="col-span-2">
                                            <p className="text-white/40 text-xs">Architectural Style</p>
                                            <p className="text-white font-medium">{place.architecturalStyle}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {place.dynasty && (
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${dynastyClass}`}>
                                            {place.dynasty}
                                        </span>
                                    )}
                                    {place.ASI_protected && (
                                        <span className="text-xs px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300">
                                            🏛️ ASI Protected
                                        </span>
                                    )}
                                    {place.UNESCO && (
                                        <span className="text-xs px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-300">
                                            🌍 UNESCO
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Significance */}
                            {place.significance && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Significance</h4>
                                    <p className="text-white/80 text-sm leading-relaxed">{place.significance}</p>
                                </div>
                            )}

                            {/* Historical fact */}
                            {place.historicalFact && (
                                <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                                    <h4 className="text-xs font-bold text-amber-400/70 uppercase tracking-widest mb-2">Historical Record</h4>
                                    <p className="text-white/75 text-sm leading-relaxed">{place.historicalFact}</p>
                                </div>
                            )}

                            {/* Inscriptions */}
                            {place.inscriptions && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Inscriptions & Records</h4>
                                    <p className="text-white/70 text-sm">{place.inscriptions}</p>
                                </div>
                            )}

                            {/* Practical info row */}
                            <div className="flex flex-wrap gap-3 text-xs text-white/60">
                                {place.bestLight && (
                                    <span>{BEST_LIGHT_LABELS[place.bestLight]} light best</span>
                                )}
                                {place.timings && (
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{place.timings}</span>
                                )}
                                {place.entryFee && (
                                    <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{place.entryFee}</span>
                                )}
                                {place.location && (
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{place.location}</span>
                                )}
                            </div>

                            {/* Tips */}
                            {place.tips && (
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-white/70 text-sm">{place.tips}</p>
                                </div>
                            )}

                            {/* AI Deep Insights section */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">AI Deep Intelligence</h4>
                                {!aiLoaded && !aiLoading && (
                                    <button
                                        onClick={loadAI}
                                        className="w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm hover:bg-purple-500/20 transition-all duration-200"
                                    >
                                        ✨ Load AI Intelligence
                                    </button>
                                )}
                                {aiLoading && (
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analysing architectural and dynastic records...
                                    </div>
                                )}
                                {aiLoaded && aiData && (
                                    <div className="space-y-3 text-sm">
                                        {aiData.architectural && (
                                            <div>
                                                <p className="text-white/40 text-xs mb-1">Architecture</p>
                                                <p className="text-white/80">{aiData.architectural.uniqueArchitectural}</p>
                                            </div>
                                        )}
                                        {aiData.visitorIntel && (
                                            <div>
                                                <p className="text-white/40 text-xs mb-1">Insider Tips</p>
                                                <ul className="space-y-1">
                                                    {(aiData.visitorIntel.insiderTips || []).slice(0, 3).map((tip, i) => (
                                                        <li key={i} className="text-white/70 flex items-start gap-1.5">
                                                            <span className="text-yellow-400 flex-shrink-0">•</span>{tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Connected sites button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onConnectedSites && onConnectedSites(); }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm hover:border-yellow-400/30 hover:text-yellow-300 transition-all duration-200"
                            >
                                <Map className="w-4 h-4" />
                                🗺️ Explore Connected Sites Across Tamil Nadu
                            </button>
                            
                            <div className="mt-4 p-4 border border-white/10 bg-black/30 rounded-2xl">
                                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Network Analysis</h4>
                                <div className="h-[200px] w-full rounded-xl overflow-hidden">
                                    <HeritageGraphView />
                                </div>
                            </div>

                            {/* Full Page Link */}
                            <Link
                                to={`/explore/chennai/${place.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl font-bold bg-vibrant-gold text-black hover:opacity-90 transition-all duration-200 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                            >
                                ✨ Open Full Explore Page
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
