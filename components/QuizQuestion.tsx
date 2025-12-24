import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, AlertTriangle } from 'lucide-react';
import { QuizQuestion as QuizQuestionType } from '../types';

interface QuizQuestionProps {
    question: QuizQuestionType;
    onAnswer: (index: number, timeRemaining: number) => void;
    totalTime?: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onAnswer, totalTime = 15 }) => {
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    if (selectedOption === null) {
                        onAnswer(-1, 0); // Time out
                    }
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [selectedOption, onAnswer]);

    const handleSelect = (index: number) => {
        if (selectedOption !== null) return; // Prevent multiple clicks
        setSelectedOption(index);
        onAnswer(index, timeLeft);
    };

    const timeProgress = (timeLeft / totalTime) * 100;
    const isCritical = timeLeft < 5;
    const progressColor = isCritical ? 'bg-red-500' : 'bg-neonPink';

    return (
        <div className="w-full max-w-4xl mx-auto relative perspective-1000">
            {/* Cinematic Timer Bar */}
            <div className="relative w-full h-4 bg-white/5 rounded-full mb-12 overflow-hidden border border-white/10">
                <motion.div
                    className={`h-full ${progressColor} shadow-[0_0_20px_rgba(247,37,133,0.6)] relative overflow-hidden`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${timeProgress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                >
                    {isCritical && (
                        <motion.div
                            animate={{ x: [-100, 100] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="absolute inset-0 bg-white/30 skew-x-12 w-10"
                        />
                    )}
                </motion.div>

                {/* Critical Warning Pulse */}
                <AnimatePresence>
                    {isCritical && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 flex items-center gap-2 font-bold tracking-widest uppercase"
                        >
                            <AlertTriangle size={16} /> Danger <AlertTriangle size={16} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex justify-between items-center mb-6 px-2">
                <div className={`flex items-center gap-3 font-mono text-2xl font-black ${isCritical ? 'text-red-500 animate-pulse' : 'text-neonPink'}`}>
                    <Clock size={28} className={isCritical ? 'animate-bounce' : ''} />
                    <span>{Math.ceil(timeLeft)}s</span>
                </div>
                <div className="px-6 py-2 rounded-full bg-white/5 text-sm font-bold text-cyanLight border border-cyanLight/30 uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(76,201,240,0.2)]">
                    {question.category}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                className="bg-midnight/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-10 relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-neonPink to-neonPurple" />
                <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-tight drop-shadow-lg">
                    {question.question}
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {question.options.map((option, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelect(index)}
                        disabled={selectedOption !== null}
                        whileHover={selectedOption === null ? { scale: 1.02, x: 5 } : {}}
                        whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group
                ${selectedOption === index
                                ? 'bg-neonPurple/20 border-neonPurple text-white shadow-[0_0_30px_rgba(114,9,183,0.5)] scale-105 z-10'
                                : selectedOption !== null
                                    ? 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-neonPink/50 hover:text-white hover:shadow-[0_0_20px_rgba(247,37,133,0.2)]'
                            }
            `}
                    >
                        <span className="relative z-10 flex items-center justify-between">
                            <span className="font-bold text-xl">{option}</span>
                            {selectedOption === index && <Zap className="text-neonPurple animate-bounce" size={24} />}
                        </span>
                        {selectedOption !== index && (
                            <div className="absolute inset-0 bg-gradient-to-r from-neonPurple/0 to-neonPink/0 group-hover:from-neonPurple/10 group-hover:to-neonPink/10 transition-opacity duration-300" />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default QuizQuestion;
