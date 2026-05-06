'use client';

import { useState, useEffect } from 'react';

export default function ContactForm() {
  const [isMounted, setIsMounted] = useState(false);
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // פתרון לשגיאת Hydration #418 - מבטיח רינדור רק בדפדפן
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const onSubmit = async (event: any) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("שולח פנייה למערכת...");

    const formData = new FormData(event.target);
    
    // מפתח גיבוי למקרה שמשתנה הסביבה לא נטען
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "c5651e0e-d0c4-4305-bbbd-c1d0da50a3ce";
    formData.append("access_key", accessKey);
    formData.append("subject", "פנייה חדשה לזיהוי מזיק - איצ׳י");

    try {
      // פנייה ישירה ל-Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("✅ הפנייה נשלחה בהצלחה!");
        event.target.reset();
      } else {
        setResult("❌ שגיאה: וודא שהמפתח ב-Vercel מעודכן.");
      }
    } catch (error) {
      setResult("❌ שגיאת תקשורת.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100" dir="rtl">
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
        <input type="text" name="name" placeholder="שם מלא" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="email" name="email" placeholder="אימייל" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          <input type="tel" name="phone" placeholder="טלפון" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <textarea name="message" placeholder="איך אפשר לעזור?" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"></textarea>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
          <label className="block text-sm font-bold text-green-800 mb-2">📸 צרף תמונה לזיהוי המזיק</label>
          <input type="file" name="attachment" accept="image/*" className="text-sm" />
        </div>

        <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
          {isSubmitting ? 'שולח...' : 'שלח לזיהוי וייעוץ'}
        </button>
        {result && <p className="text-center mt-4 font-medium">{result}</p>}
      </form>
    </div>
  );
}
