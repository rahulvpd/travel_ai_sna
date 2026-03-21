import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Clock, Play, CheckCircle, Star } from 'lucide-react';
import { verifiedRecommendations } from '../../data/recommendations';

const CultureSection = ({ destination = 'Madurai' }) => {
    // Determine which data to use based on destination
    const destinationData = verifiedRecommendations[destination] || verifiedRecommendations['Madurai'];
    const cultureSpots = destinationData.culture;

    const stories = [
        {
            title: 'Legend of Kannagi',
            duration: '5 min',
            type: 'Mythology'
        },
        {
            title: 'Architecture of Chola Dynasty',
            duration: '8 min',
            type: 'History'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-vibrant-pink font-bold uppercase tracking-widest text-xs">Google-Verified Heritage in {destination}</h3>
                <div className="flex items-center gap-1 text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                    <CheckCircle size={10} /> Verified Data
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {cultureSpots.map((spot, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative rounded-2xl overflow-hidden h-44 border border-white/10"
                    >
                        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        {/* Google Rating Badge */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-vibrant-gold/30">
                            <Star size={10} className="text-vibrant-gold fill-vibrant-gold" />
                            <span className="text-xs text-white font-bold">{spot.rating}</span>
                        </div>

                        {/* Verification Badge */}
                        <div className="absolute top-3 left-3 bg-green-500/80 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                            <CheckCircle size={10} className="text-white" />
                            <span className="text-[8px] text-white font-bold uppercase tracking-tighter">Google Verified</span>
                        </div>

                        <div className="absolute bottom-0 p-4 w-full">
                            <div className="flex justify-between items-end mb-1">
                                <h4 className="font-bold text-lg leading-tight">{spot.name}</h4>
                            </div>
                            <p className="text-white/60 text-[10px] line-clamp-2">{spot.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="pt-6 border-t border-white/10">
                <h3 className="text-vibrant-gold font-bold uppercase tracking-widest text-xs mb-4">Deep Culture Stories</h3>
                <div className="space-y-3">
                    {stories.map((story, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-vibrant-gold text-[10px] font-bold uppercase tracking-wider mb-1 block">{story.type}</span>
                                    <h4 className="text-sm font-bold group-hover:text-vibrant-gold transition-colors">{story.title}</h4>
                                    <div className="flex items-center gap-3 text-white/40 text-[10px] mt-2">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {story.duration}</span>
                                        <span className="flex items-center gap-1"><Play size={10} /> Listen Now</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-vibrant-gold/20 flex items-center justify-center text-vibrant-gold group-hover:bg-vibrant-gold group-hover:text-black transition-all">
                                    <Play size={14} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CultureSection;
