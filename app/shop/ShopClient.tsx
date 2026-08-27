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
    price: 79.9,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/0583558a8e3e890a7f3a44d3f71bff75.jpg?v=1670852917&width=1206",
    category: "נמלים ונמלת האש",
    affiliateUrl: "https://track.affiracle.com/s/AFdrPn",
    description:
      "פתרון מקצועי ללא ריח לכל סוגי הנמלים. מחסל את המלכה ומשמיד את הקן מהשורש.",
    itchiTip:
      "הפתרון הכי טוב למטבח ולבית – שמים טיפה בפינה והנמלים עושות את שאר העבודה.",
    badges: ["Best Seller", "מאושר המשרד להגנת הסביבה"],
  },
  {
    id: "ants-2",
    title: "גרנולר - פיתיון גרגירי (200 גרם)",
    price: 85.9,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/b1bee52a0d21533a1931228b05b59a57.jpg?v=1670852952&width=1206",
    category: "נמלים ונמלת האש",
    affiliateUrl: "https://www.owlmarket.co.il/items/6781618-%D7%92%D7%A8%D7%A0%D7%95%D7%9C%D7%A8-%D7%9C%D7%94%D7%93%D7%91%D7%A8%D7%AA-%D7%A0%D7%9E%D7%9C%D7%99%D7%9D-%D7%95%D7%9C%D7%A0%D7%9E%D7%9C%D7%AA-%D7%94%D7%90%D7%A9-%D7%94%D7%A7%D7%98%D7%A0%D7%94-200-%D7%92%D7%A8%D7%9D?aff_camp_id=43&aff_id=2707",
    description:
      "פיתיון גרגירי עוצמתי המיועד במיוחד לנמלת האש ולשטחים פתוחים.",
    itchiTip:
      "המוצר המושלם לחצר ולגינה. פשוט לפזר סביב הבית והנמלים ייעלמו.",
    badge: "מאושר המשרד להגנת הסביבה",
  },
  {
    id: "ants-3",
    title: 'תכשיר האמר (750 מ"ל)',
    price: 59.9,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/WhatsAppImage2025-03-20at14.53.32_1.jpg?v=1742495513&width=1206",
    category: "נמלים ונמלת האש",
    affiliateUrl: "https://www.owlmarket.co.il/items/7885818?aff_camp_id=43&aff_id=2707",
    description:
      "תרסיס עוצמתי ללא ריח בבקבוק התזה ארגונומי, ממוקד לחיסול נמלת האש.",
    itchiTip:
      "מעולה לריסוס ישיר על קנים וליצירת מחסום סביב פתחי הכניסה לבית.",
    badge: "מאושר המשרד להגנת הסביבה",
  },
  {
    id: "cockroaches-1",
    title: "טורפדו ג'ל נגד תיקנים (15 גרם)",
    price: 81,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/67c1102072cd47f13ae46b88f117ebfb.jpg?v=1670853741&width=1206",
    category: "תיקנים (ג'וקים)",
    affiliateUrl: "https://track.affiracle.com/s/y0dkkK",
    description:
      "פיתיון ג'ל מתקדם לקטילת תיקן גרמני ואמריקאי. ללא ריח, משמיד את המושבה מהשורש.",
    itchiTip:
      "הנשק הסודי נגד התיקן הגרמני הקטן במטבח. טיפה אחת מחסלת אלפי ג'וקים בלי לרסס רעל באוויר.",
    badges: ["Best Seller", "מאושר המשרד להגנת הסביבה"],
  },
  {
    id: "cockroaches-2",
    title: 'תרסיס קילר (750 סמ"ק)',
    price: 39.9,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/b18bbcc8cff9b0479b5ad2ba1162cf2a.jpg?v=1756117262&width=1206",
    category: "תיקנים (ג'וקים)",
    affiliateUrl: "https://track.affiracle.com/s/Jzng5Z",
    description:
      "תרסיס הדברה עוצמתי לשימוש ביתי ומסחרי. תוצאות מיידיות נגד תיקנים, נמלים ומזיקים נפוצים.",
    itchiTip:
      "העזרה הראשונה שחובה להחזיק בארון מתחת לכיור. למקרים שבהם צריך מענה מהיר ומיידי.",
  },
  {
    id: "green-1",
    title: "דוחה יתושים אלקטרוני",
    price: 12.9,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/14290596/large/4652dd8d7363116b55c8d63910926e2b.jpg",
    category: "פתרונות ידידותיים ואלקטרוניים",
    affiliateUrl: "https://track.affiracle.com/s/tljZf1",
    description:
      "דוחה יתושים אולטרה-סוני ידידותי לסביבה המתחבר לשקע החשמל ופולט גלי קול בתדר גבוה להרתעת יתושים.",
    itchiTip:
      "מתאים לחדרי מגורים וילדים עד 20 מ״ר, צריכת חשמל נמוכה וללא חומרים כימיים – בטוח גם ליד ילדים וחיות מחמד.",
  },
  {
    id: "flying-1",
    title: "קטלן סופה ליתושים ומעופפים (7W)",
    price: 199,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/63d629c50d62933786448beec7af0a31.jpg?v=1670853476&width=1206",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://track.affiracle.com/s/QE9uQM",
    description:
      "קטלן UV עם מפוח שואב, יניקה שקטה וחזקה ומגירת איסוף נשלפת לניקוי מהיר.",
    itchiTip:
      "השיטה השקטה והחזקה ביותר – הוא פשוט שואב אותם פנימה.",
  },
  {
    id: "flying-2",
    title: "קטלן יתושים תעשייתי LED דגם EL-1034 - אלקטרו חנן",
    price: 289,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/16548593/large/aed10d332a25aaea2dfbab6a64bd689b.jpg",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://track.affiracle.com/s/qbXg6x",
    description:
      "קטלן יתושים תעשייתי LED הפועל בהספק 13W בלבד, מידות: אורך 27 ס\"מ | רוחב 10.50 ס\"מ | גובה 50 ס\"מ. מספק הגנה שקטה ויעילה מפני מזיקים מעופפים.",
    itchiTip:
      "פתרון יעיל וידידותי לסביבה לקטילת יתושים ומעופפים בבית – הספק נמוך ותוצאות מרשימות.",
  },
  {
    id: "flying-3",
    title: "קטלן יתושים וזבובים שואב - DeBUG",
    price: 199,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/16584805/large/ef0c02eca0a99232f1ad5439232bf6bf.jpg",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://track.affiracle.com/s/1UIPXR",
    description:
      "קטלן שואב המשתמש באור אולטרה סגול למשיכת יתושים וזבובים, ושואב אותם בשקט לתוך כלי ייעודי. ידידותי לסביבה, שקט ומתאים לשימוש בכל מקום, עם הפעלה קלה באמצעות כפתורי מגע.",
    itchiTip:
      "לשיפור נוסף של משיכת היתושים, מומלץ להוסיף קפסולה למשיכת יתושים של DeBUG.",
  },
  {
    id: "flying-4",
    title: 'אנטיפליי רימי - תרסיס (750 מ״ל)',
    price: 59,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/files/50aad069ee299a4afcb5ad11ab996215_10252fe2-7987-46b0-89f8-1496c1256ada.jpg?v=1756026266&width=1206",
    category: "יתושים ומעופפים",
    affiliateUrl: "https://track.affiracle.com/s/KWjnLU",
    description:
      "תרסיס אנטיפליי מוכן לשימוש עם קטילה מידית לזבובים, יתושים, ברחשים, צרעות וזחלי עש.",
    itchiTip:
      "יעיל מאוד לעונה החמה – מתאים גם לבית וגם לחצר עם תוצאה מיידית בריסוס ישיר.",
  },
  {
    id: "moths-1",
    title:
      "מלכודת עש המזון – מלכודת מקצועית ללכידת עש המזון - 3 חבילות = 18 מלכודות",
    price: 185,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/12900125/large/f88f4760d87f82ae7dd33b0691e7226b.jpg",
    category: "עש ומזיקי בד",
    affiliateUrl: "https://track.affiracle.com/s/TSYTj5",
    description:
      "פתרון מקצועי ללכידת עש המזון במזווה, בארונות ובבתי עסק. כל מארז כולל 6 מלכודות גדולות עטופות אלומיניום לשמירת הטריות, ובחבילה 3 מארזים (18 מלכודות).",
    itchiTip:
      "הפרומון הייחודי מיושם על כל שטח המלכודת למקסום הלכידה של העשים המעופפים לאורך זמן.",
    badges: ["Best Seller", "מארז חסכוני"],
  },
  {
    id: "moths-2",
    title:
      "מלכודת עש הבגדים – מלכודת מקצועית ללכידת עש הבגדים - 3 חבילות = 6 מלכודות",
    price: 79,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/29191702/large/71dc5b848f49ee073cd5762b492a7a95.jpg",
    category: "עש ומזיקי בד",
    affiliateUrl: "https://track.affiracle.com/s/Sb6RVd",
    description:
      "פתרון מקצועי ללכידת עש הבגדים בארונות, חדרי ארונות וחנויות. כולל וו תלייה נוח ופרומון ייעודי המיושם על כל שטח המלכודת ללכידה יעילה.",
    itchiTip:
      "בכל חבילה 2 מלכודות גדולות עטופות אלומיניום לשמירת הטריות, ובמארז זה מקבלים 3 חבילות (6 מלכודות).",
  },
  {
    id: "rodents-1",
    title: "נוקאאוט RAT – מלכודת מלתעות לחולדות",
    price: 19.9,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/12917735/large/2d04256a1615d6bdff95f71a16e3a1db.jpg",
    category: "מכרסמים (עכברים וחולדות)",
    affiliateUrl: "https://track.affiracle.com/s/8GQmd5",
    description:
      "מלכודת מלתעות לחולדות (מלכודת קפיץ) בעלת מנגנון תפיסה יעיל ובטיחותי למשתמש. פטנט להכנסה בטיחותית של הפיתיון לפני דריכת המלכודת. ניתנת לשימוש רב פעמי.",
    itchiTip:
      "קל לשימוש: פשוט מניחים במיקום הרצוי ונותנים למלכודת לעשות את העבודה. מתאים לבתים, חצרות, מחסנים, מטבחים ומפעלים.",
  },
  {
    id: "rodents-2",
    title: "מאסטר Bait - מזרק פיתיון למלכודות מכרסמים - 55 גרם",
    price: 16.9,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/13863467/large/1b3fb05c1adba4cb59182176539d8fdd.jpg",
    category: "מכרסמים (עכברים וחולדות)",
    affiliateUrl: "https://track.affiracle.com/s/d1aB1D",
    description:
      "מזרק פיתיון מלא בחמאת בוטנים בלתי ניתנת לעמידה, שנועדה לפתות את כל סוגי המכרסמים. מאפשר חלוקה שיטתית בין מלכודות רבות במינימום מאמץ וללא מגע אנושי עם הפיתיון.",
    itchiTip:
      "אפס מגע ידיים עם הפיתיון – הריח נשמר פתיה לחלוטין עבור המכרסמים. 55 גרם לשימושים רבים.",
  },
  {
    id: "rodents-3",
    title: "תיבת האכלה לחולדות ועכברים עם מלכודת קפיץ נוקאאוט",
    price: 39.9,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/13752858/large/2de742d690c1634f8421f6cfdbd332dd.jpg",
    category: "מכרסמים (עכברים וחולדות)",
    affiliateUrl: "https://track.affiracle.com/s/BaQ6qY",
    description:
      "תיבת האכלה למניעת מגע של הרעל עם בני אדם וחיות מחמד. מגיעה עם מלכודות קפיץ נוקאאוט RAT ומפתח לנעילה. יש לקבע את התיבה לעמוד או לקיר.",
    itchiTip:
      "פתרון בטוח לבתים עם ילדים וחיות מחמד – התיבה מונעת גישה בלתי מורשית ומאפשרת לכידה קלה ובטוחה.",
  },
  {
    id: "special-1",
    title: 'מרסס ידני מקצועי (5 ליטר)',
    price: 75,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/ab788b5616d1f3182b6eca317e2de430.jpg?v=1671028410&width=1206",
    category: "ציוד מקצועי ותרסיסים מיוחדים",
    affiliateUrl: "https://track.affiracle.com/s/WMk3f5",
    description:
      "מרסס EVIKA 5 ליטר מפלסטיק מחוזק, צינור 1.2 מטר, דיזה מתכווננת ולחץ עבודה 2.5 בר.",
    itchiTip:
      "מרסס עמיד ונוח לעבודות ריסוס גדולות בחצר ובבית.",
  },
  {
    id: "special-4",
    title: "מרסס הדברה לצמחים (1.5 ליטר)",
    price: 29.9,
    imageUrl:
      "https://zurmarket.co.il/cdn/shop/products/2dc37d69f74bf116238677b069139ded.png?v=1670859114&width=1206",
    category: "ציוד מקצועי ותרסיסים מיוחדים",
    affiliateUrl: "https://track.affiracle.com/s/xO6BfQ",
    description:
      "מרסס פלסטיק PP קשיח בקיבולת 1.5 ליטר, קל לנשיאה ולשימוש לטיפול בצמחים, מזיקים ועשבייה.",
    itchiTip:
      "פתרון זול ואמין לריסוס נקודתי בבית ובגינה בלי לסחוב ציוד כבד.",
  },
  {
    id: "special-2",
    title: "סולאר שילד - מכשיר סולארי להרחקת יונים",
    price: 99.9,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/29931129/large/d28201c9808ab4ceb4aaf40ae78474d3.jpg",
    category: "ציוד מקצועי ותרסיסים מיוחדים",
    affiliateUrl: "https://track.affiracle.com/s/ThYoCs",
    description:
      "מכשיר סולארי מתקדם להרחקת יונים ממרפסות, גגות, חצרות ומסתורי כביסה. משתמש בגלי קול אולטראסוניים ותאורת LED מהבהבת. טעינה סולארית ואפשרות לטעינת USB.",
    itchiTip:
      "קומפקטי, קל להתקנה, מתאים לשימוש חיצוני. פעולה ללא צורך בחיבור קבוע לחשמל – פתרון פשוט וחסכוני.",
  },
  {
    id: "special-3",
    title:
      "טורפדו תחנות האכלה - פיתיון להדברה וקטילת תיקנים כולל תיקן גרמני - 2 יחידות",
    price: 59.9,
    imageUrl:
      "https://d3m9l0v76dty0.cloudfront.net/system/photos/12248383/large/7545ab8be6414681d00968909d697cf8.jpg",
    category: "תיקנים (ג'וקים)",
    affiliateUrl: "https://track.affiracle.com/s/tU7G2V",
    description:
      "תחנת האכלה מוכנה לשימוש עם פיתיון טורפדו לקטילת תיקנים. בטוחה לבתים עם ילדים וחיות מחמד ומספקת טיפול ממושך גם כמניעה.",
    itchiTip:
      "מומלץ למקם בארונות מתחת לכיור, מאחורי מדיח או מכונת כביסה — התיקן אוכל את הפיתיון, חוזר למסתור ומרעיל את הלהקה.",
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
