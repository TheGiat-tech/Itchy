"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Pest } from "@/lib/mdx";

interface Props {
  pests: Pest[];
}

export default function PestsList({ pests }: Props) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";

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
              className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
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
