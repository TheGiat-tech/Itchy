/**
 * GET /api/article-image?q=<search+query>
 *
 * Searches Wikimedia Commons for a JPEG photo matching the given query and
 * proxies the best result back to the browser.
 *
 * Falls back to the local default SVG when Wikimedia is unreachable or
 * returns no usable result.
 *
 * Cached at the edge for 24 hours so repeated page loads are fast.
 */
import { NextRequest, NextResponse } from "next/server";

const FALLBACK_IMAGE = "/images/articles/default-pest-control.svg";
const CACHE_SECONDS = 60 * 60 * 24; // 24 h
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "ItchyPestSite/1.0 (https://itchy.co.il)";
const MAX_QUERY_LENGTH = 200;

/** Allowed upstream origin for proxied images – only Wikimedia. */
const ALLOWED_IMAGE_ORIGIN = "https://upload.wikimedia.org";

function sanitizeQuery(raw: string | null): string {
  if (!raw) return "";
  // Allow only alphanumeric chars, spaces, and a small set of safe punctuation.
  // This prevents any injection-style misuse when the value is forwarded to
  // the Wikimedia API as a URL parameter.
  return raw
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[^a-zA-Z0-9 +\-.,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface WikiSearchResult {
  title: string;
}

interface WikiImageInfo {
  thumburl?: string;
  url?: string;
  mime?: string;
}

/**
 * Search Wikimedia Commons (File: namespace = 6) for the given query.
 * Returns an array of File: titles.
 */
async function searchCommons(query: string): Promise<string[]> {
  const url = new URL(COMMONS_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("srnamespace", "6");
  url.searchParams.set("format", "json");
  url.searchParams.set("srlimit", "12");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    // next.revalidate stores the result in the Next.js Data Cache (server-side);
    // the browser/CDN Cache-Control header is set on the final proxied response.
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.query?.search ?? []).map((r: WikiSearchResult) => r.title as string);
}

/**
 * Given a File: title, fetch its direct download URL from Wikimedia Commons.
 * Requests a scaled version (max 1200 px wide).
 */
async function getImageInfo(
  fileTitle: string
): Promise<WikiImageInfo | null> {
  const url = new URL(COMMONS_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("titles", fileTitle);
  url.searchParams.set("iiprop", "url|mime");
  url.searchParams.set("iiurlwidth", "1200");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const pages: Record<string, { imageinfo?: WikiImageInfo[] }> =
    json.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.imageinfo?.[0] ?? null;
}

/**
 * Walk the search results and return the first direct image URL that:
 *   - is a JPEG (preferred) or PNG/WEBP
 *   - lives on upload.wikimedia.org
 */
async function findBestImageUrl(titles: string[]): Promise<string | null> {
  // Two passes: first prefer JPEG, then accept other raster formats
  for (const pass of [/\.(jpg|jpeg)$/i, /\.(png|webp)$/i]) {
    for (const title of titles) {
      if (!pass.test(title)) continue;
      const info = await getImageInfo(title);
      if (!info) continue;
      const imgUrl = info.thumburl || info.url;
      if (!imgUrl) continue;
      // Safety: only proxy images from Wikimedia's upload CDN
      if (!imgUrl.startsWith(ALLOWED_IMAGE_ORIGIN)) continue;
      return imgUrl;
    }
  }
  return null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const rawQuery = req.nextUrl.searchParams.get("q");
  const query = sanitizeQuery(rawQuery);

  if (!query) {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
  }

  try {
    const titles = await searchCommons(query);
    const imgUrl = titles.length > 0 ? await findBestImageUrl(titles) : null;

    if (!imgUrl) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
    }

    // Proxy the image bytes so the browser never talks directly to Wikimedia
    const upstream = await fetch(imgUrl, {
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
    // Network error, Wikimedia down, etc. – serve the local fallback.
    return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
  }
}
