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
  // Keyword used to drive an Unsplash featured image search (e.g. "german cockroach close up")
  imageKeyword?: string;
  titleLatin?: string;
}

/**
 * Ordered list of direct-URL image fields to check, from highest to lowest
 * priority.  Having a single source of truth makes it trivial to add or
 * reorder fields in the future.
 */
const IMAGE_FIELDS = [
  "imageOverride",
  "image",
  "imageUrl",
  "image_url",
  "featuredImage",
  "featured_image",
  "thumbnail",
  "coverImage",
  "cover_image",
] as const;

/**
 * Derives a specific, visually descriptive English keyword for an article when
 * its frontmatter does not provide an explicit imageKeyword.
 *
 * The function inspects the Hebrew/English title, description, and slug for
 * known pest patterns and maps them to narrow visual search terms that an
 * image-search service can use to return a relevant photo.
 */
export function inferImageKeyword(
  frontmatter: Pick<ArticleFrontmatter, "title" | "titleHebrew" | "description" | "pestType">,
  slug?: string
): string {
  const text = [
    frontmatter.title ?? "",
    frontmatter.titleHebrew ?? "",
    frontmatter.description ?? "",
    frontmatter.pestType ?? "",
    slug ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (/תיקן גרמני|german[- ]cockroach|german[- ]roach/i.test(text))
    return "german cockroach close up";
  if (/תיקן אמריקאי|american[- ]cockroach/i.test(text))
    return "american cockroach";
  if (/ג'וק|ג'וקים|מקק|מקקים|cockroach|roach/i.test(text))
    return "cockroach infestation kitchen";
  if (/ששן|עכביש|spider/i.test(text))
    return "venomous spider close up";
  if (/יתוש|יתושים|mosquito/i.test(text))
    return "mosquito close up";
  if (/פשפש|bed[- ]bug/i.test(text))
    return "bed bug mattress close up";
  if (/נמלת אש|נמלות אש|fire[- ]ant/i.test(text))
    return "fire ant colony close up";
  if (/נמלה|נמלים|ant\b/i.test(text))
    return "ants marching kitchen counter";
  if (/עכבר|עכברים|mouse|mice/i.test(text))
    return "mouse in house close up";
  if (/חולדה|חולדות|\brat\b|\brats\b/i.test(text))
    return "rat in house close up";
  if (/טרמיט|termite/i.test(text))
    return "termite damage wood beams";
  if (/פרעוש|פרעושים|flea/i.test(text))
    return "flea on dog fur close up";
  if (/צרעה|צרעות|\bwasp\b/i.test(text))
    return "wasp nest close up";
  if (/קרציה|קרציות|\btick\b/i.test(text))
    return "tick close up";
  if (/עש מזון|pantry[- ]moth/i.test(text))
    return "pantry moth insect";
  if (/דג הכסף|silverfish/i.test(text))
    return "silverfish insect";
  if (/זבוב|זבובים|\bfly\b|\bflies\b/i.test(text))
    return "fly infestation kitchen";

  return "pest control technician inspection";
}

/**
 * Builds a topic-aware image URL from a keyword using Unsplash's featured
 * photo search.  Unlike a seed-based random service, this actually returns
 * photos matching the subject of the keyword.
 */
function keywordToImageUrl(keyword: string): string {
  const query = encodeURIComponent(keyword.trim());
  return `https://source.unsplash.com/featured/800x600/?${query}`;
}

/**
 * Resolves the best available image URL for an article/post.
 *
 * Priority:
 *   1. Direct image URL from frontmatter fields (imageOverride, image, …)
 *   2. Explicit frontmatter.imageKeyword → Unsplash featured search
 *   3. inferImageKeyword() keyword derived from title/description/slug → Unsplash featured search
 *
 * Returns undefined only when the post has absolutely no image information –
 * callers should render their own fallback in that case.
 *
 * @param frontmatter  Article frontmatter parsed from MDX.
 * @param slug         Optional article slug used by inferImageKeyword when
 *                     frontmatter fields alone are insufficient.
 */
export function getPostImage(
  frontmatter: ArticleFrontmatter,
  slug?: string
): string | undefined {
  for (const field of IMAGE_FIELDS) {
    const val = frontmatter[field];
    // Accept only non-empty string URLs; skip numbers, booleans, or objects
    // that gray-matter might parse from unusual frontmatter values.
    if (typeof val === "string" && val.trim()) return val.trim();
  }

  // Use explicit keyword first, then fall back to an inferred one.
  const keyword =
    (frontmatter.imageKeyword && frontmatter.imageKeyword.trim()) ||
    inferImageKeyword(frontmatter, slug);

  return keywordToImageUrl(keyword);
}

/** @deprecated Use getPostImage instead. */
export function buildImageUrl(
  frontmatter: Pick<ArticleFrontmatter, "imageOverride" | "imageKeyword" | "image">,
  slug?: string
): string | undefined {
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
