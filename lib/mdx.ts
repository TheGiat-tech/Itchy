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
  // Keyword used to generate a placeholder image via loremflickr
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
 * Resolves the best available image URL for an article/post.
 *
 * Checks direct URL fields first (in priority order via IMAGE_FIELDS), then
 * falls back to generating a loremflickr placeholder from imageKeyword.
 * Returns undefined only when the post has no image information at all –
 * callers should render their own fallback in that case.
 */
export function getPostImage(frontmatter: ArticleFrontmatter): string | undefined {
  for (const field of IMAGE_FIELDS) {
    const val = frontmatter[field];
    // Treat empty strings as absent – an empty string is not a usable URL.
    if (val) return val;
  }
  if (frontmatter.imageKeyword) {
    // Encode each tag individually to avoid special-character issues, then
    // join with "," which loremflickr expects as its tag separator.
    // e.g. "ants kitchen pest" → "https://loremflickr.com/800/600/ants,kitchen,pest"
    const tags = frontmatter.imageKeyword
      .trim()
      .split(/\s+/)
      .map((t) => encodeURIComponent(t))
      .join(",");
    return `https://loremflickr.com/800/600/${tags}`;
  }
  return undefined;
}

/** @deprecated Use getPostImage instead. */
export function buildImageUrl(
  frontmatter: Pick<ArticleFrontmatter, "imageOverride" | "imageKeyword" | "image">
): string | undefined {
  return getPostImage(frontmatter);
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
