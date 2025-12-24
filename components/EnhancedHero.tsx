import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface EnhancedHeroProps {
    onOpenAuth: () => void;
    isLoggedIn: boolean;
}

const EnhancedHero: React.FC<EnhancedHeroProps> = ({ onOpenAuth, isLoggedIn }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Animated cyber grid with parallax */}
            <motion.div
                className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-[0.15]"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Radial gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,37,133,0.1)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(76,201,240,0.08)_0%,transparent_50%)]" />

            {/* Animated light beams */}
            <motion.div
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-[2px] bg-gradient-to-r from-transparent via-neonPink/30 to-transparent"
                        style={{
                            width: '100%',
                            top: `${15 + i * 20}%`,
                            left: 0,
                            transform: `rotate(${-5 + i * 2}deg)`,
                        }}
                        animate={{
                            x: ['-100%', '200%'],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 1.5,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </motion.div>

            {/* Main content */}
            <motion.div
                className="relative z-10 text-center max-w-5xl mx-auto px-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div
                    className="inline-block mb-6"
                    variants={itemVariants}
                >
                    <motion.div
                        className="px-5 py-2 rounded-full border border-neonPink/30 bg-neonPink/10 backdrop-blur-xl relative overflow-hidden group interactive"
                        whileHover={{ scale: 1.05, borderColor: 'rgba(247, 37, 133, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-neonPink/20 via-transparent to-neonPink/20"
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                        <span className="relative text-neonPink text-xs font-mono tracking-[0.2em] uppercase">
                            ✦ Bienvenue au Niveau Supérieur ✦
                        </span>
                    </motion.div>
                </motion.div>

                {/* Main Title with dramatic animation */}
                <motion.h1
                    className="text-5xl md:text-8xl font-display font-black text-white mb-2 leading-tight tracking-tighter"
                    variants={itemVariants}
                >
                    <motion.span
                        className="inline-block"
                        animate={{
                            textShadow: [
                                '0 0 20px rgba(247, 37, 133, 0.3)',
                                '0 0 40px rgba(247, 37, 133, 0.6)',
                                '0 0 20px rgba(247, 37, 133, 0.3)',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        CULTURE{' '}
                    </motion.span>
                    <motion.span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-cyanLight via-electricBlue to-neonPurple inline-block"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    >
                        OTAKU
                    </motion.span>
                    <br />
                    <motion.span
                        className="inline-block"
                        variants={floatingVariants}
                        animate="animate"
                    >
                        DU FUTUR
                    </motion.span>
                </motion.h1>

                {/* Japanese subtitle */}
                <motion.p
                    className="text-xl md:text-2xl font-jp text-gray-400 mb-8 tracking-[0.3em] font-light"
                    variants={itemVariants}
                >
                    <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        次世代のオタクコミュニティ
                    </motion.span>
                </motion.p>

                {/* Description */}
                <motion.p
                    className="max-w-2xl mx-auto text-gray-400 mb-10 text-lg leading-relaxed"
                    variants={itemVariants}
                >
                    Rejoignez le réseau d'élite des créateurs, fans et futuristes.
                    <br className="hidden md:block" />
                    <span className="text-white/70">Discussions immersives</span>, <span className="text-neonPink/70">galeries néon</span> et <span className="text-cyanLight/70">interactions IA</span>.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col md:flex-row gap-6 justify-center items-center"
                    variants={itemVariants}
                >
                    {/* Primary Button */}
                    <motion.button
                        onClick={isLoggedIn ? undefined : onOpenAuth}
                        className="group relative px-8 py-4 bg-white text-black font-display font-bold tracking-wide rounded-sm overflow-hidden interactive"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                        />

                        {/* Gradient overlay on hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-neonPink to-neonPurple"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Default text */}
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                            {isLoggedIn ? 'ACCÉDER AU HUB' : "LANCER L'AVENTURE"}
                            <motion.span
                                className="inline-block"
                                whileHover={{ x: 5 }}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </motion.span>
                        </span>
                    </motion.button>

                    {/* Secondary Button */}
                    <motion.button
                        className="relative px-8 py-4 font-display font-bold tracking-wide rounded-sm overflow-hidden interactive group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Animated border */}
                        <motion.div
                            className="absolute inset-0 rounded-sm"
                            style={{
                                background: 'linear-gradient(90deg, #F72585, #7209B7, #4CC9F0, #F72585)',
                                backgroundSize: '300% 100%',
                                padding: '1px',
                            }}
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                            <div className="absolute inset-[1px] bg-obsidian rounded-sm" />
                        </motion.div>

                        <span className="relative z-10 text-white flex items-center gap-2">
                            DÉCOUVRIR
                        </span>

                        {/* Glow on hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-neonPink/20 to-cyanLight/20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                    </motion.button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <motion.div
                        className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
                        animate={{ borderColor: ['rgba(255,255,255,0.2)', 'rgba(247,37,133,0.4)', 'rgba(255,255,255,0.2)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <motion.div
                            className="w-1.5 h-3 bg-gradient-to-b from-neonPink to-transparent rounded-full"
                            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </header>
    );
};

export default EnhancedHero;
