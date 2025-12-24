import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    glowColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", onClick, glowColor = "#F72585" }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative group cursor-pointer ${className}`}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="relative z-10 h-full w-full"
            >
                {children}
            </div>

            {/* Glossy Reflection Gradient */}
            <div
                className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                style={{
                    background: `linear-gradient(125deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)`
                }}
            />

            {/* Dynamic Glow Behind */}
            <motion.div
                className="absolute -inset-4 z-[-1] rounded-[2rem] opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-xl"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`
                }}
            />
        </motion.div>
    );
};

export default TiltCard;
