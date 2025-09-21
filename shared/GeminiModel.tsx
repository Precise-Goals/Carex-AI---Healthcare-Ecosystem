// Convert OpenAI-style messages to Gemini format
export const convertMessagesToGemini = (
  messages: Array<{ role: string; content: string }>
) => {
  // Filter out system messages and combine them with the first user message
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

  // Combine system messages into a single system instruction
  const systemInstruction = systemMessages
    .map((msg) => msg.content)
    .join("\n\n");

  // Convert to Gemini format
  const geminiMessages = nonSystemMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  return {
    systemInstruction: systemInstruction || undefined,
    messages: geminiMessages,
  };
};

// Generate response using Gemini with direct API call
export const generateGeminiResponse = async (
  messages: Array<{ role: string; content: string }>
) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Google API key not configured");
    }

    const API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const { systemInstruction, messages: geminiMessages } =
      convertMessagesToGemini(messages);

    // Prepare the request body
    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1500,
        topP: 0.8,
        topK: 40,
      },
      ...(systemInstruction && {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      }),
    };

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw error;
  }
};

// Fallback response generator (same as OpenAI version)
export const generateFallbackResponse = (userMessage: string): string => {
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
