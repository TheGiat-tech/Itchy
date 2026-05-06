import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FALLBACK_RECIPIENT = "giat.hadbarot@gmail.com";
const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = Math.ceil((MAX_IMAGE_FILE_BYTES * 4) / 3) + 1024;
const MAX_JSON_BODY_BYTES = MAX_IMAGE_BASE64_LENGTH + 200_000;

function normalizeImageContentType(contentType?: string): string {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase() || "";
  if (!normalized.startsWith("image/")) return "image/jpeg";
  return normalized;
}

function extensionFromContentType(contentType?: string): string {
  const normalized = normalizeImageContentType(contentType);
  if (!normalized.startsWith("image/")) return "jpg";
  const ext = normalized.slice("image/".length).trim();
  return ext || "jpg";
}

function isAllowedFilenameChar(char: string): boolean {
  if (char === "_" || char === "-") return true;
  const code = char.charCodeAt(0);
  const isDigit = code >= 48 && code <= 57;
  const isUpper = code >= 65 && code <= 90;
  const isLower = code >= 97 && code <= 122;
  const isHebrew = code >= 0x0590 && code <= 0x05ff;
  return isDigit || isUpper || isLower || isHebrew;
}

function sanitizeAttachmentFilename(filename: string, fallbackExt = "jpg"): string {
  const rawExt = (fallbackExt || "jpg").toLowerCase();
  let safeExt = "";
  for (const char of rawExt) {
    const code = char.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isLower = code >= 97 && code <= 122;
    if (isDigit || isLower) safeExt += char;
  }
  if (!safeExt) safeExt = "jpg";
  let base = "";
  let prevUnderscore = false;

  for (const char of filename.normalize("NFKC")) {
    if (isAllowedFilenameChar(char)) {
      base += char;
      prevUnderscore = false;
      continue;
    }
    if (!prevUnderscore) {
      base += "_";
      prevUnderscore = true;
    }
    if (base.length >= 80) break;
  }

  while (base.startsWith("_")) base = base.slice(1);
  while (base.endsWith("_")) base = base.slice(0, -1);
  if (!base) base = "uploaded-image";

  return `${base}.${safeExt}`;
}

function getSafeImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

function getImageSection(imageUrl: string, imageBase64: string): string {
  const safeImageUrl = getSafeImageUrl(imageUrl);
  if (safeImageUrl) {
    return `<tr>
        <td style="padding:0 0 16px 0;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#374151;">תמונה שהועלתה:</p>
          <img src="${safeImageUrl}" alt="תמונת מזיק" style="max-width:400px;border-radius:8px;border:1px solid #e5e7eb;" />
        </td>
      </tr>`;
  }
  if (imageBase64) {
    return `<tr>
          <td style="padding:0 0 16px 0;">
            <p style="margin:0 0 8px 0;font-weight:600;color:#374151;">צורפה תמונה כקובץ מצורף למייל.</p>
          </td>
        </tr>`;
  }
  return "";
}

export async function POST(req: NextRequest) {
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_BYTES) {
      return NextResponse.json({ success: false, message: "Payload too large" }, { status: 413 });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return NextResponse.json(
      { success: false, message: "שגיאת תצורה פנימית, נסה שנית מאוחר יותר" },
      { status: 500 }
    );
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!fromAddress) {
    console.error("[contact] RESEND_FROM_EMAIL is not configured");
    return NextResponse.json(
      { success: false, message: "שגיאת תצורה פנימית, נסה שנית מאוחר יותר" },
      { status: 500 }
    );
  }

  const recipient = process.env.RESEND_TO_EMAIL || FALLBACK_RECIPIENT;

  let body: {
    name?: string;
    phone?: string;
    message?: string;
    pestType?: string;
    imageUrl?: string;
    imageName?: string;
    imageType?: string;
    imageBase64?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name = "",
    phone = "",
    message = "",
    pestType = "",
    imageUrl = "",
    imageName = "",
    imageType = "",
    imageBase64 = "",
  } = body;

  if (imageBase64 && imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    return NextResponse.json(
      { success: false, message: "Image payload too large" },
      { status: 413 }
    );
  }

  const pestLabel = pestType || "לא צוין";
  const subject = `🛑 ליד חדש מאיצ'י: ${pestLabel} - ${name || "לקוח"}`;

  const imageSection = getImageSection(imageUrl, imageBase64);

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,sans-serif;direction:rtl;text-align:right;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#16a34a;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🛑 ליד חדש מאיצ'י</h1>
              <p style="margin:6px 0 0 0;color:#bbf7d0;font-size:14px;">פנייה חדשה מהאתר – יש לחזור ללקוח בהקדם</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">שם הלקוח</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${name || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">טלפון</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${phone || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">סוג מזיק</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${pestLabel}</p>
                  </td>
                </tr>
                ${message ? `<tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">הודעה</p>
                    <p style="margin:0;font-size:15px;color:#374151;white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>` : ""}
                ${imageSection}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">הודעה זו נשלחה אוטומטית מ-<strong>Itchi – איצ'י</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      subject,
      html,
      attachments: imageBase64
        ? [
            {
              filename: sanitizeAttachmentFilename(
                imageName || "uploaded-image",
                extensionFromContentType(imageType)
              ),
              content: imageBase64,
              contentType: normalizeImageContentType(imageType),
            },
          ]
        : undefined,
    });

    console.log(`[contact] Email sent successfully to ${recipient} (pest: ${pestLabel})`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Failed to send email via Resend:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: "שגיאה בשליחת ההודעה, נסה שנית מאוחר יותר" },
      { status: 500 }
    );
  }
}
