import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, AlertCircle, Package } from 'lucide-react';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface GachaProps {
    userAura: number;
    onSummonComplete: (newAura: number) => void;
}

const RARITY_COLORS = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
};

const RARITY_LABELS = {
    common: 'COMMUN',
    rare: 'RARE',
    epic: 'ÉPIQUE',
    legendary: 'LÉGENDAIRE',
};

const GachaSystem: React.FC<GachaProps> = ({ userAura, onSummonComplete }) => {
    const { user } = useAuth();
    const [isSummoning, setIsSummoning] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const SUMMON_COST = 100;

    const handleSummon = async () => {
        if (!user) return;
        if (userAura < SUMMON_COST) {
            toast.error('Pas assez d\'Aura !');
            return;
        }

        setIsSummoning(true);
        setResult(null);

        try {
            // Fake delay for suspense
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await gamificationService.summonItem(user.id, SUMMON_COST);

            if (response.success) {
                setResult(response);
                onSummonComplete(response.remaining_aura);
                if (response.outcome === 'duplicate') {
                    toast('Doublon converti en XP !', { icon: '⬆️' });
                }
            } else {
                toast.error(response.message || 'Erreur lors de l\'invocation');
            }
        } catch (error) {
            toast.error('Erreur technique');
        } finally {
            setIsSummoning(false);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto bg-midnight/80 border border-white/10 rounded-2xl overflow-hidden p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(247,37,133,0.1),transparent_70%)] pointer-events-none" />

            <AnimatePresence mode="wait">
                {/* IDLE STATE */}
                {!isSummoning && !result && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="relative w-40 h-40"
                        >
                            <div className="absolute inset-0 bg-neonPink/20 blur-3xl rounded-full" />
                            <Package size={160} className="text-neonPink relative z-10" strokeWidth={1} />
                        </motion.div>

                        <div>
                            <h2 className="text-3xl font-display font-bold text-white mb-2">INVOCATION MYSTÈRE</h2>
                            <p className="text-gray-400 mb-2">Tentez votre chance pour gagner des badges et items rares !</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-midnight/50 border border-white/10 rounded-full">
                                <span className="text-sm text-gray-400">Votre Solde :</span>
                                <span className={`font-mono font-bold ${userAura >= SUMMON_COST ? 'text-neonPink' : 'text-red-400'}`}>
                                    {userAura} Aura
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSummon}
                            disabled={userAura < SUMMON_COST}
                            className={`group relative px-8 py-4 rounded-xl font-bold font-mono tracking-widest text-lg transition-all ${userAura >= SUMMON_COST
                                ? 'bg-gradient-to-r from-neonPink to-neonPurple text-white hover:scale-105 shadow-[0_0_30px_rgba(247,37,133,0.4)]'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Sparkles size={20} className={userAura >= SUMMON_COST ? 'animate-pulse' : ''} />
                                INVOQUER
                            </span>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                                Coût: {SUMMON_COST} Aura
                            </div>
                        </button>
                    </motion.div>
                )}

                {/* SUMMONING STATE */}
                {isSummoning && (
                    <motion.div
                        key="summoning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="absolute inset-0 border-4 border-dashed border-neonPink/50 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute inset-4 border-4 border-dashed border-cyanLight/50 rounded-full"
                            />
                            <div className="text-neonPink font-display font-bold text-2xl animate-pulse">
                                GACHA...
                            </div>
                        </div>
                        <p className="mt-8 text-white font-mono animate-pulse">Matérialisation en cours...</p>
                    </motion.div>
                )}

                {/* RESULT STATE */}
                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className={`relative w-48 h-48 rounded-2xl bg-gradient-to-br ${RARITY_COLORS[result.badge.rarity as keyof typeof RARITY_COLORS]} p-1 mb-8 shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center justify-center`}>
                            <div className="bg-black/40 w-full h-full rounded-xl flex items-center justify-center text-7xl">
                                {result.badge.icon}
                            </div>
                            <div className="absolute -top-4 bg-white text-black font-black px-4 py-1 rounded-full text-sm uppercase tracking-widest shadow-lg">
                                {RARITY_LABELS[result.badge.rarity as keyof typeof RARITY_LABELS] || result.badge.rarity}
                            </div>
                        </div>

                        <h3 className="text-4xl font-display font-black text-white mb-2">{result.badge.name}</h3>
                        <p className="text-gray-300 mb-8 max-w-md">{result.badge.description}</p>

                        {result.outcome === 'duplicate' && (
                            <div className="mb-6 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>Déjà possédé ! +50 XP</span>
                            </div>
                        )}

                        <button
                            onClick={() => setResult(null)}
                            className="text-white hover:text-neonPink transition-colors underline underline-offset-4"
                        >
                            Mise à zéro / Nouvelle invocation
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GachaSystem;
