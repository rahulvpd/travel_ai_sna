// src/components/chennai/ChennaiPlaceFilterBar.jsx
// Dual filter bar — Dynasty row + Place Type row

 
import { motion } from 'framer-motion';
import { DYNASTY_COLORS } from '../../services/chennaiMediaService';

const TYPE_EMOJIS = {
    temple: '🛕', fort: '🏰', beach: '🏖️', museum: '🏺',
    wildlife: '🌿', art: '🎨', market: '🛒', monument: '🏛️',
    educational: '📚', religious: '⛪', natural: '🌳', modern: '🏙️', park: '🌲'
};

const TYPE_LABELS = {
    temple: 'Temple', fort: 'Fort', beach: 'Beach', museum: 'Museum',
    wildlife: 'Wildlife', art: 'Art', market: 'Market', monument: 'Monument',
    educational: 'Education', religious: 'Religious', natural: 'Nature', modern: 'Modern', park: 'Park'
};

export default function ChennaiPlaceFilterBar({
    activeDynasty, activeType, onDynastyChange, onTypeChange,
    availableDynasties = [], availableTypes = []
}) {
    const activeClass = 'border-yellow-400 text-yellow-400 bg-yellow-400/10';
    const inactiveClass = 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white/80';

    return (
        <div className="space-y-3">
            {/* Dynasty row */}
            {availableDynasties.length > 0 && (
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Filter by Dynasty / Era</p>
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            label="All Eras"
                            active={!activeDynasty}
                            onClick={() => onDynastyChange('')}
                            activeClass={activeClass}
                            inactiveClass={inactiveClass}
                        />
                        {availableDynasties.map(d => (
                            <FilterChip
                                key={d}
                                label={d}
                                active={activeDynasty === d}
                                onClick={() => onDynastyChange(activeDynasty === d ? '' : d)}
                                activeClass={activeClass}
                                inactiveClass={inactiveClass}
                                dynClass={DYNASTY_COLORS[d]}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Type row */}
            {availableTypes.length > 0 && (
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Filter by Place Type</p>
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            label="All Types"
                            active={!activeType}
                            onClick={() => onTypeChange('')}
                            activeClass={activeClass}
                            inactiveClass={inactiveClass}
                        />
                        {availableTypes.map(t => (
                            <FilterChip
                                key={t}
                                label={`${TYPE_EMOJIS[t] || '📍'} ${TYPE_LABELS[t] || t}`}
                                active={activeType === t}
                                onClick={() => onTypeChange(activeType === t ? '' : t)}
                                activeClass={activeClass}
                                inactiveClass={inactiveClass}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterChip({ label, active, onClick, activeClass, inactiveClass, dynClass }) {
    return (
        <motion.button
            layout
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${active
                ? (dynClass || activeClass)
                : inactiveClass
                }`}
        >
            {label}
        </motion.button>
    );
}
