"use server";

import { load } from "cheerio";
import { sql } from "@vercel/postgres";
import { seedProductsTable, type ProductRow } from "@/lib/products-db";

type SyncProductsResult = {
  success: boolean;
  updated: number;
  failed: number;
  errors: string[];
};
const SYNC_CONCURRENCY = 4;

function parsePrice(rawValue: string) {
  const cleaned = rawValue.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return null;

  const commaIndex = cleaned.lastIndexOf(",");
  const dotIndex = cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (commaIndex > -1 && dotIndex > -1) {
    normalized =
      commaIndex > dotIndex
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (commaIndex > -1) {
    normalized = /,\d{1,2}$/.test(cleaned)
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function readJsonLdBlocks(html: string) {
  const $ = load(html);
  const values: Record<string, unknown>[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const rawJson = $(element).text().trim();
    if (!rawJson) return;

    try {
      const parsed = JSON.parse(rawJson) as unknown;
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && typeof item === "object") {
            values.push(item as Record<string, unknown>);
          }
        });
      } else if (parsed && typeof parsed === "object") {
        values.push(parsed as Record<string, unknown>);
      }
    } catch {
      return;
    }
  });

  return values;
}

function extractPriceAndStock(html: string) {
  const $ = load(html);

  const metaPrice =
    $('meta[property="product:price:amount"]').attr("content") ??
    $('meta[name="twitter:data1"]').attr("content");

  if (metaPrice) {
    const price = parsePrice(metaPrice);
    if (price !== null) {
      const availabilityMeta = $('meta[property="product:availability"]').attr(
        "content",
      );
      const isInStock =
        availabilityMeta?.toLowerCase() !== "out of stock" &&
        availabilityMeta?.toLowerCase() !== "out_of_stock";
      return { price, isInStock };
    }
  }

  for (const block of readJsonLdBlocks(html)) {
    const offers = block.offers;
    const offerData = Array.isArray(offers) ? offers[0] : offers;
    if (!offerData || typeof offerData !== "object") continue;

    const priceValue = (offerData as Record<string, unknown>).price;
    const availability = (offerData as Record<string, unknown>).availability;

    if (typeof priceValue === "string" || typeof priceValue === "number") {
      const price = parsePrice(String(priceValue));
      if (price === null) continue;

      const availabilityText =
        typeof availability === "string" ? availability.toLowerCase() : "";
      const isInStock = !availabilityText.includes("outofstock");
      return { price, isInStock };
    }
  }

  const fallbackPrice =
    $('[data-product-price]').first().text() ||
    $(".price-item--regular").first().text() ||
    $(".price .money").first().text();
  const parsedFallbackPrice = fallbackPrice ? parsePrice(fallbackPrice) : null;
  const pageText = $("body").text().toLowerCase();
  const isInStock =
    !pageText.includes("out of stock") &&
    !pageText.includes("sold out") &&
    !pageText.includes("אזל");

  if (parsedFallbackPrice === null) {
    return null;
  }

  return { price: parsedFallbackPrice, isInStock };
}

export async function syncProductsFromStore(): Promise<SyncProductsResult> {
  await seedProductsTable();

  const { rows } = await sql<ProductRow>`
    SELECT id, name, slug, price, store_url, image_url, is_in_stock, last_updated
    FROM products
    ORDER BY id ASC
  `;

  const errors: string[] = [];
  const syncProduct = async (product: ProductRow) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      let response: Response;

      try {
        response = await fetch(product.store_url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; ItchyBot/1.0; +https://itchy.co.il)",
          },
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        return {
          success: false,
          error: `${product.slug}: Failed to fetch (${response.status} ${response.statusText})`,
        };
      }

      const html = await response.text();
      const parsed = extractPriceAndStock(html);

      if (!parsed) {
        return { success: false, error: `${product.slug}: Could not parse price` };
      }

      await sql`
        UPDATE products
        SET price = ${parsed.price},
            is_in_stock = ${parsed.isInStock},
            last_updated = NOW()
        WHERE id = ${product.id}
      `;

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: `${product.slug}: ${errorMessage}` };
    }
  };

  const results: PromiseSettledResult<{ success: boolean; error?: string }>[] = [];

  for (let i = 0; i < rows.length; i += SYNC_CONCURRENCY) {
    const batch = rows.slice(i, i + SYNC_CONCURRENCY);
    const batchResults = await Promise.allSettled(batch.map(syncProduct));
    results.push(...batchResults);
  }
  let updated = 0;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;

    if (result.value.success) {
      updated += 1;
      continue;
    }

    errors.push(result.value.error ?? "Unknown sync error");
  }

  return {
    success: errors.length === 0,
    updated,
    failed: errors.length,
    errors,
  };
}
