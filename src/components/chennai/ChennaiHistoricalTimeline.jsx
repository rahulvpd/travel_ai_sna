// src/components/chennai/ChennaiHistoricalTimeline.jsx
// Horizontally scrollable visual timeline of Chennai's 2,000-year history

import { useState, useEffect } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { getChennaiTimeline } from '../../services/chennaiAgent';
import { DYNASTY_DOT_COLORS, DYNASTY_COLORS } from '../../services/chennaiMediaService';

const TYPE_ICONS = {
    foundation: '🏗️', construction: '🏛️', conquest: '⚔️',
    cultural: '🎭', colonial: '🚢', independence: '🎺', modern: '🌆'
};

export default function ChennaiHistoricalTimeline() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeNode, setActiveNode] = useState(null);

    useEffect(() => {
        getChennaiTimeline()
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 overflow-hidden">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Through the Ages</h2>
                <p className="text-white/50 text-sm mt-1">Chennai across 2,000 years of history</p>
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="relative py-6">
                    {/* Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
                    <div className="flex gap-12 overflow-x-auto pb-4 scrollbar-hide">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="text-xs text-transparent bg-white/10 rounded animate-pulse w-16 h-3" />
                                <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse relative z-10" />
                                <div className="text-xs text-transparent bg-white/5 rounded animate-pulse w-20 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error state */}
            {!loading && (!data || !data.timeline || data.timeline.length === 0) && (
                <p className="text-white/30 text-sm text-center py-6">Timeline data unavailable</p>
            )}

            {/* Timeline */}
            {!loading && data && data.timeline && data.timeline.length > 0 && (
                <div className="relative">
                    {/* Horizontal line */}
                    <div className="absolute top-[38px] left-0 right-0 h-0.5 bg-white/10" />

                    <div className="overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex gap-10 min-w-max relative">
                            {data.timeline.map((event, i) => {
                                const dotColor = DYNASTY_DOT_COLORS[event.dynasty] || 'bg-white/40';
                                const isActive = activeNode === i;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2 cursor-pointer" style={{ minWidth: '100px' }}>
                                        {/* Year label */}
                                        <p className="text-xs text-white/50 text-center whitespace-nowrap">{event.year}</p>

                                        {/* Node */}
                                        <motion.div
                                            whileHover={{ scale: 1.3 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setActiveNode(isActive ? null : i)}
                                            className={`w-5 h-5 rounded-full border-2 border-white/20 relative z-10 cursor-pointer transition-all ${dotColor} ${isActive ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-transparent' : ''}`}
                                        />

                                        {/* Dynasty label */}
                                        <p className="text-[10px] text-white/30 text-center leading-tight max-w-[80px] whitespace-nowrap overflow-hidden text-ellipsis">{event.dynasty}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Event detail card */}
                    <AnimatePresence mode="wait">
                        {activeNode !== null && data.timeline[activeNode] && (
                            <motion.div
                                key={activeNode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{TYPE_ICONS[data.timeline[activeNode].type] || '📍'}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-bold text-white">{data.timeline[activeNode].year}</span>
                                            <span className="text-xs text-white/40">—</span>
                                            <span className="text-xs text-white/60">{data.timeline[activeNode].era}</span>
                                            {data.timeline[activeNode].dynasty && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${DYNASTY_COLORS[data.timeline[activeNode].dynasty] || 'bg-white/10 border-white/10 text-white/50'}`}>
                                                    {data.timeline[activeNode].dynasty}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white font-medium text-sm mb-1">{data.timeline[activeNode].event}</p>
                                        {data.timeline[activeNode].significance && (
                                            <p className="text-white/50 text-xs">{data.timeline[activeNode].significance}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
