"use client";

import { useState } from "react";
import AffiliateProductCard, {
  type AffiliateProduct,
} from "@/components/AffiliateProductCard";

const CATEGORIES = [
  "הכל",
  "נמלים ונמלת האש",
  "תיקנים (ג'וקים)",
  "הדברה ירוקה ואלקטרונית",
  "הדברה לבית",
  "הדברה לגינה",
  "ציוד מקצועי",
] as const;
const SHOP_CATEGORIES = CATEGORIES.filter((category) => category !== "הכל");
type Category = (typeof CATEGORIES)[number];

const shopProducts: AffiliateProduct[] = [
  {
    id: "ants-1",
    title: "טופ ג'ל להדברת נמלים (15 גרם)",
    price: 89,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/0583558a8e3e890a7f3a44d3f71bff75.jpg?v=1670852917&width=1206",
    category: "נמלים ונמלת האש",
    affiliateUrl: "https://affiracle.com/s/TwftTS",
    description:
      "פתרון מקצועי ללא ריח לכל סוגי הנמלים. מחסל את המלכה ומשמיד את הקן מהשורש.",
    itchiTip:
      "הפתרון הכי טוב למטבח ולבית – שמים טיפה בפינה והנמלים עושות את שאר העבודה.",
    badges: ["Best Seller", "מאושר המשרד להגנת הסביבה"],
  },
  {
    id: "ants-2",
    title: "גרנולר - פיתיון גרגירי (200 גרם)",
    price: 89,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/b1bee52a0d21533a1931228b05b59a57.jpg?v=1670852952&width=1206",
    category: "נמלים ונמלת האש",
    affiliateUrl: "https://affiracle.com/s/sf7zrv",
    description:
      "פיתיון גרגירי עוצמתי המיועד במיוחד לנמלת האש ולשטחים פתוחים.",
    itchiTip:
      "המוצר המושלם לחצר ולגינה. פשוט לפזר סביב הבית והנמלים ייעלמו.",
    badge: "מאושר המשרד להגנת הסביבה",
  },
  {
    id: "ants-3",
    title: 'תכשיר האמר (960 מ"ל)',
    price: 59,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/WhatsAppImage2025-03-20at14.53.32_1.jpg?v=1742495513&width=1206",
    category: "נמלים ונמלת האש",
    affiliateUrl: "https://affiracle.com/s/rIb2dI",
    description:
      "תרסיס עוצמתי ללא ריח בבקבוק התזה ארגונומי, ממוקד לחיסול נמלת האש.",
    itchiTip:
      "מעולה לריסוס ישיר על קנים וליצירת מחסום סביב פתחי הכניסה לבית.",
    badge: "מאושר המשרד להגנת הסביבה",
  },
  {
    id: "cockroaches-1",
    title: "טורפדו ג'ל נגד תיקנים (15 גרם)",
    price: 89,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/67c1102072cd47f13ae46b88f117ebfb.jpg?v=1670853741&width=1206",
    category: "תיקנים (ג'וקים)",
    affiliateUrl: "https://affiracle.com/s/Vgd9Xz",
    description:
      "פיתיון ג'ל מתקדם לקטילת תיקן גרמני ואמריקאי. ללא ריח, משמיד את המושבה מהשורש.",
    itchiTip:
      "הנשק הסודי נגד התיקן הגרמני הקטן במטבח. טיפה אחת מחסלת אלפי ג'וקים בלי לרסס רעל באוויר.",
    badges: ["Best Seller", "מאושר המשרד להגנת הסביבה"],
  },
  {
    id: "cockroaches-2",
    title: 'תרסיס קילר (750 סמ"ק)',
    price: 49,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/b18bbcc8cff9b0479b5ad2ba1162cf2a.jpg?v=1756117262&width=1206",
    category: "תיקנים (ג'וקים)",
    affiliateUrl: "https://affiracle.com/s/qac48J",
    description:
      "תרסיס הדברה עוצמתי לשימוש ביתי ומסחרי. תוצאות מיידיות נגד תיקנים, נמלים ומזיקים נפוצים.",
    itchiTip:
      "העזרה הראשונה שחובה להחזיק בארון מתחת לכיור. למקרים שבהם צריך מענה מהיר ומיידי.",
  },
  {
    id: "green-1",
    title: "מרחיק מזיקים אלקטרוני SAKAL",
    price: 89,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/6f56a13d102714f39ea5e16bb8f2e197.jpg?v=1670853086&width=1206",
    category: "הדברה ירוקה ואלקטרונית",
    affiliateUrl: "https://affiracle.com/s/LfwF4V",
    description:
      "הדברה ירוקה בטכנולוגיית גלים אולטרסוניים. מכסה עד 100 מ\"ר ללא שימוש בכימיקלים.",
    itchiTip:
      "פתרון מושלם לחדרי ילדים ומשרדים. פשוט מחברים לשקע ויוצרים מעטפת הגנה שקטה ממזיקים.",
  },
  {
    id: "home-1",
    title: "ג׳ל פיתיון נגד תיקנים ונמלים",
    price: 59,
    imageUrl: "/images/shop/home-pest-control.svg",
    category: "הדברה לבית",
    affiliateUrl: "https://www.tzur-market.co.il/products/cockroach-ant-bait-gel",
  },
  {
    id: "home-2",
    title: "מלכודות דבק לעכברים – מארז 10 יחידות",
    price: 45,
    imageUrl: "/images/shop/home-pest-control.svg",
    category: "הדברה לבית",
    affiliateUrl: "https://www.tzur-market.co.il/products/mouse-glue-traps-10",
  },
  {
    id: "home-3",
    title: "תרסיס הדברה ביתי מוכן לשימוש",
    price: 39,
    imageUrl: "/images/shop/home-pest-control.svg",
    category: "הדברה לבית",
    affiliateUrl: "https://www.tzur-market.co.il/products/home-insect-spray",
  },
  {
    id: "garden-1",
    title: "תרכיז הדברה לגינה נגד כנימות ועש",
    price: 74,
    imageUrl: "/images/shop/garden-pest-control.svg",
    category: "הדברה לגינה",
    affiliateUrl: "https://www.tzur-market.co.il/products/garden-insect-concentrate",
  },
  {
    id: "garden-2",
    title: "דשן-דוחה מזיקים לצמחי נוי ועציצים",
    price: 52,
    imageUrl: "/images/shop/garden-pest-control.svg",
    category: "הדברה לגינה",
    affiliateUrl: "https://www.tzur-market.co.il/products/ornamental-pest-repellent",
  },
  {
    id: "garden-3",
    title: "גרגרי הדברה לשבילים ומדשאות",
    price: 67,
    imageUrl: "/images/shop/garden-pest-control.svg",
    category: "הדברה לגינה",
    affiliateUrl: "https://www.tzur-market.co.il/products/lawn-pest-control-granules",
  },
  {
    id: "pro-1",
    title: "מרסס לחץ מקצועי 8 ליטר",
    price: 189,
    imageUrl: "/images/shop/professional-equipment.svg",
    category: "ציוד מקצועי",
    affiliateUrl: "https://www.tzur-market.co.il/products/pro-pressure-sprayer-8l",
  },
  {
    id: "pro-2",
    title: "ערכת מגן להדברה – מסכה, כפפות ומשקף",
    price: 129,
    imageUrl: "/images/shop/professional-equipment.svg",
    category: "ציוד מקצועי",
    affiliateUrl: "https://www.tzur-market.co.il/products/pest-control-protection-kit",
  },
  {
    id: "pro-3",
    title: "מד ריכוז מקצועי לערבוב תמיסות",
    price: 96,
    imageUrl: "/images/shop/professional-equipment.svg",
    category: "ציוד מקצועי",
    affiliateUrl: "https://www.tzur-market.co.il/products/pro-mixing-measure",
  },
];

export default function ShopClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("הכל");

  const visibleCategories =
    activeCategory === "הכל" ? SHOP_CATEGORIES : [activeCategory];

  const groupedProducts = visibleCategories.map((category) => ({
    category,
    products: shopProducts.filter((product) => product.category === category),
  }));

  return (
    <>
      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
                  activeCategory === cat
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
                }`}
              >
                {cat}
              </button>
          ))}
        </div>
      </section>

      {/* Product sections */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="space-y-10">
          {groupedProducts.map(({ category, products }) => (
            <section key={category}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <AffiliateProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          ))}
        </div>
        {groupedProducts.every((group) => group.products.length === 0) && (
          <p className="text-center text-gray-600 py-16">
            אין מוצרים בקטגוריה זו כרגע.
          </p>
        )}
        <p className="text-xs text-gray-500 mt-10 text-center">
          חלק מהקישורים בחנות הם קישורי שותפים (Affiliate). אתר איצ׳י עשוי
          לקבל עמלה על רכישות שיבוצעו דרכם, ללא עלות נוספת עבורכם.
        </p>
      </section>
    </>
  );
}
