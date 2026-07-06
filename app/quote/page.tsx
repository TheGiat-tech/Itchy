"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { submitQuoteRequest } from "@/app/actions/quote";

export default function QuotePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const result = await submitQuoteRequest(formData);

      if (!result.success) {
        setError(result.error ?? "אירעה שגיאה בשליחת הטופס");
        return;
      }

      // Send email notification directly from the client (same as ContactForm)
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
      if (accessKey && result.data) {
        const { pestType, rooms, city, name, phone, message } = result.data;
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: "בקשת הצעת מחיר חדשה - איצ׳י",
            from_name: "אתר איצ'י",
            name,
            phone,
            message: `סוג מזיק: ${pestType}\nגודל הנכס: ${rooms}\nעיר: ${city}${message ? `\n${message}` : ""}`,
          }),
        }).catch((err) => console.error("[quote] Web3Forms error:", err));
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError("אירעה שגיאה בשליחת הטופס");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main dir="rtl" className="flex-1 bg-gradient-to-b from-green-50 via-white to-white">
        <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            קבלת הצעת מחיר ממדביר מוסמך
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            מלאו את הפרטים וקבלו הצעת מחיר מקצועית וללא התחייבות מנציג מוסמך בהקדם.
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-4 pb-16">
          <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-green-800 font-semibold text-center">
                ✅ פנייתך התקבלה! נציג יחזור אליך בהקדם
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="pestType" className="block text-sm font-semibold text-gray-700 mb-2">
                    סוג מזיק
                  </label>
                  <select
                    id="pestType"
                    name="pestType"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">בחרו סוג מזיק</option>
                    <option value="ג׳וקים">ג׳וקים</option>
                    <option value="נמלים">נמלים</option>
                    <option value="מכרסמים">מכרסמים</option>
                    <option value="פשפשי מיטה">פשפשי מיטה</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="rooms" className="block text-sm font-semibold text-gray-700 mb-2">
                    גודל הנכס
                  </label>
                  <select
                    id="rooms"
                    name="rooms"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">בחרו אפשרות</option>
                    <option value="1-2 חדרים">1-2 חדרים</option>
                    <option value="3-4 חדרים">3-4 חדרים</option>
                    <option value="5+ חדרים">5+ חדרים</option>
                    <option value="בית פרטי">בית פרטי</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    עיר/יישוב
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="לדוגמה: תל אביב"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    שם מלא
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="ישראל ישראלי"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    טלפון
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    dir="ltr"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="05XXXXXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    פרטים נוספים
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="תארו בקצרה את הבעיה או פרטים חשובים נוספים"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-green-600 text-white font-bold py-3.5 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? "שולח..." : "שליחת בקשה להצעת מחיר"}
                </button>

                <aside
                  role="note"
                  aria-label="הבהרה משפטית לגבי השירות"
                  className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"
                >
                  הבהרה: אתר איצ׳י (Itchi) משמש כפלטפורמה לשיתוף מידע בלבד. הצעות המחיר והשירותים
                  ניתנים על ידי ספקי שירות חיצוניים (צד שלישי). האתר אינו נושא באחריות לטיב
                  השירות, למחיר או לתוצאות ההדברה.
                </aside>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
