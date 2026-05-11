import { sql } from "@vercel/postgres";

export type ProductRow = {
  id: number;
  name: string;
  slug: string;
  price: number;
  store_url: string;
  image_url: string;
  is_in_stock: boolean;
  last_updated: string;
};

export const seedProducts = [
  {
    name: "טופ ג'ל להדברת נמלים (15 גרם)",
    slug: "top-gel-ants-15g",
    price: 89,
    store_url: "https://affiracle.com/s/TwftTS",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/0583558a8e3e890a7f3a44d3f71bff75.jpg?v=1670852917&width=1206",
  },
  {
    name: "גרנולר - פיתיון גרגירי (200 גרם)",
    slug: "granular-ant-bait-200g",
    price: 89,
    store_url: "https://affiracle.com/s/sf7zrv",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/b1bee52a0d21533a1931228b05b59a57.jpg?v=1670852952&width=1206",
  },
  {
    name: "טורפדו ג'ל נגד תיקנים (15 גרם)",
    slug: "torpedo-cockroach-gel-15g",
    price: 89,
    store_url: "https://affiracle.com/s/Vgd9Xz",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/67c1102072cd47f13ae46b88f117ebfb.jpg?v=1670853741&width=1206",
  },
  {
    name: "תרסיס קילר (750 סמ\"ק)",
    slug: "killer-spray-750cc",
    price: 49,
    store_url: "https://affiracle.com/s/qac48J",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/b18bbcc8cff9b0479b5ad2ba1162cf2a.jpg?v=1756117262&width=1206",
  },
  {
    name: "מרחיק מזיקים אלקטרוני SAKAL",
    slug: "sakal-electronic-repeller",
    price: 89,
    store_url: "https://affiracle.com/s/LfwF4V",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/6f56a13d102714f39ea5e16bb8f2e197.jpg?v=1670853086&width=1206",
  },
  {
    name: "קטלן סופה ליתושים ומעופפים (7W)",
    slug: "sufa-mosquito-killer-7w",
    price: 249,
    store_url: "https://affiracle.com/s/BFhVQ9",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/63d629c50d62933786448beec7af0a31.jpg?v=1670853476&width=1206",
  },
  {
    name: "קטלן STOPPER LED (14W)",
    slug: "stopper-led-14w",
    price: 189,
    store_url: "https://affiracle.com/s/7WxuSr",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/7291044110210.webp?v=1773829662&width=1206",
  },
  {
    name: "קוטל יתושים נייד USB",
    slug: "usb-portable-mosquito-killer",
    price: 59,
    store_url: "https://affiracle.com/s/9KvjDf",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/f4ced7270f583ebff5264a82e98d0f4b.jpg?v=1670859054&width=1206",
  },
  {
    name: "3 מארזים מלכודות עש המזון (18 יח')",
    slug: "food-moth-traps-18",
    price: 59,
    store_url: "https://affiracle.com/s/5QjmkS",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/d51a6c4d23526a7d5eaeb07e326dd941.png?v=1733153264&width=1206",
  },
  {
    name: "4 מארזים מלכודות עש הבגדים (8 יח')",
    slug: "clothes-moth-traps-8",
    price: 101,
    store_url: "https://affiracle.com/s/nc0od0",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/2_84f83fb1-7ca1-41f3-af80-fd1f6f30f9bf.png?v=1753697972&width=1206",
  },
  {
    name: "מלכודת SUPER CAT לעכברים וחולדות",
    slug: "super-cat-trap-rodents",
    price: 39,
    store_url: "https://affiracle.com/s/OijgVt",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/31d529d93acb07aa525875e605110917.jpg?v=1713451682&width=1206",
  },
  {
    name: "מזרק פיתיון מקצועי (60 מ\"ל)",
    slug: "rodent-bait-syringe-60ml",
    price: 79,
    store_url: "https://affiracle.com/s/UidCMp",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/52ae54226306d8b373f52d34b569aa61.jpg?v=1670858683&width=1206",
  },
  {
    name: "סט 3 מכשירי 'מרגמה' אולטרסוניים",
    slug: "margama-ultrasonic-set-3",
    price: 212,
    store_url: "https://affiracle.com/s/WCU7Dx",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/679d03f4a19840f59f8eeb52ee382300_19e6b954-447c-430b-9094-1f232a961b45.jpg?v=1700387517&width=1206",
  },
  {
    name: "מרסס ידני מקצועי (5 ליטר)",
    slug: "manual-sprayer-5l",
    price: 79,
    store_url: "https://affiracle.com/s/H5sUf7",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/ab788b5616d1f3182b6eca317e2de430.jpg?v=1671028410&width=1206",
  },
  {
    name: "מרסס הדברה לצמחים (1.5 ליטר)",
    slug: "plants-sprayer-1-5l",
    price: 29,
    store_url: "https://affiracle.com/s/qaJrIA",
    image_url:
      "https://zurmarket.co.il/cdn/shop/products/2dc37d69f74bf116238677b069139ded.png?v=1670859114&width=1206",
  },
  {
    name: "דזיטול לקרדית האבק (300 מ\"ל)",
    slug: "desitol-dust-mite-300ml",
    price: 39,
    store_url: "https://affiracle.com/s/suNGTv",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/7290109923932_S1_15-1.png?v=1756734374&width=1206",
  },
  {
    name: "מלכודות דבק לתיקנים (10 יח' + פיתיון)",
    slug: "cockroach-glue-traps-10",
    price: 49,
    store_url: "https://affiracle.com/s/QoKHI2",
    image_url:
      "https://zurmarket.co.il/cdn/shop/files/16_5e1524f1-3dd0-4770-80d6-d7b178f23cde.png?v=1755540301&width=1206",
  },
] as const;

export async function ensureProductsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      price NUMERIC(10, 2) NOT NULL,
      store_url TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
      last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function seedProductsTable() {
  await ensureProductsTable();

  for (const product of seedProducts) {
    await sql`
      INSERT INTO products (name, slug, price, store_url, image_url, is_in_stock, last_updated)
      VALUES (${product.name}, ${product.slug}, ${product.price}, ${product.store_url}, ${product.image_url}, TRUE, NOW())
      ON CONFLICT (slug)
      DO UPDATE SET
        name = EXCLUDED.name,
        store_url = EXCLUDED.store_url,
        image_url = EXCLUDED.image_url
    `;
  }
}
