#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 *
 * Daily bot that generates one Hebrew MDX article and commits it to content/articles/.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");

const CTA = "<a href=\"/contact\">📍 ליצירת קשר וייעוץ בנושא מזיקים עם הצוות של איצ'י - לחצו כאן</a>";

/**
 * Topic rules → local SVG path + default alt text.
 * Must mirror the TOPIC_IMAGE_RULES in lib/mdx.ts.
 */
const TOPIC_IMAGE_RULES = [
  { pattern: /fire.?ant|wasmannia|נמלה.*(אש|אדומ)|נמלת.*(אש|אדומ)/i, image: "/images/articles/fire-ant-colony.svg", alt: "fire ant colony" },
  { pattern: /ant|נמל/i, image: "/images/articles/ants-kitchen.svg", alt: "ants in kitchen" },
  { pattern: /bed.?bug|cimex|פשפש/i, image: "/images/articles/bed-bugs-mattress.svg", alt: "bed bugs on mattress" },
  { pattern: /flea|פרעוש/i, image: "/images/articles/flea-dog-fur.svg", alt: "flea on dog fur" },
  { pattern: /german.?cockroach|blattella/i, image: "/images/articles/german-cockroach.svg", alt: "german cockroach" },
  { pattern: /cockroach|roach|תיקן|ג['"']?וק/i, image: "/images/articles/cockroach-kitchen.svg", alt: "cockroach in kitchen" },
  { pattern: /rat|mouse|mice|rodent|חולד|עכבר|מכרסם/i, image: "/images/articles/rat-house.svg", alt: "rat in house" },
  { pattern: /termite|טרמיט/i, image: "/images/articles/termite-damage.svg", alt: "termite damage" },
  { pattern: /spider|עכביש/i, image: "/images/articles/brown-recluse-spider.svg", alt: "brown recluse spider" },
  { pattern: /technician|מדביר/i, image: "/images/articles/pest-control-technician.svg", alt: "pest control technician" },
];
const DEFAULT_IMAGE = "/images/articles/default-pest-control.svg";
const DEFAULT_ALT = "pest control";

function pickLocalImage(hint) {
  for (const { pattern, image, alt } of TOPIC_IMAGE_RULES) {
    if (pattern.test(hint)) return { image, alt };
  }
  return { image: DEFAULT_IMAGE, alt: DEFAULT_ALT };
}

// ---------------------------------------------------------------------------
// Emoji cleanup
// ---------------------------------------------------------------------------

/**
 * Strips all emoji characters from a string using Unicode property escapes.
 * Also removes variation selectors, ZWJ, and skin-tone modifiers.
 */
function stripEmojis(text) {
  if (!text) return text;
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\uFE00-\uFE0F\u20E3\u200D]/gu, "")
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Strips emojis from the article content:
 *   - frontmatter fields: titleHebrew and subtitle
 *   - all markdown headings (lines starting with #)
 *   - all body text lines that are not HTML tags (preserves the CTA anchor)
 */
function cleanupArticleContent(content) {
  // Clean specific frontmatter fields
  content = content.replace(
    /(^titleHebrew:\s*)(["']?)(.+?)\2(\s*)$/m,
    (_, key, q, val, tail) => `${key}${q}${stripEmojis(val)}${q}${tail}`
  );
  content = content.replace(
    /(^subtitle:\s*)(["']?)(.+?)\2(\s*)$/m,
    (_, key, q, val, tail) => `${key}${q}${stripEmojis(val)}${q}${tail}`
  );

  // Split off body (after closing ---) to clean headings and paragraph text
  const fmEnd = content.indexOf("\n---\n");
  if (fmEnd === -1) return content;

  const frontmatter = content.slice(0, fmEnd + 5); // up to and including "\n---\n"
  const body = content.slice(fmEnd + 5);

  const cleanedBody = body
    .split("\n")
    .map((line) => {
      // Preserve HTML lines (e.g., the CTA <a href="/contact">...)
      if (/^\s*</.test(line)) return line;
      return stripEmojis(line);
    })
    .join("\n");

  return frontmatter + cleanedBody;
}

// ---------------------------------------------------------------------------
// Image fetching — Pexels → Pixabay → local fallback
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
 * Attempts to find a stock image for the article using Pexels first, then
 * Pixabay. Falls back to a local SVG if both APIs fail or return no result.
 * Never throws — the article must always be saved even if the image API fails.
 */
async function findArticleImage(query) {
  const hint = query || "";

  if (process.env.PEXELS_API_KEY) {
    try {
      const result = await fetchPexelsImage(hint);
      if (result?.image) {
        console.log(`✅ Image provider: Pexels — ${result.image}`);
        return result;
      }
      console.warn("⚠️  Pexels returned no images for query:", hint);
    } catch (err) {
      console.warn(`⚠️  Pexels failed: ${err.message}`);
    }
  } else {
    console.log("ℹ️  PEXELS_API_KEY not set, skipping Pexels.");
  }

  if (process.env.PIXABAY_API_KEY) {
    try {
      const result = await fetchPixabayImage(hint);
      if (result?.image) {
        console.log(`✅ Image provider: Pixabay — ${result.image}`);
        return result;
      }
      console.warn("⚠️  Pixabay returned no images for query:", hint);
    } catch (err) {
      console.warn(`⚠️  Pixabay failed: ${err.message}`);
    }
  } else {
    console.log("ℹ️  PIXABAY_API_KEY not set, skipping Pixabay.");
  }

  const local = pickLocalImage(hint);
  console.log(`⚠️  Both APIs failed or unavailable. Using local fallback: ${local.image}`);
  return {
    image: local.image,
    imageAlt: local.alt,
    imageCredit: null,
    imageCreditUrl: null,
    imageProvider: "Local",
  };
}

// ---------------------------------------------------------------------------
// Frontmatter image injection
// ---------------------------------------------------------------------------

/**
 * Parses the generated MDX content and injects/replaces image-related fields
 * in the frontmatter block using the provided imageData object.
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
// Utilities
// ---------------------------------------------------------------------------

function today() {
  return new Date().toISOString().split("T")[0];
}

function stripCodeFences(text) {
  return text
    .replace(/^```(mdx|markdown)?\r?\n/, "")
    .replace(/\r?\n```$/, "")
    .trim();
}

function removeBrandName(text) {
  return text.replace(
    /גיאת הדברות|גבעת הדברות|גיאט הדברות|Giat Pest Control|Giat Hadbarot|Giat Extermination/g,
    "הצוות של איצ'י"
  );
}

function extractImageKeyword(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return "";
  const kw = fmMatch[1].match(/^imageKeyword:\s*["']?(.+?)["']?\s*$/m)?.[1];
  return kw?.trim() ?? "";
}

function validateArticle(content) {
  const errors = [];
  if (!content.includes("---")) errors.push("Missing frontmatter (---)");
  if (!content.includes("titleHebrew:")) errors.push("Missing titleHebrew in frontmatter");
  if (!content.includes("image:")) errors.push("Missing image in frontmatter");
  if (!content.includes("imageAlt:")) errors.push("Missing imageAlt in frontmatter");
  if (!content.includes("pestType:")) errors.push("Missing pestType in frontmatter");
  if (!content.includes(CTA)) errors.push("Missing final CTA");

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const titleHebrew = fm.match(/^titleHebrew:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "";
    const subtitle = fm.match(/^subtitle:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "";
    if (/\p{Extended_Pictographic}/u.test(titleHebrew)) {
      errors.push("Emoji found in titleHebrew after cleanup");
    }
    if (/\p{Extended_Pictographic}/u.test(subtitle)) {
      errors.push("Emoji found in subtitle after cleanup");
    }

    // image must be a URL path, not just the keyword text
    const imageVal = fm.match(/^image:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "";
    if (imageVal && !imageVal.startsWith("/") && !imageVal.startsWith("http")) {
      errors.push(`image field is not a valid URL: "${imageVal}"`);
    }
    if (!imageVal) {
      errors.push("image field is empty");
    }

    const imageAltVal = fm.match(/^imageAlt:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "";
    if (!imageAltVal) {
      errors.push("imageAlt field is empty");
    }
  }

  // No emojis in markdown headings
  const headings = content.match(/^#{1,6} .+$/gm) ?? [];
  const headingWithEmoji = headings.find((h) => /\p{Extended_Pictographic}/u.test(h));
  if (headingWithEmoji) {
    errors.push(`Emoji found in heading after cleanup: "${headingWithEmoji.slice(0, 50)}"`);
  }

  // No forbidden branding
  if (/גיאת הדברות|גבעת הדברות|גיאט הדברות/i.test(content)) {
    errors.push("Forbidden branding detected in article");
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Gemini model priority list
// ---------------------------------------------------------------------------

const MODEL_PRIORITY = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3-flash",
];

const RETRY_DELAYS_MS = [10_000, 20_000, 40_000];
const MAX_503_RETRIES = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function is503(err) {
  return (
    err?.status === 503 ||
    /503|overloaded|service\s*unavailable/i.test(err?.message ?? "")
  );
}

function is429(err) {
  return (
    err?.status === 429 ||
    /429|quota.*(exceeded|exhausted)|rate.?limit/i.test(err?.message ?? "")
  );
}

function is404(err) {
  return (
    err?.status === 404 ||
    /404|not.?found|unknown model/i.test(err?.message ?? "")
  );
}

/** Build a deduplicated model list: env model first, then defaults. */
function buildModelList(envModel) {
  const candidates = envModel ? [envModel, ...MODEL_PRIORITY] : [...MODEL_PRIORITY];
  return [...new Set(candidates)];
}

async function generateWithRetry(apiKey, envModel) {
  const modelsToTry = buildModelList(envModel);
  console.log(`🗒️  Model priority list: ${modelsToTry.join(", ")}`);

  let lastError;

  for (const modelName of modelsToTry) {
    console.log(`🔄 Trying model: ${modelName}`);
    let retryCount = 0;

    while (retryCount < MAX_503_RETRIES) {
      try {
        return await generateArticle(apiKey, modelName);
      } catch (err) {
        lastError = err;

        if (is503(err)) {
          retryCount++;
          if (retryCount < MAX_503_RETRIES) {
            const delay = RETRY_DELAYS_MS[retryCount - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
            console.warn(`⚠️  503 on ${modelName}. Retry ${retryCount}/${MAX_503_RETRIES - 1} in ${delay / 1000}s...`);
            await sleep(delay);
          } else {
            console.warn(`⚠️  ${modelName} failed ${MAX_503_RETRIES}× with 503. Moving to next model.`);
            break;
          }
        } else if (is429(err)) {
          console.warn(`⚠️  Quota exceeded for model ${modelName}. Trying next available model.`);
          break;
        } else if (is404(err)) {
          console.warn(`⚠️  Model ${modelName} not found. Trying next available model.`);
          break;
        } else {
          throw err;
        }
      }
    }
  }

  throw lastError ?? new Error("All Gemini models failed. Check model availability or quota.");
}

async function generateArticle(apiKey, modelName) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
אתה כותב תוכן מקצועי המתמחה ב-SEO לאתר הדברה ישראלי.

המשימה:
כתוב מאמר בעברית בלבד (500-700 מילים) בנושא אחד מהבאים: הדברה, מזיקים, חרקים, נחשים, מכרסמים, מניעה ביתית, או טבע בישראל.

הפלט חייב להיות MDX נקי ללא תגיות קוד, עם frontmatter בדיוק בפורמט:

---
titleHebrew: "כותרת חזקה ומקצועית בעברית"
subtitle: "כותרת משנה מושכת שמסבירה את ערך המאמר"
date: "${today()}"
imageKeyword: "two or three English words describing the pest and treatment"
pestType: "סוג המזיק בעברית"
---

בחר imageKeyword: שלושה מילים באנגלית המתארות את נושא המאמר ושישמשו לחיפוש תמונה רלוונטית (לדוגמה: "cockroach kitchen infestation" או "bed bugs mattress pest").

חובה: אל תמציא כתובות URL חיצוניות. שדות image ו-imageAlt בפרונטמאטר יוזרקו אוטומטית — אל תמלא אותם.

מבנה חובה של המאמר (לפי הסדר):

1. **Frontmatter** כמוגדר למעלה
2. **כותרת H1 אחת בלבד** — כתוב אותה פעם אחת בדיוק, בשורה הראשונה אחרי ה-frontmatter, בפורמט: # [titleHebrew]. אל תחזור על הכותרת בגוף המאמר.
3. **פתיחה — סיטואציה אמיתית או נקודת כאב**: התחל במשפטים שמתארים מצב מוכר מהחיים האמיתיים שהקורא יזדהה איתו. אל תתחיל בהגדרה אנציקלופדית.
4. **למה הבעיה חוזרת**: הסבר מדוע הפתרון הביתי הנפוץ נכשל, ומה שורש הבעיה האמיתית.
5. **מה באמת פותר את זה**: הצג את הפתרון הנכון בצורה ברורה ומעשית, בפסקאות קוהרנטיות.
6. **3 טיפים מעשיים**: ניתן להשתמש כאן ברשימת תבליטים — זוהי **רשימת התבליטים היחידה המותרת בכל המאמר**. אל תוסיף רשימות תבליטים נוספות בשום מקום אחר.
7. **מתי לפנות לאיש מקצוע**: כתוב פסקה קצרה ובהירה שמסבירה מתי הטיפול העצמי לא מספיק.
8. **CTA**: בסוף המאמר הוסף בדיוק את השורה הבאה, ואל תשנה אותה:

<a href="/contact">📍 ליצירת קשר וייעוץ בנושא מזיקים עם הצוות של איצ'י - לחצו כאן</a>

הנחיות סגנון:

- כתוב בעברית טבעית, אנושית וקריאה — כמו כתבה טובה, לא מדריך טכני
- שמור על טון מקצועי ורציני — אין ילדותיות, אין התרגשות מופרזת
- השתמש בפסקאות ובסיפור, לא ברשימות תבליטים ארוכות
- השתמש בכותרות ## ו-### מעשיות ו-SEO-ידידותיות — ללא אמוג'ים
- הדגש משפטים חשובים עם **bold** במשורה
- **אסור לחלוטין: אל תוסיף אמוג'ים בשום מקום במאמר** — לא בכותרות, לא בפסקאות, לא ב-frontmatter
- titleHebrew ו-subtitle חייבים להיות נקיים לחלוטין מאמוג'ים
- אל תזכיר גיאת הדברות, גבעת הדברות, נועם גיאט, שם המייסד, או שותפויות עסקיות
- אל תזכיר שמות של חברות הדברה ספציפיות אחרות
- ניתן להזכיר את הצוות של איצ'י באופן טבעי, לא יותר מפעם אחת
- אל תכלול תגיות קוד כגון: \`\`\` או \`\`\`mdx
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  if (!text) {
    throw new Error("Model returned an empty response.");
  }

  return text;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`🔑 GEMINI_API_KEY present: ${Boolean(apiKey)}`);

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing. Cannot continue.");
    process.exit(1);
  }

  const envModel = process.env.GEMINI_MODEL || "";
  console.log(`🧠 GEMINI_MODEL env: ${envModel || "(not set, using priority list)"}`);
  console.log(`🖼️  PEXELS_API_KEY present: ${Boolean(process.env.PEXELS_API_KEY)}`);
  console.log(`🖼️  PIXABAY_API_KEY present: ${Boolean(process.env.PIXABAY_API_KEY)}`);

  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  console.log("🤖 Generating article...");

  let mdxContent;
  try {
    mdxContent = await generateWithRetry(apiKey, envModel || null);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  mdxContent = stripCodeFences(mdxContent);
  mdxContent = removeBrandName(mdxContent);
  mdxContent = cleanupArticleContent(mdxContent);

  const imageKeyword = extractImageKeyword(mdxContent);
  console.log(`🔍 imageKeyword: ${imageKeyword || "(not found)"}`);

  const imageData = await findArticleImage(imageKeyword);
  mdxContent = injectImageFields(mdxContent, imageData);

  const validationErrors = validateArticle(mdxContent);
  if (validationErrors.length > 0) {
    console.error("❌ Article validation failed:");
    for (const err of validationErrors) {
      console.error(`   - ${err}`);
    }
    process.exit(1);
  }

  const suffix = Math.random().toString(36).slice(2, 8);
  const filename = `article-${today()}-${suffix}.mdx`;
  const filePath = path.join(ARTICLES_DIR, filename);

  fs.writeFileSync(filePath, mdxContent, "utf8");
  console.log(`📄 Output file: content/articles/${filename}`);
  console.log("✅ Article generated and saved successfully.");
}

main();

