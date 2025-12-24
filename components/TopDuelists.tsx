import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Flame } from 'lucide-react';
import { QuizScore } from '../types';

interface TopDuelistsProps {
    duelists: QuizScore[];
}

const TopDuelists: React.FC<TopDuelistsProps> = ({ duelists }) => {
    return (
        <section className="py-16 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-10 text-center">
                    <Trophy className="text-yellow-400 drop-shadow-glow" size={32} />
                    <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-widest uppercase">
                        Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Fame</span>
                    </h2>
                    <Trophy className="text-yellow-400 drop-shadow-glow" size={32} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {duelists.map((duelist, index) => (
                        <motion.div
                            key={duelist.userId}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative group p-[1px] rounded-2xl overflow-hidden ${index === 0 ? 'md:-mt-6' : ''}`}
                        >
                            {/* Card Border Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300
                                ${index === 0 ? 'from-yellow-400 via-orange-500 to-yellow-600 opacity-100 shadow-[0_0_30px_rgba(234,179,8,0.3)]' :
                                    index === 1 ? 'from-gray-300 via-white to-gray-400 opacity-70' :
                                        index === 2 ? 'from-orange-600 via-orange-400 to-orange-700 opacity-60' :
                                            'from-cyan-500/50 to-purple-500/50 opacity-40'}
                            `} />

                            <div className="relative bg-[#0a0a0a] rounded-2xl p-6 h-full flex flex-col items-center text-center">
                                {/* Rank Badge */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    {index === 0 && <Crown size={32} className="text-yellow-400 fill-yellow-400 animate-bounce" />}
                                    {index === 1 && <Medal size={24} className="text-gray-300 fill-gray-300/20" />}
                                    {index === 2 && <Medal size={24} className="text-orange-600 fill-orange-600/20" />}
                                </div>

                                {/* Avatar */}
                                <div className={`w-16 h-16 rounded-full mb-4 border-2 flex items-center justify-center font-bold text-xl
                                     ${index === 0 ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/10 bg-white/5 text-gray-400'}
                                `}>
                                    {duelist.username.charAt(0).toUpperCase()}
                                </div>

                                <h3 className={`font-display font-bold text-lg mb-1 ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                    {duelist.username}
                                </h3>

                                <div className="text-3xl font-black font-mono text-white mb-2">
                                    {duelist.score.toLocaleString()}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-500">Points de Duel</div>

                                {index === 0 && (
                                    <div className="absolute top-4 right-4 text-orange-500 animate-pulse">
                                        <Flame size={16} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TopDuelists;
