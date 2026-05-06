'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: any) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("שולח פנייה למערכת...");

    const formData = new FormData(event.target);

    // הגדרות Web3Forms
    formData.append("subject", "פנייה חדשה לזיהוי מזיק - איצ׳י");
    
  formData.append("from_name", "אתר איצ'י");
    
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("הפנייה נשלחה בהצלחה! נחזור אליך בהקדם.");
        event.target.reset();
      } else {
        setResult("אופס! הייתה שגיאה בשליחה. ניתן לשלוח גם בוואטסאפ.");
      }
    } catch (error) {
      setResult("שגיאת תקשורת. בדוק את החיבור לאינטרנט.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100" dir="rtl">
      <form onSubmit={onSubmit} className="space-y-4">
        
        {/* Anti-Spam Honeypot */}
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
          <input 
            type="text" 
            name="name" 
            placeholder="איך קוראים לך?" 
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input 
              type="email" 
              name="email" 
              placeholder="email@example.com" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="05X-XXXXXXX" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מה הבעיה? (סוג המזיק, מיקום וכו')</label>
          <textarea 
            name="message" 
            placeholder="תאר לנו בקצרה מה מצאת..." 
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all min-h-[100px]"
          ></textarea>
        </div>

        {/* שדה העלאת תמונה */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <label className="block text-sm font-bold text-green-800 mb-2">📸 צרף תמונה לזיהוי המזיק</label>
          <input 
            type="file" 
            name="attachment" 
            accept="image/*" 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor:pointer"
          />
          <p className="mt-2 text-xs text-green-700 italic">מומלץ לצלם מקרוב ובאור טוב לזיהוי מדויק</p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:transform active:scale-95'
          }`}
        >
          {isSubmitting ? 'שולח פנייה...' : 'שלח לזיהוי וייעוץ'}
        </button>
        
        {result && (
          <p className={`text-center font-medium mt-4 ${result.includes('הצלחה') ? 'text-green-600' : 'text-red-600'}`}>
            {result}
          </p>
        )}
      </form>
    </div>
  );
}
