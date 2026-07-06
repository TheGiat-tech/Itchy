"use server";

import { sql } from "@vercel/postgres";

interface QuoteData {
  pestType: string;
  rooms: string;
  city: string;
  name: string;
  phone: string;
  message: string;
}

type QuoteResponse = { success: boolean; error?: string; data?: QuoteData };

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

  try {
    await sql`
      INSERT INTO quotes (pest_type, rooms, city, name, phone, message, created_at)
      VALUES (${pestType}, ${rooms}, ${city}, ${name}, ${phone}, ${message}, NOW())
    `;
  } catch (error) {
    console.error("[quote] Failed to insert quote request into DB:", error);
    return { success: false, error: "שגיאה בשמירת הפרטים" };
  }

  return { success: true, data: { pestType, rooms, city, name, phone, message } };
}
