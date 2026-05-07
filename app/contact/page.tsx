"use client";

import { Suspense, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitContactForm } from "@/app/actions/contact";
import Footer from "@/components/Footer";

function ContactPageContent() {
  const searchParams = useSearchParams();
  const isPhotoFlow = searchParams.get("type") === "photo";
  const nameId = useId();
  const phoneId = useId();
  const attachmentId = useId();
  const messageId = useId();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        setSubmitted(true);
        form.reset();
      } else {
        throw new Error(result.error || "שגיאה בשליחה");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בתקשורת, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main
        id="main-content"
        className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full"
      >
        <header className="mb-8" dir="rtl">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            דברו עם איצ׳י
          </h1>
          <p className="text-gray-700">
            {isPhotoFlow
              ? "צרפו תמונה ברורה של המזיק ונחזור אליכם עם זיהוי והכוונה בהקדם."
              : "זיהיתם מזיק? יש לכם שאלה? צרו איתנו קשר ונחזור אליכם בהקדם."}
          </p>
        </header>

        {submitted ? (
          <div
            className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
            dir="rtl"
          >
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-800">
              הפרטים נשלחו בהצלחה! נחזור אליך בהקדם.
            </h2>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5"
            dir="rtl"
          >
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor={nameId}
                className="mb-1 block text-sm font-semibold text-gray-800"
              >
                שם מלא
              </label>
              <input
                id={nameId}
                type="text"
                name="name"
                required
                placeholder="ישראל ישראלי"
                autoComplete="name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor={phoneId}
                className="mb-1 block text-sm font-semibold text-gray-800"
              >
                טלפון
              </label>
              <input
                id={phoneId}
                type="tel"
                name="phone"
                required
                placeholder="05XXXXXXXX"
                autoComplete="tel"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor={attachmentId}
                className="mb-1 block text-sm font-semibold text-gray-800"
              >
                תמונה {isPhotoFlow ? "(חובה)" : "(אופציונלי)"}
              </label>
              <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 pb-6 pt-5 transition-colors hover:border-green-500">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-700">
                    <input
                      id={attachmentId}
                      type="file"
                      name="attachment"
                      accept="image/*"
                      required={isPhotoFlow}
                      className="cursor-pointer font-medium text-green-600 hover:text-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-600">PNG, JPG, GIF עד 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor={messageId}
                className="mb-1 block text-sm font-semibold text-gray-800"
              >
                הודעה (אופציונלי)
              </label>
              <textarea
                id={messageId}
                name="message"
                rows={4}
                placeholder="איך אפשר לעזור?"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
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
