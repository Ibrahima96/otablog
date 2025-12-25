import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Terminal, Trophy, MessageSquare, ArrowRight, ArrowLeft, Sparkles, Zap } from 'lucide-react';

interface NeuralGuideProps {
    onClose: () => void;
}

const STEPS = [
    {
        title: "BIENVENUE, OTAKUROSH",
        description: "Vous venez d'entrer dans la zone neurale d'OtaBlog. Laissez-moi vous guider à travers les protocoles de ce hub futuriste.",
        icon: <Sparkles className="w-12 h-12 text-neonPink" />,
        color: "from-neonPink/20 to-transparent",
        glow: "shadow-[0_0_30px_rgba(247,37,133,0.3)]"
    },
    {
        title: "LE TERMINAL NEURAL",
        description: "En bas de l'écran, le terminal est votre arme principale. Tapez des commandes comme /duel ou /matrix pour interagir avec l'IA.",
        icon: <Terminal className="w-12 h-12 text-cyanLight" />,
        color: "from-cyanLight/20 to-transparent",
        glow: "shadow-[0_0_30px_rgba(76,201,240,0.3)]"
    },
    {
        title: "QUIZ BATTLE IA",
        description: "Affrontez notre IA dans des duels épiques. L'IA génère des questions uniques basées sur vos thèmes préférés. Grimpez au classement mondial !",
        icon: <Brain className="w-12 h-12 text-neonPurple" />,
        color: "from-neonPurple/20 to-transparent",
        glow: "shadow-[0_0_30px_rgba(114,9,183,0.3)]"
    },
    {
        title: "PROGRESSION RPG",
        description: "Gagnez de l'XP à chaque duel. Montez de niveau (Genin → Hokage), débloquez des titres et dominez le Leaderboard OtaBlog.",
        icon: <Trophy className="w-12 h-12 text-neonPink" />,
        color: "from-neonPink/20 to-transparent",
        glow: "shadow-[0_0_30px_rgba(247,37,133,0.3)]"
    },
    {
        title: "COMMUNAUTÉ AURA",
        description: "Explorez la galerie, partagez vos créations et discutez avec d'autres passionnés. Chaque interaction augmente votre Aura.",
        icon: <MessageSquare className="w-12 h-12 text-yellow-400" />,
        color: "from-yellow-400/20 to-transparent",
        glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]"
    }
];

const NeuralGuide: React.FC<NeuralGuideProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-midnight/90 border border-white/10 rounded-2xl p-8 overflow-hidden shadow-2xl"
            >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${STEPS[currentStep].color} opacity-50 transition-colors duration-500`} />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        key={currentStep}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`mb-8 p-6 bg-white/5 rounded-full ring-1 ring-white/10 ${STEPS[currentStep].glow} transition-shadow duration-500`}
                    >
                        {STEPS[currentStep].icon}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-3xl font-display font-black text-white mb-4 tracking-tight uppercase italic underline decoration-neonPink decoration-4 underline-offset-8">
                                {STEPS[currentStep].title}
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                {STEPS[currentStep].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress Dots */}
                    <div className="flex gap-2 mb-8">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-neonPink' : 'w-2 bg-white/20'}`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between w-full mt-auto">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase transition-all ${currentStep === 0 ? 'opacity-0' : 'text-gray-400 hover:text-white'}`}
                        >
                            <ArrowLeft size={16} /> Retour
                        </button>

                        <button
                            onClick={nextStep}
                            className="group relative flex items-center gap-2 px-8 py-3 bg-white text-black font-display font-black text-sm tracking-widest rounded-sm overflow-hidden transition-all hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {currentStep === STEPS.length - 1 ? "C'EST PARTI !" : "SUIVANT"} <ArrowRight size={18} />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-neonPink to-neonPurple opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {currentStep === STEPS.length - 1 ? "C'EST PARTI !" : "SUIVANT"} <Zap size={18} />
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NeuralGuide;
