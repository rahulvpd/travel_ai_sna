import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import CustomCursor from '../components/ui/CustomCursor';
import CardCarousel from '../components/ui/CardCarousel';
import ColorShiftingText from '../components/ui/ColorShiftingText';
import ParticleBackground from '../components/ui/ParticleBackground';
import ScrollProgress from '../components/ui/ScrollProgress';

const LandingPage = () => {
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 500], [0, 200]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

    // Parallax text
    const yText = useTransform(scrollY, [0, 500], [0, -100]);

    return (
        <div className="font-sans bg-bg-dark text-white min-h-screen overflow-x-hidden selection:bg-vibrant-pink selection:text-white cursor-none relative">
            <CustomCursor />
            <ParticleBackground />
            <ScrollProgress />

            {/* THE GOLDEN FRAME - Official Tourism Look */}
            <div className="fixed inset-4 border-2 border-vibrant-gold/40 rounded-3xl pointer-events-none z-[50] shadow-[0_0_30px_rgba(255,204,0,0.3)]" />
            <div className="fixed top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-vibrant-gold z-[50] animate-pulse" />
            <div className="fixed top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-vibrant-gold z-[50] animate-pulse" />
            <div className="fixed bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-vibrant-gold z-[50] animate-pulse" />
            <div className="fixed bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-vibrant-gold z-[50] animate-pulse" />


            {/* HERO SECTION - Immersive Video/Image */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div style={{ y: yHero }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2670&auto=format&fit=crop" // Chennai Meenakshi Temple skyline
                        alt="Chennai Tamil Nadu"
                        className="w-full h-full object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-bg-dark" />
                    <div className="absolute inset-0 bg-vibrant-blue/10 mix-blend-overlay" />
                </motion.div>

                <motion.div
                    style={{ y: yText, opacity: opacityHero }}
                    className="relative z-10 text-center px-6 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <Star className="w-5 h-5 text-vibrant-gold fill-vibrant-gold animate-pulse" />
                        <span className="font-sans uppercase tracking-[0.4em] text-sm text-vibrant-gold font-bold">The Soul of India</span>
                        <Star className="w-5 h-5 text-vibrant-gold fill-vibrant-gold animate-pulse" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="font-heading text-7xl md:text-9xl font-bold text-white mb-8 leading-tight drop-shadow-2xl text-glow-gold"
                    >
                        TAMIL <br />
                        <ColorShiftingText text="NADU" />
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-white/80 text-xl font-light tracking-wide max-w-2xl mx-auto mb-12"
                    >
                        Where stories are etched in stone, and culture dances in the wind.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <Link to="/destinations">
                            <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full overflow-hidden transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                                <span className="relative z-10 font-bold uppercase tracking-widest text-sm flex items-center gap-3">
                                    Explore the Unseen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-vibrant-pink/50 to-vibrant-blue/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* INFINITE MARQUEE */}
            <div className="bg-gradient-to-r from-vibrant-pink via-vibrant-gold to-vibrant-pink overflow-hidden py-6 rotate-1 scale-105 border-y-4 border-black shadow-[0_10px_40px_rgba(230,0,92,0.5)]">
                <div className="flex animate-marquee whitespace-nowrap gap-12 text-black font-heading text-5xl font-bold uppercase">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-12 items-center">
                            <span className="hover:scale-110 transition-transform inline-block">Madurai</span>
                            <span className="text-6xl">✦</span>
                            <span className="hover:scale-110 transition-transform inline-block">Kanyakumari</span>
                            <span className="text-6xl">✦</span>
                            <span className="hover:scale-110 transition-transform inline-block">Rameshwaram</span>
                            <span className="text-6xl">✦</span>
                            <span className="hover:scale-110 transition-transform inline-block">Ooty</span>
                            <span className="text-6xl">✦</span>
                            <span className="hover:scale-110 transition-transform inline-block">Kodaikanal</span>
                            <span className="text-6xl">✦</span>
                            <span className="hover:scale-110 transition-transform inline-block">Thanjavur</span>
                            <span className="text-6xl">✦</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3D HIGHLIGHTS CAROUSEL */}
            <section className="relative py-32 container mx-auto px-6 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="font-heading text-4xl md:text-6xl mb-4 text-glow-gold">Timeless Journeys</h2>
                    <p className="text-white/60 text-xl">Swipe through the legends of the south.</p>
                </motion.div>

                <CardCarousel />
            </section>

            {/* FESTIVALS & CULTURE GRID */}
            <section className="py-20 container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 gap-8 items-center mb-16"
                >
                    <div className="text-left">
                        <span className="text-vibrant-pink uppercase tracking-widest font-bold text-sm glow-pink">Vibrant Culture</span>
                        <h2 className="font-heading text-4xl md:text-6xl mt-2 text-glow-gold">Land of Festivals</h2>
                    </div>
                    <p className="text-white/60 text-lg leading-relaxed">
                        From the harvest joy of Pongal to the divine dance of Natyanjali. Tamil Nadu is a kaleidoscope of colors, music, and devotion that never fades.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Large Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -20, scale: 1.02 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer border-2 border-white/20 shadow-2xl card-3d"
                    >
                        <img src="https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120" alt="Pongal" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <h3 className="text-3xl font-heading">Pongal Festival</h3>
                            <p className="text-vibrant-gold">The Great Harvest</p>
                        </div>
                    </motion.div>

                    {/* Tall Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -20, scale: 1.02 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer border-2 border-white/20 shadow-2xl card-3d"
                    >
                        <img src="https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120" alt="Dance" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <h3 className="text-3xl font-heading">Bharatanatyam</h3>
                            <p className="text-vibrant-gold">Poetry in Motion</p>
                        </div>
                    </motion.div>

                    {/* Standard Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -20, scale: 1.02 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative rounded-3xl overflow-hidden group cursor-pointer border-2 border-white/20 shadow-2xl card-3d"
                    >
                        <img src="https://images.unsplash.com/photo-1563118336-696c4f3462ff?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120" alt="Jallikattu" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <h3 className="text-2xl font-heading">Jallikattu</h3>
                            <p className="text-vibrant-gold">Valor & Tradition</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue via-purple-900 to-vibrant-pink opacity-20 animate-pulse" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="container mx-auto px-6 text-center relative z-10"
                >
                    <h2 className="font-heading text-5xl md:text-7xl mb-8 text-glow-gold">Ready for your Yatra?</h2>
                    <p className="text-white/60 text-xl mb-12 max-w-2xl mx-auto">Let AI craft your perfect journey through the land of temples.</p>
                    <Link to="/planner">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-vibrant-gold text-black font-bold text-lg rounded-full shadow-[0_0_40px_rgba(255,204,0,0.6)] hover:shadow-[0_0_80px_rgba(255,204,0,0.8)] transition-all relative overflow-hidden group"
                        >
                            <span className="relative z-10">Plan My Trip Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-vibrant-pink to-vibrant-blue opacity-0 group-hover:opacity-30 transition-opacity" />
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

        </div>
    );
};

const FeatureCard = ({ title, subtitle, icon, image, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`relative group h-[500px] rounded-[2rem] overflow-hidden border border-white/10 bg-glass-white backdrop-blur-sm shadow-2xl cursor-pointer ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

        <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
            <div className="mb-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                    {icon}
                </div>
            </div>

            <h3 className="font-heading text-3xl mb-2">{title}</h3>
            <p className="text-white/70 font-light text-lg">{subtitle}</p>
        </div>
    </motion.div>
);

export default LandingPage;
