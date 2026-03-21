import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TypewriterText = ({ text, speed = 50, className = '', delay = 0, onComplete }) => {
    const [displayText, setDisplayText] = useState('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setStarted(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!started) return;
        if (displayText.length < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length + 1));
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [displayText, text, speed, started, onComplete]);

    return (
        <span className={className}>
            {displayText}
            {displayText.length < text.length && started && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-[1em] bg-vibrant-gold ml-0.5 align-middle"
                />
            )}
        </span>
    );
};

export default TypewriterText;
