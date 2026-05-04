import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "מחירון הדברה נפוץ | איצ'י",
  description:
    "מחירון הדברה מעודכן: תיקנים, נמלים, נמלת האש, חולדות, פינוי פגרים ועוד. שקיפות מלאה ומחירים הוגנים.",
};

const PRICE_ITEMS = [
  {
    category: "מזיקים נפוצים",
    icon: "🪲",
    items: [
      { service: "טיפול בג'וקים (דירה)", price: "החל מ-₪250" },
      { service: "טיפול בנמלים", price: "החל מ-₪250" },
      { service: "טיפול בנמלת האש", price: "החל מ-₪350" },
      { service: "טיפול בכיני יונים (ריסוס)", price: "החל מ-₪280" },
    ],
  },
  {
    category: "מכרסמים",
    icon: "🐀",
    items: [
      { service: "הדברת עכברים (דירה)", price: "החל מ-₪300" },
      { service: "הדברת חולדות", price: "החל מ-₪400" },
      { service: "מניעה ואטימה", price: "לפי הצעת מחיר" },
    ],
  },
  {
    category: "תיקנים ופרעושים",
    icon: "🪳",
    items: [
      { service: "טיפול בתיקנים (חדר)", price: "החל מ-₪350" },
      { service: "טיפול בתיקנים (דירה)", price: "החל מ-₪550" },
      { service: "טיפול בפרעושים", price: "החל מ-₪280" },
    ],
  },
  {
    category: "קינים ודבורים",
    icon: "🐝",
    items: [
      { service: "סילוק קן צרעות", price: "החל מ-₪300" },
      { service: "סילוק קן דבורים", price: "לפי הצעת מחיר" },
      { service: "טיפול בנמלות עץ", price: "החל מ-₪320" },
    ],
  },
  {
    category: "פינוי פגרים",
    icon: "🦴",
    items: [
      { service: "פינוי פגר חיה קטנה (חתול / כלב)", price: "החל מ-₪250" },
      { service: "פינוי פגר חיה גדולה", price: "לפי הצעת מחיר" },
      { service: "פינוי פגר מכרסם / חולדה", price: "החל מ-₪150" },
      { service: "חיטוי ומניעת ריח לאחר פינוי", price: "החל מ-₪200" },
    ],
  },
  {
    category: "טיפולים כלליים ומסחריים",
    icon: "🏢",
    items: [
      { service: "עסק / משרד קטן", price: "החל מ-₪400" },
      { service: "מחסן / מפעל", price: "לפי הצעת מחיר" },
      { service: "חוזה שנתי (בית)", price: "לפי הצעת מחיר" },
      { service: "ביקורת מונעת", price: "החל מ-₪180" },
    ],
  },
];

export default function PricesPage() {
  return (
    <>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12" dir="rtl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            מחירון הדברה
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            מחירים הוגנים ושקופים לכל סוגי הטיפולים. המחיר הסופי נקבע לאחר
            אבחון בשטח.
          </p>
        </div>

        {/* Price tables */}
        <div className="grid gap-6 md:grid-cols-2">
          {PRICE_ITEMS.map((group) => (
            <div
              key={group.category}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="bg-green-50 px-5 py-4 flex items-center gap-3 border-b border-gray-100">
                <span className="text-2xl" aria-hidden="true">
                  {group.icon}
                </span>
                <h2 className="text-lg font-bold text-gray-800">
                  {group.category}
                </h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {group.items.map((item, idx) => (
                    <tr
                      key={item.service}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-5 py-3 text-gray-700">{item.service}</td>
                      <td className="px-5 py-3 text-green-700 font-semibold text-left whitespace-nowrap">
                        {item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Legal disclaimer */}
        <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
          * המחירים המוצגים הם הערכה ראשונית בלבד ואינם מחייבים. המחיר הסופי
          נקבע לאחר ביקור מקצועי ואבחון בשטח, בהתאם לגודל הנגיעות, סוג הנכס
          וגורמים נוספים. כל המחירים כוללים מע&quot;מ, אלא אם צוין אחרת.
        </p>

        {/* CTA */}
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
    </>
  );
}
