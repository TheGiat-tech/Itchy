#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 *
 * Daily AI content-generation bot.
 * Generates a Hebrew article about pest control / nature in Israel and saves it
 * as an MDX file under content/articles/.
 *
 * Usage:
 *   node scripts/daily-bot.mjs
 *
 * Environment variables:
 *   GEMINI_API_KEY  – required.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** ISO date string for today (YYYY-MM-DD) */
function today() {
  return new Date().toISOString().split("T")[0];
}

/** Short random suffix (8 hex chars) */
function randomSuffix() {
  return Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
}

/** Return a unique file path that does not already exist */
function uniqueFilePath(dir, date) {
  let filePath;
  do {
    filePath = path.join(dir, `article-${date}-${randomSuffix()}.mdx`);
  } while (fs.existsSync(filePath));
  return filePath;
}

// ---------------------------------------------------------------------------
// AI call
// ---------------------------------------------------------------------------

async function generateArticle() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // יצירת מספר רנדומלי כדי לנעול תמונה ספציפית לכל מאמר מתוך מאגר התמונות
  const randomImgNum = Math.floor(Math.random() * 10000);

  const prompt = `
אתה כותב תוכן מקצועי לאתר "Itchy" – אנציקלופדיית המזיקים וההדברה הישראלית.

כתוב מאמר בלוג מקצועי בעברית (כ-400 עד 700 מילים) בנושא הדברה או טבע בישראל.

הפלט חייב להיות קובץ MDX בלבד עם frontmatter בדיוק כך (ללא הסברים נוספים):

---
titleHebrew: "<כותרת המאמר בעברית>"
description: "<תיאור קצר של 1-2 משפטים>"
date: "${today()}"
imageOverride: "https://loremflickr.com/800/450/insect,pest,nature?lock=${randomImgNum}"
---

<גוף המאמר בעברית, בפורמט Markdown, עם כותרות ## ו-### ורשימות>

כללים:
- אל תוסיף \`\`\`mdx או \`\`\`markdown – הפלט עצמו הוא ה-MDX
- כלול לפחות 3 כותרות משנה (##)
- אורך: 400-700 מילים
- כתוב בסגנון מקצועי אך נגיש
`.trim();

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Ensure the articles directory exists
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });

  console.log("🤖 Generating daily article with Gemini...");

  let mdxContent;
  try {
    mdxContent = await generateArticle();
    
    // ניקוי תגיות Markdown במידה וה-AI התעקש להוסיף אותן למרות ההוראות
    mdxContent = mdxContent.replace(/^```mdx\n/, '').replace(/^```markdown\n/, '').replace(/```$/, '').trim();

  } catch (err) {
    console.error("❌ Gemini API call failed:", err.message);
    process.exit(1);
  }

  const dateStr = today();
  const filePath = uniqueFilePath(ARTICLES_DIR, dateStr);
  const filename = path.basename(filePath);

  fs.writeFileSync(filePath, mdxContent, "utf8");
  console.log(`✅ Article saved: content/articles/${filename}`);
}

main();
