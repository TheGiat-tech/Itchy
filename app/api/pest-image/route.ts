/**
 * GET /api/pest-image?name=<scientific+name>
 *
 * Fetches the Wikipedia page-image thumbnail for a given scientific name and
 * proxies it back to the browser.  Used by pest list cards so that images
 * load in the client without exposing the upstream URL.
 *
 * Falls back to the local default SVG on any error.
 * Responses are cached for 24 hours (Next.js Data Cache + Cache-Control).
 */
import { NextRequest, NextResponse } from "next/server";

const FALLBACK_IMAGE = "/images/articles/default-pest-control.svg";
const CACHE_SECONDS = 60 * 60 * 24; // 24 h
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT = "ItchyPestSite/1.0 (https://itchy.co.il)";
const MAX_NAME_LENGTH = 120;

/** Allowed upstream origins for proxied images. */
const ALLOWED_ORIGINS = [
  "https://upload.wikimedia.org",
  "https://inaturalist-open-data.s3.amazonaws.com",
  "https://static.inaturalist.org",
];

const INATURALIST_API = "https://api.inaturalist.org/v1/taxa";

function sanitizeName(raw: string | null): string {
  if (!raw) return "";
  // Allow only characters valid in Latin scientific names and common Unicode
  return raw
    .slice(0, MAX_NAME_LENGTH)
    .replace(/[^a-zA-Z0-9 \-.'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isAllowedUrl(url: string): boolean {
  return ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
}

/**
 * Query the Wikipedia API for the thumbnail of a page matching `name`.
 * Returns the thumbnail URL or null.
 */
async function fetchWikipediaThumb(name: string): Promise<string | null> {
  const url = new URL(WIKIPEDIA_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", name.replace(/ /g, "_"));
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("format", "json");
  url.searchParams.set("pithumbsize", "800");
  url.searchParams.set("redirects", "1");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    // next.revalidate stores in Next.js Data Cache (server-side).
    // Cache-Control on the response handles browser/CDN caching.
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const pages: Record<string, { thumbnail?: { source: string } }> =
    data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const thumbUrl = page?.thumbnail?.source ?? null;
  if (!thumbUrl || !isAllowedUrl(thumbUrl)) return null;
  return thumbUrl;
}

/**
 * Query the iNaturalist API for a thumbnail matching `name`.
 * Returns the medium_url or null.
 */
async function fetchINaturalistThumb(name: string): Promise<string | null> {
  try {
    const url = new URL(INATURALIST_API);
    url.searchParams.set("q", name);
    url.searchParams.set("is_active", "true");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const thumbUrl: string | null = data?.results?.[0]?.default_photo?.medium_url ?? null;
    if (!thumbUrl || !isAllowedUrl(thumbUrl)) return null;
    return thumbUrl;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const rawName = req.nextUrl.searchParams.get("name");
  const name = sanitizeName(rawName);

  if (!name) {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
  }

  try {
    const thumbUrl = await fetchWikipediaThumb(name) ?? await fetchINaturalistThumb(name);

    if (!thumbUrl) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
    }

    // Proxy the bytes so the browser never talks directly to Wikipedia/S3.
    const upstream = await fetch(thumbUrl, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=3600`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
  }
}
