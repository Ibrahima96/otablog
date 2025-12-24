import OpenAI from 'openai';

const llama = new OpenAI({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
    dangerouslyAllowBrowser: true
});

export const streamChatResponse = async function* (
    history: { role: 'user' | 'model'; text: string }[],
    userMessage: string
): AsyncGenerator<string, void, unknown> {
    try {
        // Convert history format
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
            content: msg.text
        }));

        // Add system message
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: "Tu es OtaBot, un assistant IA futuriste pour OtaBlog. Tu parles français dans un style cyberpunk cool et concis, en utilisant occasionnellement des termes japonais (romaji ou kanji) comme 'Sugoi', 'Senpai' ou 'Konnichiwa'. Tu es utile et tu connais bien la culture anime/manga. Garde les réponses sous 80 mots si possible."
            },
            ...formattedHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];

        const stream = await llama.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        console.error("Llama Error:", error);
        yield " [Erreur Système : Lien Neural Interrompu]";
    }
};

/**
 * Génère des questions de quiz structurées en JSON
 */
export const generateQuizQuestions = async (topic: string, count: number = 5): Promise<any[]> => {
    try {
        const prompt = `Génère ${count} questions de quiz sur le thème (anime/manga) : "${topic}".
        Réponds UNIQUEMENT avec un objet JSON au format:
        {
          "questions": [
            {
              "id": "unique_id",
              "category": "${topic}",
              "question": "Question ici ?",
              "options": ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
              "correctAnswer": 0, // index de la bonne réponse (0-3)
              "points": 100
            }
          ]
        }`;

        const response = await llama.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: "Tu es un générateur de quiz expert en anime/manga. Tu génères uniquement du JSON valide."
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' } // Force JSON mode if supported, or rely on prompt
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return [];

        // Parse JSON safely
        try {
            const json = JSON.parse(content);
            // Handle both object wrapper or direct array
            return Array.isArray(json) ? json : (json.questions || json.quiz || []);
        } catch (e) {
            console.error("Failed to parse AI Quiz JSON", e);
            return [];
        }

    } catch (error) {
        console.error("AI Quiz Generation Failed:", error);
        return [];
    }
};
