#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 *
 * Daily bot that generates one Hebrew MDX article sequentially from a local list
 * and commits it to content/articles/.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");
const TOPICS_FILE = path.join(REPO_ROOT, "content", "1000_pest_control_topics_israel.md");
const POINTER_FILE = path.join(__dirname, "pointer.json");

const CTA = "<a href=\"/quote\">📍 קבלו הצעת מחיר ממדביר מוסמך - ללא עלות וללא התחייבות</a>";

/**
 * Topic rules → photorealistic image API URL + default alt text.
 * Must mirror the TOPIC_IMAGE_RULES in lib/mdx.ts.
 */
const TOPIC_IMAGE_RULES = [
  { pattern: /fire.?ant|wasmannia|נמלה.*(אש|אדומ)|נמלת.*(אש|אדומ)/i, image: "/api/pest-image?name=Wasmannia+auropunctata", alt: "fire ant colony" },
  { pattern: /ant|נמל/i, image: "/api/pest-image?name=Formicidae", alt: "ants in kitchen" },
  { pattern: /bed.?bug|cimex|פשפש/i, image: "/api/pest-image?name=Cimex+lectularius", alt: "bed bugs on mattress" },
  { pattern: /flea|פרעוש/i, image: "/api/pest-image?name=Ctenocephalides+felis", alt: "flea on dog fur" },
  { pattern: /german.?cockroach|blattella/i, image: "/api/pest-image?name=Blattella+germanica", alt: "german cockroach" },
  { pattern: /cockroach|roach|תיקן|ג['"']?וק/i, image: "/api/pest-image?name=Blattodea", alt: "cockroach in kitchen" },
  { pattern: /rat|mouse|mice|rodent|חולד|עכבר|מכרסם/i, image: "/api/pest-image?name=Rattus+rattus", alt: "rat in house" },
  { pattern: /termite|טרמיט/i, image: "/api/pest-image?name=Termite", alt: "termite damage" },
  { pattern: /spider|עכביש/i, image: "/api/pest-image?name=Loxosceles+rufescens", alt: "brown recluse spider" },
  { pattern: /technician|מדביר/i, image: "/api/pest-image?name=Pest+control", alt: "pest control technician" },
];
const DEFAULT_IMAGE = "/api/pest-image?name=Pest+control";
const DEFAULT_ALT = "pest control";

function pickLocalImage(hint) {
  for (const { pattern, image, alt } of TOPIC_IMAGE_RULES) {
    if (pattern.test(hint)) return { image, alt };
  }
  return { image: DEFAULT_IMAGE, alt: DEFAULT_ALT };
}

// ---------------------------------------------------------------------------
// Sequential Topic Extraction
// ---------------------------------------------------------------------------
function getNextTopic() {
  if (!fs.existsSync(TOPICS_FILE)) {
    throw new Error(`Topics file not found at ${TOPICS_FILE}. Please ensure 1000_pest_control_topics_israel.md is in the content/ folder.`);
  }

  // Parse pointer.json
  let nextTopicIndex = 0;
  if (fs.existsSync(POINTER_FILE)) {
    try {
      const ptrData = JSON.parse(fs.readFileSync(POINTER_FILE, "utf-8"));
      nextTopicIndex = ptrData.nextTopicIndex || 0;
    } catch (err) {
      console.warn("⚠️ Could not parse pointer.json. Starting from index 0.");
    }
  }

  // Read and filter topics
  const fileContent = fs.readFileSync(TOPICS_FILE, "utf-8");
  const validTopics = fileContent
    .split("\n")
    .map(line => line.trim())
    // Keep only lines that start with numbers followed by a dot (e.g., "1. נמלים בבית...")
    .filter(line => /^\d+\.\s+/.test(line));

  if (validTopics.length === 0) {
    throw new Error("No valid topics found in the topics file.");
  }

  if (nextTopicIndex >= validTopics.length) {
    throw new Error(`All topics have been generated! Index ${nextTopicIndex} exceeds the list of ${validTopics.length} topics. Reset pointer.json to start over.`);
  }

  return { topic: validTopics[nextTopicIndex], nextTopicIndex };
}

// ---------------------------------------------------------------------------
// Emoji cleanup
// ---------------------------------------------------------------------------
function stripEmojis(text) {
  if (!text) return text;
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\uFE00-\uFE0F\u20E3\u200D]/gu, "")
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanupArticleContent(content) {
  content = content.replace(
    /(^titleHebrew:\s*)(["']?)(.+?)\2(\s*)$/m,
    (_, key, q, val, tail) => `${key}${q}${stripEmojis(val)}${q}${tail}`
  );
  content = content.replace(
    /(^subtitle:\s*)(["']?)(.+?)\2(\s*)$/m,
    (_, key, q, val, tail) => `${key}${q}${stripEmojis(val)}${q}${tail}`
  );

  const fmEnd = content.indexOf("\n---\n");
  if (fmEnd === -1) return content;

  const frontmatter = content.slice(0, fmEnd + 5);
  const body = content.slice(fmEnd + 5);

  const cleanedBody = body
    .split("\n")
    .map((line) => {
      if (/^\s*</.test(line)) return line;
      return stripEmojis(line);
    })
    .join("\n");

  return frontmatter + cleanedBody;
}

// ---------------------------------------------------------------------------
// Image fetching
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
    "חברות הדברה מורשות"
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

  const headings = content.match(/^#{1,6} .+$/gm) ?? [];
  const headingWithEmoji = headings.find((h) => /\p{Extended_Pictographic}/u.test(h));
  if (headingWithEmoji) {
    errors.push(`Emoji found in heading after cleanup: "${headingWithEmoji.slice(0, 50)}"`);
  }

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

function buildModelList(envModel) {
  const candidates = envModel ? [envModel, ...MODEL_PRIORITY] : [...MODEL_PRIORITY];
  return [...new Set(candidates)];
}

async function generateWithRetry(apiKey, envModel, topic) {
  const modelsToTry = buildModelList(envModel);
  console.log(`🗒️  Model priority list: ${modelsToTry.join(", ")}`);

  let lastError;

  for (const modelName of modelsToTry) {
    console.log(`🔄 Trying model: ${modelName}`);
    let retryCount = 0;

    while (retryCount < MAX_503_RETRIES) {
      try {
        return await generateArticle(apiKey, modelName, topic);
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

async function generateArticle(apiKey, modelName, topic) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
אתה כותב תוכן מקצועי המתמחה ב-SEO לאתר הדברה ישראלי.

המשימה:
The topic for this article MUST be exactly: '${topic}'. Ensure the titleHebrew and content directly reflect this topic.

כתוב מאמר בעברית בלבד (500-700 מילים) בדיוק על הנושא המבוקש.

הפלט חייב להיות MDX נקי ללא תגיות קוד, עם frontmatter בדיוק בפורמט:

---
titleHebrew: "כותרת חזקה ומקצועית בעברית התואמת לנושא"
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

${CTA}

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
- ניתן להזכיר חברות הדברה מורשות באופן טבעי, לא יותר מפעם אחת
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
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  // 1. Get the next topic from the file
  const { topic, nextTopicIndex } = getNextTopic();
  console.log(`🎯 Target Topic [Index ${nextTopicIndex}]: ${topic}`);

  console.log("🤖 Generating article...");

  let mdxContent;
  try {
    mdxContent = await generateWithRetry(apiKey, envModel || null, topic);
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

  // 2. Write the file
  fs.writeFileSync(filePath, mdxContent, "utf8");
  console.log(`📄 Output file: content/articles/${filename}`);
  console.log("✅ Article generated and saved successfully.");

  // 3. Increment the counter only after successful save
  fs.writeFileSync(POINTER_FILE, JSON.stringify({ nextTopicIndex: nextTopicIndex + 1 }, null, 2), "utf-8");
  console.log(`➡️  Updated pointer.json to index ${nextTopicIndex + 1} for the next run.`);
}

main();
