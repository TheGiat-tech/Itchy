import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing required environment variable: RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;
    const message = formData.get("message") as string | null;
    const photo = formData.get("photo") as File | null;

    if (!name || !message) {
      return NextResponse.json(
        { error: "שם והודעה הם שדות חובה" },
        { status: 400 }
      );
    }

    const attachments: { filename: string; content: Buffer }[] = [];
    let photoNote = "";

    if (photo && photo.size > 0) {
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: photo.name || "photo.jpg",
        content: buffer,
      });
      photoNote = "\n\nמצורפת תמונה לזיהוי מהלקוח.";
    }

    const toEmail = process.env.CONTACT_TO_EMAIL ?? "contact@itchy.co.il";

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "noreply@itchy.co.il",
      to: toEmail,
      subject: `פנייה חדשה מ-${name}`,
      text: `שם: ${name}\nטלפון: ${phone ?? "לא סופק"}\n\nהודעה:\n${message}${photoNote}`,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send contact form email", err);
    return NextResponse.json(
      { error: "שגיאה בשליחת ההודעה, נסה שוב מאוחר יותר" },
      { status: 500 }
    );
  }
}
