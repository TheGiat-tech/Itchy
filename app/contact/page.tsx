"use client";

import { Suspense, useId, useState } from "react";
import Footer from "@/components/Footer";

function ContactPageContent() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

    const errors: Record<string, string> = {};
    if (!name) errors.name = "נא להזין שם מלא.";
    if (!phone) errors.phone = "נא להזין מספר טלפון.";
    if (phone && !/^0\d{8,9}$/.test(phone)) errors.phone = "מספר הטלפון אינו תקין.";
    if (message.length > 0 && message.length < 5) errors.message = "ההודעה קצרה מדי.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    if (!accessKey) {
      setFormError("שגיאת הגדרות: חסר מפתח Web3Forms");
      setLoading(false);
      return;
    }

    formData.append("access_key", accessKey);
    formData.append("subject", "פנייה חדשה מאתר איצ׳י");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitted(true);
        form.reset();
      } else {
        throw new Error(result.message || "שגיאה בשליחה");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "שגיאה בתקשורת, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main id="main-content" className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <header className="mb-8" dir="rtl">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">דברו עם איצ׳י</h1>
          <p className="text-gray-600">זיהיתם מזיק? יש לכם שאלה? צרו איתנו קשר ונחזור אליכם בהקדם.</p>
        </header>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center" dir="rtl">
            <div className="text-5xl mb-4" aria-hidden="true">✅</div>
            <h2 className="text-xl font-bold text-green-800">הפרטים נשלחו בהצלחה! נחזור אליך בהקדם.</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5" dir="rtl" noValidate>
            <input type="checkbox" name="botcheck" className="hidden" aria-hidden="true" tabIndex={-1} />

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor={`${formId}-name`} className="block text-sm font-semibold text-gray-700 mb-1">שם מלא</label>
              <input
                id={`${formId}-name`}
                type="text"
                name="name"
                required
                aria-required="true"
                placeholder="ישראל ישראלי"
                aria-invalid={fieldErrors.name ? "true" : "false"}
                aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all motion-reduce:transition-none"
              />
              {fieldErrors.name && <p id={`${formId}-name-error`} className="mt-1 text-sm text-red-700">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor={`${formId}-phone`} className="block text-sm font-semibold text-gray-700 mb-1">טלפון</label>
              <input
                id={`${formId}-phone`}
                type="tel"
                name="phone"
                required
                aria-required="true"
                placeholder="05XXXXXXXX"
                aria-invalid={fieldErrors.phone ? "true" : "false"}
                aria-describedby={fieldErrors.phone ? `${formId}-phone-error` : undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 text-left"
                dir="ltr"
              />
              {fieldErrors.phone && <p id={`${formId}-phone-error`} className="mt-1 text-sm text-red-700">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label htmlFor={`${formId}-message`} className="block text-sm font-semibold text-gray-700 mb-1">הודעה (אופציונלי)</label>
              <textarea
                id={`${formId}-message`}
                name="message"
                rows={4}
                placeholder="איך אפשר לעזור?"
                aria-invalid={fieldErrors.message ? "true" : "false"}
                aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 resize-none"
              />
              {fieldErrors.message && <p id={`${formId}-message-error`} className="mt-1 text-sm text-red-700">{fieldErrors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 motion-reduce:transform-none"
              aria-label="שלח פנייה"
            >
              {loading ? "שולח..." : "שלח הודעה לצוות איצ׳י"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ContactPageContent />
    </Suspense>
  );
}
