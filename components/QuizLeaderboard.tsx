import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, User, Star, Crown, Share2 } from 'lucide-react';
import { QuizScore } from '../types';

interface QuizLeaderboardProps {
    scores?: QuizScore[];
    onPlayAgain: () => void;
    score: number;
    totalQuestions?: number;
    onShare?: () => void;
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return <Crown className="text-yellow-400 fill-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <span className="font-mono text-gray-500 font-bold">#{rank}</span>;
};

const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ scores = [], onPlayAgain, score, totalQuestions, onShare }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const [xpProgress, setXpProgress] = useState(0);

    useEffect(() => {
        if (score !== undefined) {
            // Animate score count up
            let start = 0;
            const end = score;
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);

                setDisplayScore(Math.floor(start + (end - start) * easeOutQuart));
                setXpProgress(easeOutQuart * 100); // Simulate filling bar

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }
    }, [score]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            {score !== undefined && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center relative"
                >
                    <div className="absolute inset-0 bg-neonPink/20 blur-[100px] rounded-full pointer-events-none" />

                    <h2 className="text-6xl font-display font-black text-white mb-2 tracking-tighter">
                        CONGRATULATIONS
                    </h2>

                    {onShare && (
                        <div className="absolute top-0 right-0">
                            <button
                                onClick={onShare}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition-all text-white border border-white/5"
                            >
                                <Share2 size={16} /> Retour
                            </button>
                        </div>
                    )}

                    <div className="relative inline-block py-8">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            {displayScore}
                        </motion.div>
                        <div className="text-neonPink font-mono tracking-[0.5em] text-sm uppercase mt-2">Points Totaux</div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="max-w-md mx-auto mt-8">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono uppercase">
                            <span>Niveau 12</span>
                            <span>{Math.floor(xpProgress)}% vers Niveau 13</span>
                        </div>
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-neonPurple to-neonPink"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="bg-midnight/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Trophy size={200} className="text-white transform rotate-12 translate-x-10 -translate-y-10" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <Trophy className="text-yellow-400" /> LEADERBOARD MONDIAL
                </h3>

                <div className="space-y-4 relative z-10">
                    {scores.map((score, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className={`flex items-center p-4 rounded-xl border transition-all hover:scale-[1.02]
                                ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50' :
                                    index === 1 ? 'bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/30' :
                                        index === 2 ? 'bg-gradient-to-r from-orange-700/10 to-transparent border-orange-700/30' :
                                            'bg-white/5 border-white/5 hover:bg-white/10'
                                }
                            `}
                        >
                            <div className="w-12 flex justify-center">
                                <RankBadge rank={index + 1} />
                            </div>

                            <div className="w-12 h-12 rounded-full bg-white/10 mx-4 overflow-hidden border border-white/20 relative group">
                                {score.avatarUrl ? (
                                    <img src={score.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                                        <User size={20} className="text-white/50" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-white text-lg flex items-center gap-2">
                                    {score.username}
                                    {index === 0 && <Crown size={14} className="text-yellow-400" />}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">Rang: Otaku Elite</div>
                            </div>

                            <div className="font-black text-2xl text-white tracking-tight">
                                {score.score.toLocaleString()} <span className="text-xs text-gray-500 font-normal">PTS</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 flex gap-4 justify-center">
                    <button
                        onClick={onPlayAgain}
                        className="px-8 py-4 bg-white text-black font-black tracking-widest rounded-sm hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        REJOUER
                    </button>
                    <button className="px-8 py-4 border border-white/20 text-white font-bold tracking-widest rounded-sm hover:bg-white/10 transition-all flex items-center gap-2">
                        <Share2 size={18} /> PARTAGER
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizLeaderboard;
