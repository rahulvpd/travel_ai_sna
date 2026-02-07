import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Shield } from 'lucide-react';
import { DISTRICTS } from '../data/districts';
import ImageWithFallback from '../components/ui/ImageWithFallback';

// 3D Tilt Card Component
const TiltCard = ({ children, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 30 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const Destinations = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDistricts = DISTRICTS.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.bestPlace.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-bg-dark text-white pt-20 overflow-x-hidden">

            {/* Vibrant Hero Header */}
            <div className="relative py-28 px-6 bg-gradient-to-r from-vibrant-blue via-purple-700 to-vibrant-pink overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full mix-blend-overlay"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-vibrant-gold/30 blur-[120px] rounded-full mix-blend-overlay"></div>

                <div className="container mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="text-vibrant-gold font-heading font-bold uppercase tracking-[0.3em] text-sm mb-4 block drop-shadow-md">
                            Incredible Tamil Nadu
                        </span>
                        <h1 className="font-serif text-6xl md:text-8xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-lg">
                            Colors of Culture
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed text-white/90">
                            Explore the vibrant soul of the South. From golden temples to azure oceans.
                        </p>
                    </motion.div>

                    {/* Glassmorphism Search Bar */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto mt-12 relative"
                    >
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-xl"></div>
                        <input
                            type="text"
                            placeholder="Find your next destination..."
                            className="relative w-full bg-transparent text-white placeholder:text-white/60 px-8 py-4 outline-none rounded-full"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-vibrant-gold w-6 h-6 drop-shadow-md" />
                    </motion.div>
                </div>
            </div>

            {/* 3D Grid */}
            <div className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {filteredDistricts.map((district, index) => (
                        <Link to={`/destinations/${district.id}`} key={district.id}>
                            <TiltCard className="group relative h-[400px] rounded-3xl bg-glass-white backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden cursor-pointer">

                                <div className="absolute inset-0 z-0">
                                    <ImageWithFallback
                                        src={district.image}
                                        alt={district.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                </div>

                                {/* Floating Content */}
                                <div className="absolute bottom-0 left-0 w-full p-6 z-10 transform translate-z-10 group-hover:translate-y-[-10px] transition-transform duration-500">
                                    {/* Safety Score Badge */}
                                    {district.safetyScore && (
                                        <div className="absolute top-[-50px] right-6 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
                                            <Shield size={16} className="text-green-400" />
                                            <span className="text-sm font-bold text-white">{district.safetyScore}</span>
                                            <span className="text-xs text-white/60">/5</span>
                                        </div>
                                    )}

                                    <span className="inline-block px-3 py-1 rounded-full bg-vibrant-pink/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white mb-3 shadow-lg">
                                        {district.tagline}
                                    </span>
                                    <h3 className="font-serif text-3xl text-white mb-2 drop-shadow-md">{district.name}</h3>

                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <MapPin className="w-4 h-4 text-vibrant-gold" />
                                        <span className="font-medium truncate">{district.bestPlace}</span>
                                    </div>
                                </div>
                            </TiltCard>
                        </Link>
                    ))}
                </div>

                {filteredDistricts.length === 0 && (
                    <div className="text-center py-20 text-white/40">
                        <h3 className="text-3xl font-serif mb-2">No places found</h3>
                        <p>The universe is vast, try searching for "Ooty".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Destinations;
