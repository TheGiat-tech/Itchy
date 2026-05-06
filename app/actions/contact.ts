"use server";

import { put, del } from "@vercel/blob";
import { sql } from "@vercel/postgres";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5 MB – Vercel Server Action limit

export async function submitContactForm(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  // --- Debug: log all received keys ---
  console.log("[contact] received formData keys:", [...formData.keys()]);

  // --- Environment variable validation ---
  // BLOB_READ_WRITE_TOKEN is checked only inside the blob-upload block (below),
  // so attachment-free submissions are never blocked by a missing/rotated blob token.
  const missingEnvVars: string[] = [];
  if (!process.env.POSTGRES_URL) missingEnvVars.push("POSTGRES_URL");
  if (!process.env.NEXT_PUBLIC_WEB3FORMS_KEY) missingEnvVars.push("NEXT_PUBLIC_WEB3FORMS_KEY");

  if (missingEnvVars.length > 0) {
    console.error("[contact] Missing environment variables:", missingEnvVars);
    return {
      success: false,
      error: `שגיאת הגדרות שרת – חסרים משתני סביבה: ${missingEnvVars.join(", ")}`,
    };
  }

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY!;

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";
  const attachment = formData.get("attachment") as File | null;

  if (!name) return { success: false, error: "שם הוא שדה חובה" };
  if (!phone) return { success: false, error: "טלפון הוא שדה חובה" };

  // --- File size guard ---
  if (attachment && attachment.size > MAX_FILE_SIZE) {
    console.warn("[contact] File too large:", attachment.size, "bytes");
    return { success: false, error: "הקובץ גדול מדי (מקסימום 4.5MB)" };
  }

  let imageUrl: string | null = null;

  // --- Blob upload ---
  if (attachment && attachment.size > 0) {
    try {
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (!blobToken) {
        console.error("[contact] BLOB_READ_WRITE_TOKEN is missing at upload time");
        return { success: false, error: "שגיאת הגדרות שרת – BLOB_READ_WRITE_TOKEN חסר" };
      }
      console.log("[contact] BLOB_READ_WRITE_TOKEN present, length:", blobToken.length);
      const safeName = attachment.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      console.log("[contact] uploading blob:", safeName, attachment.size, "bytes");
      const blob = await put(`itchi-leads/${Date.now()}-${safeName}`, attachment, {
        access: "public",
        token: blobToken,
      });
      imageUrl = blob.url;
      console.log("[contact] blob uploaded:", imageUrl);
    } catch (blobErr) {
      console.error("[contact] Blob upload failed:", blobErr);
      const msg = blobErr instanceof Error ? blobErr.message : String(blobErr);
      return { success: false, error: `שגיאה בהעלאת הקובץ: ${msg}` };
    }
  }

  // --- Postgres insert ---
  try {
    console.log("[contact] inserting lead into DB");
    await sql`
      INSERT INTO leads (name, phone, message, image_url, created_at)
      VALUES (${name}, ${phone}, ${message}, ${imageUrl}, NOW())
    `;
    console.log("[contact] DB insert OK");
  } catch (dbErr) {
    if (imageUrl) await del(imageUrl).catch(() => null);
    console.error("[contact] DB insert failed:", dbErr);
    const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
    return { success: false, error: `שגיאה בשמירת הפרטים: ${msg}` };
  }

  // --- Web3Forms notification ---
  try {
    const payload: Record<string, string> = {
      access_key: accessKey,
      subject: "פנייה חדשה מאתר איצ׳י",
      from_name: "אתר איצ'י",
      name,
      phone,
      message,
    };
    if (imageUrl) payload["image_url"] = imageUrl;

    console.log("[contact] sending Web3Forms notification");
    const web3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const web3Json = await web3Res.json();
    console.log("[contact] Web3Forms response:", web3Res.status, web3Json);

    if (!web3Json.success) {
      // Lead is already saved; log but don't fail the user
      console.error("[contact] Web3Forms returned failure:", web3Json.message);
    }
  } catch (w3Err) {
    // Non-fatal: DB already has the lead
    console.error("[contact] Web3Forms fetch error:", w3Err);
  }

  return { success: true };
}

