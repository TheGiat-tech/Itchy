import Link from "next/link";
import { getAllPestSlugs, getPestBySlug } from "@/lib/mdx";

interface NextArticleLinkProps {
  currentSlug: string;
}

export default function NextArticleLink({ currentSlug }: NextArticleLinkProps) {
  const slugs = getAllPestSlugs();
  const currentIndex = slugs.indexOf(currentSlug);

  if (currentIndex === -1 || currentIndex === slugs.length - 1) return null;

  const nextSlug = slugs[currentIndex + 1];
  const nextPest = getPestBySlug(nextSlug);
  if (!nextPest) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-100" dir="rtl">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        המשך קריאה
      </p>
      <Link
        href={`/pests/${nextSlug}`}
        className="flex items-center justify-between gap-4 bg-green-50 hover:bg-green-100 border border-green-100 rounded-2xl p-4 transition-colors group"
      >
        <div>
          <p className="text-xs text-gray-500 mb-0.5">התוכן הבא בתור:</p>
          <h4 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">
            {nextPest.frontmatter.title}
          </h4>
          {nextPest.frontmatter.titleLatin && (
            <p className="text-xs text-gray-400 italic mt-0.5">
              {nextPest.frontmatter.titleLatin}
            </p>
          )}
        </div>
        <span className="text-2xl text-green-500 flex-shrink-0">←</span>
      </Link>
    </div>
  );
}
