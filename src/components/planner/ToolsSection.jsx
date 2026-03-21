import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, AlertTriangle, Briefcase, Volume2, Phone, Check, Shield } from 'lucide-react';

const ToolsSection = () => {
    const [subTab, setSubTab] = useState('sos');

    const tamilPhrases = [
        { english: 'Hello', tamil: 'வணக்கம்', pronunciation: 'Vanakkam' },
        { english: 'Thank you', tamil: 'நன்றி', pronunciation: 'Nandri' },
        { english: 'Where is...?', tamil: 'எங்கே?', pronunciation: 'Engae?' },
        { english: 'I need help', tamil: 'எனக்கு உதவி வேண்டும்', pronunciation: 'Enakku udhavi vendum' },
    ];

    const emergencyNumbers = [
        { service: 'Police', number: '100' },
        { service: 'Tourist Helpline', number: '1800-425-4255' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {[
                    { id: 'sos', icon: AlertTriangle, label: 'SOS' },
                    { id: 'speak', icon: Languages, label: 'Lingo' },
                    { id: 'pack', icon: Briefcase, label: 'Pack' },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setSubTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${subTab === t.id ? 'bg-white/10 text-vibrant-gold shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {subTab === 'sos' && (
                    <motion.div key="sos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                            <h4 className="text-red-400 font-bold text-sm mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} /> Quick SOS Numbers
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {emergencyNumbers.map((c, i) => (
                                    <div key={i} className="bg-black/20 p-3 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-colors">
                                        <div className="text-[10px] text-white/40 uppercase mb-1">{c.service}</div>
                                        <div className="text-xl font-bold text-red-400">{c.number}</div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                <Phone size={16} /> Call Emergency Services
                            </button>
                        </div>
                        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4">
                            <h4 className="text-yellow-400 font-bold text-xs mb-2 flex items-center gap-2">
                                <Shield size={14} /> Safety Pick
                            </h4>
                            <p className="text-[10px] text-white/60 leading-relaxed italic">
                                "Always Keep the TN Tourist Helpline (1800-425-4255) saved for immediate official assistance in any district."
                            </p>
                        </div>
                    </motion.div>
                )}

                {subTab === 'speak' && (
                    <motion.div key="speak" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        {tamilPhrases.map((phrase, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-bold">{phrase.english}</span>
                                            <span className="text-lg font-tamil text-vibrant-gold">{phrase.tamil}</span>
                                        </div>
                                        <div className="text-[10px] text-white/40 italic">{phrase.pronunciation}</div>
                                    </div>
                                    <button className="p-2 rounded-full bg-white/5 hover:bg-vibrant-gold/20 text-vibrant-gold">
                                        <Volume2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {subTab === 'pack' && (
                    <motion.div key="pack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        {['Passport & Docs', 'Cotton Clothing', 'Power Bank', 'Sunscreen'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center">
                                    <Check size={12} className="text-transparent" />
                                </div>
                                <span className="text-sm">{item}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ToolsSection;
