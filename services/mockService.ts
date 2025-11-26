// Service de simulation pour OtaBot (Fallback quand les API ne fonctionnent pas)

const MOCK_RESPONSES = [
    "Je suis OtaBot, votre assistant virtuel. Mes circuits neuronaux sont en mode simulation pour le moment.",
    "C'est une question intéressante ! Dans un futur cyberpunk, la réponse serait probablement 42.",
    "Je détecte une anomalie dans le flux de données. Mais je peux toujours discuter d'animes !",
    "Sugoi ! Vous avez l'air d'un expert en la matière.",
    "Mes capteurs indiquent que nous sommes en ligne, mais sans connexion au cloud central.",
    "Voulez-vous parler de Ghost in the Shell ou de Akira ?",
    "Désolé, je n'ai pas accès à ma base de connaissances complète (API hors ligne).",
    "Konnichiwa ! Je suis prêt à vous aider avec les fonctionnalités locales."
];

export const streamChatResponse = async function* (
    history: { role: 'user' | 'model'; text: string }[],
    userMessage: string
): AsyncGenerator<string, void, unknown> {

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let responseText = "";

    // Simple keyword matching for better illusion
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello')) {
        responseText = "Konnichiwa user-san ! OtaBot à votre service.";
    } else if (lowerMsg.includes('qui es-tu') || lowerMsg.includes('t\'es qui')) {
        responseText = "Je suis OtaBot, une IA de classe S conçue pour OtaBlog. Actuellement en mode maintenance.";
    } else if (lowerMsg.includes('anime') || lowerMsg.includes('manga')) {
        responseText = "Ah, un connaisseur ! J'adore tout ce qui touche à la culture otaku.";
    } else {
        // Random response
        responseText = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    }

    // Stream the response character by character
    const chunkSize = 5;
    for (let i = 0; i < responseText.length; i += chunkSize) {
        const chunk = responseText.slice(i, i + chunkSize);
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, 30)); // Typing effect
    }
};
