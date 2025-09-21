import { NextRequest, NextResponse } from "next/server";

// Fallback response generator
const generateFallbackResponse = (userMessage: string): string => {
  const fallbackResponses = [
    "I'm sorry, I'm having trouble connecting to my knowledge base right now. Could you please repeat your question?",
    "I apologize, but I'm experiencing some technical difficulties. Could we try again in a moment?",
    "I seem to be having trouble processing your request. Could you rephrase your question?",
    "I apologize for the inconvenience, but I'm currently unable to access my medical knowledge database. Please try again shortly.",
  ];

  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
};

export async function POST(request: NextRequest) {
  try {
    const { messages, doctorPrompt } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Call Gemini API using direct URL method (similar to demo.js)
    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      );
    }

    const API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`;

    // Build the full prompt with system instruction and conversation history
    const systemInstruction =
      doctorPrompt ||
      "You are a helpful AI medical assistant. Provide concise, accurate medical information. Remember that you are not a replacement for professional medical advice, diagnosis, or treatment.";

    const conversationText = messages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    const fullPrompt = `${systemInstruction}\n\nConversation:\n${conversationText}`;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt.trim() }] }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Failed to generate response");
      }

      const data = await response.json();
      const assistantResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't generate a response.";

      return NextResponse.json({
        content: assistantResponse,
      });
    } catch (geminiError) {
      console.error("Error calling Gemini API:", geminiError);

      const fallbackResponse = generateFallbackResponse(
        "I'm having trouble understanding your request."
      );
      return NextResponse.json({
        content: fallbackResponse,
      });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
