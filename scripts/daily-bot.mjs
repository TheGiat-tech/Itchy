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

// פונקציית עזר לתאריך
function today() {
  return new Date().toISOString().split("T")[0];
}

async function generateArticle() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  // אתחול ה-SDK
  const genAI = new GoogleGenerativeAI(apiKey);

  const modelName = "gemini-1.5-flash";
  console.log(`🧠 Using Gemini model: ${modelName}`);

  /**
   * תיקון קריטי: הגדרת apiVersion ל-v1beta כדי למנוע שגיאת 404
   * המודל gemini-1.5-flash דורש גרסה זו כרגע בנקודות קצה מסוימות.
   */
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
imageKeyword: "two or three English words describing the pest and treatment (e.g. cockroach extermination kitchen, rat rodent control)"
pestType: "סוג המזיק בעברית"
---

הנחיות לגוף המאמר:
1. השורה הראשונה של הגוף חייבת להיות # [titleHebrew] (כותרת H1 זהה לכותרת שבפרונטמטר).
2. השתמש בכותרות ## ו-### עם אמוג'ים (🐜, 🛡️, 🏠, ⚠️, ✅, 🔍).
3. הדגש משפטים חשובים ב-**bold**.
4. התמקד ב"נקודות כאב": למה הריסוס הביתי נכשל והנזק שהמזיק גורם.
5. כלול לפחות 3 כותרות משנה (##) ורשימות תבליטים.
6. אל תשתמש בתגיות קוד כמו \`\`\`mdx או \`\`\`markdown.

בסוף המאמר, חובה להוסיף את השורה הבאה בדיוק:

<a href="/contact">📍 לייעוץ וזיהוי מזיקים חינם מגיאת הדברות - לחצו כאן</a>
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    if (!text) {
      throw new Error("Model returned an empty response.");
    }
    return text;
  } catch (error) {
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
}

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }

  console.log("🤖 Generating article for Itchi...");

  try {
    let mdxContent = await generateArticle();
    
    // ניקוי שאריות תגיות במידה והמודל הוסיף אותן למרות ההנחיה
    mdxContent = mdxContent
      .replace(/^```(mdx|markdown)?\n/, "")
      .replace(/\n```$/, "")
      .trim();

    const suffix = Math.random().toString(36).slice(2, 8);
    const filePath = path.join(ARTICLES_DIR, `article-${Date.now()}-${suffix}.mdx`);
    
    fs.writeFileSync(filePath, mdxContent, "utf8");
    console.log(`✅ Article saved successfully! content/articles/${path.basename(filePath)}`);
  } catch (err) {
    console.error("❌ Generation failed:", err.message);
    process.exit(1);
  }
}

main();
