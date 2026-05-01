"use client";

import { useState } from "react";

interface ArticleLeadFormProps {
  pestName: string;
}

export default function ArticleLeadForm({ pestName }: ArticleLeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with your backend/CRM endpoint (e.g. POST /api/leads)
    // e.g.: fetch("/api/leads", { method: "POST", body: JSON.stringify({ name, phone, city, pestName }) })
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="mt-12 bg-green-50 border border-green-100 rounded-2xl p-6 text-center"
        dir="rtl"
      >
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          תודה! קיבלנו את פנייתך.
        </h3>
        <p className="text-gray-600 text-sm">
          מדביר מוסמך מהאזור שלך ייצור איתך קשר בהקדם.
        </p>
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

        <button
          type="submit"
          className="w-full sm:w-auto sm:self-start px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm text-base"
        >
          שלח בקשת ייעוץ חינם
        </button>
      </form>
    </div>
  );
}
