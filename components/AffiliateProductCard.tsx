import Image from "next/image";

export interface AffiliateProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  affiliateUrl: string;
  merchantName: string;
}

export default function AffiliateProductCard({
  title,
  price,
  imageUrl,
  affiliateUrl,
  merchantName,
}: AffiliateProduct) {
  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {title}
        </h3>

        <p className="text-2xl font-extrabold text-green-700 mt-auto">
          ₪{price.toLocaleString("he-IL")}
        </p>

        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors duration-150"
        >
          לרכישה ב-{merchantName}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 flex-shrink-0 rotate-[225deg]"
            aria-hidden="true"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </article>
  );
}
