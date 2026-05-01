import Link from "next/link";
import { getAllPests } from "@/lib/mdx";

interface RelatedPestsProps {
  currentSlug: string;
  category?: string;
}

const allPests = getAllPests();

export default function RelatedPests({
  currentSlug,
  category,
}: RelatedPestsProps) {

  const related = allPests
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        (!category || p.frontmatter.category === category)
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-10" dir="rtl">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        אנשים צפו גם ב...
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((pest) => (
          <Link
            key={pest.slug}
            href={`/pests/${pest.slug}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
          >
            <h4 className="font-bold text-gray-800 text-base leading-snug">
              {pest.frontmatter.title}
            </h4>
            {pest.frontmatter.titleLatin && (
              <p className="text-xs text-gray-400 italic mt-0.5">
                {pest.frontmatter.titleLatin}
              </p>
            )}
            {pest.frontmatter.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {pest.frontmatter.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
