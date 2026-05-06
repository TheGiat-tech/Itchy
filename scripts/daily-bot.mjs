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

const CTA = "<a>📍 ליצירת קשר וייעוץ בנושא מזיקים - לחצו כאן</a>";

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
  return text.replace(/גיאת הדברות/g, "");
}

function validateArticle(content) {
  const errors = [];

  if (!content.includes("---")) {
    errors.push("Missing frontmatter (---)");
  }
  if (!content.includes("titleHebrew:")) {
    errors.push("Missing titleHebrew in frontmatter");
  }
  if (!content.includes(CTA)) {
    errors.push("Missing final CTA");
  }

  return errors;
}

const RETRY_DELAYS_MS = [10_000, 20_000, 40_000];
const MAX_PRIMARY_ATTEMPTS = 3; // initial attempt + 2 retries
const FALLBACK_MODEL = "gemini-2.0-flash";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function is503(err) {
  return (
    err?.status === 503 ||
    /503|overloaded|service\s*unavailable/i.test(err?.message ?? "")
  );
}

async function generateWithRetry(apiKey, primaryModel) {
  // Build model list: primary first, then fallback (unless they're the same).
  const modelsToTry =
    primaryModel === FALLBACK_MODEL
      ? [primaryModel]
      : [primaryModel, FALLBACK_MODEL];

  let lastError;
  let delayIndex = 0;

  for (let mi = 0; mi < modelsToTry.length; mi++) {
    const modelName = modelsToTry[mi];
    // Primary model gets MAX_PRIMARY_ATTEMPTS attempts; fallback gets one attempt.
    const maxAttempts = mi === 0 ? MAX_PRIMARY_ATTEMPTS : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait before every attempt except the very first overall attempt.
      // delayIndex tracks position in RETRY_DELAYS_MS across all attempts/models.
      if (mi > 0 || attempt > 0) {
        const ms = RETRY_DELAYS_MS[Math.min(delayIndex, RETRY_DELAYS_MS.length - 1)];
        console.log(`⏳ Waiting ${ms / 1000}s before next attempt...`);
        await sleep(ms);
        delayIndex++;
      }

      console.log(`🔄 Trying model: ${modelName} (attempt ${attempt + 1})`);
      try {
        return await generateArticle(apiKey, modelName);
      } catch (err) {
        lastError = err;
        if (is503(err)) {
          console.warn(`⚠️ Model ${modelName} returned 503 (overloaded). Will retry...`);
        } else {
          // Non-503 error – propagate immediately.
          throw err;
        }
      }
    }
  }

  throw lastError ?? new Error("All retry attempts exhausted.");
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
imageKeyword: "two or three English words describing the pest and treatment"
pestType: "סוג המזיק בעברית"
---

מבנה חובה של המאמר (לפי הסדר):

1. **Frontmatter** כמוגדר למעלה
2. **כותרת H1 אחת בלבד** — כתוב אותה פעם אחת בדיוק, בשורה הראשונה אחרי ה-frontmatter, בפורמט: # [titleHebrew]. אל תחזור על הכותרת בגוף המאמר.
3. **פתיחה — סיטואציה אמיתית או נקודת כאב**: התחל במשפטים שמתארים מצב מוכר מהחיים האמיתיים שהקורא יזדהה איתו. אל תתחיל בהגדרה אנציקלופדית.
4. **למה הבעיה חוזרת**: הסבר מדוע הפתרון הביתי הנפוץ נכשל, ומה שורש הבעיה האמיתית.
5. **מה באמת פותר את זה**: הצג את הפתרון הנכון בצורה ברורה ומעשית, בפסקאות קוהרנטיות.
6. **3 טיפים מעשיים**: ניתן להשתמש כאן ברשימת תבליטים — זוהי **רשימת התבליטים היחידה המותרת בכל המאמר**. אל תוסיף רשימות תבליטים נוספות בשום מקום אחר.
7. **מתי לפנות לאיש מקצוע**: כתוב פסקה קצרה ובהירה שמסבירה מתי הטיפול העצמי לא מספיק.
8. **CTA**: בסוף המאמר הוסף בדיוק את השורה הבאה, ואל תשנה אותה:

<a>📍 ליצירת קשר וייעוץ בנושא מזיקים - לחצו כאן</a>

הנחיות סגנון:

- כתוב בעברית טבעית, אנושית וקריאה — כמו כתבה טובה, לא מדריך טכני
- השתמש בפסקאות ובסיפור, לא ברשימות תבליטים ארוכות
- השתמש בכותרות ## ו-### מעשיות ו-SEO-ידידותיות
- הדגש משפטים חשובים עם **bold** במשורה
- הוסף אמוג'ים רלוונטיים: 🐜 🛡️ 🏠 ⚠️ ✅ 🔍
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

async function main() {
  // --- Debug: API key presence ---
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`🔑 GEMINI_API_KEY present: ${Boolean(apiKey)}`);

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing. Cannot continue.");
    process.exit(1);
  }

  // --- Debug: model name ---
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`🧠 GEMINI_MODEL: ${modelName}`);

  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  console.log("🤖 Generating article...");

  let mdxContent;
  try {
    mdxContent = await generateWithRetry(apiKey, modelName);
  } catch (err) {
    console.error(`❌ Gemini API call failed: ${err.message}`);
    process.exit(1);
  }

  // Strip code fences if the model wrapped the output
  mdxContent = stripCodeFences(mdxContent);

  // Remove brand name mentions
  mdxContent = removeBrandName(mdxContent);

  // Validate required sections
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

  // --- Debug: output file path ---
  console.log(`📄 Output file: content/articles/${filename}`);
  console.log("✅ Article generated and saved successfully.");
}

main();
