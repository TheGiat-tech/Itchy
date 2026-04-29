import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllPests } from "@/lib/mdx";
import Link from "next/link";

export const metadata: Metadata = {
  title: "כל המזיקים",
  description:
    "רשימה מלאה של כל המזיקים באנציקלופדיה – חרקים, מכרסמים, ציפורים ועוד.",
};

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function PestsIndexPage({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const pests = getAllPests();
  const query = q?.toLowerCase() ?? "";

  const filtered = pests.filter((pest) => {
    const matchesQuery =
      !query ||
      pest.frontmatter.title.toLowerCase().includes(query) ||
      (pest.frontmatter.titleLatin?.toLowerCase().includes(query) ?? false);
    const matchesCategory =
      !category || pest.frontmatter.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">כל המזיקים</h1>
        <p className="text-gray-500 mb-8">{filtered.length} מזיקים נמצאו</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p>לא נמצאו מזיקים תואמים לחיפוש שלך.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pest) => (
              <Link
                key={pest.slug}
                href={`/pests/${pest.slug}`}
                className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
              >
                <h2 className="font-bold text-gray-800 text-lg">
                  {pest.frontmatter.title}
                </h2>
                {pest.frontmatter.titleLatin && (
                  <p className="text-sm text-gray-400 italic">
                    {pest.frontmatter.titleLatin}
                  </p>
                )}
                {pest.frontmatter.habitat && (
                  <p className="text-xs text-gray-500 mt-2">
                    🏠 {pest.frontmatter.habitat}
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
        )}
      </main>
      <Footer />
    </>
  );
}
