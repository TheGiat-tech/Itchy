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
 * פונקציה לשליפת תמונה מוויקיפדיה לפי שם מדעי
 */
async function getWikipediaImage(scientificName: string): Promise<string | null> {
  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      scientificName
    )}&prop=pageimages&format=json&pithumbsize=1000&redirects=1&origin=*`;
    
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    return pages[pageId]?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

/**
 * פונקציה לשליפת תמונה מ-iNaturalist (גיבוי)
 */
async function getINaturalistImage(scientificName: string): Promise<string | null> {
  try {
    const endpoint = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&is_active=true`;
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
 * קומפוננטת הראש של המזיק - מטפלת בתמונה ובכותרות
 */
export default async function PestHeader({ pest }: { pest: PestData }) {
  // לוגיקת בחירת תמונה: 1. ידני, 2. ויקיפדיה, 3. iNaturalist
  let imageUrl = pest.imageOverride || null;
  let source = pest.imageOverride ? "ידני" : "Wikipedia";

  if (!imageUrl) {
    imageUrl = await getWikipediaImage(pest.titleLatin);
  }

  if (!imageUrl) {
    imageUrl = await getINaturalistImage(pest.titleLatin);
    source = "iNaturalist";
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
