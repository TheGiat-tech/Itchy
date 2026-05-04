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
 * Slug → local static image path.
 *
 * All paths are relative to /public and served at the listed URL by Next.js.
 * When adding a new article, add an entry here so it gets a relevant image
 * automatically even before the frontmatter image field is set.
 */
const ARTICLE_IMAGE_BY_SLUG: Record<string, string> = {
  "ants-in-kitchen-eliminating-the-nest": "/images/articles/ants-kitchen.svg",
  "bed-bugs-identification-and-prevention": "/images/articles/bed-bugs-mattress.svg",
  "fleas-pets-home-integrated-treatment": "/images/articles/flea-dog-fur.svg",
  "german-cockroach-the-kitchen-invader": "/images/articles/german-cockroach.svg",
  "green-pest-control-myths-and-safety": "/images/articles/pest-control-technician.svg",
  "how-to-prevent-cockroaches-summer": "/images/articles/cockroach-kitchen.svg",
  "little-fire-ant-stings-and-treatment": "/images/articles/fire-ant-colony.svg",
  "rats-vs-mice-noises-and-health-risks": "/images/articles/rat-house.svg",
  "termites-signs-of-damage-and-treatment": "/images/articles/termite-damage.svg",
  "venomous-spiders-identification-israel": "/images/articles/brown-recluse-spider.svg",
};

/** Fallback image served for any article that has no specific mapping. */
const DEFAULT_ARTICLE_IMAGE = "/images/articles/default-pest-control.svg";

/**
 * Resolves the best available local image path for an article.
 *
 * Priority:
 *   1. frontmatter.image — explicit local path set in the MDX file.
 *   2. ARTICLE_IMAGE_BY_SLUG[slug] — topic-specific local SVG by article slug.
 *   3. DEFAULT_ARTICLE_IMAGE — generic pest-control placeholder.
 *
 * No external image services (Unsplash, picsum, loremflickr, …) are used.
 * Every returned path starts with "/images/articles/" and is a file that
 * exists inside /public.
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

  // 2. Slug-based mapping to a topic-specific local image.
  if (slug && ARTICLE_IMAGE_BY_SLUG[slug]) {
    return ARTICLE_IMAGE_BY_SLUG[slug];
  }

  // 3. Static fallback – always resolves to a real local file.
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
