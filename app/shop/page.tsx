import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "חנות מוצרי הדברה",
  description:
    "כל הפתרונות המקצועיים להרחקת מזיקים, ישירות מהספקים המובילים בישראל.",
};

export default function ShopPage() {
  return (
    <>
      <main className="flex-1">
        {/* Hero header */}
        <section className="bg-gradient-to-b from-green-50 to-white py-14 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            חנות מוצרי הדברה
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            כל הפתרונות המקצועיים להרחקת מזיקים, ישירות מהספקים המובילים
            בישראל.
          </p>
        </section>

        <ShopClient />
      </main>
      <Footer />
    </>
  );
}
