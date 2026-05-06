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
 * Slug → image URL using the /api/pest-image route (Wikipedia pageimages API).
 * Wikipedia always serves a curated article thumbnail, which is more reliable
 * than searching Wikimedia Commons for matching JPEG files.
 *
 * When adding a new article, add a slug → Wikipedia article-name entry here.
 */
const ARTICLE_IMAGE_BY_SLUG: Record<string, string> = {
  "ants-in-kitchen-eliminating-the-nest":
    "/api/pest-image?name=Formicidae",
  "bed-bugs-identification-and-prevention":
    "/api/pest-image?name=Cimex+lectularius",
  "fleas-pets-home-integrated-treatment":
    "/api/pest-image?name=Ctenocephalides+felis",
  "german-cockroach-the-kitchen-invader":
    "/api/pest-image?name=Blattella+germanica",
  "green-pest-control-myths-and-safety":
    "/api/pest-image?name=Pest+control",
  "how-to-prevent-cockroaches-summer":
    "/api/pest-image?name=Cockroach",
  "little-fire-ant-stings-and-treatment":
    "/api/pest-image?name=Wasmannia+auropunctata",
  "rats-vs-mice-noises-and-health-risks":
    "/api/pest-image?name=Rattus+rattus",
  "termites-signs-of-damage-and-treatment":
    "/api/pest-image?name=Termite",
  "venomous-spiders-identification-israel":
    "/api/pest-image?name=Loxosceles+rufescens",
};

/** Fallback image served for any article that has no specific mapping. */
const DEFAULT_ARTICLE_IMAGE = "/images/articles/default-pest-control.svg";

/**
 * Resolves the best available image URL for an article.
 *
 * Priority:
 *   1. frontmatter.image — explicit path/URL set in the MDX file.
 *   2. ARTICLE_IMAGE_BY_SLUG[slug] — /api/article-image?q=… route that
 *      fetches a real photo from Wikimedia Commons at runtime and proxies
 *      it back to the browser (24-hour cache, CC-licensed).
 *   3. DEFAULT_ARTICLE_IMAGE — generic local pest-control SVG placeholder.
 *
 * @param frontmatter  Article frontmatter parsed from the MDX file.
 * @param slug         Article slug (filename without extension).
 */
export function getPostImage(
  frontmatter: ArticleFrontmatter,
  slug?: string
): string {
  // 1. Explicit local image path in frontmatter takes highest priority.
  if (typeof frontmatter.image === "string" && frontmatter.image.trim()) {
    return frontmatter.image.trim();
  }

  // 2. Topic inference from pestType / imageKeyword / title fields.
  const hint = [
    frontmatter.pestType,
    frontmatter.imageKeyword,
    frontmatter.titleHebrew,
    frontmatter.title,
  ]
    .filter(Boolean)
    .join(" ");
  if (hint) {
    const inferred = resolveLocalImage(hint);
    if (inferred) return inferred;
  }

  // 3. Slug-based mapping (legacy Wikipedia API routes).
  if (slug && ARTICLE_IMAGE_BY_SLUG[slug]) {
    return ARTICLE_IMAGE_BY_SLUG[slug];
  }

  // 4. Static fallback – always resolves to a real local file.
  return DEFAULT_ARTICLE_IMAGE;
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
