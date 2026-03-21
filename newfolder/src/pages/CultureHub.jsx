import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Play, BookOpen, MapPin, Music, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';

const CultureHub = () => {
    const festivals = [
        {
            name: 'Pongal Festival',
            date: 'Jan 14-17',
            desc: 'The great harvest festival of Tamil Nadu, celebrating nature and farmers.',
            image: 'https://images.unsplash.com/photo-1610992795556-9d33a6f1ac9c?q=80&w=800&auto=format&fit=crop'
        },
        {
            name: 'Chithirai Festival',
            date: 'April 2026',
            desc: 'The celestial wedding of Goddess Meenakshi in Madurai.',
            image: 'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
        },
        {
            name: 'Mahamaham',
            date: 'Feb 2026',
            desc: 'A grand festival celebrated once in 12 years at Kumbakonam.',
            image: 'https://images.unsplash.com/photo-1599136152766-3d7c588523b0?q=80&w=800&auto=format&fit=crop'
        }
    ];

    const stories = [
        {
            title: 'The Legend of Kannagi',
            duration: '5 min read',
            type: 'Mythology',
            image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Architecture of Cholas',
            duration: '8 min read',
            type: 'History',
            image: 'https://images.unsplash.com/photo-1599136152766-3d7c588523b0?q=80&w=800&auto=format&fit=crop'
        }
    ];

    return (
        <div className="min-h-screen bg-transparent text-white relative">
            <ParticleBackground />
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-6 z-10 relative">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-vibrant-pink uppercase tracking-widest text-sm font-bold block mb-2">Heritage & Stories</span>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 text-glow-gold">
                        Living <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-pink to-purple-500">Culture</span>
                    </h1>
                </motion.div>

                {/* Festivals Section */}
                <div className="mb-20">
                    <h2 className="font-heading text-3xl mb-8 flex items-center gap-3">
                        <Calendar className="text-vibrant-gold" /> Upcoming Festivals
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {festivals.map((fest, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="group relative rounded-3xl overflow-hidden h-[300px] shadow-2xl border border-white/10"
                            >
                                <img src={fest.image} alt={fest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                <div className="absolute bottom-0 p-6 w-full">
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="font-bold text-2xl">{fest.name}</h3>
                                        <span className="text-xs bg-vibrant-pink px-2 py-1 rounded text-white font-bold">{fest.date}</span>
                                    </div>
                                    <p className="text-white/70 text-sm line-clamp-2">{fest.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Digital Stories Section (Requirement #66) */}
                <div>
                    <h2 className="font-heading text-3xl mb-8 flex items-center gap-3">
                        <BookOpen className="text-vibrant-gold" /> Digital Cultural Stories
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {stories.map((story, idx) => (
                            <motion.div
                                key={idx}
                                className="flex bg-glass-white backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <div className="w-1/3 relative overflow-hidden">
                                    <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="w-2/3 p-6 flex flex-col justify-center">
                                    <span className="text-vibrant-gold text-xs font-bold uppercase tracking-wider mb-2">{story.type}</span>
                                    <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-vibrant-gold transition-colors">{story.title}</h3>
                                    <div className="flex items-center gap-4 text-white/50 text-sm mt-2">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {story.duration}</span>
                                        <span className="flex items-center gap-1"><Play size={14} /> Listen Audio</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CultureHub;
