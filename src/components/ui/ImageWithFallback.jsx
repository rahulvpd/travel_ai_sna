import { useState } from 'react';
import { ImageOff } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className }) => {
    const [error, setError] = useState(false);

    const handleOnError = () => {
        setError(true);
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
            src={src}
            alt={alt}
            className={className}
            onError={handleOnError}
        />
    );
};

export default ImageWithFallback;
