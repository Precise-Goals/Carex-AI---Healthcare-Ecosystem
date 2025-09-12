import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../lib/generated/prisma";
import { currentUser } from "@clerk/nextjs/server";

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

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

    // Call Together API
    const togetherApiKey = process.env.TOGETHER_API;
    if (!togetherApiKey) {
      return NextResponse.json(
        { error: "Together API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${togetherApiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          messages: conversationHistory,
          temperature: 0.3, // Lower temperature for more consistent medical responses
          max_tokens: 1500, // Increased for more detailed medical explanations
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Together API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response format from Together API");
    }

    const assistantResponse = data.choices[0].message.content;

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
