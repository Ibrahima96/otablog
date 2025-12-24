import { useState, useCallback, useEffect } from 'react';
import { streamChatResponse } from '../services/llamaService';
import { ChatMessage } from '../types';

interface UseChatTerminalProps {
    initialMessage?: string;
    user: any; // Using any for simplicity as AuthContext user type might be complex to import directly here without circular deps
    lastGameResult?: { score: number, topic: string } | null;
}

// Module-level mock database to persist challenges across re-renders
const CHALLENGE_DB = new Map<string, any>();
let activeChallengeCode: string | null = null; // Track current active challenge for this session

// Helper to generate a random code
const generateCode = (topic: string) => {
    const prefix = topic.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000);
    return `#${prefix}-${random}`;
};

export const useChatTerminal = ({ initialMessage, user, lastGameResult }: UseChatTerminalProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: initialMessage || 'Système initialisé. OtaBot v2.5 en ligne.' }
    ]);
    const [isMatrixMode, setIsMatrixMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle Game Result Feedback - Only trigger when result changes and is not null
    useEffect(() => {
        if (lastGameResult) {
            // Check if we were in a challenge
            if (activeChallengeCode) {
                // Update challenge score if we are the creator (simplified logic: if it's a new challenge we just made)
                // Or if we joined a challenge, compare scores.

                const challenge = CHALLENGE_DB.get(activeChallengeCode);
                let feedbackText = '';

                if (challenge) {
                    if (challenge.creator === user?.username) {
                        // We created it, so let's set the target score
                        challenge.targetScore = lastGameResult.score;
                        feedbackText = `🎯 MISSION ACCOMPLIE.\nScore enregistré : ${lastGameResult.score}.\n\n CODE DÉFI CONFIRMÉ : ${activeChallengeCode}\n Partagez ce code pour défier d'autres membres !`;
                    } else {
                        // We are a challenger
                        const diff = lastGameResult.score - (challenge.targetScore || 0);
                        if (diff > 0) {
                            feedbackText = `🏆 VICTOIRE !\nVous avez battu ${challenge.creator} de ${diff} points !\nVotre Score : ${lastGameResult.score} vs ${challenge.targetScore}`;
                        } else {
                            feedbackText = `💀 ÉCHEC.\n${challenge.creator} conserve son titre.\nVotre Score : ${lastGameResult.score} vs ${challenge.targetScore}`;
                        }
                    }
                } else {
                    // Solo/Training or lost context
                    feedbackText = `📣 SESSION TERMINÉE.\nScore final : ${lastGameResult.score} pts.\nEntraînement complet.`;
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: feedbackText
                }]);

                activeChallengeCode = null; // Reset
            } else {
                // Generic result (e.g. from /solo)
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `📣 SESSION TERMINÉE.\nScore final : ${lastGameResult.score} pts.`
                }]);
            }
        }
    }, [lastGameResult, user]);

    const clearHistory = useCallback(() => {
        setMessages([{ id: Date.now().toString(), role: 'model', text: 'Terminal nettoyé. Prêt.' }]);
    }, []);

    const createChallenge = (topic: string, questions: any[]) => {
        const code = generateCode(topic);
        CHALLENGE_DB.set(code, {
            topic,
            questions,
            creator: user?.username || 'Unknown',
            createdAt: new Date(),
            targetScore: 0 // Will be updated after game
        });
        activeChallengeCode = code; // Set active code so we know to update it upon return
        return code;
    };

    const processCommand = useCallback(async (cmd: string) => {
        const command = cmd.toLowerCase().trim();

        // JOIN COMMAND
        if (command.startsWith('/join')) {
            const code = command.replace('/join', '').trim();
            const challenge = CHALLENGE_DB.get(code);

            if (!challenge) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Erreur 404: Le code de défi ${code} est introuvable ou a expiré.`
                }]);
                return true;
            }

            activeChallengeCode = code; // Mark as active so we can compare scores later

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: `Défi trouvé : "${challenge.topic}" par ${challenge.creator}. \n🏆 Score à battre : ${challenge.targetScore || 'Non défini'}\nChargement du protocole...`,
                isTyping: true
            }]);

            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessages(prev => {
                const filtered = prev.filter(m => !m.isTyping);
                return [...filtered, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Prêt à relever le défi ${code} ?`,
                    data: { type: 'duel_invite', payload: challenge.questions, isChallenge: true, code }
                }];
            });
            return true;
        }

        // SOLO / TRAINING COMMAND
        if (command.startsWith('/solo') || command.startsWith('/train')) {
            const topic = command.replace('/solo', '').replace('/train', '').trim();
            if (!topic) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: 'Veuillez spécifier un sujet d\'entraînement. Exemple: /solo One Piece'
                }]);
                return true;
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: `Configuration du module d'entraînement "${topic}"...`,
                isTyping: true
            }]);

            // Reuse duel generation logic
            await new Promise(resolve => setTimeout(resolve, 1500));

            // ... (We would reuse the same question generation logic here, for brevity let's assume we call a helper or copy logic. 
            // For this snippet I'll duplicate the questions temporarily or refactor if I had more space, 
            // but effectively it's the same mock data)

            // Generate generic questions for solo too
            const questions = [
                {
                    id: `s1-${Date.now()}`,
                    category: topic,
                    question: `Entraînement sur ${topic} : Question facile ?`,
                    options: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
                    correctAnswer: 0,
                    points: 50
                },
                {
                    id: `s2-${Date.now()}`,
                    category: topic,
                    question: `Entraînement sur ${topic} : Question moyenne ?`,
                    options: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
                    correctAnswer: 1,
                    points: 100
                },
                {
                    id: `s3-${Date.now()}`,
                    category: topic,
                    question: `Entraînement sur ${topic} : Question difficile ?`,
                    options: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
                    correctAnswer: 2,
                    points: 200
                }
            ];

            setMessages(prev => {
                const filtered = prev.filter(m => !m.isTyping);
                return [...filtered, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Module d'entraînement prêt.`,
                    data: { type: 'duel_invite', payload: questions } // Re-using duel_invite type for now as UI handles it
                }];
            });
            return true;
        }

        // DUEL COMMAND
        if (command.startsWith('/duel')) {
            const topic = command.replace('/duel', '').trim();
            if (!topic) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: 'Veuillez spécifier un sujet. Exemple: /duel Dragon Ball'
                }]);
                return true;
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: `Analyse du sujet "${topic}"... Génération du protocole de duel...`,
                isTyping: true
            }]);

            // Simulate AI generation delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            let questions;

            // DEMO: Specific mock data for "Histoire/Culture" request
            if (topic.toLowerCase().includes('hist') || topic.toLowerCase().includes('cult') || topic.toLowerCase().includes('citation')) {
                questions = [
                    {
                        id: 'h1',
                        category: 'Histoire Otaku',
                        question: "Quel terme a été utilisé pour la première fois par Nakamori Akio en 1983 pour définir cette sous-culture ?",
                        options: ["Weeb", "Otaku", "Akiba-kei", "Hikikomori"],
                        correctAnswer: 1,
                        points: 150
                    },
                    {
                        id: 'h2',
                        category: 'Citations',
                        question: "Dans quel film de 1988 entend-on l'échange légendaire : 'KANEDA !!!' - 'TETSUO !!!' ?",
                        options: ["Ghost in the Shell", "Neon Genesis Evangelion", "Akira", "Cowboy Bebop"],
                        correctAnswer: 2,
                        points: 100
                    },
                    {
                        id: 'h3',
                        category: 'Culture',
                        question: "Quel quartier de Tokyo est historiquement considéré comme le 'Quartier Electrique' et berceau de cette culture ?",
                        options: ["Shibuya", "Shinjuku", "Harajuku", "Akihabara"],
                        correctAnswer: 3,
                        points: 100
                    },
                    {
                        id: 'h4',
                        category: 'Légende',
                        question: "Surnommé le 'Dieu du Manga', il a créé Astro Boy et révolutionné l'industrie :",
                        options: ["Hayao Miyazaki", "Akira Toriyama", "Osamu Tezuka", "Eiichiro Oda"],
                        correctAnswer: 2,
                        points: 200
                    },
                    {
                        id: 'h5',
                        category: 'Meme/Citation',
                        question: "\"Les gens meurent si on les tue.\" Cette tautologie célèbre vient de quel anime ?",
                        options: ["Bleach", "Fate/Stay Night", "Naruto", "Death Note"],
                        correctAnswer: 1,
                        points: 150
                    }
                ];
            } else {
                // Mock generated questions for generic topics
                questions = [
                    {
                        id: `d1-${Date.now()}`,
                        category: topic,
                        question: `Question générée sur ${topic} (1/5) : Quel est l'élément principal ?`,
                        options: ["Feu", "Eau", "Vent", "Terre"],
                        correctAnswer: 0,
                        points: 100
                    },
                    {
                        id: `d2-${Date.now()}`,
                        category: topic,
                        question: `Question générée sur ${topic} (2/5) : Qui est le protagoniste ?`,
                        options: ["Héros A", "Héros B", "Méchant C", "Support D"],
                        correctAnswer: 0,
                        points: 100
                    },
                    {
                        id: `d3-${Date.now()}`,
                        category: topic,
                        question: `Question générée sur ${topic} (3/5) : En quelle année est-ce sorti ?`,
                        options: ["1990", "2000", "2010", "2020"],
                        correctAnswer: 1,
                        points: 100
                    },
                    {
                        id: `d4-${Date.now()}`,
                        category: topic,
                        question: `Question générée sur ${topic} (4/5) : Quelle est la technique secrète ?`,
                        options: ["Punch", "Kick", "Beam", "Slash"],
                        correctAnswer: 2,
                        points: 150
                    },
                    {
                        id: `d5-${Date.now()}`,
                        category: topic,
                        question: `Question générée sur ${topic} (5/5) : Qui est le boss final ?`,
                        options: ["Boss X", "Boss Y", "Boss Z", "Boss Omega"],
                        correctAnswer: 3,
                        points: 200
                    }
                ];
            }

            // REGISTER CHALLENGE
            const code = createChallenge(topic, questions);

            setMessages(prev => {
                const filtered = prev.filter(m => !m.isTyping);
                return [...filtered, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Duel généré avec succès pour le sujet : ${topic}.\nCODE DÉFI: ${code}`,
                    data: { type: 'duel_invite', payload: questions, code }
                }];
            });

            return true;
        }

        switch (command) {
            case '/clear':
                clearHistory();
                return true;
            case '/matrix':
                setIsMatrixMode(prev => !prev);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: isMatrixMode ? 'Matrice désactivée.' : 'Wake up, Neo... Matrice activée.'
                }]);
                return true;
            case '/help':
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `COMMANDES DISPONIBLES:
> /duel [sujet] : Générer un nouveau quiz
> /solo [sujet] : Entraînement solo
> /join [code]  : Rejoindre un défi existant
> /clear        : Effacer l'historique
> /matrix       : Activer/Désactiver l'effet Matrix
> /system       : Afficher les statistiques système
> /help         : Afficher ce menu`
                }]); return true;
            case '/system':
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `STATS SYSTÈME:
------------------
CPU: NEURAL_ENGINE [ONLINE]
MEM: 128TB SALT HASH
NET: GIGA_FIBER CONNECTED
LOC: NEO_TOKYO_SERVER_03
------------------`
                }]);
                return true;
            default:
                return false;
        }
    }, [clearHistory, isMatrixMode, user]);

    const sendMessage = async (input: string) => {
        if (!input.trim() || isLoading || !user) return;

        // Check for commands
        if (input.startsWith('/')) {
            const isCommand = processCommand(input);
            if (isCommand) return;
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const botMsgId = (Date.now() + 1).toString();
        const botMsg: ChatMessage = {
            id: botMsgId,
            role: 'model',
            text: '',
            isTyping: true
        };

        setMessages(prev => [...prev, botMsg]);

        try {
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            const stream = streamChatResponse(history, input);

            let fullResponse = "";

            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => prev.map(msg =>
                    msg.id === botMsgId
                        ? { ...msg, text: fullResponse, isTyping: true }
                        : msg
                ));
            }

            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                    ? { ...msg, isTyping: false }
                    : msg
            ));
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                    ? { ...msg, text: "Erreur de connexion au serveur neural. Réessayez.", isTyping: false }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        sendMessage,
        isLoading,
        isMatrixMode,
        clearHistory
    };
};
