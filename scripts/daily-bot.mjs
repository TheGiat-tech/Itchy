#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 *
 * בוט אוטומטי ליצירת תוכן עבור "Itchi".
 * מעדכן את האנציקלופדיה במאמרים על הדברה וטבע בישראל.
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

function today() {
  return new Date().toISOString().split("T")[0];
}

function randomSuffix() {
  return Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
}

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

  // אתחול ה-SDK בגרסה המעודכנת
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // שימוש במודל gemini-1.5-flash בגרסה היציבה (Stable)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const randomImgNum = Math.floor(Math.random() * 10000);

  const prompt = `
אתה כותב תוכן מקצועי עבור "Itchi" (איצ'י) – מיזם ישראלי לזיהוי והדברת מזיקים.

המשימה: כתוב מאמר בלוג מקצועי ומעמיק בעברית (400-700 מילים) על חרק, מזיק או נושא טבע רלוונטי לישראל.

הפלט חייב להיות קובץ MDX בלבד עם Frontmatter במבנה הבא:

---
titleHebrew: "<כותרת המאמר בעברית>"
description: "<תיאור קצר ומסקרן>"
date: "${today()}"
imageOverride: "https://loremflickr.com/800/450/insect,pest,nature?lock=${randomImgNum}"
---

<גוף המאמר בפורמט Markdown הכולל כותרות ## ו-###, רשימות והסברים מקצועיים>

דגשים:
- אל תשתמש בתגיות קוד כמו \`\`\`mdx או \`\`\`markdown.
- כלול לפחות 3 כותרות משנה (##).
- סגנון הכתיבה צריך להיות מקצועי, מבוסס עובדות אך נגיש לקהל הרחב.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // וידוא שתיקיית המאמרים קיימת
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  console.log("🤖 Generating daily article with Gemini...");

  let mdxContent;
  try {
    mdxContent = await generateArticle();
    
    // ניקוי שאריות תגיות במידה והמודל התעקש להוסיף אותן
    mdxContent = mdxContent
      .replace(/^```(mdx|markdown)?\n/, "")
      .replace(/\n```$/, "")
      .trim();

  } catch (err) {
    console.error("❌ Generation failed:", err.message);
    process.exit(1);
  }

  const dateStr = today();
  const filePath = uniqueFilePath(ARTICLES_DIR, dateStr);
  const filename = path.basename(filePath);

  try {
    fs.writeFileSync(filePath, mdxContent, "utf8");
    console.log(`✅ Success! Article saved: content/articles/${filename}`);
  } catch (err) {
    console.error("❌ Failed to save file:", err.message);
    process.exit(1);
  }
}

main();
