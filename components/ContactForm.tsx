'use client';

import { useId, useState } from 'react';

export default function ContactForm() {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();
  const attachmentId = useId();
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("שולח פנייה...");

    const formData = new FormData(event.currentTarget);
    
    // שימוש במפתח הציבורי ישירות כגיבוי
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "c5651e0e-d0c4-4305-bbbd-c1d0da50a3ce";
    formData.append("access_key", accessKey);
    formData.append("subject", "פנייה חדשה מאתר איצ׳י");

    try {
      // פנייה ישירה ל-Web3Forms - זה מחסל את ה-404
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("✅ ההודעה נשלחה בהצלחה!");
        event.currentTarget.reset();
      } else {
        setResult("❌ שגיאה בשליחה. בדוק את המפתח ב-Vercel.");
      }
    } catch {
      setResult("❌ שגיאת תקשורת. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100" dir="rtl">
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm font-semibold text-gray-800">
            שם מלא
          </label>
          <input id={nameId} type="text" name="name" placeholder="שם מלא" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={emailId} className="mb-1 block text-sm font-semibold text-gray-800">
              אימייל
            </label>
            <input id={emailId} type="email" name="email" placeholder="אימייל" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label htmlFor={phoneId} className="mb-1 block text-sm font-semibold text-gray-800">
              טלפון
            </label>
            <input id={phoneId} type="tel" name="phone" placeholder="טלפון" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>

        <div>
          <label htmlFor={messageId} className="mb-1 block text-sm font-semibold text-gray-800">
            הודעה
          </label>
          <textarea id={messageId} name="message" placeholder="איך אפשר לעזור?" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"></textarea>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <label htmlFor={attachmentId} className="block text-sm font-bold text-green-800 mb-2">📸 צרף תמונה לזיהוי המזיק</label>
          <input id={attachmentId} type="file" name="attachment" accept="image/*" className="text-sm w-full" />
        </div>

        <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
          {isSubmitting ? 'שולח...' : 'שלח לזיהוי וייעוץ'}
        </button>

        {result && <p className="text-center mt-4 font-medium text-sm" role="status">{result}</p>}
      </form>
    </div>
  );
}
