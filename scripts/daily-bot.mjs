#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 * בוט אוטומטי ליצירת תוכן עבור "Itchi".
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
  
  // כאן התיקון הקריטי - כפייה של v1beta כדי למנוע את ה-404
  console.log(`🧠 Attemping to use ${modelName} via v1beta endpoint...`);
  
  const model = genAI.getGenerativeModel(
    { model: modelName },
    { apiVersion: "v1beta" }
  );

  const prompt = `
אתה מומחה SEO וכותב תוכן שיווקי בכיר עבור "Itchi" ו-"גיאת הדברות".
כתוב מאמר מקצועי (500-700 מילים) על הדברה בישראל.

הפלט חייב להיות MDX נקי עם ה-Frontmatter הבא:
---
titleHebrew: "כותרת חזקה עם אמוג'י"
subtitle: "כותרת משנה מושכת"
date: "${today()}"
imageKeyword: "pest control insect"
pestType: "סוג המזיק"
---

# [titleHebrew]
השתמש בכותרות ## ו-###, רשימות, וסיים בקישור:
<a href="/contact">📍 לייעוץ וזיהוי מזיקים חינם מגיאת הדברות - לחצו כאן</a>
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text.replace(/^```(mdx|markdown)?\n/, "").replace(/\n```$/, "").trim();
  } catch (error) {
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
}

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  console.log("🤖 Generating article...");
  try {
    const content = await generateArticle();
    const suffix = Math.random().toString(36).slice(2, 8);
    const filePath = path.join(ARTICLES_DIR, `article-${Date.now()}-${suffix}.mdx`);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Saved: ${path.basename(filePath)}`);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

main();
