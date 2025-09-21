import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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
    const user = await currentUser();
    console.log("User in POST:", user);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, threadId } = await request.json();

    if (!message || !threadId) {
      return NextResponse.json(
        { error: "Message and threadId are required" },
        { status: 400 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress || "unknown";

    // Get the thread to verify ownership
    const thread = await prisma.chatThread.findFirst({
      where: {
        id: threadId,
        createdBy: userEmail,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Save user message to database
    const userMessage = await prisma.chatMessage.create({
      data: {
        content: message,
        role: "user",
        threadId: threadId,
      },
    });

    // Prepare messages for API call
    const conversationHistory = thread.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the new user message
    conversationHistory.push({
      role: "user",
      content: message,
    });

    // Add healthcare-focused system prompt
    const systemPrompt = {
      role: "system",
      content: `You also understand the hinglish and marathi-english language and respond in same language but in regional language. 
      You are a helpful AI assistant with knowledge about health and wellness. You can discuss general health topics, provide health information, and answer questions about wellness. 

IMPORTANT:
- You provide general information only, not medical advice
- For emergencies, direct users to call emergency services
- Encourage users to consult healthcare professionals for medical concerns
- Be helpful, clear, and friendly in your responses
- Focus on health and wellness topics when possible


Keep responses concise, conversational and helpful.`,
    };

    // Insert system prompt at the beginning
    conversationHistory.unshift(systemPrompt);

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
    const systemInstruction = conversationHistory
      .filter((msg) => msg.role === "system")
      .map((msg) => msg.content)
      .join("\n\n");

    const conversationText = conversationHistory
      .filter((msg) => msg.role !== "system")
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    const fullPrompt = `${systemInstruction}\n\nConversation:\n${conversationText}`;

    let assistantResponse: string;
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
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Failed to generate response");
      }

      const data = await response.json();
      assistantResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Use fallback response if Gemini API fails
      assistantResponse = generateFallbackResponse(message);
    }

    // Save assistant message to database
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        content: assistantResponse,
        role: "assistant",
        threadId: threadId,
      },
    });

    // Update thread's updatedAt timestamp
    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
      response: assistantResponse,
    });
  } catch (error) {
    console.error("Error in chatbot API:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    console.log("User in GET:", user);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    const userEmail = user.emailAddresses[0]?.emailAddress || "unknown";

    if (threadId) {
      // Get specific thread with messages
      const thread = await prisma.chatThread.findFirst({
        where: {
          id: parseInt(threadId),
          createdBy: userEmail,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!thread) {
        return NextResponse.json(
          { error: "Thread not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(thread);
    } else {
      // Get all threads for user
      const threads = await prisma.chatThread.findMany({
        where: {
          createdBy: userEmail,
        },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json(threads);
    }
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}
