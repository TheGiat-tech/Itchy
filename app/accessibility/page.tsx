import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "הצהרת נגישות | איצ'י",
  description:
    "הצהרת הנגישות של איצ'י בהתאם לתקן ישראלי 5568 ברמה AA ולעקרונות WCAG 2.1.",
};

export default function AccessibilityPage() {
  return (
    <>
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full" dir="rtl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">הצהרת נגישות</h1>
        <p className="text-sm text-gray-600 mb-8">עדכון אחרון: מאי 2026</p>

        <div className="prose prose-lg prose-green max-w-none text-right leading-relaxed space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">מחויבות לנגישות</h2>
            <p>
              אתר איצ&apos;י (itchy.blog) מחויב להנגשת השירותים הדיגיטליים לציבור הרחב, לרבות
              אנשים עם מוגבלות. אנו פועלים ליישום דרישות תקן ישראלי 5568 ברמה AA ובהתאם
              לעקרונות WCAG 2.1.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">התאמות נגישות שיושמו באתר</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>ניווט מלא באמצעות מקלדת, כולל תמיכה ב-Escape לסגירת תפריטים וחלונות.</li>
              <li>תמיכה בקוראי מסך בעברית באמצעות מבנה סמנטי תקין, כותרות היררכיות וקישורי דילוג.</li>
              <li>שימוש בניגודיות צבעים משופרת לטקסט קריא ובהתאם ליעד AA.</li>
              <li>שדות טפסים עם תוויות, הודעות שגיאה מקושרות ותכונות ARIA רלוונטיות.</li>
              <li>ניהול פוקוס ברור ומובחן ברכיבים אינטראקטיביים בכל האתר.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">תאימות דפדפנים ומכשירים</h2>
            <p>
              האתר נבדק ומותאם לשימוש בדפדפנים נפוצים ועדכניים, לרבות Chrome, Firefox,
              Safari ו-Edge, וכן במכשירים ניידים ושולחניים. מומלץ להשתמש בגרסאות עדכניות
              של הדפדפנים לקבלת חוויית נגישות מיטבית.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">רכז נגישות</h2>
            <p>
              לצורך פניות בנושא נגישות ניתן ליצור קשר עם רכז הנגישות:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>שם: נועם (Noam)</li>
              <li>
                דוא&quot;ל:{" "}
                <a href="mailto:info@itchy.blog" className="text-green-700 hover:underline">
                  info@itchy.blog
                </a>
              </li>
              <li>
                עמוד יצירת קשר:{" "}
                <Link href="/contact" className="text-green-700 hover:underline">
                  /contact
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">הערות ושיפור מתמיד</h2>
            <p>
              על אף המאמצים הרבים, ייתכן שחלקים דינמיים או רכיבי צד שלישי באתר עדיין
              ידרשו שיפור נגישות נוסף. אם נתקלתם בקושי או בתקלה, נשמח לקבל דיווח כדי
              לטפל בכך בהקדם.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
