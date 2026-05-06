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

  // אתחול Gemini SDK
  const genAI = new GoogleGenerativeAI(apiKey);

  // מודל ברירת מחדל
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  console.log(`🧠 Using Gemini model: ${modelName}`);

  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const prompt = `
אתה מומחה SEO וכותב תוכן מקצועי עבור "Itchi" (איצ'י).

המשימה:
לכתוב מאמר מקצועי, איכותי ואמין (500-700 מילים) בנושא הדברה, מזיקים, חרקים, נחשים, מכרסמים או טבע בישראל.

המטרה:
ליצור תוכן SEO איכותי שיגרום לקורא להישאר באתר וליצור אמון.

הפלט חייב להיות MDX נקי (ללא תגיות קוד) עם ה-Frontmatter הבא בדיוק:

---
titleHebrew: "כותרת חזקה בעברית עם אמוג'י רלוונטי"
subtitle: "כותרת משנה מושכת שמסבירה את ערך המאמר"
date: "${today()}"
imageKeyword: "two or three English words describing the pest and treatment"
pestType: "סוג המזיק בעברית"
---

הנחיות לגוף המאמר:

1. השורה הראשונה חייבת להיות:
# [titleHebrew]

2. השתמש בכותרות:
## ו-###

3. הוסף אמוג'ים רלוונטיים:
🐜 🛡️ 🏠 ⚠️ ✅ 🔍

4. הדגש משפטים חשובים עם:
**bold**

5. שלב:
- רשימות תבליטים
- טיפים פרקטיים
- מידע אמין ומקצועי

6. אל תשתמש בתגיות קוד כמו:
\`\`\`
mdx
markdown
\`\`\`

7. כתוב בעברית טבעית, קריאה וזורמת.

בסוף המאמר חובה להוסיף בדיוק:

<a href="/contact">📍 ליצירת קשר וייעוץ בנושא מזיקים - לחצו כאן</a>
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

    // ניקוי תגיות markdown אם המודל מוסיף אותן
    mdxContent = mdxContent
      .replace(/^```(mdx|markdown)?\n/, "")
      .replace(/\n```$/, "")
      .trim();

    const suffix = Math.random()
      .toString(36)
      .slice(2, 8);

    const filePath = path.join(
      ARTICLES_DIR,
      `article-${Date.now()}-${suffix}.mdx`
    );

    fs.writeFileSync(filePath, mdxContent, "utf8");

    console.log(
      `✅ Article saved successfully! content/articles/${path.basename(filePath)}`
    );
  } catch (err) {
    console.error("❌ Generation failed:", err.message);
    process.exit(1);
  }
}

main();
