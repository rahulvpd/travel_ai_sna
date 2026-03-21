import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ImageReveal = ({ src, alt, className = '', direction = 'left' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const clipPaths = {
        left: {
            hidden: 'inset(0 100% 0 0)',
            visible: 'inset(0 0% 0 0)'
        },
        right: {
            hidden: 'inset(0 0 0 100%)',
            visible: 'inset(0 0 0 0%)'
        },
        top: {
            hidden: 'inset(0 0 100% 0)',
            visible: 'inset(0 0 0% 0)'
        },
        bottom: {
            hidden: 'inset(100% 0 0 0)',
            visible: 'inset(0% 0 0 0)'
        }
    };

    const clip = clipPaths[direction] || clipPaths.left;

    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <motion.img
                src={src}
                alt={alt}
                initial={{ clipPath: clip.hidden, scale: 1.2 }}
                animate={isInView ? { clipPath: clip.visible, scale: 1 } : {}}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default ImageReveal;
