"use client";

import { useState } from "react";
import AffiliateProductCard, {
  type AffiliateProduct,
} from "@/components/AffiliateProductCard";

const CATEGORIES = ["הכל", "חרקים", "מכרסמים", "גינה"] as const;
type Category = (typeof CATEGORIES)[number];

const mockProducts: AffiliateProduct[] = [
  {
    id: "1",
    title: "תרסיס K300 – קוטל חרקים מקצועי",
    price: 49,
    imageUrl: "/images/placeholder-product.png",
    category: "חרקים",
    affiliateUrl: "https://ksp.co.il/web/item/12345?appkey=YOUR_ID",
    merchantName: "KSP",
  },
  {
    id: "2",
    title: "מלכודת דבק לעכברים – אריזת 6 יחידות",
    price: 29,
    imageUrl: "/images/placeholder-product.png",
    category: "מכרסמים",
    affiliateUrl: "https://ksp.co.il/web/item/12346?appkey=YOUR_ID",
    merchantName: "KSP",
  },
  {
    id: "3",
    title: "קטלן יתושים חשמלי UV – לשימוש בית ובגינה",
    price: 119,
    imageUrl: "/images/placeholder-product.png",
    category: "חרקים",
    affiliateUrl: "https://ksp.co.il/web/item/12347?appkey=YOUR_ID",
    merchantName: "KSP",
  },
  {
    id: "4",
    title: "ראטיסיד – פיתיון לחולדות ועכברים",
    price: 39,
    imageUrl: "/images/placeholder-product.png",
    category: "מכרסמים",
    affiliateUrl: "https://ksp.co.il/web/item/12348?appkey=YOUR_ID",
    merchantName: "KSP",
  },
  {
    id: "5",
    title: "ריסוס אורגני לגינה נגד כנימות ועש",
    price: 59,
    imageUrl: "/images/placeholder-product.png",
    category: "גינה",
    affiliateUrl: "https://ksp.co.il/web/item/12349?appkey=YOUR_ID",
    merchantName: "KSP",
  },
  {
    id: "6",
    title: "מלכודת נדבקת לג׳וקים ועקרבים",
    price: 24,
    imageUrl: "/images/placeholder-product.png",
    category: "חרקים",
    affiliateUrl: "https://ksp.co.il/web/item/12350?appkey=YOUR_ID",
    merchantName: "KSP",
  },
];

export default function ShopClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("הכל");

  const filtered =
    activeCategory === "הכל"
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 ${
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

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <AffiliateProductCard key={product.id} {...product} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-16">
            אין מוצרים בקטגוריה זו כרגע.
          </p>
        )}
      </section>
    </>
  );
}
