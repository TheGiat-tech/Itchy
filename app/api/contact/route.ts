import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FALLBACK_RECIPIENT = "giat.hadbarot@gmail.com";
const MAX_IMAGE_BASE64_LENGTH = 7_000_000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY" },
      { status: 500 }
    );
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!fromAddress) {
    return NextResponse.json(
      { error: "Missing RESEND_FROM_EMAIL" },
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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
      { error: "Image payload too large" },
      { status: 413 }
    );
  }

  const pestLabel = pestType || "לא צוין";
  const subject = `🛑 ליד חדש מאיצ'י: ${pestLabel} - ${name || "לקוח"}`;

  const imageSection = imageUrl
    ? `<tr>
        <td style="padding:0 0 16px 0;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#374151;">תמונה שהועלתה:</p>
          <img src="${imageUrl}" alt="תמונת מזיק" style="max-width:400px;border-radius:8px;border:1px solid #e5e7eb;" />
        </td>
      </tr>`
    : imageBase64
      ? `<tr>
          <td style="padding:0 0 16px 0;">
            <p style="margin:0 0 8px 0;font-weight:600;color:#374151;">צורפה תמונה כקובץ מצורף למייל.</p>
          </td>
        </tr>`
      : "";

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
              filename: imageName || "uploaded-image",
              content: imageBase64,
              contentType: imageType || "application/octet-stream",
            },
          ]
        : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
