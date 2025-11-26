import OpenAI from 'openai';

// Key from .env
const apiKey = "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";

const openai = new OpenAI({
  apiKey: apiKey,
});

async function test() {
  try {
    console.log("Testing OpenAI connection...");
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      stream: true,
    });

    console.log("Stream started. Receiving chunks:");
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
      }
    }
    console.log("\n\nVerification Passed!");
  } catch (error) {
    console.error("\nVerification Failed:", error);
  }
}

test();
