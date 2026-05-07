'use client';

import { useId, useState } from 'react';

export default function ContactForm() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formId = useId();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("שולח פנייה...");
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const errors: Record<string, string> = {};
    if (!name) errors.name = "נא להזין שם מלא.";
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.email = "נא להזין אימייל תקין.";
    if (!/^0\\d{8,9}$/.test(phone)) errors.phone = "נא להזין מספר טלפון תקין.";
    if (!message) errors.message = "נא להזין הודעה.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setResult("❌ יש שדות שדורשים תיקון.");
      setIsSubmitting(false);
      return;
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!accessKey) {
      setResult("❌ שגיאה בהגדרות: חסר מפתח Web3Forms.");
      setIsSubmitting(false);
      return;
    }

    formData.append("access_key", accessKey);
    formData.append("subject", "פנייה חדשה מאתר איצ׳י");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("✅ ההודעה נשלחה בהצלחה!");
        form.reset();
      } else {
        setResult("❌ שגיאה בשליחה.");
      }
    } catch {
      setResult("❌ שגיאת תקשורת. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100" dir="rtl">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />

        <div>
          <label htmlFor={`${formId}-name`} className="block text-sm font-semibold text-gray-700 mb-1">שם מלא</label>
          <input id={`${formId}-name`} type="text" name="name" required aria-required="true" aria-invalid={fieldErrors.name ? "true" : "false"} aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined} placeholder="שם מלא" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2" />
          {fieldErrors.name && <p id={`${formId}-name-error`} className="mt-1 text-sm text-red-700">{fieldErrors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-semibold text-gray-700 mb-1">אימייל</label>
            <input id={`${formId}-email`} type="email" name="email" required aria-required="true" aria-invalid={fieldErrors.email ? "true" : "false"} aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined} placeholder="אימייל" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2" />
            {fieldErrors.email && <p id={`${formId}-email-error`} className="mt-1 text-sm text-red-700">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-phone`} className="block text-sm font-semibold text-gray-700 mb-1">טלפון</label>
            <input id={`${formId}-phone`} type="tel" name="phone" required aria-required="true" aria-invalid={fieldErrors.phone ? "true" : "false"} aria-describedby={fieldErrors.phone ? `${formId}-phone-error` : undefined} placeholder="טלפון" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2" />
            {fieldErrors.phone && <p id={`${formId}-phone-error`} className="mt-1 text-sm text-red-700">{fieldErrors.phone}</p>}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-message`} className="block text-sm font-semibold text-gray-700 mb-1">איך אפשר לעזור?</label>
          <textarea id={`${formId}-message`} name="message" placeholder="איך אפשר לעזור?" required aria-required="true" aria-invalid={fieldErrors.message ? "true" : "false"} aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 min-h-[100px]"></textarea>
          {fieldErrors.message && <p id={`${formId}-message-error`} className="mt-1 text-sm text-red-700">{fieldErrors.message}</p>}
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <label htmlFor={`${formId}-attachment`} className="block text-sm font-bold text-green-800 mb-2">📸 צרף תמונה לזיהוי המזיק</label>
          <input id={`${formId}-attachment`} type="file" name="attachment" accept="image/*" className="text-sm w-full" />
        </div>

        <button type="submit" disabled={isSubmitting} aria-label="שלח פנייה" className={`w-full py-3 rounded-lg font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
          {isSubmitting ? 'שולח...' : 'שלח לזיהוי וייעוץ'}
        </button>

        {result && <p className="text-center mt-4 font-medium text-sm">{result}</p>}
      </form>
    </div>
  );
}
