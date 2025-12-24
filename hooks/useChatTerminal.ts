import { useState, useCallback, useEffect } from 'react';
import { streamChatResponse, generateQuizQuestions } from '../services/llamaService';
import { ChatMessage } from '../types';

interface UseChatTerminalProps {
    initialMessage?: string;
    user: any;
    lastGameResult?: { score: number, topic: string } | null;
}

// Module-level mock database to persist challenges across re-renders
const CHALLENGE_DB = new Map<string, any>();
let globalActiveChallengeCode: string | null = null;

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
    const [isHypnosisActive, setIsHypnosisActive] = useState(false);

    const triggerHypnosis = useCallback(async () => {
        setIsHypnosisActive(true);
        const script = [
            { text: "👁️ SYNCHRONISATION NEURALE EN COURS...", delay: 1000 },
            { text: "Respirez. Laissez le code couler.", delay: 1500 },
            { text: "Le Terminal est votre esprit. Le code est votre voix.", delay: 2000 },
            { text: "✨ BIENVENUE DANS L'OTAGRID v3.0", delay: 1000 },
            { text: "Ici, l'IA n'est pas un outil, c'est une extension.", delay: 1500 },
            { text: "🔹 TAPEZ `/duel` POUR DÉFIER LA RÉALITÉ.", delay: 800 },
            { text: "🔹 TAPEZ `/matrix` POUR VOIR AU-DELÀ.", delay: 800 },
            { text: "🔹 TAPEZ `/help` POUR TOUT CONTRÔLER.", delay: 1500 },
            { text: "L'immersion est totale. Vous êtes prêt. 🦾", delay: 2000 }
        ];

        setMessages([]);

        for (const step of script) {
            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                role: 'model',
                text: step.text
            }]);
            await new Promise(resolve => setTimeout(resolve, step.delay));
        }

        setIsHypnosisActive(false);
    }, []);

    // Handle Game Result Feedback
    useEffect(() => {
        if (lastGameResult) {
            const challenge = globalActiveChallengeCode ? CHALLENGE_DB.get(globalActiveChallengeCode) : null;
            let feedbackText = '';

            if (challenge) {
                if (challenge.creator === user?.username) {
                    challenge.targetScore = lastGameResult.score;
                    feedbackText = `🎯 MISSION ACCOMPLIE.\nScore enregistré : ${lastGameResult.score}.\n\n CODE DÉFI CONFIRMÉ : ${globalActiveChallengeCode}\n Partagez ce code pour défier d'autres membres !`;
                } else {
                    const diff = lastGameResult.score - (challenge.targetScore || 0);
                    if (diff > 0) {
                        feedbackText = `🏆 VICTOIRE !\nVous avez battu ${challenge.creator} de ${diff} points !\nVotre Score : ${lastGameResult.score} vs ${challenge.targetScore}`;
                    } else {
                        feedbackText = `💀 ÉCHEC.\n${challenge.creator} conserve son titre.\nVotre Score : ${lastGameResult.score} vs ${challenge.targetScore}`;
                    }
                }
            } else {
                feedbackText = `📣 SESSION TERMINÉE.\nScore final : ${lastGameResult.score} pts.\nEntraînement complet.`;
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: feedbackText
            }]);

            globalActiveChallengeCode = null;
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
            targetScore: 0
        });
        globalActiveChallengeCode = code;
        return code;
    };

    const processCommand = useCallback(async (cmd: string): Promise<boolean> => {
        try {
            const command = cmd.toLowerCase().trim();

            if (command.startsWith('/join')) {
                const code = command.replace('/join', '').trim();
                if (!code || code.length < 3) {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Erreur: Format de code invalide.` }]);
                    return true;
                }
                const challenge = CHALLENGE_DB.get(code);

                if (!challenge) {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Erreur 404: Le code de défi ${code} est introuvable.` }]);
                    return true;
                }

                globalActiveChallengeCode = code;
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Défi trouvé : "${challenge.topic}" par ${challenge.creator}. \n🏆 Score à battre : ${challenge.targetScore || 'Non défini'}\nChargement...`,
                    isTyping: true
                }]);

                await new Promise(resolve => setTimeout(resolve, 800));

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

            if (command.startsWith('/solo') || command.startsWith('/train')) {
                const topic = command.replace('/solo', '').replace('/train', '').trim();
                if (!topic) {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Veuillez spécifier un sujet. Exemple: /solo One Piece' }]);
                    return true;
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Configuration du module d'entraînement "${topic}"...`,
                    isTyping: true
                }]);

                const questions = await generateQuizQuestions(topic, 5);
                const finalQuestions = questions.length >= 3 ? questions : [
                    { id: 's1', category: topic, question: `Entraînement sur ${topic} : Question 1?`, options: ["R1", "R2", "R3", "R4"], correctAnswer: 0, points: 100 }
                ];

                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isTyping);
                    return [...filtered, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: `Module d'entraînement prêt.`,
                        data: { type: 'duel_invite', payload: finalQuestions }
                    }];
                });
                return true;
            }

            if (command.startsWith('/duel')) {
                const topic = command.replace('/duel', '').trim();
                if (!topic) {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Veuillez spécifier un sujet. Exemple: /duel Dragon Ball' }]);
                    return true;
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Analyse du sujet "${topic}"... Génération du protocole de duel...`,
                    isTyping: true
                }]);

                const aiQuestions = await generateQuizQuestions(topic, 5);
                const finalQuestions = aiQuestions.length >= 3 ? aiQuestions : [
                    { id: 'd1', category: topic, question: `Duel sur ${topic} ?`, options: ["A", "B", "C", "D"], correctAnswer: 0, points: 100 }
                ];

                const code = createChallenge(topic, finalQuestions);

                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isTyping);
                    return [...filtered, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: `Duel généré avec succès pour le sujet : ${topic}.\nCODE DÉFI: ${code}`,
                        data: { type: 'duel_invite', payload: finalQuestions, code }
                    }];
                });
                return true;
            }

            if (command === '/guide' || command === '/tuto') {
                triggerHypnosis();
                return true;
            }

            switch (command) {
                case '/clear': clearHistory(); return true;
                case '/matrix': setIsMatrixMode(prev => !prev);
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: !isMatrixMode ? 'Matrice activée.' : 'Matrice désactivée.' }]); return true;
                case '/help': setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `COMMANDES:\n> /duel [sujet]\n> /solo [sujet]\n> /join [code]\n> /guide\n> /clear\n> /matrix\n> /help` }]); return true;
                case '/system': setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `STATS SYSTÈME: [ONLINE]` }]); return true;
                default: return false;
            }
        } catch (err) {
            console.error("Command Error:", err);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `⚠ ERREUR CRITIQUE.` }]);
            return true;
        }
    }, [clearHistory, isMatrixMode, user, triggerHypnosis]);

    const sendMessage = async (input: string) => {
        if (!input.trim() || isLoading || !user) return;

        if (input.startsWith('/')) {
            const isCommand = await processCommand(input);
            if (isCommand) return;
        }

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const botMsgId = (Date.now() + 1).toString();
        const botMsg: ChatMessage = { id: botMsgId, role: 'model', text: '', isTyping: true };
        setMessages(prev => [...prev, botMsg]);

        try {
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            const stream = streamChatResponse(history, input);
            let fullResponse = "";

            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => prev.map(msg =>
                    msg.id === botMsgId ? { ...msg, text: fullResponse, isTyping: true } : msg
                ));
            }

            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId ? { ...msg, isTyping: false } : msg
            ));
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId ? { ...msg, text: "Erreur de connexion.", isTyping: false } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, sendMessage, isLoading, isMatrixMode, isHypnosisActive, triggerHypnosis, clearHistory };
};
