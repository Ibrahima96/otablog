import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Brain, Target, Award, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuizQuestion from './QuizQuestion';
import QuizLeaderboard from './QuizLeaderboard';
import DailyChallenges from './DailyChallenges';
import TiltCard from './TiltCard';
import { QuizQuestion as QuizQuestionType, QuizScore } from '../types';
import { useFeedback } from './FeedbackOverseer';
import ComboMeter from './ComboMeter';
import { generateQuizQuestions } from '../services/llamaService';

// Fallback questions if AI fails
const SAMPLE_QUESTIONS: QuizQuestionType[] = [
    {
        id: '1',
        category: 'shonen',
        question: "Dans Naruto, quel est le nom du démon scellé à l'intérieur de Gaara ?",
        options: ["Kurama", "Shukaku", "Gyuki", "Matatabi"],
        correctAnswer: 1,
        points: 100
    },
    {
        id: '2',
        category: 'general',
        question: "Quel studio d'animation a produit 'L'Attaque des Titans' (Saisons 1-3) ?",
        options: ["MAPPA", "Madhouse", "Wit Studio", "Bones"],
        correctAnswer: 2,
        points: 100
    },
    {
        id: '3',
        category: 'isekai',
        question: "Dans 'Re:Zero', quel est le pouvoir de Subaru ?",
        options: ["Imagine Breaker", "Geass", "Vector Manipulation", "Return by Death"],
        correctAnswer: 3,
        points: 150
    }
];

const QUESTIONS_POOL: QuizQuestionType[] = [
    ...SAMPLE_QUESTIONS,
    { id: '6', category: 'shonen', question: "Dans Naruto, quel est le nom du démon à 9 queues ?", options: ["Kurama", "Shukaku", "Gyuki", "Matatabi"], correctAnswer: 0, points: 100 },
    { id: '7', category: 'seinen', question: "Quel est l'auteur de Berserk ?", options: ["Kentaro Miura", "Hirohiko Araki", "Takehiko Inoue", "Junji Ito"], correctAnswer: 0, points: 200 },
    { id: '8', category: 'shonen', question: "Quel fruit du démon Luffy a-t-il mangé ?", options: ["Mera Mera", "Gomu Gomu", "Hito Hito", "Yami Yami"], correctAnswer: 1, points: 100 },
    { id: '9', category: 'classique', question: "En quelle année est sorti Akira ?", options: ["1984", "1988", "1991", "1995"], correctAnswer: 1, points: 150 },
];

const getRandomQuestions = (count: number) => {
    return [...QUESTIONS_POOL].sort(() => 0.5 - Math.random()).slice(0, count);
};

const SAMPLE_SCORES: QuizScore[] = [
    { userId: '1', username: 'OtakuKing99', score: 2850, rank: 1, avatarUrl: '' },
    { userId: '2', username: 'Mikasa_Lover', score: 2400, rank: 2, avatarUrl: '' },
    { userId: '3', username: 'GokuSolos', score: 2150, rank: 3, avatarUrl: '' },
];

const AnimeQuizPageContent: React.FC<{ initialQuestions?: QuizQuestionType[], onGameComplete?: (score: number) => void }> = ({ initialQuestions, onGameComplete }) => {
    const { user } = useAuth();
    const { triggerFeedback } = useFeedback();
    const [gameState, setGameState] = useState<'menu' | 'loading' | 'playing' | 'gameover'>('menu');
    const [questions, setQuestions] = useState<QuizQuestionType[]>(SAMPLE_QUESTIONS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions);
            setGameState('playing');
        }
    }, [initialQuestions]);

    const isDuel = !!initialQuestions && initialQuestions.length > 0;
    const questionTimer = isDuel ? 5 : 15;

    const handleClose = () => {
        if (onGameComplete) {
            onGameComplete(score);
        } else {
            setGameState('menu');
            setCurrentQuestionIndex(0);
            setScore(0);
            setStreak(0);
        }
    }

    const handleStartGame = async () => {
        try {
            setGameState('loading');
            const topics = ["Shonen", "Seinen", "Studios Animation", "Ghibli", "Nouveautés 2024"];
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];

            const aiQuestions = await generateQuizQuestions(randomTopic, 5);

            if (aiQuestions && aiQuestions.length >= 3) {
                const mapped = aiQuestions.map((q: any) => ({
                    ...q,
                    id: q.id || Math.random().toString(36).substr(2, 9),
                    points: q.points || 100
                }));
                setQuestions(mapped);
            } else {
                setQuestions(getRandomQuestions(5));
            }

            setGameState('playing');
            setCurrentQuestionIndex(0);
            setScore(0);
            setStreak(0);
        } catch (error) {
            console.error("Quiz Start Error:", error);
            setQuestions(getRandomQuestions(5));
            setGameState('playing');
        }
    };

    const handleAnswer = (index: number, timeRemaining: number) => {
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = index === currentQ.correctAnswer;

        if (isCorrect) {
            triggerFeedback('success');
            const timeBonus = Math.floor(timeRemaining * 10);
            const streakBonus = streak * 20;
            setScore(prev => prev + (currentQ.points || 100) + timeBonus + streakBonus);
            setStreak(prev => prev + 1);
        } else {
            triggerFeedback('error');
            setStreak(0);
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setGameState('gameover');
            }
        }, 1200);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden flex flex-col items-center">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,37,133,0.1),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(76,201,240,0.1),transparent_40%)]" />

            <div className="max-w-7xl w-full mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neonPurple/10 border border-neonPurple/30 text-neonPurple mb-8">
                                <Brain size={20} />
                                <span className="font-mono uppercase tracking-widest text-sm">Zone de Test Neural</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter drop-shadow-glow">
                                ANIME <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">QUIZ</span> BATTLE
                            </h1>

                            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                                L'IA génère des questions uniques basées sur votre passion. Prouvez votre savoir Otaku.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-16 perspective-1000">
                                <TiltCard className="bg-midnight/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md" glowColor="#F72585">
                                    <Zap className="mx-auto mb-6 text-neonPink" size={40} />
                                    <h3 className="text-2xl font-bold text-white mb-2">IA Dynamique</h3>
                                    <p className="text-gray-400">Questions générées en temps réel par notre noyau intelligent.</p>
                                </TiltCard>
                                <TiltCard className="bg-midnight/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md" glowColor="#7209B7">
                                    <Trophy className="mx-auto mb-6 text-neonPurple" size={40} />
                                    <h3 className="text-2xl font-bold text-white mb-2">Multiplayer</h3>
                                    <p className="text-gray-400">Utilisez <code className="text-neonPurple">/duel</code> dans le terminal pour inviter un rival.</p>
                                </TiltCard>
                                <TiltCard className="bg-midnight/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md" glowColor="#4CC9F0">
                                    <Award className="mx-auto mb-6 text-cyanLight" size={40} />
                                    <h3 className="text-2xl font-bold text-white mb-2">Récompenses</h3>
                                    <p className="text-gray-400">Gagnez de l'XP et débloquez des titres cyberpunk exclusifs.</p>
                                </TiltCard>
                            </div>

                            <div className="max-w-4xl mx-auto mb-12">
                                <DailyChallenges />
                            </div>

                            <button
                                onClick={handleStartGame}
                                className="group relative px-12 py-6 bg-white text-black font-display font-black text-2xl tracking-wide rounded-sm overflow-hidden transition-transform hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    LANCER LE DÉFI <Play className="w-8 h-8 fill-current" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-neonPink to-neonPurple opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    GÉNÉRER LE QUIZ <Brain className="w-8 h-8 fill-current" />
                                </span>
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="relative mb-8">
                                <Brain className="w-24 h-24 text-neonPink animate-pulse" />
                                <motion.div
                                    className="absolute inset-0 border-4 border-neonPurple rounded-full"
                                    animate={{ scale: [1, 1.2, 1], rotate: 360, opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2 neon-text-glow">INITIALISATION NEURALE</h2>
                            <p className="text-gray-400 font-mono tracking-widest uppercase">L'IA parcourt les archives du multivers...</p>
                            <div className="mt-12 w-80 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-neonPink via-neonPurple to-cyanLight"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full max-w-4xl mx-auto"
                        >
                            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                                <div>
                                    <span className="text-gray-400 text-sm uppercase tracking-widest font-mono">Sequence</span>
                                    <div className="text-4xl font-black text-white">
                                        {currentQuestionIndex + 1} <span className="text-xl text-gray-600 font-normal">/ {questions.length}</span>
                                    </div>
                                </div>
                                <ComboMeter combo={streak} />
                                <div className="text-right">
                                    <span className="text-gray-400 text-sm uppercase tracking-widest font-mono">Neural Points</span>
                                    <div className="text-4xl font-black text-neonPink glow-text">
                                        {score}
                                    </div>
                                </div>
                            </div>

                            <QuizQuestion
                                question={questions[currentQuestionIndex]}
                                onAnswer={handleAnswer}
                                totalTime={questionTimer}
                            />
                        </motion.div>
                    )}

                    {gameState === 'gameover' && (
                        <motion.div
                            key="gameover"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-5xl mx-auto"
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

const AnimeQuizPage: React.FC<{ initialQuestions?: QuizQuestionType[], onGameComplete?: (score: number) => void }> = (props) => (
    <AnimeQuizPageContent {...props} />
);

export default AnimeQuizPage;
