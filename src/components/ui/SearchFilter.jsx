import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchFilter = ({ onSearch, onFilter }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Mock categories
    const categories = ['Temples', 'Beaches', 'Hill Stations', 'Wildlife', 'Culture'];

    const handleSearch = (e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className="relative mb-12 max-w-2xl mx-auto z-30">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 group-focus-within:text-vibrant-gold transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search destinations (e.g., Madurai, Ooty)..."
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-5 pl-16 pr-16 text-lg text-white shadow-xl focus:outline-none focus:border-vibrant-gold/50 focus:bg-white/10 focus:shadow-[0_0_30px_rgba(255,204,0,0.15)] transition-all"
                />

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-vibrant-gold hover:text-black text-white rounded-full transition-all"
                >
                    {isOpen ? <X size={20} /> : <Filter size={20} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                        <h4 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">Filter by Category</h4>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => onFilter(cat)}
                                    className="px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-vibrant-gold hover:text-black hover:border-vibrant-gold transition-all"
                                >
                                    {cat}
                                </button>
                            ))}
                            <button onClick={() => onFilter('All')} className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                                Reset
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchFilter;
