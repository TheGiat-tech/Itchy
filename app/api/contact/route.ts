import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name: string = (body.name ?? "").trim();
    const phone: string = (body.phone ?? "").trim();
    const message: string = (body.message ?? "").trim();
    const pestType: string = (body.pestType ?? "").trim();

    if (!phone) {
      return NextResponse.json({ success: false, message: "טלפון הוא שדה חובה" }, { status: 400 });
    }

    const fullMessage = [pestType && `סוג מזיק: ${pestType}`, message].filter(Boolean).join("\n");

    // --- Postgres insert ---
    if (process.env.POSTGRES_URL) {
      try {
        await sql`
          INSERT INTO leads (name, phone, message, image_url, created_at)
          VALUES (${name || null}, ${phone}, ${fullMessage || null}, ${null}, NOW())
        `;
      } catch (dbErr) {
        console.error("[api/contact] DB insert failed:", dbErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/contact] unexpected error:", err);
    return NextResponse.json({ success: false, message: "שגיאת שרת" }, { status: 500 });
  }
}
