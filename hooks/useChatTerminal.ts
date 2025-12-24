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
            { text: "👁️ SYNCHRONISATION NEURALE EN COURS...", delay: 5000 },
            { text: "Respirez. Laissez le code couler.", delay: 5000 },
            { text: "Le Terminal est votre esprit. Le code est votre voix.", delay: 5000 },
            { text: "✨ BIENVENUE DANS L'OTAGRID v3.0 (Cyber-Enhanced)", delay: 5000 },
            { text: "Ici, l'IA n'est pas un outil, c'est une extension.", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "🎮 COMMANDES DE DUEL", delay: 5000 },
            { text: "🔹 /duel [sujet] - Créer un défi et obtenir un code", delay: 5000 },
            { text: "🔹 /solo [sujet] - S'entraîner en mode solo", delay: 5000 },
            { text: "🔹 /join [code] - Rejoindre un défi existant", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "🏆 COMMANDES SOCIALES", delay: 5000 },
            { text: "🔹 /leaderboard - Voir le top 10 des joueurs", delay: 5000 },
            { text: "🔹 /stats - Vos statistiques personnelles", delay: 5000 },
            { text: "🔹 /share [code] - Partager sur WhatsApp", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "🎲 COMMANDES FUN", delay: 5000 },
            { text: "🔹 /fortune - Citation otaku inspirante", delay: 5000 },
            { text: "🔹 /8ball [question] - Boule magique 8", delay: 5000 },
            { text: "🔹 /flip - Pile ou face", delay: 5000 },
            { text: "🔹 /roll [XdY] - Lancer de dés (ex: 2d6)", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "💬 CHAT IA", delay: 5000 },
            { text: "🔹 Posez n'importe quelle question à l'IA", delay: 5000 },
            { text: "🔹 Discutez de manga, anime, tech...", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "⚙️ COMMANDES SYSTÈME", delay: 5000 },
            { text: "🔹 /help - Voir toutes les commandes", delay: 5000 },
            { text: "🔹 /clear - Nettoyer l'historique", delay: 5000 },
            { text: "🔹 /matrix - Activer/désactiver le mode Matrix", delay: 5000 },
            { text: "🔹 /guide - Revoir ce tutoriel", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "🎯 EXEMPLE D'UTILISATION", delay: 5000 },
            { text: "1️⃣ Tapez: /duel Naruto", delay: 5000 },
            { text: "2️⃣ Jouez au quiz pour définir le score", delay: 5000 },
            { text: "3️⃣ Partagez le code avec vos amis", delay: 5000 },
            { text: "4️⃣ Ils tapent: /join #CODE pour vous défier", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "💡 NOUVEAUTÉ : Les défis sont maintenant persistants !", delay: 5000 },
            { text: "Les codes survivent au refresh de la page. 🎉", delay: 5000 },
            { text: "", delay: 2000 },
            { text: "L'immersion est totale. Vous êtes prêt. 🦾", delay: 5000 }
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

            // Fun commands
            if (command === '/fortune') {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🔮 FORTUNE OTAKU DU JOUR\n\nGénération d'une citation inspirante...`,
                    isTyping: true
                }]);

                try {
                    const prompt = "Génère une citation inspirante et motivante d'un personnage d'anime ou manga célèbre. La citation doit être courte (max 2 phrases), profonde et motivante. Format: \"Citation\" - Nom du personnage (Anime). Exemple: \"Si tu abandonnes maintenant, tu ne sauras jamais ce qui aurait pu arriver.\" - Monkey D. Luffy (One Piece)";

                    const stream = streamChatResponse([], prompt);
                    let fullQuote = "";

                    for await (const chunk of stream) {
                        fullQuote += chunk;
                    }

                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: `🔮 FORTUNE OTAKU DU JOUR\n\n${fullQuote}\n\n✨ Sagesse d'anime générée par IA`
                        }];
                    });
                } catch (error) {
                    console.error('Fortune error:', error);
                    // Fallback to static quotes if AI fails
                    const fallbackFortunes = [
                        "Si tu abandonnes maintenant, tu ne sauras jamais ce qui aurait pu arriver. - Monkey D. Luffy (One Piece)",
                        "Les gens deviennent plus forts parce qu'ils ont des choses qu'ils ne peuvent pas oublier. - Naruto Uzumaki (Naruto)",
                        "Crois en toi. Pas en toi qui croit en moi. Crois en toi qui croit en toi. - Kamina (Gurren Lagann)",
                        "Peu importe combien de fois tu tombes, relève-toi et continue d'avancer. - All Might (My Hero Academia)",
                        "La vraie victoire, c'est de ne jamais abandonner ses rêves. - Roronoa Zoro (One Piece)"
                    ];
                    const randomFortune = fallbackFortunes[Math.floor(Math.random() * fallbackFortunes.length)];
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: `🔮 FORTUNE OTAKU DU JOUR\n\n"${randomFortune}"\n\n✨ Sagesse d'anime`
                        }];
                    });
                }
                return true;
            }

            if (command.startsWith('/8ball')) {
                const question = command.replace('/8ball', '').trim();
                if (!question) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Posez une question !\n\nExemple: /8ball Est-ce que je vais réussir ?'
                    }]);
                    return true;
                }

                const answers = [
                    "C'est certain.", "Sans aucun doute.", "Oui, définitivement.",
                    "Vous pouvez compter dessus.", "Comme je le vois, oui.",
                    "Les signes pointent vers oui.", "Très probable.", "Bonne perspective.",
                    "Oui.", "Les signes disent oui.",
                    "Réponse floue, réessayez.", "Redemandez plus tard.",
                    "Mieux vaut ne pas vous le dire maintenant.", "Impossible de prédire maintenant.",
                    "Concentrez-vous et redemandez.",
                    "N'y comptez pas.", "Ma réponse est non.",
                    "Mes sources disent non.", "Les perspectives ne sont pas bonnes.",
                    "Très douteux."
                ];
                const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🎱 BOULE MAGIQUE 8\n\n❓ "${question}"\n\n💬 ${randomAnswer}`
                }]);
                return true;
            }

            if (command === '/flip') {
                const result = Math.random() > 0.5;
                const coin = result ? '🪙 PILE' : '🪙 FACE';
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🎲 PILE OU FACE\n\n${coin}\n\n${result ? '✨ Vous avez gagné !' : '💫 Réessayez !'}`
                }]);
                return true;
            }

            if (command.startsWith('/roll')) {
                const diceStr = command.replace('/roll', '').trim();
                if (!diceStr) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Format invalide !\n\nExemples:\n> /roll 2d6 (2 dés à 6 faces)\n> /roll 1d20 (1 dé à 20 faces)\n> /roll 3d10 (3 dés à 10 faces)'
                    }]);
                    return true;
                }

                const match = diceStr.match(/^(\d+)d(\d+)$/i);
                if (!match) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Format invalide ! Utilisez: XdY\n\nExemple: /roll 2d6'
                    }]);
                    return true;
                }

                const numDice = parseInt(match[1]);
                const numSides = parseInt(match[2]);

                if (numDice > 20 || numDice < 1) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Nombre de dés invalide (1-20)'
                    }]);
                    return true;
                }

                if (numSides > 100 || numSides < 2) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Nombre de faces invalide (2-100)'
                    }]);
                    return true;
                }

                const rolls = [];
                let total = 0;
                for (let i = 0; i < numDice; i++) {
                    const roll = Math.floor(Math.random() * numSides) + 1;
                    rolls.push(roll);
                    total += roll;
                }

                const rollsText = rolls.map((r, i) => `Dé ${i + 1}: ${r}`).join('\n');
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🎲 LANCER DE DÉS (${numDice}d${numSides})\n\n${rollsText}\n\n🎯 Total: ${total}`
                }]);
                return true;
            }

            if (command.startsWith('/leaderboard') || command === '/top') {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `🏆 LEADERBOARD - TOP 10\n\nChargement des meilleurs scores...`,
                    isTyping: true
                }]);

                try {
                    const { data, error } = await supabase
                        .from('quiz_scores')
                        .select('username, score')
                        .order('score', { ascending: false })
                        .limit(10);

                    if (error) throw error;

                    let leaderboardText = '🏆 LEADERBOARD - TOP 10\n\n';
                    if (data && data.length > 0) {
                        data.forEach((player, index) => {
                            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                            leaderboardText += `${medal} ${player.username} - ${player.score} pts\n`;
                        });
                    } else {
                        leaderboardText += 'Aucun score enregistré.\n\nSoyez le premier ! Tapez /duel [sujet]';
                    }

                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: leaderboardText
                        }];
                    });
                } catch (error) {
                    console.error('Leaderboard error:', error);
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: '❌ Erreur lors du chargement du leaderboard.'
                        }];
                    });
                }
                return true;
            }

            if (command === '/stats') {
                if (!user) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Vous devez être connecté pour voir vos stats.'
                    }]);
                    return true;
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `📊 VOS STATISTIQUES\n\nChargement...`,
                    isTyping: true
                }]);

                try {
                    const { data: scoreData } = await supabase
                        .from('quiz_scores')
                        .select('score')
                        .eq('user_id', user.id)
                        .single();

                    const { data: challengesData } = await supabase
                        .from('duel_challenges')
                        .select('id')
                        .eq('creator_id', user.id);

                    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Joueur';
                    const score = scoreData?.score || 0;
                    const challengesCreated = challengesData?.length || 0;

                    const statsText = `📊 STATISTIQUES DE ${username.toUpperCase()}\n\n🎮 Meilleur Score: ${score} pts\n🎯 Défis Créés: ${challengesCreated}\n📈 Niveau: ${score > 500 ? 'Expert' : score > 300 ? 'Avancé' : score > 100 ? 'Intermédiaire' : 'Débutant'}\n\n💡 Continuez à jouer pour améliorer vos stats !`;

                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: statsText
                        }];
                    });
                } catch (error) {
                    console.error('Stats error:', error);
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTyping);
                        return [...filtered, {
                            id: Date.now().toString(),
                            role: 'model',
                            text: '❌ Erreur lors du chargement des stats.'
                        }];
                    });
                }
                return true;
            }

            if (command.startsWith('/share')) {
                const code = command.replace('/share', '').trim();
                if (!code) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: '❌ Spécifiez un code de défi !\n\nExemple: /share #NAR-1234-5678'
                    }]);
                    return true;
                }

                const message = `🎮 Défi OtaBlog!\n\nJe te défie sur un quiz !\n\nCode: ${code}\n\nRejoins sur https://gravity-ota.vercel.app et tape /join ${code}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `📤 PARTAGE WHATSAPP\n\nCode: ${code}\n\n✅ Lien généré !\n\nCliquez ici pour partager:\n${whatsappUrl}\n\n💡 Le lien s'ouvrira dans WhatsApp`
                }]);

                // Open WhatsApp in new tab
                if (typeof window !== 'undefined') {
                    window.open(whatsappUrl, '_blank');
                }
                return true;
            }

            switch (command) {
                case '/clear': clearHistory(); return true;
                case '/matrix': setIsMatrixMode(prev => !prev);
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: !isMatrixMode ? '🟢 Mode Matrix activé.' : '🔴 Mode Matrix désactivé.' }]); return true;
                case '/help': setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `📖 COMMANDES DISPONIBLES\n\n🎮 DUELS & QUIZ\n> /duel [sujet] - Créer un défi\n> /solo [sujet] - S'entraîner\n> /join [code] - Rejoindre un défi\n\n🏆 SOCIAL\n> /leaderboard - Top 10 joueurs\n> /stats - Vos statistiques\n> /share [code] - Partager WhatsApp\n\n🎲 FUN\n> /fortune - Citation otaku\n> /8ball [question] - Boule magique\n> /flip - Pile ou face\n> /roll [XdY] - Lancer de dés\n\n💬 CHAT IA\n> Tapez sans / pour discuter\n\n⚙️ SYSTÈME\n> /help - Cette aide\n> /guide - Tutoriel animé\n> /clear - Nettoyer\n> /matrix - Mode Matrix\n> /system - Stats système\n\n💡 Tapez /guide pour le tutoriel complet !` }]); return true;
                case '/system': setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `⚡ STATS SYSTÈME\n\n🟢 Status: ONLINE\n🤖 IA: Gemini Flash 2.0\n💾 Base: Supabase\n🎮 Défis: Persistants\n📊 Version: OtaBot v3.0\n\nTout fonctionne parfaitement ! ✨` }]); return true;
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
