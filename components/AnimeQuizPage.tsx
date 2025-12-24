import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Brain, Target, Award, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuizQuestion from './QuizQuestion';
import QuizLeaderboard from './QuizLeaderboard';
import DailyChallenges from './DailyChallenges';
import TiltCard from './TiltCard';
import { QuizQuestion as QuizQuestionType, QuizScore } from '../types';
import { FeedbackOverseer, useFeedback } from './FeedbackOverseer';
import ComboMeter from './ComboMeter';

// Hardcoded sample questions
const SAMPLE_QUESTIONS: QuizQuestionType[] = [
    {
        id: '1',
        category: 'shonen',
        question: "Dans Naruto, quel est le nom du démon scellé à l'intérieur de Gaara ?",
        options: ["Kurama", "Shukaku", "Gyuki", "Matatabi"],
        correctAnswer: 1, // Shukaku
        points: 100
    },
    {
        id: '2',
        category: 'general',
        question: "Quel studio d'animation a produit 'L'Attaque des Titans' (Saisons 1-3) ?",
        options: ["MAPPA", "Madhouse", "Wit Studio", "Bones"],
        correctAnswer: 2, // Wit Studio
        points: 100
    },
    {
        id: '3',
        category: 'isekai',
        question: "Dans 'Re:Zero', quel est le pouvoir de Subaru ?",
        options: ["Imagine Breaker", "Geass", "Vector Manipulation", "Return by Death"],
        correctAnswer: 3, // Return by Death
        points: 150
    },
    {
        id: '4',
        category: 'shonen',
        question: "Qui est le capitaine de la 10ème division dans Bleach ?",
        options: ["Byakuya Kuchiki", "Kenpachi Zaraki", "Toshiro Hitsugaya", "Gin Ichimaru"],
        correctAnswer: 2, // Toshiro Hitsugaya
        points: 120
    },
    {
        id: '5',
        category: 'seinen',
        question: "Quel est le vrai nom de 'L' dans Death Note ?",
        options: ["Light Yagami", "L Lawliet", "Nate River", "Mihael Keehl"],
        correctAnswer: 1, // L Lawliet
        points: 200
    }
];

const SAMPLE_SCORES: QuizScore[] = [
    { userId: '1', username: 'OtakuKing99', score: 2850, rank: 1, avatarUrl: '' },
    { userId: '2', username: 'Mikasa_Lover', score: 2400, rank: 2, avatarUrl: '' },
    { userId: '3', username: 'GokuSolos', score: 2150, rank: 3, avatarUrl: '' },
];

const AnimeQuizPageContent: React.FC<{ initialQuestions?: QuizQuestionType[], onGameComplete?: (score: number) => void }> = ({ initialQuestions, onGameComplete }) => {
    const { user } = useAuth();
    const { triggerFeedback } = useFeedback();
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [questions, setQuestions] = useState<QuizQuestionType[]>(SAMPLE_QUESTIONS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

    // Effect to start game immediately if custom questions are provided
    useEffect(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions);
            setGameState('playing');
        }
    }, [initialQuestions]);

    const handleClose = () => {
        if (onGameComplete) {
            onGameComplete(score);
        } else {
            setGameState('menu');
            // Reset game
            setCurrentQuestionIndex(0);
            setScore(0);
            setStreak(0);
        }
    }

    const handleStartGame = () => {
        setGameState('playing');
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0);
    };

    const handleAnswer = (index: number, timeRemaining: number) => {
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = index === currentQ.correctAnswer;

        // Calculate Score
        if (isCorrect) {
            triggerFeedback('success');
            const timeBonus = Math.floor(timeRemaining * 10);
            const streakBonus = streak * 20;
            setScore(prev => prev + currentQ.points + timeBonus + streakBonus);
            setStreak(prev => prev + 1);
        } else {
            triggerFeedback('error');
            setStreak(0);
        }

        // Delay to show result then move next
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setGameState('gameover');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-24 px-6 relative overflow-hidden flex flex-col items-center">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,37,133,0.15),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(76,201,240,0.15),transparent_40%)]" />

            <ComboMeter combo={streak} />

            <div className="max-w-6xl w-full mx-auto relative z-10">

                <AnimatePresence mode='wait'>
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neonPurple/10 border border-neonPurple/30 text-neonPurple mb-4">
                                <Brain size={20} />
                                <span className="font-mono uppercase tracking-widest text-sm">Zone de Test</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 neon-text-glow">
                                ANIME <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">QUIZ</span> BATTLE
                            </h1>

                            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                                Prouvez votre connaissance de l'univers Otaku. Grimpez dans le classement et débloquez des badges légendaires.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-16 perspective-1000">
                                <TiltCard
                                    className="bg-midnight/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md h-full"
                                    onClick={() => { }}
                                    glowColor="#F72585"
                                >
                                    <div className="w-16 h-16 bg-neonPink/20 rounded-full flex items-center justify-center mx-auto mb-6 text-neonPink ring-1 ring-neonPink/50 shadow-[0_0_20px_rgba(247,37,133,0.3)]">
                                        <Zap size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Mode Blitz</h3>
                                    <p className="text-gray-300">Répondez le plus vite possible. Chaque seconde compte !</p>
                                    <div className="mt-4 text-xs font-mono text-neonPink border border-neonPink/30 rounded px-2 py-1 inline-block">
                                        BONUS XP x2
                                    </div>
                                </TiltCard>

                                <TiltCard
                                    className="bg-midnight/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md h-full"
                                    onClick={() => { }}
                                    glowColor="#7209B7"
                                >
                                    <div className="w-16 h-16 bg-neonPurple/20 rounded-full flex items-center justify-center mx-auto mb-6 text-neonPurple ring-1 ring-neonPurple/50 shadow-[0_0_20px_rgba(114,9,183,0.3)]">
                                        <Trophy size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Ranking</h3>
                                    <p className="text-gray-300">Affrontez les meilleurs otakus et grimpez les échelons.</p>
                                    <div className="mt-4 text-xs font-mono text-neonPurple border border-neonPurple/30 rounded px-2 py-1 inline-block">
                                        SAISON 1
                                    </div>
                                </TiltCard>

                                <TiltCard
                                    className="bg-midnight/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md h-full"
                                    onClick={() => { }}
                                    glowColor="#4CC9F0"
                                >
                                    <div className="w-16 h-16 bg-cyanLight/20 rounded-full flex items-center justify-center mx-auto mb-6 text-cyanLight ring-1 ring-cyanLight/50 shadow-[0_0_20px_rgba(76,201,240,0.3)]">
                                        <Award size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Badges</h3>
                                    <p className="text-gray-300">Débloquez des titres exclusifs pour votre profil.</p>
                                    <div className="mt-4 text-xs font-mono text-cyanLight border border-cyanLight/30 rounded px-2 py-1 inline-block">
                                        12 DISPONIBLES
                                    </div>
                                </TiltCard>
                            </div>

                            <div className="max-w-4xl mx-auto mb-16">
                                <DailyChallenges />
                            </div>

                            <button
                                onClick={handleStartGame}
                                className="group relative px-10 py-5 bg-white text-black font-display font-black text-xl tracking-wide rounded-sm overflow-hidden transition-transform hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    LANCER LE DÉFI <Play className="w-6 h-6 fill-current" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-neonPink to-neonPurple opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    LANCER LE DÉFI <Play className="w-6 h-6 fill-current" />
                                </span>
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full"
                        >
                            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                                <div>
                                    <span className="text-gray-400 text-sm uppercase tracking-widest">Question</span>
                                    <div className="text-3xl font-black text-white">
                                        {currentQuestionIndex + 1} <span className="text-lg text-gray-500 font-normal">/ {questions.length}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-400 text-sm uppercase tracking-widest">Score</span>
                                    <div className="text-3xl font-black text-neonPink animate-pulse">
                                        {score}
                                    </div>
                                </div>
                            </div>

                            <QuizQuestion
                                question={questions[currentQuestionIndex]}
                                onAnswer={handleAnswer}
                            />
                        </motion.div>
                    )}

                    {gameState === 'gameover' && (
                        <motion.div
                            key="gameover"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <QuizLeaderboard
                                score={score}
                                scores={SAMPLE_SCORES}
                                totalQuestions={questions.length}
                                onPlayAgain={() => {
                                    setGameState('menu');
                                    setCurrentQuestionIndex(0);
                                    setScore(0);
                                    setStreak(0);
                                }}
                                onShare={handleClose}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Wrap content to use useFeedback hook safely (though it's wrapped in App, it's safer for testing individual component)
const AnimeQuizPage: React.FC<{ initialQuestions?: QuizQuestionType[] }> = (props) => (
    <AnimeQuizPageContent {...props} />
);

export default AnimeQuizPage;
