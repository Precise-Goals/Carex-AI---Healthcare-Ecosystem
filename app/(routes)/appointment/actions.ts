'use server';

// Server Action for analyzing medical documents
export async function analyzeAndSubmit(formData: FormData) {
  console.log('🚀 Starting analyzeAndSubmit server action');
  
  try {
    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const age = formData.get('age') as string;
    const contact = formData.get('contact') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const pincode = formData.get('pincode') as string;
    const message = formData.get('message') as string;
    
    console.log('📝 Extracted form data:', { fullName, age, contact, email, address, pincode, message });

    // Gemini API configuration
    const apiKey = process.env.GEMINI_API_KEY!;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Extract uploaded files
    const uploadedFiles: File[] = [];
    for (let i = 0; i < 4; i++) {
      const file = formData.get(`file-${i}`) as File;
      if (file && file.size > 0) {
        uploadedFiles.push(file);
      }
    }
    
    console.log(`📁 Found ${uploadedFiles.length} uploaded files`);

    // System prompt for medical analysis
    const systemPrompt = `You are an expert medical data analyst. Analyze the blood report document (image or PDF) and provide a structured JSON output.
- Extract patient information.
- Extract all test results with value, unit, range, and a status ('Normal', 'Low', 'High', 'Borderline').
- Analyze the results to identify potential health conditions. For each condition, provide a simple 'condition' name, an 'explanation', 'advice' for management (how to recover), and a boolean 'isSerious' flag.
- Respond ONLY with a valid JSON object of this structure:
{
  "patientInfo": { "Name": "...", "Age": "..." },
  "results": [ { "test": "...", "value": "...", "unit": "...", "range": "...", "status": "..." } ],
  "healthInsights": [ { "condition": "...", "explanation": "...", "advice": "...", "isSerious": boolean } ]
}
Do not include any text or markdown formatting outside of the single JSON object.`;

    // Process each file with Gemini AI
    const allHealthInsights: any[] = [];
    
    for (const file of uploadedFiles) {
      // Convert file to Base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = file.type;

      // Analyze with Gemini REST API
      const requestBody = {
        contents: [{
          parts: [
            { text: systemPrompt },
            { inlineData: { mimeType, data: base64 } }
          ]
        }]
      };

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API request failed: ${geminiResponse.status} ${geminiResponse.statusText}`);
      }

      const responseJson = await geminiResponse.json();
      const analysisText = responseJson.candidates[0].content.parts[0].text;
      
      console.log('🤖 Gemini AI analysis completed successfully');

      try {
        // Parse the JSON response
        const analysis = JSON.parse(analysisText);
        if (analysis.healthInsights && Array.isArray(analysis.healthInsights)) {
          allHealthInsights.push(...analysis.healthInsights);
          console.log(`💡 Extracted ${analysis.healthInsights.length} health insights from file`);
        }
      } catch (parseError) {
        console.error('❌ Error parsing AI response:', parseError);
        // Continue with other files even if one fails
      }
    }

    // Construct webhook payload
    const webhookPayload = {
      fullName,
      age,
      contact,
      email,
      address,
      pincode,
      message,
      emailBody: allHealthInsights
    };

    // Send to webhook
    const webhookUrl = 'https://carex.app.n8n.cloud/webhook-test/204f2b53-4dae-4994-8ff1-bc2debb74801';
    
    console.log('🌐 About to send webhook request with payload:', webhookPayload);
    
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
      }

      console.log('✅ Webhook request successful');
      return {
        success: true
      };
    } catch (webhookError) {
      console.error('❌ Webhook error:', webhookError);
      return {
        success: false,
        error: `Failed to submit to webhook: ${webhookError instanceof Error ? webhookError.message : 'Unknown error'}`
      };
    }

  } catch (error) {
    console.error('❌ Critical error in analyzeAndSubmit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
