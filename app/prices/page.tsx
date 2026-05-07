import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "מחירון הדברה | איצ'י",
  description:
    "מחירון הדברה לדירות 3–5 חדרים: ג'וקים, נמלים, מכרסמים, פרעושים, טרמיטים, יונים ומעופפים. המחירים משוערים ונקבעים לפי אבחון.",
};

const PRICE_ITEMS = [
  {
    pest: "ג'וקים",
    rooms3: "300–400 ₪",
    rooms4: "350–450 ₪",
    rooms5: "400–500 ₪",
    note: "כולל טיפול בדירה לפי רמת הנגיעות",
  },
  {
    pest: "נמלים",
    rooms3: "280–380 ₪",
    rooms4: "330–430 ₪",
    rooms5: "380–480 ₪",
    note: "ריסוס או ג'ל לפי סוג הנמלה",
  },
  {
    pest: "ג'וקים + נמלים",
    rooms3: "330–430 ₪",
    rooms4: "380–480 ₪",
    rooms5: "430–550 ₪",
    note: "טיפול משולב",
  },
  {
    pest: "פרעושים / קרציות",
    rooms3: "350–500 ₪",
    rooms4: "400–550 ₪",
    rooms5: "500–700 ₪",
    note: "תלוי בבעלי חיים, חצר ורמת נגיעות",
  },
  {
    pest: "פשפש המיטה",
    rooms3: "לפי אבחון",
    rooms4: "לפי אבחון",
    rooms5: "לפי אבחון",
    note: "לפי מספר חדרים נגועים ורמת הנגיעות",
  },
  {
    pest: "טרמיטים",
    rooms3: "לפי הצעת מחיר",
    rooms4: "לפי הצעת מחיר",
    rooms5: "לפי הצעת מחיר",
    note: "לאחר בדיקה בשטח בלבד",
  },
  {
    pest: "עכברים / חולדות",
    rooms3: "400–650 ₪",
    rooms4: "450–750 ₪",
    rooms5: "550–900 ₪",
    note: "לפי מוקדים, גישה ומספר ביקורים",
  },
  {
    pest: "תיקנים בביוב",
    rooms3: "300–400 ₪",
    rooms4: "350–450 ₪",
    rooms5: "400–550 ₪",
    note: "לפי מספר בורות ביוב",
  },
  {
    pest: "יונים",
    rooms3: "לפי שעת עבודה",
    rooms4: "לפי שעת עבודה",
    rooms5: "לפי שעת עבודה",
    note: "רשתות, דוקרנים, ניקוי וגישה",
  },
  {
    pest: "זבובים",
    rooms3: "400–550 ₪",
    rooms4: "450–650 ₪",
    rooms5: "550–750 ₪",
    note: "אין אחריות על מעופפים",
  },
  {
    pest: "יתושים",
    rooms3: "300–500 ₪",
    rooms4: "350–600 ₪",
    rooms5: "400–700 ₪",
    note: "אין אחריות על מעופפים",
  },
  {
    pest: "צרעות / דבורים",
    rooms3: "350–700 ₪",
    rooms4: "400–800 ₪",
    rooms5: "500–1,000 ₪",
    note: "לפי גובה, גישה וסוג הקן",
  },
];

export default function PricesPage() {
  return (
    <>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            מחירון הדברה
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            המחירים משתנים לפי סוג המזיק, גודל הדירה, רמת הנגיעות, גישה
            למוקדי ההדברה, צורך בטיפול חוזר, חצר, מרפסת, בורות ביוב או עבודה
            בגובה.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-green-50 text-gray-800">
                <tr>
                  <th className="px-5 py-4 text-right font-bold">סוג המזיק</th>
                  <th className="px-5 py-4 text-right font-bold">דירת 3 חדרים</th>
                  <th className="px-5 py-4 text-right font-bold">דירת 4 חדרים</th>
                  <th className="px-5 py-4 text-right font-bold">דירת 5 חדרים</th>
                  <th className="px-5 py-4 text-right font-bold">הערה</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_ITEMS.map((item, idx) => (
                  <tr
                    key={item.pest}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {item.pest}
                    </td>
                    <td className="px-5 py-4 text-green-700 font-semibold whitespace-nowrap">
                      {item.rooms3}
                    </td>
                    <td className="px-5 py-4 text-green-700 font-semibold whitespace-nowrap">
                      {item.rooms4}
                    </td>
                    <td className="px-5 py-4 text-green-700 font-semibold whitespace-nowrap">
                      {item.rooms5}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900 mb-3">חשוב לדעת</h2>
          <p>
            המחירון מציג טווחים ממוצעים בלבד ואינו מהווה הצעת מחיר סופית.
            במקרים מורכבים כמו טרמיטים, פשפש המיטה, יונים, מכרסמים או נגיעות
            חריגה — המחיר ייקבע לאחר אבחון.
          </p>
          <p className="mt-3">
            אין אחריות על מעופפים כגון זבובים, יתושים ודבורים, משום שהם יכולים
            להיכנס מחדש מבחוץ לאחר הטיפול.
          </p>
          <p className="mt-3">
            הרחקת יונים מתומחרת לפי שעת עבודה, סוג הפתרון והגישה למקום. טיפול
            בטרמיטים ניתן לפי הצעת מחיר לאחר בדיקה בשטח.
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
          * כל המחירים משוערים בלבד. המחיר הסופי נקבע לפי בדיקה מקצועית, סוג
          הנכס, רמת הנגיעות, תנאי הגישה והיקף העבודה. כל המחירים כוללים מע&quot;מ,
          אלא אם צוין אחרת.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-gray-600 text-lg font-medium">
            רוצים הצעת מחיר מדויקת? דברו איתנו עכשיו.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            📞 צור קשר לקבלת הצעת מחיר
          </Link>
        </div>
      </main>
      <Footer />
    </<div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-gray-700 leading-relaxed">
  <h2 className="text-xl font-bold text-gray-900 mb-3">
    חשוב לדעת
  </h2>

  <p>
    המחירון מציג טווחי מחירים ממוצעים בלבד ואינו מהווה הצעת מחיר
    מחייבת. המחיר הסופי נקבע בהתאם לסוג המזיק, רמת הנגיעות,
    גודל הנכס, תנאי הגישה והיקף העבודה בפועל.
  </p>

  <p className="mt-3">
    במקרים מורכבים כגון טרמיטים, פשפש המיטה, יונים, מכרסמים
    או נגיעות חריגה — המחיר ייקבע לאחר אבחון מקצועי.
  </p>

  <p className="mt-3">
    אין אחריות על מעופפים כגון זבובים, יתושים ודבורים,
    משום שהם יכולים להיכנס מחדש מבחוץ לאחר הטיפול.
  </p>

  <p className="mt-3">
    הרחקת יונים מתומחרת לפי שעת עבודה, סוג הפתרון,
    תנאי הגישה והיקף ההתקנה.
  </p>

  <p className="mt-3">
    אתר איצ&apos;י הינו פלטפורמה להנגשת מידע, השוואת מחירים
    וחיבור בין גולשים לבין מדבירים ובעלי מקצוע חיצוניים.
    האתר אינו מספק שירותי הדברה בעצמו ואינו מבצע עבודות
    הדברה בפועל.
  </p>

  <p className="mt-3">
    בעת השארת פרטים באתר, ייתכן שהפרטים יועברו למדבירים,
    חברות הדברה או בעלי מקצוע צד ג&apos; לצורך יצירת קשר
    ומתן הצעת מחיר.
  </p>

  <p className="mt-3">
    ההתקשרות, השירות, האחריות, התמחור, איכות העבודה,
    השימוש בחומרים, העמידה בדרישות החוק ורישיון ההדברה —
    הינם באחריותו הבלעדית של בעל המקצוע המבצע בלבד.
  </p>

  <p className="mt-3">
    אתר איצ&apos;י, בעליו ומפעיליו אינם צד להסכם בין הלקוח
    לבין המדביר או בעל המקצוע, ולא יישאו באחריות לכל נזק,
    הפסד, טיפול לקוי, שימוש בחומרים, עיכוב, רשלנות או
    מחלוקת מכל סוג הקשורה לשירות שסופק על ידי צד שלישי.
  </p>
</div>
  );
}
