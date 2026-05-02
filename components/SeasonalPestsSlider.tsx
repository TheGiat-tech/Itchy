"use client";

import { useRef } from "react";
import Link from "next/link";

interface SeasonalPest {
  slug: string;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
}

const SEASONAL_PESTS: SeasonalPest[] = [
  {
    slug: "little-fire-ant",
    emoji: "🐜",
    title: "נמלת האש הקטנה",
    subtitle: "Little Fire Ant",
    tag: "פולשן עונתי",
  },
  {
    slug: "asian-tiger-mosquito",
    emoji: "🦟",
    title: "יתוש הנמר האסייתי",
    subtitle: "Asian Tiger Mosquito",
    tag: "פעיל בקיץ",
  },
  {
    slug: "khumeini-beetle",
    emoji: "🪲",
    title: "חיפושית חומיני",
    subtitle: "Khumeini Beetle",
    tag: "בעונת החום",
  },
  {
    slug: "german-cockroach",
    emoji: "🪳",
    title: "תיקן גרמני",
    subtitle: "German Cockroach",
    tag: "כל השנה",
  },
  {
    slug: "bed-bug",
    emoji: "🛏️",
    title: "פשפש המיטה",
    subtitle: "Bed Bug",
    tag: "עלייה בקיץ",
  },
];

const SCROLL_AMOUNT = 240; // approximate card width (176px) + gap (16px) + buffer

export default function SeasonalPestsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "right" | "left") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative" dir="rtl">
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50 transition-colors -mr-4"
        aria-label="הקודם"
      >
        ›
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 px-2 hide-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {SEASONAL_PESTS.map((pest) => (
          <Link
            key={pest.slug}
            href={`/pests/${pest.slug}`}
            className="flex-shrink-0 w-44 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 p-4 text-center"
          >
            <div className="text-4xl mb-2">{pest.emoji}</div>
            <span className="inline-block text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full mb-2">
              {pest.tag}
            </span>
            <h3 className="font-bold text-gray-800 text-sm leading-snug">
              {pest.title}
            </h3>
            <p className="text-xs text-gray-400 italic mt-0.5">
              {pest.subtitle}
            </p>
          </Link>
        ))}
      </div>

      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50 transition-colors -ml-4"
        aria-label="הבא"
      >
        ‹
      </button>
    </div>
  );
}
