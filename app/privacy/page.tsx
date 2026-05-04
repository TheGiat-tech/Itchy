import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של אתר איצ׳י – כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">מדיניות פרטיות</h1>
        <p className="text-sm text-gray-500 mb-8">עדכון אחרון: מאי 2026</p>

        <div className="prose prose-lg prose-green text-right space-y-6" dir="rtl">
          <p>
            ברוכים הבאים לאתר איצ׳י (<strong>itchy.blog</strong>). אנו מכבדים את פרטיותכם
            ומחויבים להגן על המידע האישי שלכם. מדיניות זו מסבירה כיצד אנו אוספים,
            משתמשים ומגנים על המידע בעת השימוש באתר.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-800">א. איסוף מידע</h2>
            <p>אנו אוספים מידע מינימלי הנדרש לצורך שיפור חוויית המשתמש, הכולל:</p>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>מידע שנמסר מרצון דרך טפסי יצירת קשר (כגון שם וכתובת אימייל).</li>
              <li>
                מידע טכני הנאסף אוטומטית (כתובת IP, סוג דפדפן, וזמן שהייה באתר).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">ב. שימוש בעוגיות (Cookies) ופרסומות</h2>
            <p>
              האתר משתמש בעוגיות (Cookies) לצורך ניתוח תנועת גולשים (Google Analytics)
              והצגת פרסומות מותאמות אישית דרך Google AdSense.
            </p>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>
                צדדים שלישיים, כולל גוגל, משתמשים בעוגיות כדי להציג מודעות המבוססות
                על ביקוריכם הקודמים באתר.
              </li>
              <li>
                באפשרותכם לבטל את השימוש בפרסום מותאם אישית דרך{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline"
                >
                  הגדרות המודעות של גוגל
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">
              ג. גילוי נאות לשירותי צד שלישי (Affiliate Disclosure)
            </h2>
            <p>
              האתר עשוי לכלול קישורי שותפים (Affiliate Links). המשמעות היא שאנו עשויים
              לקבל עמלה במידה ותבצעו רכישה או הרשמה לשירותים דרך קישורים אלו (לדוגמה:
              Vetster, Amazon). העמלה אינה מייקרת את השירות עבורכם ותומכת בהמשך
              הפעילות של האתר.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">ד. אבטחת מידע</h2>
            <p>
              אנו מפעילים אמצעי אבטחה טכנולוגיים וארגוניים כדי למנוע אובדן, שימוש לרעה
              או שינוי של המידע האישי שלכם.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
