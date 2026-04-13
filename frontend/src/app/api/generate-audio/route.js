import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { topic } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Explain ${topic} like a teacher speaking in a lecture. Keep it simple, clear words.`,
    });

    console.log("Gemini Audio Response:", response); // DEBUG

    return Response.json({ audioText: response.text });

  } catch (error) {
    console.error("AUDIO ERROR FULL:", error); 
    return Response.json(
      { audioText: "Error generating audio." },
      { status: 500 }
    );
  }
}