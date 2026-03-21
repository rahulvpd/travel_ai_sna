import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Phone, Languages, DollarSign, Briefcase, AlertTriangle, Volume2, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';

const TravelTools = () => {
    const [activeTab, setActiveTab] = useState('language');
    const [packingChecklist, setPackingChecklist] = useState([
        { id: 1, item: 'Passport & Visa', checked: false },
        { id: 2, item: 'Comfortable walking shoes', checked: false },
        { id: 3, item: 'Light cotton clothes', checked: false },
        { id: 4, item: 'Sunscreen & Hat', checked: false },
        { id: 5, item: 'Power bank', checked: false },
        { id: 6, item: 'First aid kit', checked: false }
    ]);

    const tamilPhrases = [
        { english: 'Hello', tamil: 'வணக்கம்', pronunciation: 'Vanakkam' },
        { english: 'Thank you', tamil: 'நன்றி', pronunciation: 'Nandri' },
        { english: 'How much?', tamil: 'எவ்வளவு?', pronunciation: 'Evvalavu?' },
        { english: 'Where is...?', tamil: 'எங்கே?', pronunciation: 'Engae?' },
        { english: 'I need help', tamil: 'எனக்கு உதவி வேண்டும்', pronunciation: 'Enakku udhavi vendum' },
        { english: 'Beautiful', tamil: 'அழகு', pronunciation: 'Azhagu' }
    ];

    const emergencyNumbers = [
        { service: 'Police', number: '100' },
        { service: 'Ambulance', number: '108' },
        { service: 'Fire', number: '101' },
        { service: 'Tourist Helpline', number: '1800-425-4255' }
    ];

    const togglePacking = (id) => {
        setPackingChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

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
                    <span className="text-vibrant-blue uppercase tracking-widest text-sm font-bold block mb-2">Your Safety & Convenience</span>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 text-glow-gold">
                        Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-blue to-vibrant-pink">Essentials</span>
                    </h1>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex justify-center gap-4 mb-12 flex-wrap">
                    {[
                        { id: 'language', label: 'Language Helper', icon: Languages },
                        { id: 'emergency', label: 'SOS', icon: AlertTriangle },
                        { id: 'packing', label: 'Packing List', icon: Briefcase }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-vibrant-gold text-black' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Language Helper Tab */}
                    {activeTab === 'language' && (
                        <motion.div
                            key="language"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-glass-white backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                                <h2 className="font-heading text-3xl mb-6 flex items-center gap-3">
                                    <Languages className="text-vibrant-gold" /> Essential Tamil Phrases
                                </h2>
                                <div className="space-y-4">
                                    {tamilPhrases.map((phrase, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <span className="text-xl font-bold">{phrase.english}</span>
                                                        <span className="text-3xl font-tamil">{phrase.tamil}</span>
                                                    </div>
                                                    <div className="text-vibrant-gold text-sm italic">{phrase.pronunciation}</div>
                                                </div>
                                                <button className="p-3 rounded-full bg-white/5 hover:bg-vibrant-gold/20 transition-colors group-hover:scale-110">
                                                    <Volume2 size={20} className="text-vibrant-gold" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Emergency SOS Tab */}
                    {activeTab === 'emergency' && (
                        <motion.div
                            key="emergency"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8">
                                <h2 className="font-heading text-3xl mb-6 flex items-center gap-3 text-red-200">
                                    <AlertTriangle className="text-red-400" /> Emergency Contacts
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    {emergencyNumbers.map((contact, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-black/40 border border-red-500/30 rounded-2xl p-6 hover:border-red-400 transition-colors"
                                        >
                                            <div className="text-white/60 text-sm mb-2">{contact.service}</div>
                                            <div className="text-4xl font-bold text-red-400 mb-4">{contact.number}</div>
                                            <button className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                                <Phone size={18} /> Call Now
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-black/30 border border-yellow-500/20 rounded-2xl p-6">
                                    <h3 className="text-yellow-200 font-bold mb-2 flex items-center gap-2">
                                        <Shield size={20} /> Safety Tips
                                    </h3>
                                    <ul className="text-white/70 text-sm space-y-2">
                                        <li>• Always carry a copy of your passport and visa</li>
                                        <li>• Share your itinerary with family/friends</li>
                                        <li>• Avoid isolated areas after dark</li>
                                        <li>• Keep emergency contacts saved offline</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Packing Assistant Tab */}
                    {activeTab === 'packing' && (
                        <motion.div
                            key="packing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-glass-white backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                                <h2 className="font-heading text-3xl mb-6 flex items-center gap-3">
                                    <Briefcase className="text-vibrant-gold" /> Packing Checklist
                                </h2>
                                <div className="space-y-3">
                                    {packingChecklist.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => togglePacking(item.id)}
                                            className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${item.checked ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                                                {item.checked && <Check size={16} className="text-white" />}
                                            </div>
                                            <span className={`text-lg ${item.checked ? 'line-through text-white/50' : 'text-white'}`}>
                                                {item.item}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                    + Add Custom Item
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default TravelTools;
