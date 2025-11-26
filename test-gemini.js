import { GoogleGenAI } from "@google/genai";

// Key from .env (verified in previous step)
// const apiKey = "AIzaSyAdduSQYpeG1q_1b-RkXVtLjZ74J6Jp6mI"; 
// const ai = new GoogleGenAI({ apiKey });
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
async function test() {
  try {
    const model = 'gemini-2.0-flash';
    console.log(`Testing model: ${model}`);
    
    const chat = ai.chats.create({
      model,
      history: [],
    });

    const result = await chat.sendMessageStream({
      message: "Hello"
    });

    console.log("Response stream started...");
    for await (const chunk of result) {
      if (chunk.text) {
        console.log("Received chunk:", chunk.text);
        break; // Just need one chunk to verify
      }
    }
    console.log("Verification Passed!");
  } catch (error) {
    console.error("Verification Failed:", error);
    process.exit(1);
  }
}

test();
