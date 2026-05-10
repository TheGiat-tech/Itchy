#!/usr/bin/env node
/**
 * scripts/fix-article-images.mjs
 *
 * One-off script that back-fills real stock photos into existing articles
 * whose `image` field is either:
 *   - missing entirely
 *   - pointing at a local SVG fallback (e.g. /images/articles/*.svg)
 *
 * For each article that needs a fix the script:
 *   1. Derives a search query from `imageKeyword` (preferred) or `imageAlt`.
 *   2. Tries Pexels → Pixabay → keeps the existing value unchanged on failure.
 *   3. Rewrites the frontmatter image-related fields in-place.
 *
 * Usage:
 *   PEXELS_API_KEY=... PIXABAY_API_KEY=... node scripts/fix-article-images.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "../content/articles");

// ---------------------------------------------------------------------------
// Stock-image providers (same logic as daily-bot.mjs)
// ---------------------------------------------------------------------------

async function fetchPexelsImage(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5`;
  const response = await fetch(url, { headers: { Authorization: apiKey } });
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const photo = data?.photos?.[0];
  if (!photo) return null;

  return {
    image: photo.src.large2x || photo.src.large || photo.src.landscape,
    imageAlt: photo.alt || query,
    imageCredit: photo.photographer,
    imageCreditUrl: photo.photographer_url,
    imageProvider: "Pexels",
  };
}

async function fetchPixabayImage(query) {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return null;

  const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=5`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const hit = data?.hits?.[0];
  if (!hit) return null;

  return {
    image: hit.largeImageURL || hit.webformatURL,
    imageAlt: hit.tags || query,
    imageCredit: hit.user,
    imageCreditUrl: hit.pageURL,
    imageProvider: "Pixabay",
  };
}

/**
 * Tries Pexels then Pixabay. Returns null if both are unavailable or empty.
 */
async function fetchStockImage(query) {
  if (process.env.PEXELS_API_KEY) {
    try {
      const result = await fetchPexelsImage(query);
      if (result?.image) {
        console.log(`  ✅ Pexels: ${result.image}`);
        return result;
      }
      console.warn("  ⚠️  Pexels returned no images.");
    } catch (err) {
      console.warn(`  ⚠️  Pexels failed: ${err.message}`);
    }
  }

  if (process.env.PIXABAY_API_KEY) {
    try {
      const result = await fetchPixabayImage(query);
      if (result?.image) {
        console.log(`  ✅ Pixabay: ${result.image}`);
        return result;
      }
      console.warn("  ⚠️  Pixabay returned no images.");
    } catch (err) {
      console.warn(`  ⚠️  Pixabay failed: ${err.message}`);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return match[1];
}

/** Returns true when the image value is a local SVG fallback or empty. */
function needsRealImage(imageValue) {
  if (!imageValue) return true;
  if (imageValue.endsWith(".svg")) return true;
  return false;
}

function getFrontmatterField(fmBlock, field) {
  const match = fmBlock.match(new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, "m"));
  return match?.[1]?.trim() ?? null;
}

/**
 * Rewrites image-related fields in the frontmatter block.
 * Preserves all other fields exactly as-is.
 */
function injectImageFields(content, imageData) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return content;

  const fmBlock = fmMatch[1];
  const { image, imageAlt, imageCredit, imageCreditUrl, imageProvider } = imageData;

  const cleanedFm = fmBlock
    .replace(/^image:.*$/m, "")
    .replace(/^imageAlt:.*$/m, "")
    .replace(/^imageProvider:.*$/m, "")
    .replace(/^imageCredit:.*$/m, "")
    .replace(/^imageCreditUrl:.*$/m, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  let newFmBlock = `${cleanedFm}\nimage: "${image}"\nimageAlt: "${imageAlt}"`;
  if (imageProvider) newFmBlock += `\nimageProvider: "${imageProvider}"`;
  if (imageCredit) newFmBlock += `\nimageCredit: "${imageCredit}"`;
  if (imageCreditUrl) newFmBlock += `\nimageCreditUrl: "${imageCreditUrl}"`;

  return content.replace(fmMatch[0], `---\n${newFmBlock}\n---`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const hasPexels = Boolean(process.env.PEXELS_API_KEY);
  const hasPixabay = Boolean(process.env.PIXABAY_API_KEY);

  console.log(`🖼️  PEXELS_API_KEY present: ${hasPexels}`);
  console.log(`🖼️  PIXABAY_API_KEY present: ${hasPixabay}`);

  if (!hasPexels && !hasPixabay) {
    console.error("❌ Neither PEXELS_API_KEY nor PIXABAY_API_KEY is set. Cannot fix images.");
    process.exit(1);
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"));
  console.log(`\n📂 Found ${files.length} articles in ${ARTICLES_DIR}\n`);

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const fmBlock = parseFrontmatter(content);

    if (!fmBlock) {
      console.warn(`⚠️  ${file}: no frontmatter found, skipping.`);
      skipped++;
      continue;
    }

    const currentImage = getFrontmatterField(fmBlock, "image");

    if (!needsRealImage(currentImage)) {
      console.log(`✓  ${file}: image OK (${currentImage?.slice(0, 60)})`);
      skipped++;
      continue;
    }

    // Derive search query: prefer imageKeyword, fall back to imageAlt
    const imageKeyword = getFrontmatterField(fmBlock, "imageKeyword");
    const imageAlt = getFrontmatterField(fmBlock, "imageAlt");
    const query = imageKeyword || imageAlt || "";

    if (!query) {
      console.warn(`⚠️  ${file}: no imageKeyword or imageAlt to search with, skipping.`);
      skipped++;
      continue;
    }

    console.log(`🔍 ${file}`);
    console.log(`   query: "${query}"`);
    console.log(`   current image: ${currentImage || "(none)"}`);

    const imageData = await fetchStockImage(query);

    if (!imageData) {
      console.warn(`  ❌ Could not find a stock image for "${query}" — leaving unchanged.\n`);
      failed++;
      continue;
    }

    const updatedContent = injectImageFields(content, imageData);
    fs.writeFileSync(filePath, updatedContent, "utf8");
    console.log(`  💾 Updated: ${file}\n`);
    fixed++;
  }

  console.log(`\n✅ Done. Fixed: ${fixed} | Skipped: ${skipped} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
