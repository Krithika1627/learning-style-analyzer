import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { topic } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // ✅ FAST MODEL
      contents: `Generate short structured notes on ${topic}.`,
    });

    return Response.json({ notes: response.text });

  } catch (error) {
    console.error("Gemini ERROR:", error);
    return Response.json(
      { notes: "Error generating notes." },
      { status: 500 }
    );
  }
}