"use client";

import { useId, useState } from "react";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "נא להזין שם מלא.";
    if (!/^0\d{8,9}$/.test(phone.trim())) errors.phone = "נא להזין מספר טלפון תקין.";
    if (!city.trim()) errors.city = "נא להזין עיר.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
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
        <div className="text-4xl mb-3" aria-hidden="true">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          הפרטים נשלחו בהצלחה לחברות הדברה מורשות! נחזור אליך בהקדם.
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
          <label htmlFor={`${formId}-name`} className="sr-only">שם מלא</label>
          <input
            id={`${formId}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם מלא"
            required
            aria-required="true"
            aria-invalid={fieldErrors.name ? "true" : "false"}
            aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 bg-white text-right"
            dir="rtl"
          />
          <label htmlFor={`${formId}-phone`} className="sr-only">מספר טלפון</label>
          <input
            id={`${formId}-phone`}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="טלפון"
            required
            aria-required="true"
            aria-invalid={fieldErrors.phone ? "true" : "false"}
            aria-describedby={fieldErrors.phone ? `${formId}-phone-error` : undefined}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 bg-white text-right"
            dir="ltr"
          />
          <label htmlFor={`${formId}-city`} className="sr-only">עיר</label>
          <input
            id={`${formId}-city`}
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="עיר"
            required
            aria-required="true"
            aria-invalid={fieldErrors.city ? "true" : "false"}
            aria-describedby={fieldErrors.city ? `${formId}-city-error` : undefined}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 bg-white text-right"
            dir="rtl"
          />
        </div>
        {(fieldErrors.name || fieldErrors.phone || fieldErrors.city) && (
          <div className="space-y-1">
            {fieldErrors.name && <p id={`${formId}-name-error`} className="text-red-700 text-sm">{fieldErrors.name}</p>}
            {fieldErrors.phone && <p id={`${formId}-phone-error`} className="text-red-700 text-sm">{fieldErrors.phone}</p>}
            {fieldErrors.city && <p id={`${formId}-city-error`} className="text-red-700 text-sm">{fieldErrors.city}</p>}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:self-start px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          aria-label="שלח פנייה"
        >
          {loading ? "שולח..." : "שלח בקשת ייעוץ חינם"}
        </button>
      </form>
    </div>
  );
}
