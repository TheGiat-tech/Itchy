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

// ---------------------------------------------------------------------------
// AI call
// ---------------------------------------------------------------------------

async function generateArticle() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  // אתחול ה-SDK
  const genAI = new GoogleGenerativeAI(apiKey);

  // שימוש במודל gemini-1.5-flash בלבד
  const modelName = "gemini-1.5-flash";
  console.log(`🧠 Using Gemini model: ${modelName}`);
  // נסיון ראשון עם v1beta; במקרה של 404 נבצע fallback ללא apiVersion
  // (כלומר לגרסת ה-API שה-SDK בוחר כברירת מחדל).
  const model = genAI.getGenerativeModel(
    { model: modelName },
    { apiVersion: "v1beta" }
  );

  const prompt = `
אתה מומחה SEO וכותב תוכן שיווקי בכיר עבור "Itchi" (איצ'י) ו-"גיאת הדברות".
המשימה: לכתוב מאמר מקצועי (500-700 מילים) על הדברה בישראל שגורם לקורא להשאיר פרטים.

הפלט חייב להיות MDX נקי (ללא תגיות קוד) עם ה-Frontmatter הבא בדיוק:
---
titleHebrew: "כותרת חזקה בעברית עם אמוג'י רלוונטי"
subtitle: "כותרת משנה מושכת שמסבירה את ערך המאמר"
date: "${today()}"
imageKeyword: "two or three English words describing the pest and treatment (e.g. cockroach extermination kitchen, rat rodent control, termite wood damage)"
pestType: "סוג המזיק בעברית (לדוגמה: ג'וקים, נמלים, חולדות, עכבישים, פרעושים, טרמיטים)"
---

הנחיות לגוף המאמר:
1. השורה הראשונה של הגוף חייבת להיות # [titleHebrew] (כותרת H1 זהה לכותרת שבפרונטמטר).
2. השתמש בכותרות ## ו-### עם אמוג'ים (🐜, 🛡️, 🏠, ⚠️, ✅, 🔍).
3. הדגש משפטים חשובים ב-**bold**.
4. התמקד ב"נקודות כאב": למה הריסוס הביתי נכשל והנזק שהמזיק גורם.
5. כלול לפחות 3 כותרות משנה (##) ורשימות תבליטים.
6. אל תשתמש בתגיות קוד כמו \`\`\`mdx או \`\`\`markdown.

בסוף המאמר, **חובה** להוסיף את השורה הבאה בדיוק (ללא שינויים):

<a href="/contact">📍 לייעוץ וזיהוי מזיקים חינם מגיאת הדברות - לחצו כאן</a>
`.trim();

  try {
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (error) {
      const errMsg = String(error?.message || "");
      const statusCode = Number(error?.status || error?.code || 0);
      const isNotFound =
        statusCode === 404 ||
        errMsg.includes("404") || errMsg.includes("Not Found") || errMsg.includes("not found");
      if (!isNotFound) {
        throw error;
      }

      console.warn(
        "⚠️ Gemini v1beta endpoint returned 404. Retrying with SDK default API version..."
      );
      const fallbackModel = genAI.getGenerativeModel({ model: modelName });
      result = await fallbackModel.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text().trim();
    if (!text) {
      throw new Error(
        `Model "${modelName}" returned an empty response. ` +
        "This may be caused by content filtering or an API issue. " +
        "Check the Gemini API status or adjust the prompt."
      );
    }
    return text;
  } catch (error) {
    throw new Error(`Gemini API call failed (model: "${modelName}"): ${error.message}`);
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

  console.log("🤖 Generating article for Itchi...");

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

  // שם קובץ עם timestamp ו-suffix אקראי למניעת התנגשויות
  const suffix = Math.random().toString(36).slice(2, 8);
  const filePath = path.join(ARTICLES_DIR, `article-${Date.now()}-${suffix}.mdx`);
  const filename = path.basename(filePath);

  try {
    fs.writeFileSync(filePath, mdxContent, "utf8");
    console.log(`✅ Article saved successfully! content/articles/${filename}`);
  } catch (err) {
    console.error("❌ Failed to save file:", err.message);
    process.exit(1);
  }
}

main();
