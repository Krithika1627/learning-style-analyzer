import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { topic } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Generate 3 practice tasks and 1 mini project for ${topic}. No theory. `,
    });

    return Response.json({ tasks: response.text });

  } catch (error) {
    console.error("Gemini Practice ERROR:", error);
    return Response.json(
      { tasks: "Error generating tasks." },
      { status: 500 }
    );
  }
}