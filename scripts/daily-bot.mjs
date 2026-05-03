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

// מספר הטלפון / וואטסאפ לפניות – ניתן לעקוף עם CONTACT_PHONE
const CONTACT_PHONE = process.env.CONTACT_PHONE || "972XXXXXXXXX";

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

  // אתחול ה-SDK
  const genAI = new GoogleGenerativeAI(apiKey);

  // ניתן לעקוף את המודל באמצעות משתנה סביבה GEMINI_MODEL
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  console.log(`🧠 Using Gemini model: ${modelName}`);
  const model = genAI.getGenerativeModel(
    { model: modelName },
    { apiVersion: "v1" }
  );

  const unsplashKeywords = ["pest,insect", "cockroach", "rat,rodent", "ant,insect", "spider", "mosquito"];
  const keyword = unsplashKeywords[Math.floor(Math.random() * unsplashKeywords.length)];

  const prompt = `
אתה כותב תוכן שיווקי ומקצועי עבור "איצ'י" ו"גיאת הדברות" – חברת הדברה ישראלית מובילה.

המשימה: כתוב מאמר בלוג בעברית (400-700 מילים) על חרק, מזיק או נושא הדברה רלוונטי לישראל, בסגנון דף נחיתה ממיר ומשכנע.

הפלט חייב להיות קובץ MDX בלבד עם Frontmatter במבנה הבא:

---
title: "<כותרת המאמר בעברית – קצרה, מושכת, עם אמוג'י רלוונטי>"
excerpt: "<תיאור קצר ומסקרן, 1-2 משפטים>"
date: "${today()}"
category: "הדברה"
image: "https://source.unsplash.com/featured/800x450/?${keyword}"
---

<גוף המאמר בפורמט Markdown>

דגשים חשובים לסגנון:
- **השתמש באמוג'י רלוונטיים** בכותרות ## ו-### (לדוגמה: 🐜, 🛡️, 🏠, ⚠️, ✅, 🔍).
- **השתמש בטקסט מודגש** (**כך**) להדגשת עובדות חשובות.
- **כלול רשימות תבליטים** להפוך את התוכן לנגיש וקל לסריקה.
- כלול לפחות 3 כותרות משנה (##).
- סגנון כתיבה: מקצועי, דחוף, מעורר פעולה – כמו דף נחיתה.
- אל תשתמש בתגיות קוד כמו \`\`\`mdx או \`\`\`markdown.

בסוף המאמר, **חובה** להוסיף את הקטע הבא בדיוק (ללא שינויים):

---

## 🆘 זקוקים לעזרה מקצועית?

> **אל תתנו למזיקים להשתלט לכם על הבית.** הצוות של "איצ'י" ו"גיאת הדברות" זמין עבורכם עכשיו לייעוץ חינם והצעת מחיר משתלמת.
>
> <a href="https://wa.me/${CONTACT_PHONE}">👉 לחצו כאן לייעוץ בוואטסאפ</a> | <a href="tel:${CONTACT_PHONE}">📞 התקשרו עכשיו</a>
`.trim();

  try {
    const result = await model.generateContent(prompt);
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
