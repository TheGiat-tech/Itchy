import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "חנות מוצרי הדברה",
  description:
    "מוצרים נבחרים להדברה לבית, לגינה ולמקצוענים - בקנייה ישירה מצור מרקט.",
};

export default function ShopPage() {
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

        <ShopClient />
      </main>
      <Footer />
    </>
  );
}
