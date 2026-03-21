// src/components/chennai/ChennaiTamilNameBadge.jsx
// Displays Tamil script + Roman transliteration below every place name
// Fails silently — renders nothing if Sarvam unavailable

import { useState, useEffect } from 'react';
import { translateWithTransliteration } from '../../services/sarvam';

export default function ChennaiTamilNameBadge({ placeName }) {
    const [data, setData] = useState({ tamil: null, transliteration: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const result = await translateWithTransliteration(placeName);
            if (!cancelled) { setData(result); setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [placeName]);

    if (loading) {
        return (
            <div className="flex flex-col gap-1 mt-1">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            </div>
        );
    }

    if (!data.tamil && !data.transliteration) return null;

    return (
        <div className="mt-1 leading-tight">
            {data.tamil && (
                <p className="text-sm text-amber-300/80 font-medium" style={{ fontFamily: 'Noto Serif Tamil, serif' }}>
                    {data.tamil}
                </p>
            )}
            {data.transliteration && (
                <p className="text-xs text-white/40 italic">{data.transliteration}</p>
            )}
        </div>
    );
}
