// components/PestHeader.tsx
import React from 'react';

interface PestData {
  titleHebrew: string;
  titleEnglish?: string;
  titleLatin: string;
  imageOverride?: string;
  category?: string;
}

/**
 * פונקציה שמנקה את השם הלטיני מסלאשים, סימני דולר והערות
 * כדי שויקיפדיה תצליח למצוא את הערך המדויק.
 */
function cleanScientificName(name: string): string {
  if (!name) return "";
  // מוריד סימני דולר, לוקח רק את מה שלפני הסלאש או הסוגריים, ומנקה רווחים
  return name.replace(/\$/g, '').split('/')[0].split('(')[0].trim();
}

/**
 * ויקיפדיה בעדיפות עליונה (באמצעות ה-REST API המדויק לתמונות ראשיות)
 */
async function getWikipediaImage(scientificName: string): Promise<string | null> {
  const cleanName = cleanScientificName(scientificName);
  if (!cleanName) return null;

  try {
    // ה-REST API מביא אך ורק את התמונה הראשית של הערך (ללא מפות ואייקונים)
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    // עדיפות לתמונה המקורית הגדולה, ואם אין - לתמונה המוקטנת
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

/**
 * iNaturalist - גיבוי בלבד! מופעל רק אם ויקיפדיה נכשלה.
 */
async function getINaturalistImage(scientificName: string): Promise<string | null> {
  const cleanName = cleanScientificName(scientificName);
  if (!cleanName) return null;

  try {
    const endpoint = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(cleanName)}&is_active=true&rank=species,genus`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;

    const data = await res.json();
    return data.results[0]?.default_photo?.medium_url || null;
  } catch {
    return null;
  }
}

const containerClassName =
  "mt-6 mb-8 overflow-hidden rounded-2xl border border-gray-100 shadow-sm";

/**
 * קומפוננטת הראש של המזיק
 */
export default async function PestHeader({ pest }: { pest: PestData }) {
  // 1. קודם כל בודק אם שמת לינק ידני
  let imageUrl = pest.imageOverride || null;
  let source = pest.imageOverride ? "תמונה מותאמת אישית" : "Wikipedia";

  // 2. אם אין ידני, מחפש בויקיפדיה (עדיפות עליונה)
  if (!imageUrl) {
    imageUrl = await getWikipediaImage(pest.titleLatin);
  }

  // 3. רק אם ויקיפדיה לא מצאה כלום (או החזירה שגיאה), עובר לגיבוי
  if (!imageUrl) {
    const inatImage = await getINaturalistImage(pest.titleLatin);
    if (inatImage) {
      imageUrl = inatImage;
      source = "iNaturalist";
    }
  }

  const captionSource =
    source === "Wikipedia" ? "ויקיפדיה / Wikimedia Commons" : source;

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {pest.titleHebrew}
        </h1>
        {pest.titleEnglish && (
          <p className="text-base text-gray-500 mt-0.5">{pest.titleEnglish}</p>
        )}
        {pest.titleLatin && (
          <p className="text-lg text-gray-400 italic mt-1">{pest.titleLatin}</p>
        )}
      </div>

      {imageUrl ? (
        <div className={containerClassName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={pest.titleHebrew}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
          <p className="border-t border-gray-100 bg-gray-50 py-2 text-center text-xs text-gray-400">
            מקור התמונה: {captionSource}
          </p>
        </div>
      ) : (
        <div
          className={`${containerClassName} flex flex-col items-center justify-center gap-2 bg-gray-50 py-12`}
        >
          <span className="text-5xl">🔍</span>
          <p className="text-sm text-gray-400">לא נמצאה תמונה למזיק זה</p>
        </div>
      )}
    </div>
  );
}
