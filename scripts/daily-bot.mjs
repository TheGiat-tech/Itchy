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

async function generateArticle(apiKey, modelName) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
אתה מומחה SEO וכותב תוכן מקצועי לאתר הדברה ישראלי.

המשימה:
לכתוב מאמר מקצועי, איכותי ואמין (500-700 מילים) בנושא אחד מהבאים: הדברה, מזיקים, חרקים, נחשים, מכרסמים, מניעה ביתית, או טבע בישראל.

הפלט חייב להיות MDX נקי ללא תגיות קוד, עם frontmatter בדיוק בפורמט:

---
titleHebrew: "כותרת חזקה בעברית עם אמוג'י רלוונטי"
subtitle: "כותרת משנה מושכת שמסבירה את ערך המאמר"
date: "${today()}"
imageKeyword: "two or three English words describing the pest and treatment"
pestType: "סוג המזיק בעברית"
---

הנחיות לגוף המאמר:

1. השורה הראשונה אחרי ה-frontmatter חייבת להיות: # [titleHebrew]
2. השתמש בכותרות ## ו-### לאורך המאמר
3. הוסף אמוג'ים רלוונטיים: 🐜 🛡️ 🏠 ⚠️ ✅ 🔍
4. הדגש משפטים חשובים עם **bold**
5. שלב רשימות תבליטים, טיפים פרקטיים ומידע מקצועי
6. אל תכלול תגיות קוד כגון: \`\`\` או \`\`\`mdx או \`\`\`markdown
7. כתוב בעברית טבעית, קריאה וזורמת
8. אל תזכיר שמות של חברות הדברה ספציפיות

בסוף המאמר חובה להוסיף בדיוק את השורה הבאה:

<a>📍 ליצירת קשר וייעוץ בנושא מזיקים - לחצו כאן</a>
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
    mdxContent = await generateArticle(apiKey, modelName);
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
