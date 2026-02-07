import { motion } from 'framer-motion';

const ColorShiftingText = ({ text, className }) => {
    return (
        <span className={`relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-vibrant-gold via-vibrant-pink to-vibrant-blue bg-[length:200%_auto] animate-gradient ${className}`}>
            {text}
        </span>
    );
};

export default ColorShiftingText;
