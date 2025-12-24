import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleEffect {
    id: number;
    x: number;
    y: number;
}

const MagneticCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
    const [ripples, setRipples] = useState<RippleEffect[]>([]);
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);

        // Add to trail
        setTrail((prev) => {
            const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }];
            return newTrail.slice(-8); // Keep last 8 positions
        });

        // Check if hovering over interactive element
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, [role="button"], input, .interactive');
        setIsHoveringInteractive(!!isInteractive);
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        setIsClicking(true);

        // Add ripple effect
        const newRipple: RippleEffect = {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 1000);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsClicking(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave]);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
        return null;
    }

    return (
        <>
            {/* Cursor Trail */}
            <AnimatePresence>
                {trail.map((point, index) => (
                    <motion.div
                        key={point.id}
                        className="fixed pointer-events-none z-[9997]"
                        style={{
                            left: point.x,
                            top: point.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ opacity: 0.6, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.02 }}
                    >
                        <div
                            className="rounded-full"
                            style={{
                                width: 6 + index,
                                height: 6 + index,
                                background: `rgba(247, 37, 133, ${0.3 - index * 0.03})`,
                                filter: 'blur(2px)',
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Main Cursor Glow */}
            <motion.div
                className="fixed pointer-events-none z-[9998] mix-blend-screen"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: isClicking ? 0.8 : isHoveringInteractive ? 1.5 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div
                    className="rounded-full"
                    style={{
                        width: 80,
                        height: 80,
                        background: 'radial-gradient(circle, rgba(247, 37, 133, 0.15) 0%, rgba(114, 9, 183, 0.1) 40%, transparent 70%)',
                        filter: 'blur(20px)',
                    }}
                />
            </motion.div>

            {/* Inner Cursor Dot */}
            <motion.div
                className="fixed pointer-events-none z-[9999]"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: isClicking ? 0.5 : isHoveringInteractive ? 1.8 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 800, damping: 35 }}
            >
                <div
                    className="rounded-full"
                    style={{
                        width: 8,
                        height: 8,
                        background: isHoveringInteractive
                            ? 'linear-gradient(135deg, #F72585, #7209B7)'
                            : 'rgba(255, 255, 255, 0.9)',
                        boxShadow: isHoveringInteractive
                            ? '0 0 20px rgba(247, 37, 133, 0.8), 0 0 40px rgba(114, 9, 183, 0.5)'
                            : '0 0 10px rgba(255, 255, 255, 0.5)',
                    }}
                />
            </motion.div>

            {/* Ring around cursor when hovering interactive */}
            <motion.div
                className="fixed pointer-events-none z-[9998]"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: isHoveringInteractive ? 1 : 0,
                    opacity: isHoveringInteractive ? 1 : 0,
                    rotate: [0, 360],
                }}
                transition={{
                    scale: { type: 'spring', stiffness: 500, damping: 30 },
                    opacity: { duration: 0.2 },
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                }}
            >
                <div
                    className="rounded-full"
                    style={{
                        width: 40,
                        height: 40,
                        border: '2px solid transparent',
                        borderTopColor: '#F72585',
                        borderRightColor: '#7209B7',
                    }}
                />
            </motion.div>

            {/* Click Ripples */}
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        className="fixed pointer-events-none z-[9996]"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div
                            className="rounded-full"
                            style={{
                                width: 50,
                                height: 50,
                                border: '2px solid rgba(247, 37, 133, 0.5)',
                                boxShadow: '0 0 20px rgba(247, 37, 133, 0.3)',
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </>
    );
};

export default React.memo(MagneticCursor);
