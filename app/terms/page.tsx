import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description: "תנאי השימוש של אתר איצ׳י – הצהרת אי-אחריות, קניין רוחני וסמכות שיפוט.",
};

export default function TermsPage() {
  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">תנאי שימוש</h1>
        <p className="text-sm text-gray-500 mb-8">עדכון אחרון: מאי 2026</p>

        <div className="prose prose-lg prose-green text-right space-y-6" dir="rtl">
          <p>
            השימוש באתר איצ׳י (להלן: &quot;האתר&quot;) כפוף לתנאים המפורטים להלן.
            גלישה באתר מהווה הסכמה לתנאים אלו.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-800">
              א. הצהרת אי-אחריות (Disclaimer) – חשוב ביותר
            </h2>
            <p>
              התוכן המופיע באתר איצ׳י נועד למטרות אינפורמטיביות ולימודיות בלבד. המידע
              אינו מהווה ייעוץ מקצועי, חוות דעת משפטית או תחליף לשירותיו של מדביר
              מוסמך ובעל רישיון בתוקף.
            </p>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>
                השימוש במידע, בשיטות ההדברה העצמית או בחומרים המוזכרים באתר הוא על
                אחריות המשתמש בלבד.
              </li>
              <li>
                בעלי האתר אינם נושאים באחריות לכל נזק, ישיר או עקיף, שייגרם כתוצאה
                מהסתמכות על המידע באתר.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">ב. מהות השירות</h2>
            <p>
              איצ׳י הוא אתר תוכן ומידע העוסק בתחום המזיקים וההדברה.
            </p>
            <ul className="list-disc list-inside space-y-1 pr-4">
              <li>האתר הנו אתר אינטרנט ואינו אפליקציה לטלפונים חכמים.</li>
              <li>
                האתר אינו כולל פיצ&#39;ר של סורק ויזואלי (Visual Scanner) לזיהוי מזיקים;
                זיהוי המזיקים מתבצע על בסיס השוואה למדריכי התוכן והתמונות הקיימים בו.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">ג. קניין רוחני</h2>
            <p>
              כל התוכן באתר, לרבות מאמרים, מדריכים, לוגו ותמונות, שייך לאיצ׳י ומוגן
              בזכויות יוצרים. אין להעתיק, להפיץ או להשתמש בתוכן האתר ללא אישור מראש
              ובכתב.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">ד. סמכות שיפוט</h2>
            <p>
              על תנאי שימוש אלו יחולו חוקי מדינת ישראל. סמכות השיפוט הבלעדית בכל
              הקשור לאתר תהיה לבתי המשפט המוסמכים במחוז תל אביב-יפו.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
