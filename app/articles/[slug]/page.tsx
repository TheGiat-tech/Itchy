import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/Footer";
import { getArticleBySlug, getAllArticleSlugs, getPostImage } from "@/lib/mdx";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  const { frontmatter } = article;
  const metaTitle = frontmatter.titleHebrew || frontmatter.title || "";
  const metaImage = getPostImage(frontmatter, slug);
  return {
    title: metaTitle,
    description: frontmatter.excerpt || frontmatter.description,
    openGraph: {
      title: `${metaTitle} | Itchy`,
      description: frontmatter.excerpt || frontmatter.description,
      locale: "he_IL",
      images: metaImage ? [{ url: metaImage }] : undefined,
    },
  };
}

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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // TypeScript narrowing: article is guaranteed non-null after notFound()
  const { frontmatter, content } = article;
  const displayTitle = frontmatter.titleHebrew || frontmatter.title || "";
  const displayExcerpt = frontmatter.excerpt || frontmatter.subtitle || frontmatter.description;
  const displayImage = getPostImage(frontmatter, slug);

  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full" dir="rtl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-1">
          <Link href="/articles" className="hover:text-green-700 transition-colors">
            מאמרים
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{displayTitle}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          {frontmatter.category && (
            <span className="inline-block text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
              {frontmatter.category}
            </span>
          )}
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            {displayTitle}
          </h1>
          {displayExcerpt && (
            <p className="text-lg text-gray-500 leading-relaxed">
              {displayExcerpt}
            </p>
          )}
          {frontmatter.date && (
            <p className="text-sm text-gray-400 mt-3">{formatDate(frontmatter.date)}</p>
          )}
        </div>

        {/* Hero image */}
        {displayImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={frontmatter.imageAlt || displayTitle}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Article body */}
        <article className="prose prose-lg prose-green max-w-none text-right" dir="rtl">
          <MDXRemote source={content} />
        </article>

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium transition-colors"
          >
            ← חזרה לכל המאמרים
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
