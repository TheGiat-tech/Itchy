import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { getAllArticles, getPostImage } from "@/lib/mdx";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const cardTitle = article.frontmatter.titleHebrew || article.frontmatter.title || "";
              const cardExcerpt = article.frontmatter.excerpt || article.frontmatter.subtitle || article.frontmatter.description;
              const cardImage = getPostImage(article.frontmatter, article.slug);
              return (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                {cardImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cardImage}
                    alt={cardTitle}
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 bg-green-50 flex items-center justify-center text-5xl">
                    📰
                  </div>
                )}

                {/* Text */}
                <div className="flex flex-col justify-center p-5 gap-2 flex-1">
                  {article.frontmatter.category && (
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                      {article.frontmatter.category}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                    {cardTitle}
                  </h2>
                  {cardExcerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {cardExcerpt}
                    </p>
                  )}
                  {article.frontmatter.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(article.frontmatter.date)}
                    </p>
                  )}
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
