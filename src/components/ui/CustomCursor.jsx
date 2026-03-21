import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('button')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]">
            {/* Main Cursor Dot */}
            <motion.div
                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: -6, // Center offset
                    y: -6
                }}
                animate={{
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                }}
                transition={{ duration: 0.1 }}
            />

            {/* Magnetic Ring */}
            <motion.div
                className="absolute w-10 h-10 border border-vibrant-gold rounded-full"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: -20, // Center offset
                    y: -20
                }}
                animate={{
                    scale: isClicking ? 1.2 : isHovering ? 2 : 1,
                    opacity: isHovering ? 1 : 0.5,
                    borderColor: isHovering ? '#ffcc00' : 'rgba(255,255,255,0.3)'
                }}
                transition={{ duration: 0.2 }}
            />
        </div>
    );
};

export default CustomCursor;
