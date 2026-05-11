import Link from "next/link";
import { getAllArticles } from "@/lib/mdx";

interface Props {
  currentSlug: string;
  category?: string;
  pestType?: string;
  title?: string;
}

const PEST_CATEGORY_RULES: Array<{ pattern: RegExp; category: string; label: string }> = [
  { pattern: /נמל|ant/i, category: "ants", label: "נמלים" },
  { pattern: /תיקן|ג['׳]?וק|cockroach/i, category: "cockroaches", label: "תיקנים" },
  { pattern: /פשפש|פרעוש|קרצי|bug|flea|tick/i, category: "biting-bloodsucking", label: "עוקצים ומוצצי דם" },
  { pattern: /מכרסם|עכבר|חולד|rodent|rat|mouse/i, category: "rodents", label: "מכרסמים" },
  { pattern: /טרמיט|termite/i, category: "pantry-pests", label: "מזיקי מזווה ורכוש" },
  { pattern: /עכביש|עקרב|spider|scorpion/i, category: "arachnids", label: "עכבישים ועקרבים" },
  { pattern: /יתוש|זבוב|צרע|mosquito|fly|wasp/i, category: "flying-insects", label: "חרקים מעופפים" },
];

function getPestHubLink(context: string) {
  const match = PEST_CATEGORY_RULES.find((rule) => rule.pattern.test(context));
  if (!match) return null;
  return {
    href: `/pests?category=${match.category}`,
    label: `עמוד מזיקים קשור: ${match.label}`,
  };
}

function normalize(value?: string): string {
  return (value ?? "").toLowerCase().trim();
}

function getScore(input: {
  articleCategory: string;
  articlePestType: string;
  contextCategory: string;
  contextPestType: string;
  contextTitle: string;
  articleText: string;
}): number {
  let score = 0;
  if (input.contextCategory && input.articleCategory === input.contextCategory) score += 4;
  if (input.contextPestType && input.articlePestType === input.contextPestType) score += 4;
  if (input.contextPestType && input.articleText.includes(input.contextPestType)) score += 2;
  if (input.contextTitle && input.articleText.includes(input.contextTitle)) score += 1;
  return score;
}

export default function RelatedContent({ currentSlug, category, pestType, title }: Props) {
  const allArticles = getAllArticles();
  const contextCategory = normalize(category);
  const contextPestType = normalize(pestType);
  const contextTitle = normalize(title);
  const contextForHub = `${category ?? ""} ${pestType ?? ""} ${title ?? ""}`;
  const hubLink = getPestHubLink(contextForHub);

  const related = allArticles
    .filter((article) => article.slug !== currentSlug)
    .map((article) => {
      const articleCategory = normalize(article.frontmatter.category);
      const articlePestType = normalize(article.frontmatter.pestType);
      const articleText = normalize(
        `${article.frontmatter.titleHebrew ?? ""} ${article.frontmatter.title ?? ""} ${article.frontmatter.subtitle ?? ""} ${article.frontmatter.excerpt ?? ""} ${article.frontmatter.description ?? ""} ${article.frontmatter.pestType ?? ""}`
      );

      return {
        article,
        score: getScore({
          articleCategory,
          articlePestType,
          contextCategory,
          contextPestType,
          contextTitle,
          articleText,
        }),
      };
    })
    .sort((a, b) => b.score - a.score || b.article.frontmatter.date?.localeCompare(a.article.frontmatter.date ?? "") || 0)
    .slice(0, 3)
    .map(({ article }) => article);

  if (related.length === 0 && !hubLink) return null;

  return (
    <section className="mt-12" dir="rtl" aria-label="תוכן קשור">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">תוכן קשור</h2>

      {hubLink && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <Link href={hubLink.href} className="text-green-800 font-semibold hover:text-green-900 transition-colors">
            {hubLink.label}
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {related.map((article) => {
            const articleTitle = article.frontmatter.titleHebrew || article.frontmatter.title || "";
            const articleExcerpt = article.frontmatter.excerpt || article.frontmatter.subtitle || article.frontmatter.description;
            return (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
              >
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{articleTitle}</h3>
                {articleExcerpt && <p className="text-sm text-gray-600 line-clamp-3">{articleExcerpt}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
