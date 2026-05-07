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
const GENERATED_IMAGES_DIR = path.join(REPO_ROOT, "public", "images", "articles", "generated");

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

/**
 * Parses the generated MDX content, determines the correct local image from
 * the article topic, and injects/replaces `image:` + `imageAlt:` in the
 * frontmatter block so the final file always has a real local image path.
 */
function injectImageFields(content, overrideImage, overrideAlt) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return content;

  const fmBlock = fmMatch[1];

  const pestTypeMatch = fmBlock.match(/^pestType:\s*["']?(.+?)["']?\s*$/m);
  const imageKeywordMatch = fmBlock.match(/^imageKeyword:\s*["']?(.+?)["']?\s*$/m);
  const titleHebrewMatch = fmBlock.match(/^titleHebrew:\s*["']?(.+?)["']?\s*$/m);

  const hint = [
    pestTypeMatch?.[1] ?? "",
    imageKeywordMatch?.[1] ?? "",
    titleHebrewMatch?.[1] ?? "",
  ].join(" ");

  let image, alt;
  if (overrideImage) {
    image = overrideImage;
    alt = overrideAlt ?? DEFAULT_ALT;
  } else if (imageKeywordMatch?.[1]) {
    // Use the free Wikimedia Commons API proxy for a real photo based on article topic.
    // The /api/article-image route already falls back to the default SVG on any API error.
    const keyword = imageKeywordMatch[1].trim();
    image = `/api/article-image?q=${encodeURIComponent(keyword)}`;
    alt = `${keyword} pest control`;
  } else {
    ({ image, alt } = pickLocalImage(hint));
  }

  const cleanedFm = fmBlock
    .replace(/^image:.*$/m, "")
    .replace(/^imageAlt:.*$/m, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  const newFmBlock = `${cleanedFm}\nimage: "${image}"\nimageAlt: "${alt}"`;
  return content.replace(fmMatch[0], `---\n${newFmBlock}\n---`);
}

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

function validateArticle(content) {
  const errors = [];
  if (!content.includes("---")) errors.push("Missing frontmatter (---)");
  if (!content.includes("titleHebrew:")) errors.push("Missing titleHebrew in frontmatter");
  if (!content.includes("image:")) errors.push("Missing image in frontmatter");
  if (!content.includes("imageAlt:")) errors.push("Missing imageAlt in frontmatter");
  if (!content.includes("pestType:")) errors.push("Missing pestType in frontmatter");
  if (!content.includes(CTA)) errors.push("Missing final CTA");
  return errors;
}

// ---------------------------------------------------------------------------
// Gemini model priority list — no gemini-2.0-flash
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
titleHebrew: "כותרת חזקה בעברית עם אמוג'י רלוונטי"
subtitle: "כותרת משנה מושכת שמסבירה את ערך המאמר"
date: "${today()}"
image: "/images/articles/FILENAME.svg"
imageAlt: "short relevant English description of the image"
imageKeyword: "two or three English words describing the pest and treatment"
pestType: "סוג המזיק בעברית"
---

בחר imageKeyword: שלושה מילים באנגלית המתארות את נושא המאמר ושישמשו לחיפוש תמונה רלוונטית (לדוגמה: "cockroach kitchen infestation" או "bed bugs mattress pest").

חובה: אל תמציא כתובות URL חיצוניות. image בפרונטמאטר יוחלף אוטומטית — אל תמלא אותו.

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
- השתמש בפסקאות ובסיפור, לא ברשימות תבליטים ארוכות
- השתמש בכותרות ## ו-### מעשיות ו-SEO-ידידותיות
- הדגש משפטים חשובים עם **bold** במשורה
- **חובה: כל כותרת ## חייבת להכיל 1-2 אמוג'ים רלוונטיים** (לדוגמה: ## למה הג'וקים חוזרים? 🪳🏠)
- **חובה: כל כותרת ### חייבת להכיל אמוג'י אחד לפחות** (לדוגמה: ### 🌡️ טיפול בחום)
- הוסף אמוג'ים גם בגוף המאמר בפסקאות — מינימום 10 אמוג'ים בכל המאמר: 🐜 🛡️ 🏠 ⚠️ ✅ 🔍 🐀 🕷️ 🪲 🌿 🚫 💡
- אל תזכיר גיאת הדברות, גבעת הדברות, נועם גיאת, שם המייסד, או שותפויות עסקיות
- אל תזכיר שמות של חברות הדברה ספציפיות אחרות
- ניתן להזכיר את Itchi (האתר/המותג) באופן טבעי וקל, לא יותר מפעם אחת
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
// Optional image generation
// ---------------------------------------------------------------------------

function extractTopicHint(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return "";
  const fm = fmMatch[1];
  const get = (key) =>
    fm.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"))?.[1] ?? "";
  return [get("pestType"), get("imageKeyword"), get("titleHebrew")].join(" ");
}

/**
 * Attempt to generate an image via the Gemini image model.
 * Returns the saved public path on success, or null on any failure.
 */
async function tryGenerateImage(apiKey, imageModel, slug, topicHint) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: imageModel });

    const imagePrompt =
      `Professional realistic article hero image for a pest control website, ` +
      `showing ${topicHint || "pest control"}, clean modern Israeli home context, ` +
      `natural light, realistic details, no text, no logos, no gore, 16:9 aspect ratio.`;

    console.log(`🖼️  Generating image with model: ${imageModel}`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
      generationConfig: { responseMimeType: "image/png" },
    });

    const parts = result.response?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
    if (!imagePart?.inlineData?.data) {
      console.warn("⚠️  Image generation returned no image data.");
      return null;
    }

    if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
      fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `article-${timestamp}-${slug}.png`;
    const filePath = path.join(GENERATED_IMAGES_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(imagePart.inlineData.data, "base64"));

    const publicPath = `/images/articles/generated/${filename}`;
    console.log(`✅ Generated image saved: ${publicPath}`);
    return publicPath;
  } catch (err) {
    console.warn(`⚠️  Image generation failed (${err.message}). Using local fallback image.`);
    return null;
  }
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

  const generateImages =
    (process.env.GENERATE_ARTICLE_IMAGES ?? "").toLowerCase() === "true";
  const imageModel = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  console.log(`🖼️  Image generation enabled: ${generateImages}`);
  if (generateImages) console.log(`🖼️  Image model: ${imageModel}`);

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

  const topicHint = extractTopicHint(mdxContent);
  const localMatch = pickLocalImage(topicHint);
  const hasGoodLocalImage = localMatch.image !== DEFAULT_IMAGE;
  console.log(
    `🗂️  Local image match: ${localMatch.image} (${hasGoodLocalImage ? "topic-specific" : "fallback"})`
  );

  let generatedImagePath = null;
  if (!hasGoodLocalImage && generateImages) {
    const imgSlug = Math.random().toString(36).slice(2, 8);
    generatedImagePath = await tryGenerateImage(apiKey, imageModel, imgSlug, topicHint);
  }

  if (generatedImagePath) {
    mdxContent = injectImageFields(
      mdxContent,
      generatedImagePath,
      topicHint ? `${topicHint} pest control` : DEFAULT_ALT
    );
  } else {
    mdxContent = injectImageFields(mdxContent);
  }

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
