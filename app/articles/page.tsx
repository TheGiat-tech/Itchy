import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { getAllArticles } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "מאמרים",
  description: "מאמרים, טיפים ומדריכים מקצועיים בנושא הדברה, מניעת מזיקים וסביבה בריאה.",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <>
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full" dir="rtl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">מאמרים</h1>
        <p className="text-gray-500 mb-10">
          מדריכים, טיפים ומידע מקצועי על הדברה ומניעת מזיקים.
        </p>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">✍️</p>
            <p>עוד אין מאמרים – בקרוב!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col sm:flex-row gap-5 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-green-200 transition-all"
              >
                {/* Thumbnail */}
                {article.frontmatter.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={article.frontmatter.image}
                    alt={article.frontmatter.title}
                    className="w-full sm:w-56 h-44 sm:h-auto object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full sm:w-56 h-44 sm:h-auto flex-shrink-0 bg-green-50 flex items-center justify-center text-5xl">
                    📰
                  </div>
                )}

                {/* Text */}
                <div className="flex flex-col justify-center p-5 gap-2">
                  {article.frontmatter.category && (
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                      {article.frontmatter.category}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                    {article.frontmatter.title}
                  </h2>
                  {article.frontmatter.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {article.frontmatter.excerpt}
                    </p>
                  )}
                  {article.frontmatter.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(article.frontmatter.date)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
