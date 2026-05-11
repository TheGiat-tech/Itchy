import AffiliateProductCard, {
  type AffiliateProduct,
} from "@/components/AffiliateProductCard";

type ShopClientProps = {
  products: AffiliateProduct[];
};

export default function ShopClient({ products }: ShopClientProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <AffiliateProductCard key={product.id} {...product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-600 py-16">אין מוצרים זמינים כרגע.</p>
      )}

      <p className="text-xs text-gray-500 mt-10 text-center">
        חלק מהקישורים בחנות הם קישורי שותפים (Affiliate). אתר איצ׳י עשוי לקבל
        עמלה על רכישות שיבוצעו דרכם, ללא עלות נוספת עבורכם.
      </p>
    </section>
  );
}
