import { PestFrontmatter } from "./mdx";

export function generatePestJsonLd(slug: string, frontmatter: PestFrontmatter) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description:
      frontmatter.description ?? `מידע מקיף על ${frontmatter.title}`,
    name: frontmatter.title,
    alternateName: frontmatter.titleLatin,
    keywords: [
      frontmatter.title,
      frontmatter.titleLatin ?? "",
      "מזיקים",
      "הדברה",
      "ישראל",
    ]
      .filter(Boolean)
      .join(", "),
    inLanguage: "he",
    url: `https://itchy.co.il/pests/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Itchy – אנציקלופדיית המזיקים",
      url: "https://itchy.co.il",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://itchy.co.il/pests/${slug}`,
    },
  };
}
