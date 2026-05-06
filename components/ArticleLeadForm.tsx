"use client";

import { useState } from "react";

interface ArticleLeadFormProps {
  pestName: string;
}

export default function ArticleLeadForm({ pestName }: ArticleLeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message: `עיר: ${city}`, pestType: pestName }),
      });
      if (!res.ok) {
        console.error("contact API error, status:", res.status);
        let errorMsg = "שגיאה בשליחה";
        try {
          const json = await res.json();
          errorMsg = json.message || errorMsg;
        } catch {
          // response was not JSON (e.g. HTML error page)
        }
        throw new Error(errorMsg);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="mt-12 bg-green-50 border border-green-100 rounded-2xl p-6 text-center"
        dir="rtl"
      >
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          הפרטים נשלחו בהצלחה לצוות המדבירים! נחזור אליך בהקדם.
        </h3>
      </div>
    );
  }

  return (
    <div
      className="mt-12 bg-amber-50 border border-amber-100 rounded-2xl p-6"
      dir="rtl"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        צריכים עזרה עם {pestName}?
      </h3>
      <p className="text-sm text-gray-600 mb-5">
        השאירו פרטים ומדביר מוסמך מהאזור שלך ייצור איתך קשר – ללא עלות וללא
        התחייבות.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם מלא"
            required
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none bg-white text-right"
            dir="rtl"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="טלפון"
            required
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none bg-white text-right"
            dir="ltr"
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="עיר"
            required
            className="px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none bg-white text-right"
            dir="rtl"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:self-start px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-sm text-base"
        >
          {loading ? "שולח..." : "שלח בקשת ייעוץ חינם"}
        </button>
      </form>
    </div>
  );
}
