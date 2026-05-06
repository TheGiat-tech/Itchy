"use server";

import { put, del } from "@vercel/blob";
import { sql } from "@vercel/postgres";

export async function submitContactForm(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";
  const attachment = formData.get("attachment") as File | null;

  if (!name) return { success: false, error: "שם הוא שדה חובה" };
  if (!phone) return { success: false, error: "טלפון הוא שדה חובה" };

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) {
    return { success: false, error: "שגיאת הגדרות שרת, אנא נסה שנית" };
  }

  let imageUrl: string | null = null;

  try {
    if (attachment && attachment.size > 0) {
      // Sanitize filename: replace any characters that are not alphanumeric, dot, or hyphen
      const safeName = attachment.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const blob = await put(`itchi-leads/${Date.now()}-${safeName}`, attachment, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    try {
      await sql`
        INSERT INTO leads (name, phone, message, image_url, created_at)
        VALUES (${name}, ${phone}, ${message}, ${imageUrl}, NOW())
      `;
    } catch (dbErr) {
      // Clean up uploaded blob if DB insert fails
      if (imageUrl) await del(imageUrl).catch(() => null);
      console.error("[contact] DB insert failed:", dbErr);
      return { success: false, error: "שגיאה בשמירת הפרטים, אנא נסה שנית" };
    }

    const payload: Record<string, string> = {
      access_key: accessKey,
      subject: "פנייה חדשה מאתר איצ׳י",
      from_name: "אתר איצ'י",
      name,
      phone,
      message,
    };
    if (imageUrl) {
      payload["image_url"] = imageUrl;
    }

    const web3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const web3Json = await web3Res.json();
    if (!web3Json.success) {
      console.error("[contact] Web3Forms error:", web3Json.message);
      // Lead is saved in DB; treat as partial success but still return success to user
    }

    return { success: true };
  } catch (err) {
    // Clean up uploaded blob if an unexpected error occurs before DB insert
    if (imageUrl) await del(imageUrl).catch(() => null);
    console.error("[contact] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "שגיאה לא ידועה";
    return { success: false, error: msg };
  }
}

