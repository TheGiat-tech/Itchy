import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "הצהרת נגישות | איצ'י",
  description:
    "הצהרת הנגישות של אתר איצ'י, פירוט התאמות נגישות ודרכי פנייה בנושא נגישות.",
};

export default function AccessibilityPage() {
  return (
    <>
      <main
        id="main-content"
        className="flex-1 w-full max-w-4xl mx-auto px-4 py-12"
        dir="rtl"
      >
        <header className="mb-10">
          <h1 className="mb-2 text-4xl font-extrabold text-gray-900">
            הצהרת נגישות
          </h1>
          <p className="text-sm text-gray-600">עדכון אחרון: מאי 2026</p>
        </header>

        <div className="prose prose-lg prose-green max-w-none text-right text-gray-800 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">מהו האתר</h2>
            <p>
              איצ&apos;י הוא אתר תוכן והכוונה בתחום המזיקים, ההדברה והמניעה, המפרסם
              מידע מקצועי ומאפשר לגולשים להשאיר פרטים לצורך קבלת הצעות מבעלי
              מקצוע חיצוניים. האתר פועל בעברית, מותאם ל-RTL ומיועד לשימוש נוח
              במגוון מכשירים.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">מחויבות לנגישות</h2>
            <p>
              אנו רואים חשיבות רבה בהנגשת האתר לכלל הציבור ופועלים לקידום חוויית
              שימוש נגישה, מכבדת ושוויונית ככל האפשר. ההתאמות באתר מבוצעות מתוך
              שאיפה להתקרב לדרישות תקן ישראלי 5568 ולעקרונות WCAG ברמת AA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              התאמות נגישות שיושמו באתר
            </h2>
            <ul className="list-disc space-y-2 pr-6">
              <li>מבנה סמנטי ברור עם כותרות, אזורי תוכן ראשי, ניווט ו-footer.</li>
              <li>קישור &quot;דלג לתוכן הראשי&quot; לשיפור הניווט באמצעות מקלדת.</li>
              <li>התאמה לניווט מקלדת, מצבי פוקוס גלויים ורכיבים אינטראקטיביים נגישים יותר.</li>
              <li>מאמצי תאימות לקוראי מסך באמצעות סימון כותרות, תוויות וטקסטים חלופיים.</li>
              <li>טפסים עם שדות מזוהים, תוויות קריאות והודעות שגיאה נגישות יותר.</li>
              <li>שמירה על תמיכה במובייל, טאבלט, דסקטופ והגדלת תצוגה בדפדפן.</li>
              <li>שיפור קריאות הטיפוגרפיה, הניגודיות והימנעות מטקסטים חלשים בתוכן חשוב.</li>
              <li>שימוש בטקסט חלופי לתמונות ככל האפשר ובמבנה תוכן היררכי.</li>
              <li>התחשבות בהעדפות להפחתת תנועה בממשק.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              תאימות ותחזוקה שוטפת
            </h2>
            <p>
              האתר נבדק ונבחן בדפדפנים נפוצים כגון Chrome, Safari, Firefox ו-Edge,
              ובמגוון גדלי מסך. אנו ממשיכים לשפר את נגישות האתר באופן שוטף,
              לרבות התאמות לקוראי מסך, שיפור טפסים, מבנה תוכן, ניווט מקלדת
              והתנהגות רכיבים דינמיים.
            </p>
            <p>
              למרות מאמצינו, ייתכן שחלקים מסוימים באתר עדיין דורשים שיפור או
              התאמה נוספת. האתר נמצא בתהליך שיפור מתמיד של נגישות. אם נתקלתם
              בבעיה, נשמח שתפנו אלינו דרך עמוד יצירת הקשר.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">פנייה בנושא נגישות</h2>
            <p>
              אם נתקלתם בקושי בגלישה, בתוכן שאינו נגיש מספיק, בטופס שאינו פועל
              כראוי או בכל בעיית נגישות אחרת, נשמח לקבל משוב ולפעול לתיקון בהקדם.
            </p>
            <ul className="list-disc space-y-2 pr-6">
              <li>
                דוא&quot;ל:{" "}
                <a href="mailto:info@itchy.blog">info@itchy.blog</a>
              </li>
              <li>
                עמוד יצירת קשר: <Link href="/contact">/contact</Link>
              </li>
            </ul>
            <p>
              האתר נמצא בתהליך שיפור מתמיד של נגישות. אם נתקלתם בבעיה, נשמח
              שתפנו אלינו דרך עמוד יצירת הקשר.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
