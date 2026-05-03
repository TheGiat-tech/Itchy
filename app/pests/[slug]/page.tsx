import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/Footer";
import GalleryPlaceholder from "@/components/GalleryPlaceholder";
import FeedbackButton from "@/components/FeedbackButton";
import ArticleLeadForm from "@/components/ArticleLeadForm";
import PestImage from "@/components/PestImage";
import RelatedPests from "@/components/RelatedPests";
import NextArticleLink from "@/components/NextArticleLink";
import { getPestBySlug, getAllPestSlugs } from "@/lib/mdx";
import { generatePestJsonLd } from "@/lib/jsonld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pest = getPestBySlug(slug);
  if (!pest) return {};
  const { frontmatter } = pest;
  return {
    title: frontmatter.title,
    description:
      frontmatter.description ??
      `מידע מקיף על ${frontmatter.title} – זיהוי, מחזור חיים, ובית גידול.`,
    openGraph: {
      title: `${frontmatter.title} | Itchy`,
      description: frontmatter.description,
      locale: "he_IL",
    },
  };
}

export default async function PestPage({ params }: Props) {
  const { slug } = await params;
  const pest = getPestBySlug(slug);
  if (!pest) notFound();

  const { frontmatter, content } = pest;
  const jsonLd = generatePestJsonLd(slug, frontmatter);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {frontmatter.title}
          </h1>
          {frontmatter.titleLatin && (
            <p className="text-lg text-gray-400 italic mt-1">
              {frontmatter.titleLatin}
            </p>
          )}
        </div>

        {(frontmatter.titleLatin || frontmatter.imageOverride) && (
          <PestImage
            scientificName={frontmatter.titleLatin ?? ""}
            altText={frontmatter.title}
            imageOverride={frontmatter.imageOverride}
          />
        )}

        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {frontmatter.lifecycle && (
            <div>
              <span className="font-semibold text-green-800">מחזור חיים: </span>
              <span className="text-gray-700">{frontmatter.lifecycle}</span>
            </div>
          )}
          {frontmatter.habitat && (
            <div>
              <span className="font-semibold text-green-800">בית גידול: </span>
              <span className="text-gray-700">{frontmatter.habitat}</span>
            </div>
          )}
          {frontmatter.identification && (
            <div className="sm:col-span-2">
              <span className="font-semibold text-green-800">סימני זיהוי: </span>
              <span className="text-gray-700">{frontmatter.identification}</span>
            </div>
          )}
        </div>

        <article className="prose prose-lg prose-green max-w-none text-right" dir="rtl">
          <MDXRemote source={content} />
        </article>

        <GalleryPlaceholder pestName={frontmatter.title} />

        <ArticleLeadForm pestName={frontmatter.title} />

        <RelatedPests
          currentSlug={slug}
          category={frontmatter.category}
        />

        <NextArticleLink currentSlug={slug} />

        <div className="mt-8 pt-6 border-t border-gray-100">
          <FeedbackButton pestTitle={frontmatter.title} />
        </div>
      </main>
      <Footer />
    </>
  );
}
