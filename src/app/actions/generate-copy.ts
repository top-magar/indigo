'use server';

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { createLogger } from "@/lib/logger";
const log = createLogger("actions:generate-copy");

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function generateCopy(prompt: string, currentText?: string) {
  try {
    const modelId = process.env.AWS_BEDROCK_MODEL_ID || "us.anthropic.claude-3-5-haiku-20241022-v1:0";

    const systemPrompt = `You are an expert copywriter for an e-commerce store. 
    Your goal is to write catchy, professional, and concise text based on the user's request.
    Return ONLY the generated text. Do not include quotes or "Here is the text:" prefixes.`;

    const userMessage = currentText 
      ? `Rewrite the following text to be more engaging: "${currentText}". Context: ${prompt}`
      : `Write a short piece of text about: ${prompt}`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      messages: [
        { role: "user", content: `${systemPrompt}\n\n${userMessage}` }
      ],
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrock.send(command);
    const decodedBody = new TextDecoder().decode(response.body);
    const jsonBody = JSON.parse(decodedBody);

    return { 
      success: true, 
      text: jsonBody.content[0].text 
    };

  } catch (error: unknown) {
    log.error("Bedrock Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      error: `AI generation failed: ${errorMessage}. Please check AWS credentials.` 
    };
  }
}
