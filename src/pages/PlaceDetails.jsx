import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Clock, Ticket, Star, Play, Monitor } from 'lucide-react';
import { DISTRICTS } from '../data/districts';
import ChennaiPlaceGallery from '../components/chennai/ChennaiPlaceGallery';
import ChennaiAudioGuide from '../components/chennai/ChennaiAudioGuide';
import ChennaiTamilNameBadge from '../components/chennai/ChennaiTamilNameBadge';
import { DYNASTY_COLORS, getVirtualTourForPlace, getVideosForPlace } from '../services/chennaiMediaService';
import { useState, useEffect } from 'react';
import { getChennaiPlaceIntelligence } from '../services/chennaiAgent';

export default function PlaceDetails() {
    const { id, placeId } = useParams();

    // ✅ All hooks MUST be called before any conditional return
    const [aiData, setAiData] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [videoModal, setVideoModal] = useState(null);

    // Find data after hooks are declared
    const districtData = DISTRICTS.find(d => d.id === id);
    const place = districtData?.places?.find(
        p => p.name.toLowerCase().replace(/\s+/g, '-') === placeId
    );

    useEffect(() => {
        if (!place) return;
        window.scrollTo(0, 0);
        
        let isMounted = true;
        
        const loadIntelligence = async () => {
            setAiLoading(true);
            try {
                const data = await getChennaiPlaceIntelligence(place.name);
                if (isMounted) setAiData(data);
            } catch (err) {
                if (isMounted) console.error('AI Error:', err);
            } finally {
                if (isMounted) setAiLoading(false);
            }
        };

        setAiData(null);
        loadIntelligence();

        return () => { isMounted = false; };
    }, [place?.name]);

    // Conditional renders AFTER all hooks
    if (!districtData) return (
        <div className="min-h-screen pt-24 flex items-center justify-center text-white">
            District data not found.
        </div>
    );
    if (!place) return (
        <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-white">
            <p className="text-2xl font-bold">Place not found</p>
            <Link to={`/explore/${id}`} className="text-vibrant-gold hover:underline">← Back to {districtData.name} Explore</Link>
        </div>
    );

    const dynastyClass = DYNASTY_COLORS?.[place.dynasty] || 'bg-white/10 text-white/60 border-white/20';
    const virtualTour = getVirtualTourForPlace(place.name);
    const placeVideos = getVideosForPlace(place.name);

    return (
        <div className="min-h-screen bg-bg-dark text-white pt-24 pb-12 font-sans selection:bg-vibrant-gold selection:text-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Back Navigation */}
                <Link to={`/explore/${id}`} className="inline-flex items-center gap-2 text-white/60 hover:text-vibrant-gold transition-colors mb-6">
                    <ChevronLeft size={16} /> Back to {districtData.name} Explore
                </Link>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl">{place.emoji || '📍'}</span>
                        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white">{place.name}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        {place.category && (
                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">{place.category}</span>
                        )}
                        {place.rating && (
                            <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                                <Star className="w-4 h-4 fill-yellow-400" />{place.rating}
                            </span>
                        )}
                        <ChennaiTamilNameBadge placeName={place.name} />
                        <ChennaiAudioGuide text={place.significance || place.description} placeName={place.name} />
                    </div>
                </motion.div>

                {/* Hero Gallery */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                    <ChennaiPlaceGallery placeName={place.name} />
                </motion.div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="md:col-span-2 space-y-8">

                        <section>
                            <h2 className="text-2xl font-bold mb-4 font-serif text-vibrant-gold">About This Place</h2>
                            <p className="text-white/80 leading-relaxed text-lg">{place.description}</p>
                            {place.historicalFact && (
                                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2">Historical Fact</h4>
                                    <p className="text-white/80 text-sm">{place.historicalFact}</p>
                                </div>
                            )}
                            {place.significance && (
                                <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2">Significance</h4>
                                    <p className="text-white/80 text-sm">{place.significance}</p>
                                </div>
                            )}
                        </section>

                        {place.tips && (
                            <section>
                                <h2 className="text-xl font-bold mb-3 font-serif text-white">Visitor Tips</h2>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                    <p className="text-white/80 text-sm leading-relaxed">💡 {place.tips}</p>
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-xl font-bold mb-4 font-serif text-white">AI Deep Intelligence</h2>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[120px]">
                                {aiLoading ? (
                                    <div className="animate-pulse flex flex-col gap-4">
                                        <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                        <div className="h-3 bg-white/10 rounded w-2/3"></div>
                                    </div>
                                ) : aiData ? (
                                    <div className="space-y-6">
                                        {aiData.architectural?.uniqueArchitectural && (
                                            <div>
                                                <h3 className="text-sm text-vibrant-gold uppercase font-bold tracking-wider mb-2">Architecture</h3>
                                                <p className="text-white/80 text-sm leading-relaxed">{aiData.architectural.uniqueArchitectural}</p>
                                            </div>
                                        )}
                                        {aiData.visitorIntel?.insiderTips?.length > 0 && (
                                            <div>
                                                <h3 className="text-sm text-vibrant-gold uppercase font-bold tracking-wider mb-2">Insider Tips</h3>
                                                <ul className="space-y-2">
                                                    {aiData.visitorIntel.insiderTips.slice(0, 4).map((tip, idx) => (
                                                        <li key={idx} className="flex gap-2 text-white/80 text-sm">
                                                            <span className="text-vibrant-gold mt-0.5 flex-shrink-0">•</span>{tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aiData.artTraditions?.festivals?.length > 0 && (
                                            <div>
                                                <h3 className="text-sm text-vibrant-gold uppercase font-bold tracking-wider mb-2">Festivals</h3>
                                                <p className="text-white/80 text-sm">{aiData.artTraditions.festivals.join(', ')}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-white/40 text-sm italic">AI insights temporarily unavailable. Check back shortly — results are cached for 24h.</p>
                                )}
                            </div>
                        </section>

                        {/* Virtual Experiences Section */}
                        {(virtualTour || placeVideos.length > 0) && (
                            <section>
                                <h2 className="text-xl font-bold mb-4 font-serif text-white">Virtual Experiences</h2>
                                <div className="space-y-4">
                                    {virtualTour && (
                                        <a
                                            href={virtualTour.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Monitor className="w-5 h-5 text-blue-300" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">{virtualTour.label}</h4>
                                                <p className="text-white/50 text-xs">Explore in 360°</p>
                                            </div>
                                        </a>
                                    )}

                                    {placeVideos.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {placeVideos.map(video => (
                                                <div
                                                    key={video.id}
                                                    onClick={() => setVideoModal(video)}
                                                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border border-white/10"
                                                >
                                                    <img
                                                        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-2 left-2 right-2">
                                                        <p className="text-white text-xs font-bold truncate drop-shadow-md">{video.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                    </motion.div>

                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">

                        {/* Practical Info */}
                        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
                            <h3 className="font-bold text-lg">Practical Info</h3>
                            {place.location && (
                                <div className="flex gap-3 text-sm text-white/70">
                                    <MapPin className="w-4 h-4 text-vibrant-gold flex-shrink-0 mt-0.5" />
                                    <span>{place.location}</span>
                                </div>
                            )}
                            {place.timings && (
                                <div className="flex gap-3 text-sm text-white/70">
                                    <Clock className="w-4 h-4 text-vibrant-gold flex-shrink-0 mt-0.5" />
                                    <span>{place.timings}</span>
                                </div>
                            )}
                            {place.entryFee && (
                                <div className="flex gap-3 text-sm text-white/70">
                                    <Ticket className="w-4 h-4 text-vibrant-gold flex-shrink-0 mt-0.5" />
                                    <span>{place.entryFee}</span>
                                </div>
                            )}
                            {place.bestTimeToVisit && (
                                <div className="text-sm text-white/50 pt-2 border-t border-white/10">
                                    ⏰ Best: {place.bestTimeToVisit}
                                </div>
                            )}
                        </div>

                        {/* Heritage */}
                        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
                            <h3 className="font-bold text-lg">Heritage Origin</h3>
                            {place.period && (
                                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                                    <span className="text-white/50">Period</span>
                                    <span className="font-medium text-right">{place.period}</span>
                                </div>
                            )}
                            {place.builtBy && (
                                <div className="flex justify-between text-sm border-b border-white/10 pb-2 gap-2">
                                    <span className="text-white/50 flex-shrink-0">Built By</span>
                                    <span className="font-medium text-right">{place.builtBy}</span>
                                </div>
                            )}
                            {place.architecturalStyle && (
                                <div className="text-sm border-b border-white/10 pb-2">
                                    <span className="text-white/50 block">Style</span>
                                    <span className="font-medium">{place.architecturalStyle}</span>
                                </div>
                            )}
                            <div className="pt-1 flex flex-wrap gap-2">
                                {place.dynasty && (
                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${dynastyClass}`}>
                                        {place.dynasty}
                                    </span>
                                )}
                                {place.ASI_protected && (
                                    <span className="text-xs px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300">
                                        🏛️ ASI Protected
                                    </span>
                                )}
                                {place.UNESCO && (
                                    <span className="text-xs px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-300">
                                        🌍 UNESCO
                                    </span>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>

            {/* Video Modal */}
            {videoModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setVideoModal(null)}
                >
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoModal.id}?autoplay=1`}
                            title={videoModal.title}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); setVideoModal(null); }}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
