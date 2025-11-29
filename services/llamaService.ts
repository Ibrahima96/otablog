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
