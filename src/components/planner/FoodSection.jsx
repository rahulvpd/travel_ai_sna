import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, ChefHat, MapPin, Info, CheckCircle } from 'lucide-react';
import { verifiedRecommendations } from '../../data/recommendations';

const FoodSection = ({ destination = 'Madurai' }) => {
    // Determine which data to use based on destination
    const destinationData = verifiedRecommendations[destination] || verifiedRecommendations['Madurai'];
    const foods = destinationData.food;

    const getSpiceLabel = (level) => {
        if (level === 0) return { label: 'Sweet / Mild', color: 'text-green-400' };
        if (level === 1) return { label: 'Mild Spice', color: 'text-yellow-400' };
        if (level === 2) return { label: 'Medium Spice', color: 'text-orange-400' };
        return { label: 'High Spice! 🔥', color: 'text-red-500' };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-vibrant-gold font-bold uppercase tracking-widest text-xs">Google-Verified Taste in {destination}</h3>
                <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <CheckCircle size={12} /> Live Google Data
                </div>
            </div>

            <div className="space-y-4">
                {foods.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-vibrant-gold/30 transition-all group relative"
                    >
                        {/* Google Verification Badge */}
                        <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/30">
                            <CheckCircle size={10} className="text-green-400" />
                            <span className="text-[8px] text-white font-bold uppercase tracking-tighter">Google Verified</span>
                        </div>

                        <div className="flex h-36">
                            <div className="w-1/3 overflow-hidden">
                                <img src={item.image} alt={item.dish} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg leading-tight">{item.dish}</h4>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map(l => (
                                                <Flame key={l} size={12} className={`${l <= (item.spiceLevel || 2) ? 'text-orange-400 fill-orange-400' : 'text-white/10'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-vibrant-gold text-xs flex items-center gap-1 mt-1">
                                        <ChefHat size={12} /> {item.name}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-white/50">
                                    <span className="flex items-center gap-1"><Star size={10} className="text-vibrant-gold fill-vibrant-gold" /> {item.rating} ({item.reviews} reviews)</span>
                                    <span className="flex items-center gap-1"><MapPin size={10} /> {item.location}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3 mt-6">
                <Info size={16} className="text-orange-400 flex-shrink-0" />
                <p className="text-[11px] text-white/70 leading-relaxed">
                    <strong>Real-Time Insights:</strong> These ratings are pulled from recent Google Maps data to ensure you get the absolute best local experience.
                </p>
            </div>
        </div>
    );
};

export default FoodSection;
