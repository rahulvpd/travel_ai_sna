// src/components/chennai/ChennaiPlaceGallery.jsx
// Multi-image gallery for Chennai place cards with lightbox

import { useState } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { getPlaceImages } from '../../services/chennaiMediaService';

export default function ChennaiPlaceGallery({ placeName, images }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    const imgs = images || getPlaceImages(placeName);
    const main = imgs[0];
    const side1 = imgs[1];
    const side2 = imgs[2];
    const extra = imgs.length - 3;

    const openLightbox = (idx) => { setLightboxIdx(idx); setLightboxOpen(true); };
    const prev = () => setLightboxIdx((i) => (i - 1 + imgs.length) % imgs.length);
    const next = () => setLightboxIdx((i) => (i + 1) % imgs.length);

    return (
        <>
            {/* Grid layout */}
            <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden h-40">
                {/* Main image */}
                <div className="col-span-2 relative cursor-pointer group" onClick={() => openLightbox(0)}>
                    <img
                        src={main}
                        alt={placeName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>

                {/* Side images */}
                <div className="flex flex-col gap-1">
                    {side1 && (
                        <div className="relative flex-1 cursor-pointer group" onClick={() => openLightbox(1)}>
                            <img
                                src={side1}
                                alt={`${placeName} 2`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        </div>
                    )}
                    {side2 && (
                        <div className="relative flex-1 cursor-pointer group overflow-hidden" onClick={() => openLightbox(2)}>
                            <img
                                src={side2}
                                alt={`${placeName} 3`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            {extra > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center">
                                        <Images className="mx-auto mb-1 text-white w-4 h-4" />
                                        <span className="text-white text-xs font-bold">+{extra} more</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
                            onClick={() => setLightboxOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-3 hover:bg-white/20 transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <motion.img
                            key={lightboxIdx}
                            src={imgs[lightboxIdx]}
                            alt={`${placeName} ${lightboxIdx + 1}`}
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-3 hover:bg-white/20 transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); next(); }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {imgs.map((_, i) => (
                                <button
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all ${i === lightboxIdx ? 'bg-white scale-125' : 'bg-white/40'}`}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
