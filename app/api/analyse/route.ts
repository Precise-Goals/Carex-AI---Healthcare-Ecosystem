// File: app/api/analyse/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    console.log("🔍 API endpoint hit. Starting file analysis...");

    // Parse FormData
    const formData = await request.formData();
    
    // Extract all form fields from FormData
    const name = formData.get("name") as string;
    const age = formData.get("age") as string;
    const contact = formData.get("contact") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const pin = formData.get("pin") as string;
    const file = formData.get("file") as File;

    console.log(`📝 Processing appointment for: ${name} (${email})`);

    // Validate required fields
    if (!name || !age || !contact || !email || !address || !pin) {
      console.error("❌ Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!file) {
      console.error("❌ No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`📁 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      console.error(`❌ Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image or PDF." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error(`❌ File too large: ${file.size}`);
      return NextResponse.json(
        { error: "File is too large. Max size is 10MB." },
        { status: 413 }
      );
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    console.log("✅ File converted to Base64.");

    // --- Call Gemini API ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY environment variable is not set.");
      return NextResponse.json(
        { error: "AI service is not configured on the server." },
        { status: 500 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an expert medical data analyst. Analyze the provided medical document (image or PDF) and extract all relevant information to create a structured analysis with the following sections:

## AI Health Insights
[Provide key health insights and potential conditions identified from the medical report]

## Advice
[Provide practical advice and recommendations for the patient]

## Detailed Breakdown
[Provide a detailed breakdown of all test results, values, and their significance]

Format your response as clean, readable text with proper headings and bullet points. Do not include any JSON formatting or markdown code blocks.`;

    // Multimodal processing with file data
    const geminiRequestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
    };

    console.log("🤖 Sending request to Gemini API...");
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiRequestBody),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error(
        "❌ Gemini API request failed:",
        geminiResponse.status,
        JSON.stringify(errorBody, null, 2)
      );
      throw new Error(
        `Gemini API error: ${
          errorBody.error?.message || "Failed to get response"
        }`
      );
    }

    const responseJson = await geminiResponse.json();

    // --- Parse AI Response ---
    if (
      !responseJson.candidates ||
      !responseJson.candidates[0].content.parts ||
      !responseJson.candidates[0].content.parts[0].text
    ) {
      console.error(
        "❌ Invalid response structure from Gemini API:",
        JSON.stringify(responseJson, null, 2)
      );
      throw new Error("Received an invalid response structure from the AI.");
    }
    
    const structuredAnalysis = responseJson.candidates[0].content.parts[0].text;
    console.log("✅ Received structured analysis from Gemini API.");

    // --- Send to Webhook ---
    const webhookUrl =
      "https://carex.app.n8n.cloud/webhook-test/204f2b53-4dae-4994-8ff1-bc2debb74801";
    const webhookPayload = { 
      name,
      age,
      contact,
      email,
      address,
      pin,
      message: structuredAnalysis
    };

    console.log("🌐 Sending insights to webhook...");
    // We send the webhook but don't wait for it (fire and forget)
    // This makes the user's experience faster and won't fail if the webhook is down.
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    })
      .then((res) => {
        if (res.ok) console.log("✅ Webhook notified successfully.");
        else
          console.warn(
            "⚠️ Webhook notification failed with status:",
            res.status
          );
      })
      .catch((err) => {
        console.warn("⚠️ Webhook request error (non-critical):", err);
      });

    // --- Send Email with Analysis ---
    console.log("📧 Preparing to send email with analysis...");
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailRecipient = process.env.EMAIL_RECIPIENT;
    
    if (!emailRecipient) {
      console.warn("⚠️ EMAIL_RECIPIENT not configured, skipping email");
    } else {
      // Construct email content with structured analysis
      const emailSubject = `New Blood Report Analysis for: ${name}`;
      const emailBody = `
Patient Details:
- Name: ${name}
- Age: ${age}
- Contact: ${contact}
- Email: ${email}
- Address: ${address}
- Pin Code: ${pin}

${structuredAnalysis}
      `.trim();

      try {
        await resend.emails.send({
          from: 'Carex Medical <noreply@carex.app>',
          to: [emailRecipient],
          subject: emailSubject,
          text: emailBody,
        });
        console.log("✅ Email sent successfully to:", emailRecipient);
      } catch (emailError) {
        console.error("❌ Failed to send email:", emailError);
        // Don't fail the entire request if email fails
      }
    }

    // --- Return Success Response to Client ---
    console.log("🎉 Analysis successful. Data submitted and emailed.");
    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error("💥 An unexpected error occurred in the API route:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
