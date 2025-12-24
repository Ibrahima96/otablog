import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Orb {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    blur: number;
    duration: number;
    delay: number;
}

const FloatingOrbs: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const orbs: Orb[] = [
        { id: 1, x: 10, y: 20, size: 400, color: 'rgba(247, 37, 133, 0.15)', blur: 80, duration: 25, delay: 0 },
        { id: 2, x: 80, y: 60, size: 350, color: 'rgba(114, 9, 183, 0.12)', blur: 100, duration: 30, delay: 2 },
        { id: 3, x: 20, y: 70, size: 300, color: 'rgba(76, 201, 240, 0.10)', blur: 90, duration: 28, delay: 4 },
        { id: 4, x: 70, y: 15, size: 250, color: 'rgba(67, 97, 238, 0.12)', blur: 70, duration: 22, delay: 1 },
        { id: 5, x: 50, y: 50, size: 500, color: 'rgba(247, 37, 133, 0.08)', blur: 120, duration: 35, delay: 3 },
        { id: 6, x: 90, y: 80, size: 200, color: 'rgba(255, 255, 255, 0.05)', blur: 60, duration: 20, delay: 5 },
    ];

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            style={{ perspective: '1000px' }}
        >
            {orbs.map((orb) => (
                <motion.div
                    key={orb.id}
                    className="absolute rounded-full"
                    style={{
                        width: orb.size,
                        height: orb.size,
                        left: `${orb.x}%`,
                        top: `${orb.y}%`,
                        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                        filter: `blur(${orb.blur}px)`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                        x: [0, 50, -30, 20, 0],
                        y: [0, -40, 30, -20, 0],
                        scale: [1, 1.2, 0.9, 1.1, 1],
                        opacity: [0.5, 0.8, 0.6, 0.9, 0.5],
                    }}
                    transition={{
                        duration: orb.duration,
                        delay: orb.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Morphing blob effect */}
            <motion.div
                className="absolute"
                style={{
                    width: 600,
                    height: 600,
                    left: '30%',
                    top: '40%',
                    background: 'linear-gradient(135deg, rgba(247, 37, 133, 0.1), rgba(114, 9, 183, 0.1), rgba(76, 201, 240, 0.1))',
                    filter: 'blur(100px)',
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    borderRadius: [
                        '30% 70% 70% 30% / 30% 30% 70% 70%',
                        '70% 30% 30% 70% / 70% 70% 30% 30%',
                        '50% 50% 50% 50% / 50% 50% 50% 50%',
                        '30% 70% 70% 30% / 30% 30% 70% 70%',
                    ],
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 0.95, 1.05, 1],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
        </div>
    );
};

export default React.memo(FloatingOrbs);
