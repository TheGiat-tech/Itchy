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
          INSERT INTO leads (name, phone, message, created_at)
          VALUES (${name || null}, ${phone}, ${fullMessage || null}, NOW())
        `;
      } catch (dbErr) {
        console.error("[api/contact] DB insert failed:", dbErr);
        // Non-fatal: still attempt Web3Forms notification
      }
    }

    // --- Web3Forms notification ---
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (accessKey) {
      try {
        const payload: Record<string, string> = {
          access_key: accessKey,
          subject: "פנייה חדשה מאתר איצ׳י",
          from_name: "אתר איצ'י",
          phone,
        };
        if (name) payload["name"] = name;
        if (pestType) payload["pest_type"] = pestType;
        if (message) payload["message"] = message;

        const web3Res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const web3Json = await web3Res.json();
        if (!web3Res.ok || !web3Json.success) {
          console.error("[api/contact] Web3Forms error:", web3Res.status, web3Json);
        }
      } catch (w3Err) {
        console.error("[api/contact] Web3Forms fetch error:", w3Err);
      }
    } else {
      console.warn("[api/contact] NEXT_PUBLIC_WEB3FORMS_KEY is not set – skipping email notification");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/contact] unexpected error:", err);
    return NextResponse.json({ success: false, message: "שגיאת שרת" }, { status: 500 });
  }
}
