import Link from "next/link";

export default function ArticleFooterCTA() {
  return (
    <section className="mt-12 space-y-4" dir="rtl" aria-label="אפשרויות טיפול במזיקים">
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-bold text-emerald-900 mb-2">הדברה עצמית</h2>
        <p className="text-gray-700 mb-4">
          רוצים לפתור את הבעיה לבד? ריכזנו עבורכם את חומרי ההדברה והציוד המקצועי ביותר לטיפול עצמי, ללא צורך במדביר.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-white font-bold hover:bg-emerald-800 transition-colors"
        >
          לצפייה במוצרים בחנות
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
        <h2 className="text-xl font-bold text-amber-900 mb-2">הצעת מחיר ממדביר</h2>
        <p className="text-gray-700 mb-4">
          מעדיפים לתת למקצוענים לטפל בזה? קבלו הצעת מחיר ממדביר מוסמך באזורכם – במהירות, ללא עלות וללא התחייבות.
        </p>
        <Link
          href="/quote"
          className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-3 text-white font-bold hover:bg-amber-700 transition-colors"
        >
          לקבלת הצעת מחיר ממדביר
        </Link>
      </div>
    </section>
  );
}
