import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Lock, Trophy, Zap, Target, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDailyChallenges, completeChallenge, DailyChallenge } from '../services/dailyChallengesService';
import { toast } from 'sonner';

const iconMap: Record<string, React.ReactNode> = {
    star: <Star size={20} className="text-yellow-400" />,
    trophy: <Trophy size={20} className="text-neonPink" />,
    zap: <Zap size={20} className="text-electricBlue" />,
    target: <Target size={20} className="text-green-400" />,
    heart: <Heart size={20} className="text-red-400" />,
};

const DailyChallenges: React.FC = () => {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadChallenges();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadChallenges = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getDailyChallenges(user.id);
            setChallenges(data);
        } catch (error) {
            console.error('Error loading challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (challenge: DailyChallenge) => {
        if (!user || challenge.completed) return;

        setClaiming(challenge.id);
        try {
            const result = await completeChallenge(user.id, challenge.id);
            if (result.success) {
                toast.success(`🎉 +${result.xpEarned} XP gagnés!`);
                setChallenges(prev =>
                    prev.map(c =>
                        c.id === challenge.id
                            ? { ...c, completed: true }
                            : c
                    )
                );
            } else {
                toast.error('Erreur lors de la réclamation');
            }
        } catch (error) {
            toast.error('Erreur lors de la réclamation');
        } finally {
            setClaiming(null);
        }
    };

    if (!user) {
        return (
            <div className="bg-midnight/30 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="text-yellow-400 fill-current" /> Défis Du Jour
                </h3>
                <p className="text-gray-400 text-sm">Connectez-vous pour voir vos défis quotidiens</p>
            </div>
        );
    }

    return (
        <div className="bg-midnight/30 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" /> Défis Du Jour
            </h3>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-neonPink animate-spin" />
                </div>
            ) : challenges.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                    Aucun défi disponible aujourd'hui
                </p>
            ) : (
                <div className="space-y-4">
                    {challenges.map((challenge, index) => (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center p-3 rounded-lg border transition-all ${challenge.completed
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : challenge.difficulty === 3
                                        ? 'bg-neonPink/5 border-neonPink/20 hover:border-neonPink/40'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="mr-3 p-2 rounded-full bg-black/20">
                                {challenge.completed
                                    ? <CheckCircle size={16} className="text-green-400" />
                                    : iconMap[challenge.icon] || iconMap.star
                                }
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${challenge.completed ? 'text-green-400 line-through' : 'text-white'
                                    }`}>
                                    {challenge.title}
                                </h4>
                                <p className="text-xs text-gray-400">{challenge.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs font-mono font-bold text-cyanLight bg-cyanLight/10 px-2 py-1 rounded">
                                    +{challenge.reward_xp} XP
                                </div>
                                {!challenge.completed && (
                                    <button
                                        onClick={() => handleClaimReward(challenge)}
                                        disabled={claiming === challenge.id}
                                        className="px-3 py-1 bg-neonPink/20 hover:bg-neonPink/40 text-neonPink text-xs font-bold rounded border border-neonPink/30 transition-all disabled:opacity-50"
                                    >
                                        {claiming === challenge.id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            'Réclamer'
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    Reset dans 24h
                </p>
            </div>
        </div>
    );
};

export default DailyChallenges;
