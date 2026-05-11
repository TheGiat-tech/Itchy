import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ArticleFooterCTA from "@/components/ArticleFooterCTA";
import SchemaMarkup, { type SchemaFaqItem } from "@/components/SchemaMarkup";
import LegalDisclaimer from "@/components/LegalDisclaimer";

interface Props {
  params: Promise<{ city: string }>;
}

const TOP_CITIES = [
  "tel-aviv",
  "jerusalem",
  "haifa",
  "rishon-lezion",
  "petah-tikva",
  "beer-sheva",
];

function decodeCitySlug(rawCity: string): string {
  const decoded = decodeURIComponent(rawCity).replace(/-/g, " ").trim();
  if (!decoded) return "העיר שלכם";
  return decoded;
}

function normalizeDescription(value: string): string {
  return value.slice(0, 160);
}

function getLocalFaq(cityName: string): SchemaFaqItem[] {
  return [
    {
      question: `כמה זמן לוקח לקבל הצעת מחיר להדברה ב${cityName}?`,
      answer: `ברוב המקרים ניתן לקבל הצעות מחיר ממדביר מוסמך הפועל באזור ${cityName} בתוך זמן קצר, בהתאם לשעות הפעילות ולסוג הבעיה.`,
    },
    {
      question: `האם אפשר להשוות בין כמה מדבירים ב${cityName}?`,
      answer: `כן. הפלטפורמה מאפשרת השוואה בין כמה הצעות מחיר ממדבירים מוסמכים עצמאיים, כדי לבחור את האפשרות המתאימה לכם.`,
    },
    {
      question: `איך מתכוננים לביקור הדברה בדירה ב${cityName}?`,
      answer: "מומלץ לפנות מזון חשוף, להרחיק ילדים וחיות מחמד לפי ההנחיות שתקבלו מראש, ולוודא גישה נוחה לאזורי הטיפול.",
    },
  ];
}

export async function generateStaticParams() {
  return TOP_CITIES.map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeCitySlug(city);
  const title = `הדברה ב${cityName} - השוואת הצעות מחיר ממדבירים מוסמכים`;
  const description = normalizeDescription(
    `מחפשים הדברה ב${cityName}? השוו הצעות מחיר ממדבירים מוסמכים, קבלו מידע מקצועי, ובחרו בין פתרון עצמי לרכישת מוצרים לבין הזמנת מדביר.`
  );

  return {
    title,
    description,
    alternates: {
      canonical: `/locations/${city}`,
    },
    openGraph: {
      title,
      description,
      locale: "he_IL",
      url: `/locations/${city}`,
      type: "website",
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeCitySlug(city);
  const faqItems = getLocalFaq(cityName);

  return (
    <>
      <SchemaMarkup faqItems={faqItems} />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full" dir="rtl">
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            הדברה ב{cityName} - השוואת הצעות מחיר ממדבירים מוסמכים
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            בעמוד זה תוכלו לקבל מידע עדכני על פתרונות הדברה ב{cityName}, להשוות בין הצעות מחיר ממדביר מוסמך,
            ולבחור את פתרון הטיפול המתאים לבית או לעסק שלכם.
          </p>
        </section>

        <section className="rounded-2xl border border-green-100 bg-green-50 p-6 mb-10">
          <h2 className="text-2xl font-bold text-green-900 mb-4">שאלות נפוצות על הדברה ב{cityName}</h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-xl bg-white border border-green-100 p-4">
                <h3 className="font-bold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <ArticleFooterCTA cityName={cityName} />

        <LegalDisclaimer className="mt-8 text-sm text-gray-600 leading-relaxed" />
      </main>
      <Footer />
    </>
  );
}
