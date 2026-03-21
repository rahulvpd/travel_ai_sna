import { useState } from 'react';
import { ImageOff } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className }) => {
    const [error, setError] = useState(false);
    const [fallbackUsed, setFallbackUsed] = useState(false);

    // Try to infer district id from src or alt
    let districtId = null;
    if (src && src.includes('unsplash.com')) {
        // Try to extract id from alt (e.g., Chennai -> chn, Cuddalore -> cud)
        if (alt) {
            const altLower = alt.toLowerCase();
            if (altLower.includes('chennai')) districtId = 'chn';
            else if (altLower.includes('cuddalore')) districtId = 'cud';
            // Add more mappings as needed
        }
    }

    const fallbackSrc = districtId ? `/images/${districtId}.jpg` : null;

    const handleOnError = (e) => {
        if (!fallbackUsed && fallbackSrc) {
            setFallbackUsed(true);
            e.target.src = fallbackSrc;
        } else {
            setError(true);
        }
    };

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-200 text-gray-400 ${className}`}>
                <ImageOff className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest text-center px-4">{alt}</span>
            </div>
        );
    }

    return (
        <img
            src={fallbackUsed && fallbackSrc ? fallbackSrc : src}
            alt={alt}
            className={className}
            onError={handleOnError}
        />
    );
};

export default ImageWithFallback;
