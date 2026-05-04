import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של אתר איצ׳י – כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלכם.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">מדיניות פרטיות</h1>
        <p className="text-sm text-gray-500 mb-8">עדכון אחרון: מאי 2026</p>

        <div className="prose prose-lg prose-green text-right" dir="rtl">
          <p>
            ברוכים הבאים לאתר <strong>איצ׳י</strong> (<strong>itchy.blog</strong>). אנו מכבדים את
            פרטיותכם ומחויבים להגן על המידע האישי שלכם. מדיניות זו מסבירה כיצד אנו אוספים,
            משתמשים ומגנים על המידע בעת השימוש באתר.
          </p>

          <h2>א. איסוף מידע</h2>
          <p>אנו אוספים מידע מינימלי הנדרש לצורך שיפור חוויית המשתמש, הכולל:</p>
          <ul>
            <li>מידע שנמסר מרצון דרך טפסי יצירת קשר (כגון שם וכתובת אימייל).</li>
            <li>מידע טכני הנאסף אוטומטית (כתובת IP, סוג דפדפן, וזמן שהייה באתר).</li>
          </ul>

          <h2>ב. שימוש בעוגיות (Cookies) ופרסומות</h2>
          <p>
            האתר משתמש בעוגיות (Cookies) לצורך ניתוח תנועת גולשים (Google Analytics) והצגת
            פרסומות מותאמות אישית דרך <strong>Google AdSense</strong>.
          </p>
          <ul>
            <li>
              צדדים שלישיים, כולל גוגל, משתמשים בעוגיות כדי להציג מודעות המבוססות על ביקוריכם
              הקודמים באתר.
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

          <h2>ג. גילוי נאות לשירותי צד שלישי (Affiliate Disclosure)</h2>
          <p>
            האתר עשוי לכלול קישורי שותפים (Affiliate Links). המשמעות היא שאנו עשויים לקבל עמלה
            במידה ותבצעו רכישה או הרשמה לשירותים דרך קישורים אלו (לדוגמה: <strong>Vetster</strong>
            , <strong>Amazon</strong>). העמלה אינה מייקרת את השירות עבורכם ותומכת בהמשך הפעילות
            של האתר.
          </p>

          <h2>ד. אבטחת מידע</h2>
          <p>
            אנו מפעילים אמצעי אבטחה טכנולוגיים וארגוניים כדי למנוע אובדן, שימוש לרעה או שינוי
            של המידע האישי שלכם.
          </p>

          <p>
            לשאלות בנושא מדיניות פרטיות, אנא{" "}
            <Link href="/contact" className="text-green-700 hover:underline">
              צרו קשר
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
