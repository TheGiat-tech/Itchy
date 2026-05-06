"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";

function ContactPageContent() {
  const searchParams = useSearchParams();
  const isPhotoFlow = searchParams.get("type") === "photo";

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

    const formData = new FormData(e.currentTarget);
    
    // הגדרות Web3Forms
    // מומלץ להגדיר את המפתח ב-Vercel תחת NEXT_PUBLIC_WEB3FORMS_KEY
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "c5651e0e-d0c4-4305-bbbd-c1d0da50a3ce";
    formData.append("access_key", accessKey);
    formData.append("subject", isPhotoFlow ? "פנייה חדשה לזיהוי מזיק - איצ׳י" : "פנייה חדשה מצור קשר - איצ׳י");
    formData.append("from_name", "אתר איצ'י");

    try {
      // שליחה ישירה ל-Web3Forms (עוקף את ה-404 של /api/contact)
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
      } else {
        throw new Error(json.message || "שגיאה בשליחה");
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
            {isPhotoFlow ? "שלח תמונה לזיהוי" : "דברו עם איצ׳י"}
          </h1>
          <p className="text-gray-500">
            {isPhotoFlow
              ? "צרפו תמונה ברורה של המזיק ונחזור אליכם עם זיהוי והכוונה בהקדם."
              : "זיהיתם מזיק? יש לכם שאלה? צרו איתנו קשר ונחזור אליכם בהקדם."}
          </p>
        </header>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center" dir="rtl">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-800">הפרטים נשלחו בהצלחה! נחזור אליך בהקדם.</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5" dir="rtl">
            {/* שדה נגד בוטים */}
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

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
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                תמונה {isPhotoFlow ? "(חובה)" : "(אופציונלי)"}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-green-400 transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <input
                      type="file"
                      name="attachment"
                      accept="image/*"
                      required={isPhotoFlow}
                      className="cursor-pointer font-medium text-green-600 hover:text-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF עד 5MB</p>
                </div>
              </div>
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
