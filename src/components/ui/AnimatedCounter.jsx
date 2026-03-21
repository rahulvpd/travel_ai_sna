import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedCounter = ({ end, duration = 2, prefix = '', suffix = '', className = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        let startTime;
        let animFrame;
        const startVal = 0;
        const endVal = typeof end === 'string' ? parseFloat(end) : end;
        const isDecimal = String(end).includes('.');

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            // Ease out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startVal + (endVal - startVal) * eased;
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));

            if (progress < 1) {
                animFrame = requestAnimationFrame(step);
            }
        };

        animFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animFrame);
    }, [isInView, end, duration]);

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={className}
        >
            {prefix}{count}{suffix}
        </motion.span>
    );
};

export default AnimatedCounter;
