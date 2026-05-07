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

  await sql`
    INSERT INTO quotes (pest_type, rooms, city, name, phone, message, created_at)
    VALUES (${pestType}, ${rooms}, ${city}, ${name}, ${phone}, ${message}, NOW())
  `;

  await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
      subject: "בקשת הצעת מחיר חדשה - איצ׳י",
      pestType,
      rooms,
      city,
      name,
      phone,
      message,
    }),
  });

  return { success: true };
}
