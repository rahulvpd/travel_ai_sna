import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, MapPin, Users, Hash } from 'lucide-react';

const TrendMonitor = () => {
    const [trends, setTrends] = useState([
        { id: 1, name: 'Meenakshi Temple', score: 98, mentions: 1240, status: 'rising' },
        { id: 2, name: 'Dhanushkodi', score: 92, mentions: 850, status: 'stable' },
        { id: 3, name: 'Ooty Lake', score: 88, mentions: 620, status: 'falling' },
        { id: 4, name: 'Mahabalipuram', score: 85, mentions: 590, status: 'rising' },
    ]);

    const [liveFeed, setLiveFeed] = useState([]);

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly update scores
            setTrends(prev => prev.map(t => ({
                ...t,
                score: Math.min(100, Math.max(0, t.score + (Math.random() > 0.5 ? 1 : -1))),
                mentions: t.mentions + Math.floor(Math.random() * 5),
                status: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'rising' : 'falling') : t.status
            })).sort((a, b) => b.score - a.score));

            // Add a live activity feed item
            const activities = [
                "User just booked a trip to Madurai",
                "New 5-star review for Ooty Boat House",
                "Trending: #PongalFestival2026",
                "High footfall detected at Kanyakumari",
                "Live: Cultural event starting in Thanjavur"
            ];
            const newActivity = {
                id: Date.now(),
                text: activities[Math.floor(Math.random() * activities.length)],
                time: new Date().toLocaleTimeString()
            };

            setLiveFeed(prev => [newActivity, ...prev].slice(0, 5));

        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-vibrant-pink animate-pulse" />
                        <div className="absolute inset-0 bg-vibrant-pink blur-md opacity-50 animate-ping" />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg font-bold">Live Trends</h3>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">Real-time Social Analysis</p>
                    </div>
                </div>
                <div className="px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400">LIVE</span>
                </div>
            </div>

            {/* Top Trending List */}
            <div className="space-y-4 mb-8">
                <AnimatePresence>
                    {trends.map((trend, index) => (
                        <motion.div
                            key={trend.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-lg w-6 ${index === 0 ? 'text-vibrant-gold' : 'text-white/40'}`}>#{index + 1}</span>
                                <div>
                                    <h4 className="font-bold text-sm">{trend.name}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-white/50">
                                        <Hash className="w-3 h-3" /> {trend.mentions} mentions
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-mono font-bold ${trend.status === 'rising' ? 'text-green-400' : 'text-red-400'}`}>
                                    {trend.score}%
                                </div>
                                <TrendingUp className={`w-3 h-3 ml-auto ${trend.status === 'rising' ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Live Feed */}
            <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase text-white/40 mb-3">Recent Activity</h4>
                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {liveFeed.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-start gap-2 text-xs text-white/70"
                            >
                                <span className="text-vibrant-gold whitespace-nowrap opacity-50">{item.time}</span>
                                <span>{item.text}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-blue/20 blur-[60px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-vibrant-pink/20 blur-[60px] -z-10 pointer-events-none" />
        </div>
    );
};

export default TrendMonitor;
