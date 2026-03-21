import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Shield, Users, ArrowRight, Camera, Sun, Umbrella } from 'lucide-react';
import { Link } from 'react-router-dom';

const Destinations = () => {
    const [activeTab, setActiveTab] = useState('heritage');

    const categories = [
        { id: 'heritage', label: 'Heritage & Spiritual', icon: '🏛️', desc: 'Timeless temples and ancient architecture.' },
        { id: 'nature', label: 'Nature & Eco', icon: '🌿', desc: 'Misty hills, wildlife, and serene landscapes.' },
        { id: 'leisure', label: 'Leisure & Adventure', icon: '🏖️', desc: 'Sun-kissed beaches and vibrant experiences.' },
    ];

    const destinationsData = {
heritage: [
    {
      id: 1,
      name: 'Madurai',
                title: 'The City of Temples',
                image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2670&auto=format&fit=crop',
                rating: 4.8,
                safety: 98,
                crowd: 'High',
                tags: ['Meenakshi Temple', 'History', 'Food'],
                bestSeason: 'sunny',
                seasonLabel: 'Oct–Mar'
            },
            {
                id: 2,
                name: 'Thanjavur',
                title: 'Rice Bowl of Tamil Nadu',
                image: 'https://images.unsplash.com/photo-1627894006066-b4528dc9052b?q=80&w=2670&auto=format&fit=crop', // Big Temple
                rating: 4.9,
                safety: 96,
                crowd: 'Moderate',
                tags: ['Brihadeeswarar Temple', 'Art', 'Culture'],
                bestSeason: 'sunny',
                seasonLabel: 'Nov–Feb'
            },
            {
                id: 3,
                name: 'Mahabalipuram',
                title: 'Stone Carvings & Shore Temples',
                image: 'https://images.unsplash.com/photo-1621327017866-26795b87702f?q=80&w=2670&auto=format&fit=crop',
                rating: 4.7,
                safety: 95,
                crowd: 'High',
                tags: ['UNESCO Heritage', 'Beach', 'Sculptures'],
                bestSeason: 'sunny',
                seasonLabel: 'Nov–Mar'
            }
        ],
        nature: [
            {
                id: 4,
                name: 'Ooty',
                title: 'Queen of Hill Stations',
                image: 'https://images.unsplash.com/photo-1548685122-f6b97645f629?q=80&w=2670&auto=format&fit=crop', // Tea gardens
                rating: 4.6,
                safety: 94,
                crowd: 'High',
                tags: ['Tea Gardens', 'Lake', 'Toy Train'],
                bestSeason: 'cool',
                seasonLabel: 'Apr–Jun'
            },
            {
                id: 5,
                name: 'Kodaikanal',
                title: 'Princess of Hill Stations',
                image: 'https://images.unsplash.com/photo-1596707328599-28c0c1969a59?q=80&w=2670&auto=format&fit=crop', // Kodai Lake
                rating: 4.7,
                safety: 97,
                crowd: 'Moderate',
                tags: ['Lake', 'Trekking', 'Mist'],
                bestSeason: 'cool',
                seasonLabel: 'Apr–Jun'
            },
            {
                id: 6,
                name: 'Yercaud',
                title: 'Jewel of the South',
                image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=2574&auto=format&fit=crop',
                rating: 4.5,
                safety: 99,
                crowd: 'Low',
                tags: ['Coffee', 'Quiet', 'Viewpoints'],
                bestSeason: 'monsoon',
                seasonLabel: 'Jul–Sep'
            }
        ],
        leisure: [
            {
                id: 7,
                name: 'Dhanushkodi',
                title: 'Ghost Town & Mystic Beach',
                image: 'https://images.unsplash.com/photo-1616853610260-84524c552026?q=80&w=2670&auto=format&fit=crop',
                rating: 4.9,
                safety: 88,
                crowd: 'Low',
                tags: ['Adventure', 'Ruins', 'Ocean'],
                bestSeason: 'sunny',
                seasonLabel: 'Oct–Mar'
            },
            {
                id: 8,
                name: 'Pondicherry',
                title: 'French Riviera of the East',
                image: 'https://images.unsplash.com/photo-1582915293040-349929235d25?q=80&w=2670&auto=format&fit=crop', // Promenade
                rating: 4.7,
                safety: 92,
                crowd: 'High',
                tags: ['French Colony', 'Beaches', 'Cafes'],
                bestSeason: 'sunny',
                seasonLabel: 'Oct–Mar'
            },
            {
                id: 9,
                name: 'Kanyakumari',
                title: 'Tip of India',
                image: 'https://images.unsplash.com/photo-1598322634336-d446927d3536?q=80&w=2670&auto=format&fit=crop', // Thiruvalluvar Statue
                rating: 4.6,
                safety: 93,
                crowd: 'Very High',
                tags: ['Sunrise', 'Vivekananda Rock', 'Sea'],
                bestSeason: 'sunny',
                seasonLabel: 'Oct–Mar'
            }
        ]
    };

    return (
        <div className="min-h-screen bg-bg-dark text-white pt-24 pb-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-vibrant-blue/20 to-transparent -z-10 blur-3xl" />

            <div className="container mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-vibrant-gold font-bold uppercase tracking-[0.3em] text-xs block mb-4 glow-text">Discover Tamil Nadu</span>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
                        Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-pink to-vibrant-gold">Category</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
                        From the sacred chants of ancient temples to the silent whispers of misty hills, find a destination that resonates with your soul.
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`relative px-8 py-4 rounded-full border transition-all duration-300 group ${activeTab === cat.id
                                ? 'bg-white/10 border-vibrant-gold shadow-[0_0_20px_rgba(255,204,0,0.3)]'
                                : 'bg-black/40 border-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <span className="text-2xl filter drop-shadow-lg">{cat.icon}</span>
                                <div className="text-left">
                                    <div className={`text-sm font-bold uppercase tracking-wider ${activeTab === cat.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                        {cat.label}
                                    </div>
                                    <div className="text-[10px] text-white/40 hidden md:block">{cat.desc}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Destination Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode='popLayout'>
                        {destinationsData[activeTab].map((dest) => (
                            <motion.div
                                key={dest.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm hover:border-vibrant-gold/50 transition-colors"
                            >
                                {/* Image Overlay */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-8 z-10 flex flex-col justify-end h-full">

                                    {/* Top Badges */}
                                    <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                                        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                            <Star className="w-3 h-3 text-vibrant-gold fill-vibrant-gold" />
                                            <span className="text-xs font-bold">{dest.rating}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30 flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-green-400" />
                                            <span className="text-[10px] font-bold text-green-400">{dest.safety}% Safe</span>
                                        </div>
                                        {dest.bestSeason && (
                                            <div className={`px-3 py-1 backdrop-blur-md rounded-full border flex items-center gap-2 ${
                                                dest.bestSeason === 'sunny' ? 'bg-yellow-500/20 border-yellow-500/30' :
                                                dest.bestSeason === 'monsoon' ? 'bg-blue-500/20 border-blue-500/30' :
                                                'bg-cyan-500/20 border-cyan-500/30'
                                            }`}>
                                                {dest.bestSeason === 'sunny' ? <Sun className="w-3 h-3 text-yellow-400" /> :
                                                 dest.bestSeason === 'monsoon' ? <Umbrella className="w-3 h-3 text-blue-400" /> :
                                                 <Sun className="w-3 h-3 text-cyan-400" />}
                                                <span className={`text-[10px] font-bold ${
                                                    dest.bestSeason === 'sunny' ? 'text-yellow-400' :
                                                    dest.bestSeason === 'monsoon' ? 'text-blue-400' :
                                                    'text-cyan-400'
                                                }`}>{dest.seasonLabel}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {dest.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-3xl font-heading font-bold text-white mb-1 group-hover:text-vibrant-gold transition-colors">{dest.name}</h3>
                                        <p className="text-white/60 text-sm mb-6">{dest.title}</p>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-6 border-t border-white/10 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-vibrant-pink" />
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase">Crowd</div>
                                                    <div className="text-xs font-bold">{dest.crowd}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-vibrant-blue" />
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase">Vibe</div>
                                                    <div className="text-xs font-bold">{activeTab === 'heritage' ? 'Spiritual' : activeTab === 'nature' ? 'Serene' : 'Fun'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Link to={`/explore/${dest.id}`} className="inline-flex items-center gap-2 text-vibrant-gold font-bold text-sm tracking-widest uppercase hover:gap-4 transition-all">
                                            Explore Plan <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>
        </div>
    );
};

export default Destinations;
