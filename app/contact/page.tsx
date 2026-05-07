"use client";

import { Suspense, useState, useEffect } from "react";
import Footer from "@/components/Footer";

function ContactPageContent() {
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // פתרון לשגיאת Hydration #418 - מבטיח שהטופס ירונדר רק בדפדפן
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

    if (!accessKey) {
      setError("שגיאת הגדרות: חסר מפתח Web3Forms");
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
      setError(err instanceof Error ? err.message : "שגיאה בתקשורת, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <header className="mb-8" dir="rtl">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            דברו עם איצ׳י
          </h1>
          <p className="text-gray-500">
            זיהיתם מזיק? יש לכם שאלה? צרו איתנו קשר ונחזור אליכם בהקדם.
          </p>
        </header>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center" dir="rtl">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-800">הפרטים נשלחו בהצלחה! נחזור אליך בהקדם.</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5" dir="rtl">
            <input type="checkbox" name="botcheck" className="hidden" />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">שם מלא</label>
              <input
                type="text"
                name="name"
                required
                placeholder="ישראל ישראלי"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">טלפון</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="05XXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">הודעה (אופציונלי)</label>
              <textarea
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
