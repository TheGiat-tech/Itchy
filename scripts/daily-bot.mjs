#!/usr/bin/env node
/**
 * scripts/daily-bot.mjs
 *
 * Daily AI content-generation bot.
 * Generates a Hebrew article about pest control / home environment and saves it
 * as an MDX file under content/articles/.
 *
 * Usage:
 *   node scripts/daily-bot.mjs
 *
 * Environment variables:
 *   OPENAI_API_KEY  – required (or swap out the AI call for your preferred LLM).
 *   ARTICLE_TOPIC   – optional override for the topic to write about.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a slug from a Hebrew or English string */
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[\u0590-\u05FF]/g, "") // strip Hebrew letters (use English slug)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80)
    || `article-${Date.now()}`;
}

/** ISO date string for today */
function today() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Call the OpenAI Chat Completions API and return the assistant's message text.
 * Swap this function body to use any other LLM / API.
 */
async function callAI(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY environment variable");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// Prompt templates
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `
אתה כותב תוכן מקצועי לאתר "Itchy" – אנציקלופדיית המזיקים וההדברה הישראלית.
כתוב בעברית ברורה, מקצועית וידידותית.
הפלט שלך יהיה קובץ MDX בלבד (ללא קוד נוסף, ללא הסברים).
`.trim();

/**
 * Build the user prompt for the AI.
 * @param {string} topic - The article topic.
 * @returns {string}
 */
function buildUserPrompt(topic) {
  return `
כתוב מאמר בלוג מקצועי בעברית בנושא: "${topic}".

הפלט חייב להיות בפורמט MDX עם frontmatter בדיוק כך:

---
title: "<כותרת המאמר>"
excerpt: "<תקציר קצר של 1-2 משפטים>"
date: "${today()}"
category: "<קטגוריה: מניעה | זיהוי | הדברה | בריאות | עונתי>"
---

<גוף המאמר בעברית, בפורמט Markdown, עם כותרות ## ו-### ורשימות>

כללים:
- אל תוסיף \`\`\`mdx או \`\`\`markdown – הפלט עצמו הוא ה-MDX
- אורך: 400-700 מילים
- כלול לפחות 3 כותרות משנה (##)
- כתוב בגוף שלישי / מקצועי אך נגיש
`.trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Ensure the articles directory exists
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });

  // Determine topic
  const topic =
    process.env.ARTICLE_TOPIC ||
    pickRandomTopic();

  console.log(`🤖 Generating article on: "${topic}"`);

  let mdxContent;
  try {
    mdxContent = await callAI(SYSTEM_PROMPT, buildUserPrompt(topic));
  } catch (err) {
    console.error("❌ AI call failed:", err.message);
    process.exit(1);
  }

  // Derive slug from the title extracted from frontmatter (or fall back to topic)
  const titleMatch = mdxContent.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const titleForSlug = titleMatch ? titleMatch[1] : topic;
  const slug = toSlug(titleForSlug) || `article-${today()}`;
  const filename = `${slug}.mdx`;
  const filePath = path.join(ARTICLES_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.warn(`⚠️  File already exists, skipping: ${filename}`);
    process.exit(0);
  }

  fs.writeFileSync(filePath, mdxContent, "utf8");
  console.log(`✅ Article saved: content/articles/${filename}`);
}

// ---------------------------------------------------------------------------
// Random topic pool (used when ARTICLE_TOPIC env var is not set)
// ---------------------------------------------------------------------------

const TOPICS = [
  "איך למנוע פלישת נמלים בקיץ",
  "סכנות בריאותיות של קרדית האבק בבית",
  "ההבדל בין חרקי שדה לחרקי עיר",
  "כיצד לזהות נגיעות של עש הבגדים",
  "שיטות הדברה ידידותיות לסביבה לחקלאים",
  "מה לעשות אם נשכת מעכביש",
  "כיצד פועלים תאי פיתיון לג'וקים",
  "האם חרקים מועילים בגינה שלי?",
  "מניעת מכרסמים בחורף – המדריך המלא",
  "זבובים בבית: גורמים ופתרונות",
  "למה חשוב לטפל בנגיעות לפני הקיץ",
  "הדברה ביולוגית – מה זה ואיך עובד",
];

function pickRandomTopic() {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

main();
