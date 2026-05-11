"use client";

import { useState } from "react";
import AffiliateProductCard, {
  type AffiliateProduct,
} from "@/components/AffiliateProductCard";

const CATEGORIES = ["הכל", "הדברה לבית", "הדברה לגינה", "ציוד מקצועי"] as const;
type Category = (typeof CATEGORIES)[number];

const shopProducts: AffiliateProduct[] = [
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
    activeCategory === "הכל"
      ? CATEGORIES.filter((category): category is Exclude<Category, "הכל"> => category !== "הכל")
      : [activeCategory];

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
          חלק מהקישורים בחנות הם קישורי שותפים (Affiliate). אתר איצ&apos;י עשוי
          לקבל עמלה על רכישות שיבוצעו דרכם, ללא עלות נוספת עבורכם
        </p>
      </section>
    </>
  );
}
