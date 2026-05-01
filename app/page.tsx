import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import SeasonalPestsSlider from "@/components/SeasonalPestsSlider";

export const metadata: Metadata = {
  title: "Itchy – אנציקלופדיית המזיקים של ישראל",
  description:
    "זהה מזיקים, למד על מחזור החיים שלהם ומצא פתרונות. המדריך המקיף ביותר למזיקים בישראל.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-green-50 to-white py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            אנציקלופדיית המזיקים של ישראל
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            זהה כל מזיק, הבן את מחזור החיים שלו, ומצא את הפתרון הנכון.
          </p>
          <SearchBar placeholder="איזה מזיק מטריד אותך? חפש כאן..." />
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">קטגוריות</h2>
          <CategoryGrid />
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            מזיקים עונתיים ופופולריים
          </h2>
          <SeasonalPestsSlider />
        </section>
      </main>
      <Footer />
    </>
  );
}
