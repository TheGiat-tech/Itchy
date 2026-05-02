interface PestImageProps {
  scientificName: string;
  altText: string;
}

type ImageResult = { url: string; source: "Wikipedia" | "iNaturalist" } | null;

async function fetchFromWikipedia(scientificName: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(scientificName.replace(/ /g, "_"));
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=800&redirects=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages as Record<
      string,
      { thumbnail?: { source: string } }
    >;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchFromINaturalist(scientificName: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(scientificName);
    const url = `https://api.inaturalist.org/v1/taxa?q=${encoded}&is_active=true`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.results?.[0]?.default_photo?.medium_url as string) ?? null;
  } catch {
    return null;
  }
}

async function resolveImage(scientificName: string): Promise<ImageResult> {
  const wikiUrl = await fetchFromWikipedia(scientificName);
  if (wikiUrl) return { url: wikiUrl, source: "Wikipedia" };

  const inatUrl = await fetchFromINaturalist(scientificName);
  if (inatUrl) return { url: inatUrl, source: "iNaturalist" };

  return null;
}

const containerClassName =
  "mt-6 mb-8 overflow-hidden rounded-2xl border border-gray-100 shadow-sm";

export default async function PestImage({ scientificName, altText }: PestImageProps) {
  if (!scientificName) return null;

  const image = await resolveImage(scientificName);

  if (!image) {
    return (
      <div
        className={`${containerClassName} flex flex-col items-center justify-center gap-2 bg-gray-50 py-12`}
        dir="rtl"
      >
        <span className="text-5xl">🔍</span>
        <p className="text-sm text-gray-400">לא נמצאה תמונה למזיק זה</p>
      </div>
    );
  }

  const captionSource =
    image.source === "Wikipedia" ? "ויקיפדיה / Wikimedia Commons" : "iNaturalist";

  return (
    <div className={containerClassName} dir="rtl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={altText}
        loading="lazy"
        className="w-full h-auto object-cover"
      />
      <p className="border-t border-gray-100 bg-gray-50 py-2 text-center text-xs text-gray-400">
        מקור התמונה: {captionSource}
      </p>
    </div>
  );
}
