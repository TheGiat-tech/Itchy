import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/Footer";
import ArticleFooterCTA from "@/components/ArticleFooterCTA";
import RelatedContent from "@/components/RelatedContent";
import SchemaMarkup, { type SchemaFaqItem } from "@/components/SchemaMarkup";
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
  const rawDescription = frontmatter.excerpt || frontmatter.description || frontmatter.subtitle || "";
  const metaDescription = rawDescription.slice(0, 160);
  const metaImage = getPostImage(frontmatter, slug);
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      locale: "he_IL",
      url: `/articles/${slug}`,
      type: "article",
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

function stripMarkdown(value: string): string {
  return value
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaqFromContent(content: string): SchemaFaqItem[] {
  const lines = content.split("\n");
  const faqSectionIndex = lines.findIndex((line) => /^##\s*(שאלות נפוצות|faq)\b/i.test(line.trim()));
  if (faqSectionIndex === -1) return [];

  const faqItems: SchemaFaqItem[] = [];
  let currentQuestion = "";
  let currentAnswerLines: string[] = [];

  for (let i = faqSectionIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (/^##\s+/.test(line)) break;

    const questionMatch = line.match(/^###\s+(.+\?)\s*$/);
    if (questionMatch) {
      if (currentQuestion && currentAnswerLines.length > 0) {
        faqItems.push({
          question: stripMarkdown(currentQuestion),
          answer: stripMarkdown(currentAnswerLines.join(" ")),
        });
      }
      currentQuestion = questionMatch[1];
      currentAnswerLines = [];
      continue;
    }

    if (currentQuestion && line) {
      currentAnswerLines.push(line);
    }
  }

  if (currentQuestion && currentAnswerLines.length > 0) {
    faqItems.push({
      question: stripMarkdown(currentQuestion),
      answer: stripMarkdown(currentAnswerLines.join(" ")),
    });
  }

  return faqItems;
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
  const datePublished = frontmatter.date;
  const dateModified = frontmatter.updatedAt || frontmatter.date;
  const faqItems = extractFaqFromContent(content);

  return (
    <>
      <SchemaMarkup
        article={{
          headline: displayTitle,
          description: displayExcerpt,
          url: `https://itchy.co.il/articles/${slug}`,
          image: displayImage,
          datePublished,
          dateModified,
          authorName: "מערכת איצ'י",
        }}
        faqItems={faqItems}
      />
      <main id="main-content" className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full" dir="rtl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8 flex items-center gap-1">
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
          <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600">
            {dateModified && <p>עודכן לאחרונה: {formatDate(dateModified)}</p>}
            <p>מאת: מערכת איצ&apos;י</p>
          </div>
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

        <RelatedContent
          currentSlug={slug}
          category={frontmatter.category}
          pestType={frontmatter.pestType}
          title={displayTitle}
        />

        <ArticleFooterCTA />

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 leading-relaxed">
          המידע מוגש כהמלצה בלבד. איצ&apos;י היא פלטפורמת מידע ואינה מספקת שירותי הדברה בעצמה. כל שירותי ההדברה
          מבוצעים על ידי קבלנים מוסמכים עצמאיים.
        </div>

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
