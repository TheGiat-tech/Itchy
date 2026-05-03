#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 * בוט אוטומטי ליצירת תוכן עבור "Itchi" - גרסה מתוקנת (Node 24 + Gemini Fix)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");

function today() {
  return new Date().toISOString().split("T")[0];
}

async function generateArticle() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = "gemini-1.5-flash";
  
  console.log(`🧠 Using Gemini model: ${modelName}`);

  // כפייה של גרסת v1beta כדי למנוע את שגיאת ה-404 שנראתה בלוגים
  const model = genAI.getGenerativeModel(
    { model: modelName },
    { apiVersion: "v1beta" }
  );

  const prompt = `
אתה מומחה SEO עבור "Itchi" ו-"גיאת הדברות". כתוב מאמר מקצועי (500-700 מילים) על הדברה בישראל.
הפלט חייב להיות MDX נקי עם ה-Frontmatter הבא:
---
titleHebrew: "כותרת עם אמוג'י רלוונטי"
subtitle: "כותרת משנה מושכת"
date: "${today()}"
imageKeyword: "pest control insect"
pestType: "סוג המזיק"
---
# [titleHebrew]
השתמש בכותרות ## ו-###, הדגשים ב-bold, ורשימות.
בסוף המאמר, הוסף: <a href="/contact">📍 לייעוץ וזיהוי מזיקים חינם מגיאת הדברות - לחצו כאן</a>
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    // אם v1beta נכשל, ננסה פעם אחרונה בלי הגדרת גרסה (Fallback)
    console.warn("⚠️ v1beta failed, trying default version...");
    const fallbackModel = genAI.getGenerativeModel({ model: modelName });
    const result = await fallbackModel.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }
}

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  console.log("🤖 Generating article for Itchi...");
  try {
    let mdxContent = await generateArticle();
    mdxContent = mdxContent.replace(/^```(mdx|markdown)?\n/, "").replace(/\n```$/, "").trim();
    const suffix = Math.random().toString(36).slice(2, 8);
    const filePath = path.join(ARTICLES_DIR, `article-${Date.now()}-${suffix}.mdx`);
    fs.writeFileSync(filePath, mdxContent, "utf8");
    console.log(`✅ Saved: ${path.basename(filePath)}`);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}
main();
