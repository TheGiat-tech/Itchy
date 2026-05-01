import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אודות",
  description: "מי אנחנו, למה הקמנו את Itchy ומה המטרה שלנו.",
};

export default function AboutPage() {
  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          אודות Itchy
        </h1>
        <div className="prose prose-lg prose-green text-right" dir="rtl">
          <p>
            <strong>Itchy</strong> היא אנציקלופדיית המזיקים הדיגיטלית של
            ישראל. הפרויקט נולד מתוך צורך אמיתי – כשנתקלים במזיק בבית, לא
            תמיד קל למצוא מידע מהימן, מדויק ובעברית.
          </p>
          <p>
            המטרה שלנו היא לספק לכל ישראלי גישה נוחה למידע מקצועי על כל מזיק:
            זיהוי, מחזור חיים, בית גידול, נזקים אפשריים ודרכי מניעה.
          </p>
          <h2>המידע שלנו</h2>
          <p>
            המאגר שלנו נבנה ומתוחזק על ידי אנשי מקצוע בתחום ההדברה. כל ערך
            עובר בדיקה לפני פרסום. אם מצאת שגיאה – אנחנו מעריכים אם תדווח לנו
            דרך טופס{" "}
            <Link href="/contact?type=error" className="text-green-700 hover:underline">
              יצירת הקשר
            </Link>
            .
          </p>
          <h2>השתתפות הקהילה</h2>
          <p>
            אנו מאמינים בכוח הקהילה. תמונות שתשלחו מהשטח עוזרות לשפר את
            האנציקלופדיה ולסייע לאחרים לזהות מזיקים.{" "}
            <Link href="/contact?type=photo" className="text-green-700 hover:underline">
              שלח תמונה עכשיו →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
