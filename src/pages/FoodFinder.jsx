import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MapPin, Star, ChefHat, Info } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';

const FoodFinder = () => {
    const [filter, setFilter] = useState('All');

    const foods = [
        {
            id: 1,
            name: 'Murugan Idli Shop',
            dish: 'Malligai Poo Idli',
            spiceLevel: 1,
            rating: 4.8,
            location: 'West Masi Street, Madurai',
            image: 'https://images.unsplash.com/photo-1589301760576-416ccd9a6335?q=80&w=1000&auto=format&fit=crop',
            desc: 'The softest idlis in the world, served with 4 types of chutneys.'
        },
        {
            id: 2,
            name: 'Kumar Mess',
            dish: 'Mutton Chukka',
            spiceLevel: 3,
            rating: 4.9,
            location: 'Town Hall Road, Madurai',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop',
            desc: 'Spicy, flavorful mutton cooked in traditional Chettinad style.'
        },
        {
            id: 3,
            name: 'Amma Mess',
            dish: 'Bone Marrow Omelette',
            spiceLevel: 2,
            rating: 4.7,
            location: 'Tallakulam, Madurai',
            image: 'https://images.unsplash.com/photo-1593560708920-6dc16279930f?q=80&w=1000&auto=format&fit=crop',
            desc: 'A legendary non-veg delicacy that attracts foodies from all over.'
        },
        {
            id: 4,
            name: 'Jigarthanda Shop',
            dish: 'Famous Jigarthanda',
            spiceLevel: 0,
            rating: 5.0,
            location: 'East Marret, Madurai',
            image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=1000&auto=format&fit=crop',
            desc: 'The "Heart Cooler" drink made with almond gum, sarsaparilla, and ice cream.'
        }
    ];

    const getSpiceLabel = (level) => {
        if (level === 0) return { label: 'Sweet / Mild', color: 'text-green-400' };
        if (level === 1) return { label: 'Mild Spice', color: 'text-yellow-400' };
        if (level === 2) return { label: 'Medium Spice', color: 'text-orange-400' };
        return { label: 'High Spice! 🔥', color: 'text-red-500' };
    };

    return (
        <div className="min-h-screen bg-transparent text-white relative">
            <ParticleBackground />
            <Navbar />

            <div className="relative pt-32 pb-20 container mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-vibrant-gold uppercase tracking-widest text-sm font-bold block mb-2">Culinary Journey</span>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 text-glow-gold">
                        Taste of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Madurai</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-white/60">
                        Discover authentic local flavors. Check the
                        <span className="text-vibrant-gold font-bold mx-2">Spice Meter <Flame className="inline w-4 h-4" /></span>
                        before you try!
                    </p>
                </motion.div>

                {/* Spice Level Filter Bar */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {[
                        { id: 'All', label: 'All Dishes', icon: '🍽️' },
                        { id: 'sweet', label: 'Sweet / Mild', icon: '🍃' },
                        { id: 'mild', label: 'Mild Spice', icon: '🌶️' },
                        { id: 'medium', label: 'Medium Spice', icon: '🔥' },
                        { id: 'spicy', label: 'Spicy 🔥🔥🔥', icon: '' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${filter === f.id
                                ? 'bg-vibrant-gold text-black border-vibrant-gold shadow-[0_0_15px_rgba(255,204,0,0.3)]'
                                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {f.icon && <span>{f.icon}</span>} {f.label}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <AnimatePresence mode="popLayout">
                    {foods
                        .filter(item => {
                            if (filter === 'All') return true;
                            if (filter === 'sweet') return item.spiceLevel === 0;
                            if (filter === 'mild') return item.spiceLevel === 1;
                            if (filter === 'medium') return item.spiceLevel === 2;
                            if (filter === 'spicy') return item.spiceLevel === 3;
                            return true;
                        })
                        .map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="bg-glass-white backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl group hover:border-vibrant-gold/30 transition-all duration-300"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-vibrant-gold font-bold">
                                    <Star size={14} fill="currentColor" /> {item.rating}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-heading text-2xl font-bold mb-1">{item.dish}</h3>
                                        <p className="text-vibrant-gold text-sm font-medium flex items-center gap-1">
                                            <ChefHat size={14} /> At {item.name}
                                        </p>
                                    </div>

                                    {/* Spice Meter Widget */}
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-1 mb-1 bg-black/30 p-1.5 rounded-lg">
                                            {[1, 2, 3].map((l) => (
                                                <Flame
                                                    key={l}
                                                    size={16}
                                                    className={`${l <= item.spiceLevel ? (item.spiceLevel === 3 ? 'text-red-500 fill-red-500' : 'text-orange-400 fill-orange-400') : 'text-white/20'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-xs font-bold ${getSpiceLabel(item.spiceLevel).color}`}>
                                            {getSpiceLabel(item.spiceLevel).label}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-white/70 mb-6 line-clamp-2">{item.desc}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <MapPin size={16} /> {item.location}
                                    </div>
                                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:text-vibrant-gold text-white rounded-full transition-colors font-medium">
                                        View Map
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>

                {/* PDF Requirement: Food Spice Guidance */}
                <div className="max-w-3xl mx-auto mt-20 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/20 rounded-2xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-full text-orange-400">
                        <Info size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-orange-200 mb-2">Spice Level Guidance for Visitors</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Tamil Nadu cuisine uses distinct spices like black pepper, curry leaves, and red chilies.
                            <strong>Level 1</strong> is safe for most international travelers.
                            <strong>Level 2</strong> has a noticeable kick.
                            <strong>Level 3</strong> is traditionally spicy – proceed with caution!
                            Drink buttermilk (Mor) to cool down if needed.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FoodFinder;
