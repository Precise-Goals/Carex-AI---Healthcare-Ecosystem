// src/api/gemini.js
import { getDatabase, ref, get, set } from "firebase/database";
import { fetchWeather } from "./weather";
import { fetchStartupTrends } from "./startups";
import { fetchStockPrices } from "./stocks";

const apiKey = import.meta.env.GEMINI_API_KEY;
const API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function incrementUserCount(userId, field) {
  if (!userId) return;
  const db = getDatabase();

  // 1. Increment the total count
  const countRef = ref(db, `users/${userId}/${field}Count`);
  const snapshot = await get(countRef);
  const currentCount = snapshot.exists() ? snapshot.val() : 0;
  await set(countRef, currentCount + 1);

  // 2. Log timestamp for last 30 sec metrics
  const timestamp = Date.now();
  const tsRef = ref(db, `users/${userId}/${field}Timestamps/${timestamp}`);
  await set(tsRef, true);
}

export const generateBlogPost = async (articleContent, userId) => {
  try {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `Write a blog about: ${articleContent}` }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Failed to generate blog post");
    }

    const data = await response.json();
    await incrementUserCount(userId, "blog");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No content.";
  } catch (error) {
    console.error("Error generating blog post:", error);
    return articleContent;
  }
};

export const sendMessage = async (message, userId) => {
  try {
    let context = "";

    if (/weather|temperature|rain|climate/i.test(message)) {
      const weather = await fetchWeather("Pune");
      context += `Weather in ${weather.city}: ${weather.temperature}°C, ${weather.condition}, humidity ${weather.humidity}%, wind ${weather.windSpeed}km/h.\n\n`;
    }

    if (/startup|launch|product|founder/i.test(message)) {
      const startupNews = await fetchStartupTrends();
      context += `Startup news:\n${startupNews
        .map((a) => `• ${a.title} (${a.source.name})`)
        .join("\n")}\n\n`;
    }

    if (/stock|market|nifty|tcs|infy|reliance/i.test(message)) {
      const stocks = await fetchStockPrices([
        "TCS.NS",
        "INFY.NS",
        "RELIANCE.NS",
      ]);
      context += `Stock updates:\n${stocks
        .map(
          (s) =>
            `${s.name} (${s.symbol}): ₹${s.price} (${s.change.toFixed(2)}%)`
        )
        .join("\n")}\n\n`;
    }

    const fullPrompt = `
${context}
You are a helpful News assistant. The user is asking: '${message}'.
Respond in the same language, keeping the tone friendly and concise.
Be knowledgeable and accurate.
`;

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
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Failed to generate response");
    }

    const data = await response.json();
    await incrementUserCount(userId, "chat");
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
