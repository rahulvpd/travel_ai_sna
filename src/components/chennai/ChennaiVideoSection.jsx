// src/components/chennai/ChennaiVideoSection.jsx
// Horizontally scrollable YouTube video card strip

import { useState } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Film } from 'lucide-react';

export default function ChennaiVideoSection({ videos = [] }) {
    const [activeVideo, setActiveVideo] = useState(null);

    const typeColors = {
        documentary: 'bg-blue-500/20 text-blue-300',
        heritage: 'bg-amber-500/20 text-amber-300',
        'walking-tour': 'bg-green-500/20 text-green-300',
        food: 'bg-orange-500/20 text-orange-300',
        culture: 'bg-purple-500/20 text-purple-300',
        'museum-tour': 'bg-teal-500/20 text-teal-300',
    };

    return (
        <>
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                    <Film className="w-5 h-5 text-red-400" />
                    <h2 className="text-xl font-bold text-white">See Chennai</h2>
                </div>
                <p className="text-white/50 text-sm mb-5">Documentaries, walkthroughs, and cultural films</p>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {videos.map((v) => (
                        <motion.div
                            key={v.id}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveVideo(v)}
                            className="flex-shrink-0 w-52 cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-200 group"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                                    alt={v.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                    </div>
                                </div>
                                <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                                    {v.duration}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="text-white text-xs font-medium leading-snug line-clamp-2 mb-2">{v.title}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[v.type] || 'bg-white/10 text-white/50'}`}>
                                        {v.type}
                                    </span>
                                    {v.place !== 'General' && (
                                        <span className="text-[10px] text-white/40 truncate ml-1">{v.place}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveVideo(null)}
                    >
                        <motion.div
                            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                                title={activeVideo.title}
                                className="w-full h-full"
                                allow="autoplay; fullscreen"
                                loading="lazy"
                                allowFullScreen
                            />
                        </motion.div>
                        <button
                            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                            onClick={() => setActiveVideo(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
