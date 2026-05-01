"use client";

import { useEffect, useState } from "react";

interface PestImageProps {
  titleLatin: string;
  pestName: string;
}

export default function PestImage({ titleLatin, pestName }: PestImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!titleLatin) return;

    const controller = new AbortController();
    const encoded = encodeURIComponent(titleLatin.replace(/ /g, "_"));
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&pithumbsize=600&format=json&origin=*`;

    fetch(apiUrl, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const pages = data?.query?.pages as Record<
          string,
          { thumbnail?: { source: string } }
        >;
        if (!pages) return;
        const page = Object.values(pages)[0];
        const src = page?.thumbnail?.source ?? null;
        setImageUrl(src);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          // Silently fail – image is supplementary
        }
      });

    return () => controller.abort();
  }, [titleLatin]);

  if (!imageUrl) return null;

  return (
    <div className="mt-6 mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={pestName}
        loading="lazy"
        className="w-full max-h-72 object-cover"
      />
      <p className="text-center text-xs text-gray-400 py-2 bg-gray-50 border-t border-gray-100">
        מקור התמונה: ויקיפדיה / Wikimedia Commons
      </p>
    </div>
  );
}
