import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ShopClient from "./ShopClient";
import { sql } from "@vercel/postgres";
import { ensureProductsTable, type ProductRow } from "@/lib/products-db";

export const metadata: Metadata = {
  title: "חנות מוצרי הדברה",
  description:
    "מוצרים נבחרים להדברה לבית, לגינה ולמקצוענים - בקנייה ישירה מצור מרקט.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  await ensureProductsTable();

  const { rows } = await sql<ProductRow>`
    SELECT id, name, slug, price, store_url, image_url, is_in_stock, last_updated
    FROM products
    ORDER BY name ASC
  `;

  const products = rows.map((product) => ({
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    storeUrl: product.store_url,
    imageUrl: product.image_url,
    isInStock: product.is_in_stock,
  }));

  return (
    <>
      <main id="main-content" className="flex-1">
        {/* Hero header */}
        <section className="bg-gradient-to-b from-green-50 to-white py-14 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            חנות מוצרי הדברה
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            מוצרים נבחרים להדברה לבית, לגינה ולמקצוענים — בקנייה ישירה מצור
            מרקט.
          </p>
        </section>

        <ShopClient products={products} />
      </main>
      <Footer />
    </>
  );
}
