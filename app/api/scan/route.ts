import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  let body: { base64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { base64, mimeType = "image/jpeg" } = body;
  if (!base64) {
    return NextResponse.json({ error: "Missing base64 image" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash" },
    { apiVersion: "v1" }
  );

  const prompt = `אתה מומחה להדברה בישראל. בחן את התמונה וזהה את המזיק.
ענה אך ורק ב-JSON (ללא הסברים נוספים) בפורמט:
{"pestName": "שם המזיק בעברית", "description": "תיאור קצר של עד 2 משפטים על המזיק והסכנה שהוא מהווה"}
אם אינך מזהה מזיק, החזר: {"pestName": "לא זוהה", "description": "לא ניתן לזהות מזיק בתמונה. נסה תמונה ברורה יותר."}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let parsed: { pestName: string; description: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if model doesn't return clean JSON
      parsed = { pestName: "לא זוהה", description: text.slice(0, 200) };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
