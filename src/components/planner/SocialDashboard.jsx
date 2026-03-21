import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, TrendingUp, Zap, Hexagon, Star, Crown, Globe } from 'lucide-react';

const SocialDashboard = () => {
    const [stats, setStats] = useState({ tribe: 'Vivid Voyager 🗺️', influential: [], socialRecs: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real graph data from SNA endpoints
        const fetchSNAData = async () => {
            try {
                const [tribeRes, influentialRes, recsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/analytics/tribe', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('tourism_token')}` }
                    }),
                    fetch('http://localhost:5000/api/analytics/influential'),
                    fetch('http://localhost:5000/api/analytics/social-recs', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('tourism_token')}` }
                    })
                ]);

                const tribeData = await tribeRes.json();
                const influentialData = await influentialRes.json();
                const recsData = await recsRes.json();

                setStats({
                    tribe: tribeData.tribe,
                    influential: influentialData,
                    socialRecs: recsData
                });
            } catch (error) {
                console.error("SNA Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSNAData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-vibrant-gold/20 border-t-vibrant-gold rounded-full"
            />
            <p className="text-white/40 text-[10px] animate-pulse uppercase tracking-[0.2em]">Calculating Graph Metrics...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Travel Tribe Identity */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-6 glass-panel rounded-3xl border border-vibrant-gold/30 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Hexagon size={80} className="text-vibrant-gold" />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vibrant-gold to-vibrant-orange flex items-center justify-center text-black shadow-xl shadow-vibrant-gold/20">
                        <Users size={32} />
                    </div>
                    <div>
                        <h4 className="text-vibrant-gold text-[10px] font-bold uppercase tracking-widest mb-1">Your Travel Tribe</h4>
                        <div className="text-2xl font-bold text-white tracking-tight">{stats.tribe}</div>
                    </div>
                </div>

                <p className="text-white/50 text-[11px] mt-4 leading-relaxed">
                    Based on your graph connectivity, you are categorized as a {stats.tribe.split(' ')[0]}.
                    You share interests with <span className="text-vibrant-gold font-bold">42%</span> of the network.
                </p>
            </motion.div>

            {/* Network Influencers (PageRank) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={14} className="text-vibrant-orange" /> Network Pulse
                    </h5>
                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> Live Centrality
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {stats.influential.map((place, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-vibrant-gold font-mono font-bold text-lg opacity-40">#{idx + 1}</div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-vibrant-gold transition-colors">{place.name}</div>
                                    <div className="text-[10px] text-white/40 uppercase">{place.type}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-vibrant-gold justify-end">
                                    <Crown size={12} />
                                    <span className="text-xs font-bold">{Math.round(place.score)}</span>
                                </div>
                                <div className="text-[9px] text-white/30 uppercase tracking-tighter">Influence Score</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Social Recommendations (Similarity) */}
            <div className="space-y-4">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
                    <Globe size={14} className="text-blue-400" /> Collaborative Discovery
                </h5>
                <div className="space-y-2">
                    {stats.socialRecs.length > 0 ? stats.socialRecs.map((rec, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-blue-500/10 to-transparent p-4 rounded-2xl border-l-2 border-blue-400/50 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white">{rec.name}</div>
                                <div className="text-[10px] text-white/50">Highly visited by people like you</div>
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                <Star size={10} className="text-vibrant-gold fill-vibrant-gold" />
                                <span className="text-[10px] font-bold">{rec.rating}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                            <Users size={24} className="mx-auto text-white/20 mb-2" />
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Connect more to unlock social recs</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Share CTA */}
            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 hover:border-vibrant-gold/30 transition-all text-white/70 group">
                <Share2 size={16} className="group-hover:text-vibrant-gold transition-colors" />
                <span className="text-xs font-bold uppercase tracking-widest">Share My Travel Graph</span>
            </button>
        </div>
    );
};

export default SocialDashboard;
