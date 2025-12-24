import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, MessageSquare } from 'lucide-react';

const EnhancedFeatures: React.FC = () => {
    const features = [
        {
            title: 'Découvrir',
            desc: "Explorez l'art anime tendance et l'esthétique cyberpunk sélectionnés par la communauté.",
            icon: <Sparkles className="w-8 h-8" />,
            gradient: 'from-neonPink to-neonPurple',
            glowColor: 'rgba(247, 37, 133, 0.4)',
            borderHover: 'group-hover:border-neonPink/50',
        },
        {
            title: 'Partager',
            desc: 'Publiez vos créations, théories et collections en haute fidélité.',
            icon: <Share2 className="w-8 h-8" />,
            gradient: 'from-cyanLight to-electricBlue',
            glowColor: 'rgba(76, 201, 240, 0.4)',
            borderHover: 'group-hover:border-cyanLight/50',
        },
        {
            title: 'Discuter',
            desc: 'Participez à des conversations approfondies avec un public passionné.',
            icon: <MessageSquare className="w-8 h-8" />,
            gradient: 'from-neonPurple to-electricBlue',
            glowColor: 'rgba(114, 9, 183, 0.4)',
            borderHover: 'group-hover:border-neonPurple/50',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <section id="discover" className="py-24 bg-obsidian relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(114,9,183,0.1)_0%,transparent_60%)]" />

            {/* Grid pattern */}
            <motion.div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(247, 37, 133, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(247, 37, 133, 0.3) 1px, transparent 1px)
          `,
                    backgroundSize: '100px 100px',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.span
                        className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-mono mb-4"
                        whileHover={{ scale: 1.05, borderColor: 'rgba(247, 37, 133, 0.3)' }}
                    >
                        ✦ FONCTIONNALITÉS ✦
                    </motion.span>
                    <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
                        Tout ce dont vous avez{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink via-neonPurple to-cyanLight">
                            besoin
                        </span>
                    </h2>
                </motion.div>

                {/* Cards grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            className={`group relative p-8 rounded-2xl bg-midnight/30 border border-white/5 backdrop-blur-sm transition-all duration-500 ${feature.borderHover} interactive`}
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 },
                            }}
                            style={{ perspective: '1000px' }}
                        >
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                                style={{
                                    background: `radial-gradient(circle at 50% 50%, ${feature.glowColor}, transparent 70%)`,
                                    filter: 'blur(40px)',
                                }}
                            />

                            {/* Animated border gradient */}
                            <motion.div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: `linear-gradient(90deg, transparent, ${feature.glowColor}, transparent)`,
                                    backgroundSize: '200% 100%',
                                }}
                                animate={{
                                    backgroundPosition: ['0% 50%', '200% 50%'],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />

                            {/* Glass overlay on hover */}
                            <div className="absolute inset-[1px] rounded-2xl bg-midnight/50 backdrop-blur-xl -z-10" />

                            {/* Icon container */}
                            <motion.div
                                className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 w-fit relative overflow-hidden`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6 }}
                                />
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient}`}>
                                    {React.cloneElement(feature.icon, {
                                        className: 'w-8 h-8',
                                        stroke: 'url(#gradient-' + i + ')'
                                    })}
                                </span>
                                <span className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r ${feature.gradient} bg-clip-text`}>
                                    {feature.icon}
                                </span>
                            </motion.div>

                            {/* Title */}
                            <motion.h3
                                className="text-2xl font-display font-bold text-white mb-4"
                                whileHover={{ x: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {feature.title}
                            </motion.h3>

                            {/* Description */}
                            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                {feature.desc}
                            </p>

                            {/* Decorative corner */}
                            <motion.div
                                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-[100px] group-hover:opacity-20 transition-opacity duration-500`}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default EnhancedFeatures;
