type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
type JsonLdObject = { [key: string]: JsonLdValue };

export interface SchemaArticleInput {
  headline: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName: string;
  publisherName?: string;
  inLanguage?: string;
}

export interface SchemaFaqItem {
  question: string;
  answer: string;
}

interface SchemaMarkupProps {
  article?: SchemaArticleInput;
  faqItems?: SchemaFaqItem[];
  additionalSchemas?: JsonLdObject[];
}

function sanitizeJsonLd(schema: JsonLdObject): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export default function SchemaMarkup({
  article,
  faqItems = [],
  additionalSchemas = [],
}: SchemaMarkupProps) {
  const schemas: JsonLdObject[] = [];

  if (article) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.headline,
      description: article.description,
      image: article.image,
      datePublished: article.datePublished,
      dateModified: article.dateModified ?? article.datePublished,
      author: {
        "@type": "Person",
        name: article.authorName,
      },
      publisher: {
        "@type": "Organization",
        name: article.publisherName ?? "Itchy",
        url: "https://itchy.co.il",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": article.url,
      },
      inLanguage: article.inLanguage ?? "he-IL",
    });
  }

  if (faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  schemas.push(...additionalSchemas);

  if (schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
