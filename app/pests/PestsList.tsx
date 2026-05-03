"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Pest } from "@/lib/mdx";

interface Props {
  pests: Pest[];
}

export default function PestsList({ pests }: Props) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const q = query.toLowerCase();

  const filtered = pests.filter((pest) => {
    const matchesQuery =
      !q ||
      pest.frontmatter.title.toLowerCase().includes(q) ||
      (pest.frontmatter.titleLatin?.toLowerCase().includes(q) ?? false);
    const matchesCategory =
      !category || pest.frontmatter.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <div className="relative w-full max-w-xl mx-auto mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש מזיק (למשל: עקרב, תיקן, Camponotus...)"
          dir="rtl"
          className="w-full rounded-full border border-gray-200 bg-white py-3 pr-5 pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>
      <p className="text-gray-500 mb-8">{filtered.length} מזיקים נמצאו</p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>לא נמצאו מזיקים תואמים לחיפוש שלך.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pest) => (
            <Link
              key={pest.slug}
              href={`/pests/${pest.slug}`}
              className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 hover:-translate-y-1"
            >
              <h2 className="font-bold text-gray-800 text-lg">
                {pest.frontmatter.title}
              </h2>
              {pest.frontmatter.titleLatin && (
                <p className="text-sm text-gray-400 italic">
                  {pest.frontmatter.titleLatin}
                </p>
              )}
              {pest.frontmatter.habitat && (
                <p className="text-xs text-gray-500 mt-2">
                  🏠 {pest.frontmatter.habitat}
                </p>
              )}
              {pest.frontmatter.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {pest.frontmatter.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
