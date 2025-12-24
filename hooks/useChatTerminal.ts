import { useState, useCallback, useEffect } from 'react';
import { streamChatResponse, generateQuizQuestions } from '../services/llamaService';
import { ChatMessage } from '../types';
import { supabase } from '../services/supabaseClient';

interface UseChatTerminalProps {
    initialMessage?: string;
    user: any;
    lastGameResult?: { score: number, topic: string } | null;
}

// Helper to generate a unique challenge code
const generateCode = (topic: string) => {
    const prefix = topic.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000);
    const timestamp = Date.now().toString().slice(-4);
    return `#${prefix}-${random}-${timestamp}`;
};

// Create a challenge in Supabase
const createChallengeInDB = async (code: string, topic: string, questions: any[], userId: string, username: string) => {
    try {
        const { data, error } = await supabase
            .from('duel_challenges')
            .insert({
                code,
                topic,
                creator_id: userId,
                creator_username: username,
                questions,
                target_score: 0,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating challenge:', error);
        return null;
    }
};

// Get a challenge from Supabase
const getChallengeFromDB = async (code: string) => {
    try {
        const { data, error } = await supabase
            .from('duel_challenges')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching challenge:', error);
        return null;
    }
};

// Update challenge score
const updateChallengeScore = async (code: string, score: number) => {
    try {
        const { error } = await supabase
            .from('duel_challenges')
            .update({ target_score: score })
            .eq('code', code);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating challenge score:', error);
        return false;
    }
};

export const useChatTerminal = ({ initialMessage, user, lastGameResult }: UseChatTerminalProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: initialMessage || 'Système initialisé. OtaBot v2.5 en ligne.' }
    ]);
    const [isMatrixMode, setIsMatrixMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isHypnosisActive, setIsHypnosisActive] = useState(false);
    const [activeChallengeCode, setActiveChallengeCode] = useState<string | null>(null);

    const triggerHypnosis = useCallback(async () => {
        setIsHypnosisActive(true);
        const script = [
            { text: "👁️ SYNCHRONISATION NEURALE EN COURS...", delay: 1000 },
            { text: "Respirez. Laissez le code couler.", delay: 1500 },
            { text: "Le Terminal est votre esprit. Le code est votre voix.", delay: 2000 },
            { text: "✨ BIENVENUE DANS L'OTAGRID v3.0 (Cyber-Enhanced)", delay: 1000 },
            { text: "Ici, l'IA n'est pas un outil, c'est une extension.", delay: 1500 },
            { text: "", delay: 500 },
            { text: "🎮 COMMANDES DE DUEL", delay: 800 },
            { text: "🔹 /duel [sujet] - Créer un défi et obtenir un code", delay: 800 },
            { text: "🔹 /solo [sujet] - S'entraîner en mode solo", delay: 800 },
            { text: "🔹 /join [code] - Rejoindre un défi existant", delay: 800 },
            { text: "", delay: 500 },
            { text: "💬 COMMANDES SOCIALES", delay: 800 },
            { text: "🔹 Posez n'importe quelle question à l'IA", delay: 800 },
            { text: "🔹 Discutez de manga, anime, tech...", delay: 800 },
            { text: "", delay: 500 },
            { text: "⚙️ COMMANDES SYSTÈME", delay: 800 },
            { text: "🔹 /help - Voir toutes les commandes", delay: 800 },
            { text: "🔹 /clear - Nettoyer l'historique", delay: 800 },
            { text: "🔹 /matrix - Activer/désactiver le mode Matrix", delay: 800 },
            { text: "🔹 /guide - Revoir ce tutoriel", delay: 800 },
            { text: "", delay: 500 },
            { text: "🎯 EXEMPLE D'UTILISATION", delay: 1000 },
            { text: "1️⃣ Tapez: /duel Naruto", delay: 1000 },
            { text: "2️⃣ Jouez au quiz pour définir le score", delay: 1000 },
            { text: "3️⃣ Partagez le code avec vos amis", delay: 1000 },
            { text: "4️⃣ Ils tapent: /join #CODE pour vous défier", delay: 1000 },
            { text: "", delay: 500 },
            { text: "💡 NOUVEAUTÉ : Les défis sont maintenant persistants !", delay: 1500 },
            { text: "Les codes survivent au refresh de la page. 🎉", delay: 1500 },
            { text: "", delay: 500 },
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
        const handleGameResult = async () => {
            if (!lastGameResult) return;

            let feedbackText = '';

            if (activeChallengeCode) {
                const challenge = await getChallengeFromDB(activeChallengeCode);

                if (challenge) {
                    if (challenge.creator_username === user?.username) {
                        // Creator finished - update target score
                        await updateChallengeScore(activeChallengeCode, lastGameResult.score);
                        feedbackText = `🎯 MISSION ACCOMPLIE.\nScore enregistré : ${lastGameResult.score}.\n\n📋 CODE DÉFI CONFIRMÉ : ${activeChallengeCode}\n\n💬 Partagez ce code pour défier d'autres membres !`;
                    } else {
                        // Challenger finished
                        const diff = lastGameResult.score - (challenge.target_score || 0);
                        if (diff > 0) {
                            feedbackText = `🏆 VICTOIRE !\nVous avez battu ${challenge.creator_username} de ${diff} points !\n\nVotre Score : ${lastGameResult.score} vs ${challenge.target_score}`;
                        } else {
                            feedbackText = `💀 ÉCHEC.\n${challenge.creator_username} conserve son titre.\n\nVotre Score : ${lastGameResult.score} vs ${challenge.target_score}`;
                        }
                    }
                }
            } else {
                feedbackText = `📣 SESSION TERMINÉE.\nScore final : ${lastGameResult.score} pts.\n\n✨ Entraînement complet.`;
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: feedbackText
            }]);

            setActiveChallengeCode(null);
        };

        handleGameResult();
    }, [lastGameResult, user, activeChallengeCode]);

    const clearHistory = useCallback(() => {
        setMessages([{ id: Date.now().toString(), role: 'model', text: 'Terminal nettoyé. Prêt.' }]);
    }, []);

    const processCommand = useCallback(async (cmd: string): Promise<boolean> => {
        try {
            const command = cmd.toLowerCase().trim();

            if (command.startsWith('/join')) {
                const code = command.replace('/join', '').trim();
                if (!code || code.length < 5) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: `❌ Erreur: Format de code invalide.\n\nUtilisation: /join #CODE-1234-5678`
                    }]);
                    return true;
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🔍 Recherche du défi ${code}...`,
                    isTyping: true
                }]);

                const challenge = await getChallengeFromDB(code);

                if (!challenge) {
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: `❌ Erreur 404: Le code de défi ${code} est introuvable.\n\nVérifiez le code et réessayez.`
                        }];
                    });
                    return true;
                }

                setActiveChallengeCode(code);

                await new Promise(resolve => setTimeout(resolve, 500));

                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isTyping);
                    return [...filtered, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: `✅ Défi trouvé !\n\n📚 Sujet: "${challenge.topic}"\n👤 Créateur: ${challenge.creator_username}\n🏆 Score à battre: ${challenge.target_score || 'Non défini'}\n\n⚔️ Prêt à relever le défi ?`,
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
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Veuillez spécifier un sujet.\n\nExemple: /duel Dragon Ball'
                    }]);
                    return true;
                }

                if (!user) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Vous devez être connecté pour créer un défi.'
                    }]);
                    return true;
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🤖 Analyse du sujet "${topic}"...\n⚙️ Génération du protocole de duel...`,
                    isTyping: true
                }]);

                const aiQuestions = await generateQuizQuestions(topic, 5);
                const finalQuestions = aiQuestions.length >= 3 ? aiQuestions : [
                    { id: 'd1', category: topic, question: `Duel sur ${topic} ?`, options: ["A", "B", "C", "D"], correctAnswer: 0, points: 100 }
                ];

                const code = generateCode(topic);
                const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Joueur';

                const challenge = await createChallengeInDB(code, topic, finalQuestions, user.id, username);

                if (!challenge) {
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: '❌ Erreur lors de la création du défi. Réessayez.'
                        }];
                    });
                    return true;
                }

                setActiveChallengeCode(code);

                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isTyping);
                    return [...filtered, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: `✅ Duel généré avec succès !\n\n📚 Sujet: ${topic}\n📋 CODE DÉFI: ${code}\n\n💡 Jouez d'abord pour définir le score à battre !`,
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
