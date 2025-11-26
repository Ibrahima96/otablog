import { GoogleGenAI } from "@google/genai";

// Key from .env (verified in previous step)
const apiKey = "AIzaSyB4USx0rXfaP24WNtGfAZbrTbTwqE7LGsU"; 
const ai = new GoogleGenAI({ apiKey });

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
