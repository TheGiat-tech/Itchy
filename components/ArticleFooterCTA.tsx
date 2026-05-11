import Link from "next/link";

interface Props {
  cityName?: string;
}

export default function ArticleFooterCTA({ cityName }: Props) {
  const shopTitle = cityName ? `הדברה עצמית לתושבי ${cityName}` : "הדברה עצמית";
  const shopDescription = cityName
    ? `גרים ב${cityName}? ריכזנו עבורכם חומרי הדברה וציוד מקצועי לטיפול עצמי, ללא צורך במדביר.`
    : "רוצים לפתור את הבעיה לבד? ריכזנו עבורכם את חומרי ההדברה והציוד המקצועי לטיפול עצמי, ללא צורך במדביר.";
  const quoteTitle = cityName ? `הצעת מחיר ממדביר ב${cityName}` : "הצעת מחיר ממדביר";
  const quoteDescription = cityName
    ? `מעדיפים טיפול מקצועי? קבלו הצעת מחיר ממדביר מוסמך ב${cityName} – במהירות, ללא עלות וללא התחייבות.`
    : "מעדיפים לתת למקצוענים לטפל בזה? קבלו הצעת מחיר ממדביר מוסמך באזורכם – במהירות, ללא עלות וללא התחייבות.";

  return (
    <section className="mt-12 space-y-4" dir="rtl" aria-label="אפשרויות טיפול במזיקים">
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-bold text-emerald-900 mb-2">{shopTitle}</h2>
        <p className="text-gray-700 mb-4">{shopDescription}</p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-white font-bold hover:bg-emerald-800 transition-colors"
        >
          לצפייה במוצרים בחנות
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
        <h2 className="text-xl font-bold text-amber-900 mb-2">{quoteTitle}</h2>
        <p className="text-gray-700 mb-4">{quoteDescription}</p>
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
