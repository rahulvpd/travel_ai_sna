// src/components/chennai/ChennaiEventsCalendar.jsx
// Events/festival calendar grid for Chennai 2026

import { useState, useEffect } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Loader2, Ticket } from 'lucide-react';
import { getChennaiEventsCalendar } from '../../services/chennaiAgent';

const TYPE_COLORS = {
    music: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    dance: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    religious: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    food: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    film: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    literary: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

const TYPE_ICONS = {
    music: '🎵', dance: '💃', religious: '🪔', food: '🍛', film: '🎬', literary: '📖'
};

const ALL_TYPES = ['All', 'music', 'dance', 'religious', 'food', 'film', 'literary'];

export default function ChennaiEventsCalendar() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        getChennaiEventsCalendar()
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const events = data?.events || [];
    const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);

    return (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Chennai in 2026</h2>
            </div>
            <p className="text-white/50 text-sm mb-5">Festivals, concerts, and cultural celebrations</p>

            {/* Type filter */}
            <div className="flex flex-wrap gap-2 mb-5">
                {ALL_TYPES.map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${filter === t
                            ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                            : 'border-white/10 text-white/50 hover:border-white/30'
                            }`}
                    >
                        {t === 'All' ? '📅 All' : `${TYPE_ICONS[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-white/50 py-6 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading events calendar...
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <p className="text-white/30 text-sm text-center py-6">No events found</p>
            )}

            {/* Event list */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                {filtered.map((event, i) => (
                    <motion.div
                        key={event.name || i}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200"
                    >
                        {/* Month block */}
                        <div className="w-12 flex-shrink-0 text-center">
                            <div className="bg-amber-500/20 rounded-lg px-1 py-2">
                                <p className="text-amber-300 font-bold text-xs leading-tight">{event.month?.slice(0, 3).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Event info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-white font-semibold text-sm">{event.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${TYPE_COLORS[event.type] || 'bg-white/10 border-white/10 text-white/50'}`}>
                                    {TYPE_ICONS[event.type] || '📅'} {event.type}
                                </span>
                            </div>

                            <p className="text-white/60 text-xs mt-1 line-clamp-2">{event.description}</p>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/40">
                                {event.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />{event.location}
                                    </span>
                                )}
                                {event.duration && <span>📆 {event.duration} days</span>}
                                {event.ticketed && (
                                    <span className="flex items-center gap-1 text-blue-400/70">
                                        <Ticket className="w-3 h-3" />Ticketed
                                    </span>
                                )}
                                {event.bestFor && <span className="text-white/30">Best for: {event.bestFor}</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
