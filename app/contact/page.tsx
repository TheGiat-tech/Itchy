"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "שגיאה בשליחה");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">צור קשר</h1>
        <p className="text-gray-500 mb-8">
          שאלה? שגיאה? רוצה לשלוח תמונה לזיהוי? אנחנו כאן.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center" dir="rtl">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              הפרטים נשלחו בהצלחה לצוות המדבירים! נחזור אליך בהקדם.
            </h2>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm" dir="rtl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                שם מלא
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="ישראל ישראלי"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                טלפון
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="05X-XXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                הודעה
              </label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="תאר את הבעיה שלך, את המזיק שראית, או שאל שאלה..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none resize-none text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                📸 תמונה לזיהוי (אופציונלי)
              </label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 file:ml-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                תמונה ברורה תעזור לנו לזהות את המזיק בצורה מדויקת יותר.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "שולח..." : "שלח הודעה"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
