import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const streamChatResponse = async function* (
  history: { role: 'user' | 'model'; text: string }[],
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  try {
    const model = 'gemini-1.5-flash';

    // Construct the chat history for the API
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model,
      history: formattedHistory,
      config: {
        systemInstruction: "Tu es OtaBot, un assistant IA futuriste pour OtaBlog. Tu parles français dans un style cyberpunk cool et concis, en utilisant occasionnellement des termes japonais (romaji ou kanji) comme 'Sugoi', 'Senpai' ou 'Konnichiwa'. Tu es utile et tu connais bien la culture anime/manga. Garde les réponses sous 80 mots si possible.",
      }
    });

    const result = await chat.sendMessageStream({
      message: userMessage
    });

    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      if (response.text) {
        yield response.text;
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    yield " [Erreur Système : Lien Neural Interrompu]";
  }
};