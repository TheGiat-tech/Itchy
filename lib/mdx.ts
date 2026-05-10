import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PESTS_DIR = path.join(process.cwd(), "content", "pests");
const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export interface PestFrontmatter {
  title: string;
  titleLatin?: string;
  lifecycle?: string;
  habitat?: string;
  identification?: string;
  description?: string;
  category?: string;
  image?: string;
  imageOverride?: string;
}

export interface Pest {
  slug: string;
  frontmatter: PestFrontmatter;
  content: string;
}

export function getAllPestSlugs(): string[] {
  if (!fs.existsSync(PESTS_DIR)) return [];
  return fs
    .readdirSync(PESTS_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => file.replace(/\.mdx?$/, ""));
}

export function getPestBySlug(slug: string): Pest | null {
  const mdxPath = path.join(PESTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(PESTS_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { slug, frontmatter: data as PestFrontmatter, content };
}

export function getAllPests(): Pest[] {
  return getAllPestSlugs()
    .map((slug) => getPestBySlug(slug))
    .filter((p): p is Pest => p !== null);
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export interface ArticleFrontmatter {
  title?: string;
  titleHebrew?: string;
  subtitle?: string;
  excerpt?: string;
  description?: string;
  date?: string;
  category?: string;
  pestType?: string;
  // Direct image URL fields (priority order is defined in IMAGE_FIELDS below)
  imageOverride?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  featuredImage?: string;
  featured_image?: string;
  thumbnail?: string;
  coverImage?: string;
  cover_image?: string;
  // Kept for backward compatibility with existing frontmatter files.
  imageKeyword?: string;
  imageQuery?: string;
  // Alt text for the article image (used in <img alt="…">).
  imageAlt?: string;
  titleLatin?: string;
}

/**
 * Keyword rules → local SVG image path.
 * Checked in declaration order; the first matching rule wins.
 */
const TOPIC_IMAGE_RULES: Array<{ pattern: RegExp; image: string }> = [
  {
    pattern: /fire.?ant|wasmannia|נמלה.*(אש|אדומ)|נמלת.*(אש|אדומ)/i,
    image: "/images/articles/fire-ant-colony.svg",
  },
  { pattern: /ant|נמל/i, image: "/images/articles/ants-kitchen.svg" },
  {
    pattern: /bed.?bug|cimex|פשפש/i,
    image: "/images/articles/bed-bugs-mattress.svg",
  },
  { pattern: /flea|פרעוש/i, image: "/images/articles/flea-dog-fur.svg" },
  {
    pattern: /german.?cockroach|blattella/i,
    image: "/images/articles/german-cockroach.svg",
  },
  {
    pattern: /cockroach|roach|תיקן|ג['"]?וק/i,
    image: "/images/articles/cockroach-kitchen.svg",
  },
  {
    pattern: /rat|mouse|mice|rodent|חולד|עכבר|מכרסם/i,
    image: "/images/articles/rat-house.svg",
  },
  {
    pattern: /termite|טרמיט/i,
    image: "/images/articles/termite-damage.svg",
  },
  {
    pattern: /spider|עכביש/i,
    image: "/images/articles/brown-recluse-spider.svg",
  },
  {
    pattern: /technician|מדביר/i,
    image: "/images/articles/pest-control-technician.svg",
  },
];

/**
 * Infers the best local image path from a plain-text hint (pestType,
 * imageKeyword, title, etc.). Returns `null` when no rule matches.
 */
export function resolveLocalImage(hint: string): string | null {
  for (const { pattern, image } of TOPIC_IMAGE_RULES) {
    if (pattern.test(hint)) return image;
  }
  return null;
}

/**
 * Maps article slug → English Wikipedia page title.
 * The /api/pest-image route uses the Wikipedia pageimages API to fetch a
 * curated high-quality thumbnail, which is far more reliable than searching
 * Wikimedia Commons for matching JPEG files.
 *
 * When adding a new article, add a slug → Wikipedia article-name entry here.
 */
const ARTICLE_WIKI_PAGE_BY_SLUG: Record<string, string> = {
  "ants-in-kitchen-eliminating-the-nest":     "Formicidae",
  "article-2026-05-06-i2xzrw":               "Rattus rattus",
  "article-2026-05-06-s1t0u4":               "Cockroach",
  "article-2026-05-07-5ncibd":               "Cimex lectularius",
  "article-2026-05-07-gq9pwz":               "Termite",
  "article-2026-05-07-zhoy1h":               "Blattella germanica",
  "article-2026-05-08-qr9lar":               "Rattus norvegicus",
  "article-2026-05-09-52w39m":               "Rattus norvegicus",
  "article-2026-05-10-1cnnq0":               "Formicidae",
  "bed-bugs-identification-and-prevention":   "Cimex lectularius",
  "fleas-pets-home-integrated-treatment":     "Ctenocephalides felis",
  "german-cockroach-the-kitchen-invader":     "Blattella germanica",
  "green-pest-control-myths-and-safety":      "Pest control",
  "how-to-prevent-cockroaches-summer":        "Cockroach",
  "little-fire-ant-stings-and-treatment":     "Wasmannia auropunctata",
  "rats-vs-mice-noises-and-health-risks":     "Rattus rattus",
  "termites-signs-of-damage-and-treatment":   "Termite",
  "venomous-spiders-identification-israel":   "Loxosceles rufescens",
};

/**
 * Returns a URL pointing to the /api/pest-image proxy, which fetches the
 * Wikipedia page-image thumbnail for the given English article name.
 */
function buildPestImageUrl(wikiPage: string): string {
  return `/api/pest-image?name=${encodeURIComponent(wikiPage)}`;
}

/**
 * Resolves the best available image URL for an article.
 *
 * Priority:
 *   0. frontmatter.imageOverride — explicit override always wins.
 *   1. frontmatter.image — direct image URL injected by the article bot
 *      (may be an external https:// URL from Pexels/Pixabay or a local path).
 *   2. ARTICLE_WIKI_PAGE_BY_SLUG[slug] — curated Wikipedia page; returns a
 *      real photo via the /api/pest-image proxy (24-hour cache).
 *   3. frontmatter.titleLatin — explicit scientific name → Wikipedia thumbnail.
 *   4. frontmatter.imageKeyword (English) → Wikipedia thumbnail.
 *   5. frontmatter.imageQuery — falls back to Wikimedia Commons text search.
 *   6. Generic "Pest control" Wikipedia thumbnail as the last resort.
 *
 * @param frontmatter  Article frontmatter parsed from the MDX file.
 * @param slug         Article slug (filename without extension).
 */
export function getPostImage(
  frontmatter: ArticleFrontmatter,
  slug?: string
): string {
  // 0. Explicit imageOverride always takes priority.
  const override = frontmatter.imageOverride?.trim();
  if (override) return override;

  // 1. Direct image URL set by the article bot (Pexels/Pixabay or local SVG).
  const directImage = frontmatter.image?.trim();
  if (directImage && (directImage.startsWith("https://") || directImage.startsWith("http://") || directImage.startsWith("/"))) {
    return directImage;
  }

  // 2. Slug → curated Wikipedia page (most reliable – always returns a photo).
  if (slug && ARTICLE_WIKI_PAGE_BY_SLUG[slug]) {
    return buildPestImageUrl(ARTICLE_WIKI_PAGE_BY_SLUG[slug]);
  }

  // 3. Explicit Latin/scientific name in frontmatter.
  const latin = frontmatter.titleLatin?.trim();
  if (latin) {
    return buildPestImageUrl(latin);
  }

  // 4. English imageKeyword → Wikipedia page thumbnail.
  const keyword = frontmatter.imageKeyword?.trim();
  if (keyword && /[A-Za-z]/.test(keyword)) {
    return buildPestImageUrl(keyword);
  }

  // 5. Explicit Wikimedia Commons search query (least reliable, use as fallback).
  const explicitQuery = frontmatter.imageQuery?.trim();
  if (explicitQuery) {
    return `/api/article-image?q=${encodeURIComponent(explicitQuery)}`;
  }

  // 6. Generic last-resort – always returns a real photo.
  return buildPestImageUrl("Pest control");
}

/** @deprecated Use getPostImage instead. */
export function buildImageUrl(
  frontmatter: ArticleFrontmatter,
  slug?: string
): string {
  return getPostImage(frontmatter, slug);
}

export interface Article {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string;
}

export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => file.replace(/\.mdx?$/, ""));
}

export function getArticleBySlug(slug: string): Article | null {
  const mdxPath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  const mdPath = path.join(ARTICLES_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { slug, frontmatter: data as ArticleFrontmatter, content };
}

export function getAllArticles(): Article[] {
  return getAllArticleSlugs()
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is Article => a !== null)
    .sort((a, b) => {
      const dateA = a.frontmatter.date ?? "";
      const dateB = b.frontmatter.date ?? "";
      return dateB.localeCompare(dateA); // newest first
    });
}
