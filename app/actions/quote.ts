"use server";

import { sql } from "@vercel/postgres";

type QuoteResponse = { success: boolean; error?: string };

export async function submitQuoteRequest(formData: FormData): Promise<QuoteResponse> {
  const pestType = (formData.get("pestType") as string | null)?.trim() ?? "";
  const rooms = (formData.get("rooms") as string | null)?.trim() ?? "";
  const city = (formData.get("city") as string | null)?.trim() ?? "";
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!pestType || !rooms || !city || !name || !phone) {
    return { success: false, error: "נא למלא את כל שדות החובה" };
  }

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) {
    return { success: false, error: "שגיאת שרת: מפתח Web3Forms חסר" };
  }

  try {
    await sql`
      INSERT INTO quotes (pest_type, rooms, city, name, phone, message, created_at)
      VALUES (${pestType}, ${rooms}, ${city}, ${name}, ${phone}, ${message}, NOW())
    `;
  } catch (error) {
    console.error("[quote] Failed to insert quote request into DB:", error);
    return { success: false, error: "שגיאה בשמירת הפרטים" };
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "בקשת הצעת מחיר חדשה - איצ׳י",
        pestType,
        rooms,
        city,
        name,
        phone,
        message,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "הפנייה נשמרה, אך שליחת ההתראה נכשלה" };
    }

    const result = (await response.json()) as { success?: boolean };
    if (!result.success) {
      return { success: false, error: "הפנייה נשמרה, אך שליחת ההתראה נכשלה" };
    }
  } catch (error) {
    console.error("[quote] Failed to send Web3Forms notification:", error);
    return { success: false, error: "הפנייה נשמרה, אך שליחת ההתראה נכשלה" };
  }

  return { success: true };
}
