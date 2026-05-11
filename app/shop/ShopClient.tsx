"use client";

import { useState } from "react";
import AffiliateProductCard, {
  type AffiliateProduct,
} from "@/components/AffiliateProductCard";

const CATEGORIES = [
  "הכל",
  "נמלים ונמלת האש",
  "תיקנים (ג'וקים)",
  "יתושים ומעופפים",
  "עש ומזיקי בד",
  "פתרונות ידידותיים ואלקטרוניים",
  "מכרסמים (עכברים וחולדות)",
  "ציוד מקצועי ותרסיסים מיוחדים",
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
    category: "פתרונות ידידותיים ואלקטרוניים",
    affiliateUrl: "https://affiracle.com/s/LfwF4V",
    description:
      "הדברה אלקטרונית בטכנולוגיית גלים אולטרסוניים. מכסה עד 100 מ״ר ללא שימוש בכימיקלים.",
    itchiTip:
      "פתרון מושלם לחדרי ילדים ומשרדים. פשוט מחברים לשקע ויוצרים מעטפת הגנה שקטה ממזיקים.",
  },
  {
    id: "flying-1",
    title: "קטלן סופה (7W)",
    price: 249,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/63d629c50d62933786448beec7af0a31.jpg?v=1670853476&width=1206",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://affiracle.com/s/BFhVQ9",
    description:
      "קטלן יתושים שקט ועוצמתי עם מנגנון שאיבה פנימי, אידיאלי לשימוש ביתי שוטף.",
    itchiTip:
      "השיטה השקטה והחזקה ביותר – הוא פשוט שואב אותם פנימה.",
  },
  {
    id: "flying-2",
    title: "קטלן STOPPER LED (14W)",
    price: 189,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/7291044110210.webp?v=1773829662&width=1206",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://affiracle.com/s/7WxuSr",
    description:
      "קטלן LED חזק ועמיד לחללים גדולים, למסעדות, לחצרות ולבתים עם עומס מעופפים.",
    itchiTip:
      "אידיאלי למסעדות, חצרות ובתים גדולים. עוצמתי ועמיד מאוד.",
  },
  {
    id: "flying-3",
    title: "קוטל יתושים נייד USB",
    price: 59,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/f4ced7270f583ebff5264a82e98d0f4b.jpg?v=1670859054&width=1206",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://affiracle.com/s/9KvjDf",
    description:
      "פתרון קומפקטי ונייד ליתושים עם חיבור USB, נוח לנסיעות, לקמפינג ולחדרים קטנים.",
    itchiTip:
      "החבר הכי טוב שלכם במילואים, בקמפינג או בחדר הילדים.",
  },
  {
    id: "flying-4",
    title: 'תרסיס אנטיפליי (750 מ״ל)',
    price: 69,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/50aad069ee299a4afcb5ad11ab996215_10252fe2-7987-46b0-89f8-1496c1256ada.jpg?v=1756026266&width=1206",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://affiracle.com/s/6QIUiw",
    description:
      "תרסיס ממוקד נגד זבובים ומעופפים לשימוש מהיר במטבח, במרפסת ובאזורים בעייתיים.",
    itchiTip:
      "ריסוס אחד וגמרנו – יעיל במיוחד נגד זבובים עקשנים.",
  },
  {
    id: "moths-1",
    title: "מלכודות עש המזון (18 יח')",
    price: 59,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/d51a6c4d23526a7d5eaeb07e326dd941.png?v=1733153264&width=1206",
    category: "עש ומזיקי בד",
    affiliateUrl: "https://affiracle.com/s/5QjmkS",
    description:
      "מלכודות פרומון ייעודיות לעש המזון בארונות מטבח, במזווה ובאזורי אחסון יבשים.",
    itchiTip:
      "ללא רעלים! הפתרון הכי בטוח לארונות המטבח והמזווה.",
    badges: ["Best Seller", "ללא רעלים"],
  },
  {
    id: "moths-2",
    title: "מלכודות עש הבגדים (8 יח')",
    price: 101,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/2_84f83fb1-7ca1-41f3-af80-fd1f6f30f9bf.png?v=1753697972&width=1206",
    category: "עש ומזיקי בד",
    affiliateUrl: "https://affiracle.com/s/nc0od0",
    description:
      "מלכודות ייעודיות להגנה על ארונות בגדים, שמיכות וטקסטיל מפני עש הבגדים.",
    itchiTip:
      "שומר על הבגדים היקרים שלכם מחורים ללא ריח לוואי של נפתלין.",
  },
  {
    id: "rodents-1",
    title: "מלכודת SUPER CAT לעכברים וחולדות",
    price: 39,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/31d529d93acb07aa525875e605110917.jpg?v=1713451682&width=1206",
    category: "מכרסמים (עכברים וחולדות)",
    affiliateUrl: "https://affiracle.com/s/OijgVt",
    description:
      "מלכודת קפיץ שוויצרית איכותית עם פיתיון מובנה. עמידה, רב-פעמית ומאפשרת פינוי היגייני ללא מגע.",
    itchiTip:
      "איכות שוויצרית שעושה את העבודה. היא חזקה, ניתנת לשטיפה ושימוש חוזר, והכי חשוב – לא עושה שימוש ברעלים.",
  },
  {
    id: "rodents-2",
    title: 'מזרק פיתיון מקצועי (60 מ"ל)',
    price: 79,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/52ae54226306d8b373f52d34b569aa61.jpg?v=1670858683&width=1206",
    category: "מכרסמים (עכברים וחולדות)",
    affiliateUrl: "https://affiracle.com/s/UidCMp",
    description:
      "פיתיון עוצמתי מבוסס חמאת בוטנים להגברת יעילות הלכידה במלכודות. ללא רעלים ובטוח לשימוש.",
    itchiTip:
      "טיפ של מקצוענים: אם העכבר חכם ולא מתקרב, הריח של המזרק הזה ימשוך אותו למלכודת תוך דקות.",
  },
  {
    id: "rodents-3",
    title: "סט 3 מכשירי 'מרגמה' אולטרסוניים",
    price: 212,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/679d03f4a19840f59f8eeb52ee382300_19e6b954-447c-430b-9094-1f232a961b45.jpg?v=1700387517&width=1206",
    category: "מכרסמים (עכברים וחולדות)",
    affiliateUrl: "https://affiracle.com/s/WCU7Dx",
    description:
      "מארז שלושה מכשירי הרחקה הפועלים על סוללות. אידיאלי לארונות חשמל, מגירות וחללים ללא שקע.",
    itchiTip:
      "הפתרון המושלם למגירות מטבח וארונות חשמל. טכנולוגיית סאונד שמרחיקה מכרסמים בלי ללכלך ובלי רעלים.",
  },
  {
    id: "special-1",
    title: 'מרסס ידני מקצועי (5 ליטר)',
    price: 79,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/ab788b5616d1f3182b6eca317e2de430.jpg?v=1671028410&width=1206",
    category: "ציוד מקצועי ותרסיסים מיוחדים",
    affiliateUrl: "https://affiracle.com/s/H5sUf7",
    description:
      "מרסס ידני מקצועי ועמיד לעבודות ריסוס רחבות בבית, בגינה ובשטחים חיצוניים.",
    itchiTip:
      "מרסס עמיד ונוח לעבודות ריסוס גדולות בחצר ובבית.",
  },
  {
    id: "special-2",
    title: 'דזיטול לקרדית האבק (300 מ״ל)',
    price: 39,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/7290109923932_S1_15-1.png?v=1756734374&width=1206",
    category: "ציוד מקצועי ותרסיסים מיוחדים",
    affiliateUrl: "https://affiracle.com/s/suNGTv",
    description:
      "תרסיס ייעודי לקרדית האבק במזרנים, שטיחים ובדים להפחתת עומס אלרגני בבית.",
    itchiTip:
      "חובה לכל מי שסובל מאלרגיות – מחסל את הקרדית במזרנים ושטיחים.",
  },
  {
    id: "special-3",
    title: "מלכודות דבק לתיקנים (10 יח')",
    price: 49,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/16_5e1524f1-3dd0-4770-80d6-d7b178f23cde.png?v=1755540301&width=1206",
    category: "ציוד מקצועי ותרסיסים מיוחדים",
    affiliateUrl: "https://affiracle.com/s/QoKHI2",
    description:
      "מלכודות דבק חזקות לניטור וללכידת תיקנים באזורים בעייתיים ללא ריסוס וללא בלגן.",
    itchiTip:
      "שיטה נקייה ובטוחה לניטור ולכידת תיקנים ללא ריסוס.",
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
