import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import { getAllPests } from "@/lib/mdx";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Itchy – אנציקלופדיית המזיקים של ישראל",
  description:
    "זהה מזיקים, למד על מחזור החיים שלהם ומצא פתרונות. המדריך המקיף ביותר למזיקים בישראל.",
};

export default function HomePage() {
  const pests = getAllPests();

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
          <SearchBar />
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">קטגוריות</h2>
          <CategoryGrid />
        </section>

        {pests.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              מזיקים במאגר
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pests.map((pest) => (
                <Link
                  key={pest.slug}
                  href={`/pests/${pest.slug}`}
                  className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
                >
                  <h3 className="font-bold text-gray-800 text-lg">
                    {pest.frontmatter.title}
                  </h3>
                  {pest.frontmatter.titleLatin && (
                    <p className="text-sm text-gray-400 italic">
                      {pest.frontmatter.titleLatin}
                    </p>
                  )}
                  {pest.frontmatter.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {pest.frontmatter.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
