import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const cards = [
    {
        id: 1,
        title: "Madurai",
        subtitle: "The City of Temples",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Kanyakumari",
        subtitle: "Tip of India",
        image: "https://images.unsplash.com/photo-1590050752117-238cb0fb23b5?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Ooty",
        subtitle: "Queen of Hills",
        image: "https://images.unsplash.com/photo-1548685913-fe78d6badd69?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 4,
        title: "Mahabalipuram",
        subtitle: "Stone Heritage",
        image: "https://images.unsplash.com/photo-1605335832731-50e56616421a?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 5,
        title: "Thanjavur",
        subtitle: "Chola Architecture",
        image: "https://images.unsplash.com/photo-1605626889417-3bf751241f32?q=80&w=800&auto=format&fit=crop",
    }
];

const CardCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(2);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    };

    // Auto-play effect
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000); // Change slide every 4 seconds
        return () => clearInterval(interval);
    }, [activeIndex]);


    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden perspective-1000">
            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 md:left-20 z-30 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-vibrant-gold hover:text-black transition-all"
            >
                <ChevronLeft />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 md:right-20 z-30 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-vibrant-gold hover:text-black transition-all"
            >
                <ChevronRight />
            </button>

            {/* Cards */}
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                {cards.map((card, index) => {
                    // Calculate offset from active index
                    let offset = index - activeIndex;

                    // Handle wrap-around logic for infinite feel (simplified for 5 items)
                    // If offset is too far, hide it or wrap it visually? 
                    // Let's stick to a simple centered focus logic for now.

                    const isActive = index === activeIndex;
                    const isPrev = index === activeIndex - 1;
                    const isNext = index === activeIndex + 1;

                    // Only show 3 cards mainly
                    if (Math.abs(offset) > 1 && !isActive) {
                        // return null; // Or hide with opacity
                    }

                    return (
                        <motion.div
                            key={card.id}
                            initial={false}
                            animate={{
                                x: offset * 320, // Spacing
                                scale: isActive ? 1.3 : 0.75,
                                opacity: Math.abs(offset) > 2 ? 0 : isActive ? 1 : 0.4,
                                rotateY: isActive ? 0 : offset > 0 ? -20 : 20, // 3D Tilt towards center
                                zIndex: isActive ? 10 : 5 - Math.abs(offset),
                                boxShadow: isActive ? '0 30px 80px rgba(255, 204, 0, 0.4)' : '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute w-[300px] h-[450px] md:w-[350px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 bg-gray-900"
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                            <div className="absolute bottom-0 left-0 p-6 w-full text-left">
                                <span className="text-vibrant-gold text-xs font-bold uppercase tracking-widest mb-2 block">
                                    {card.subtitle}
                                </span>
                                <h3 className="text-3xl font-heading text-white">{card.title}</h3>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4"
                                    >
                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            <span>Click to Explore</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default CardCarousel;
