'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("שולח פנייה...");

    const formData = new FormData(event.target);

    // הגדרת נושא המייל שיגיע אליך
    formData.append("subject", "פנייה חדשה מאתר איצ׳י");
    
    // שימוש במשתנה סביבה (מומלץ מאוד ב-Vercel)
    // אם לא הגדרת, הקוד ישתמש במפתח שכתבת כברירת מחדל
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "c5651e0e-d0c4-4305-bbbd-c1d0da50a3ce";
    formData.append("access_key", accessKey);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("הפנייה נשלחה בהצלחה! נחזור אליך בקרוב.");
        event.target.reset();
      } else {
        setResult("אופס! הייתה שגיאה בשליחה. נסה שוב.");
      }
    } catch (error) {
      setResult("שגיאת תקשורת. בדוק את החיבור לאינטרנט.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-wrapper" style={{ direction: 'rtl', maxWidth: '400px', margin: '0 auto' }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* שדה Honeypot - בוטים ימלאו אותו והודעתם תיחסם, בני אדם לא רואים אותו */}
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

        <input 
          type="text" 
          name="name" 
          placeholder="שם מלא" 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="אימייל לחזרה" 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <textarea 
          name="message" 
          placeholder="איך אפשר לעזור?" 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
        ></textarea>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: isSubmitting ? '#ccc' : '#2563eb', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            border: 'none'
          }}
        >
          {isSubmitting ? 'שולח...' : 'שלח הודעה'}
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>{result}</p>
      </form>
    </div>
  );
}
