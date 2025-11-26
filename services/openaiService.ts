import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

export const streamChatResponse = async function* (
    history: { role: 'user' | 'model'; text: string }[],
    userMessage: string
): AsyncGenerator<string, void, unknown> {
    try {
        // Convert history format from 'model' to 'assistant' for OpenAI
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.text
        })) as { role: 'user' | 'assistant'; content: string }[];

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using cost-effective model
            messages: [
                {
                    role: 'system',
                    content: "Tu es OtaBot, un assistant IA futuriste pour OtaBlog. Tu parles français dans un style cyberpunk cool et concis, en utilisant occasionnellement des termes japonais (romaji ou kanji) comme 'Sugoi', 'Senpai' ou 'Konnichiwa'. Tu es utile et tu connais bien la culture anime/manga. Garde les réponses sous 80 mots si possible."
                },
                ...formattedHistory,
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            stream: true,
            temperature: 0.8,
            max_tokens: 500
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        console.error("OpenAI Error:", error);
        yield " [Erreur Système : Lien Neural Interrompu]";
    }
};
