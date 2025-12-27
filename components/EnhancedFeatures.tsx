import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, MessageSquare, Trophy, ArrowRight, Zap, Globe } from 'lucide-react';
import TiltCard from './TiltCard';

interface EnhancedFeaturesProps {
    onNavigate: (view: 'home' | 'quiz' | 'shop' | 'profile') => void;
}

const EnhancedFeatures: React.FC<EnhancedFeaturesProps> = ({ onNavigate }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <section id="discover" className="py-24 bg-obsidian relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(114,9,183,0.15),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-obsidian to-transparent z-10" />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-20">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neonPink text-xs font-mono tracking-[0.2em] mb-6 backdrop-blur-md">
                        SYSTEM_UPGRADE_V2.0
                    </span>
                    <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 tracking-tight">
                        Immersion <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink via-purple-500 to-cyanLight animate-gradient-x">Totale</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Une interface repensée pour l'élite. Découvrez nos fonctionnalités avancées dans une grille holographique interactive.
                    </p>
                </motion.div>

                {/* BENTO GRID */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {/* ITEM 1: DISCOVER (Large 2x2) */}
                    <motion.div className="md:col-span-2 md:row-span-2" variants={itemVariants}>
                        <TiltCard
                            className="h-full min-h-[400px] bg-gradient-to-br from-midnight/80 to-obsidian/90 border border-white/10 rounded-3xl p-8 flex flex-col justify-between overflow-hidden"
                            glowColor="rgba(247, 37, 133, 0.4)"
                            onClick={() => onNavigate('shop')}
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-neonPink/20 flex items-center justify-center mb-6 backdrop-blur-sm border border-neonPink/30 text-neonPink">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
                                    Galerie <br />Cyberpunk
                                </h3>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <p className="text-gray-300 mb-6 max-w-sm leading-relaxed backdrop-blur-sm bg-black/20 p-2 rounded-lg">
                                    Explorez une collection infinie d'art digital, généré par IA et curaté par la communauté.
                                </p>
                                <div className="flex items-center gap-2 text-neonPink font-bold group-hover:gap-4 transition-all">
                                    <span>EXPLORER</span>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* ITEM 2: COMMUNITY (Tall 1x2) */}
                    <motion.div className="md:col-span-1 md:row-span-2" variants={itemVariants}>
                        <TiltCard
                            className="h-full min-h-[400px] bg-midnight/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl"
                            glowColor="rgba(114, 9, 183, 0.4)"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-neonPurple/10 to-transparent opacity-50" />

                            <div className="flex flex-col h-full relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-neonPurple/20 flex items-center justify-center mb-6 border border-neonPurple/30 text-neonPurple">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white mb-4">Nexus Social</h3>

                                <div className="space-y-4 my-auto">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm transform transition-transform group-hover:translate-x-2" style={{ transitionDelay: `${i * 100}ms` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyanLight to-blue-500" />
                                                <div className="h-2 w-20 bg-white/20 rounded-full" />
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full mt-3" />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <p className="text-gray-400 text-sm">
                                        Rejoignez les discussions en direct. Théories, débats et fandoms.
                                    </p>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* ITEM 3: SHARE (1x1) */}
                    <motion.div className="md:col-span-1 md:row-span-1" variants={itemVariants}>
                        <TiltCard
                            className="h-full min-h-[220px] bg-midnight/40 border border-white/10 rounded-3xl p-6 overflow-hidden"
                            glowColor="rgba(76, 201, 240, 0.4)"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Share2 size={80} className="text-cyanLight" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="w-10 h-10 rounded-xl bg-cyanLight/20 flex items-center justify-center border border-cyanLight/30 text-cyanLight">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white mb-2">Partage Global</h3>
                                    <p className="text-sm text-gray-400">Diffusez vos créations instantanément.</p>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* ITEM 4: RANKING (Wide 2x1) */}
                    <motion.div className="md:col-span-2 md:row-span-1" variants={itemVariants}>
                        <TiltCard
                            className="h-full min-h-[220px] bg-gradient-to-r from-midnight/40 to-obsidian/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                            glowColor="rgba(255, 183, 3, 0.4)"
                            onClick={() => onNavigate('quiz')}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-yellow-500/10 to-transparent" />

                            <div className="flex items-center justify-between relative z-10 h-full">
                                <div className="max-w-md">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 text-yellow-500">
                                            <Trophy size={20} />
                                        </div>
                                        <span className="text-yellow-500 font-mono text-sm tracking-widest uppercase">Compétition</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2">Classement Semaine</h3>
                                    <p className="text-sm text-gray-400">Montez les échelons et devenez le Champion.</p>
                                </div>

                                <div className="hidden md:flex items-center gap-2">
                                    <div className="text-right">
                                        <div className="text-3xl font-display font-bold text-white">#1</div>
                                        <div className="text-xs text-neonPink">Top Player</div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-2 border-yellow-500 p-1">
                                        <div className="w-full h-full rounded-full bg-gray-700 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                </motion.div>

            </div>
        </section>
    );
};

export default EnhancedFeatures;
