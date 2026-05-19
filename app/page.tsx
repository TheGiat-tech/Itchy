import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import SeasonalPestsSlider from "@/components/SeasonalPestsSlider";
import { getAllPests } from "@/lib/mdx"; 

export const metadata: Metadata = {
  title: "Itchy – אנציקלופדיית המזיקים של ישראל",
  description:
    "זהה מזיקים, למד על מחזור החיים שלהם ומצא פתרונות. המדריך המקיף ביותר למזיקים בישראל.",
};

export const revalidate = 3600; 

// תמונות גיבוי ריאליסטיות לחלוטין (צילומי טבע אמיתיים מוויקיפדיה) כדי למנוע מוקאפים
const REALISTIC_FALLBACKS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Acanthoscelides_obtectus_bl%C3%A2nchen.jpg/1200px-Acanthoscelides_obtectus_bl%C3%A2nchen.jpg", 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Vespa_orientalis_P1.jpg/1200px-Vespa_orientalis_P1.jpg", 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Formica_rufa_clear.jpg/1200px-Formica_rufa_clear.jpg", 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Kakerlake_macro.jpg/1200px-Kakerlake_macro.jpg" 
];

// מוצרים אמיתיים - החלף את כתובות ה-img לקישורי התמונות המדויקים שהעתקת מהאתר שלך
const SHOP_PRODUCTS = [
  { 
    id: 1, 
    title: "ג'ל פיתיון מקצועי לנמלים", 
    price: "89 ₪", 
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Formica_rufa_clear.jpg/500px-Formica_rufa_clear.jpg", 
    desc: "פיתיון ג'ל מתקדם להשמדת קני נמלים מהיסוד." 
  },
  { 
    id: 2, 
    title: "מלכודת חרקים מעופפים ביתית", 
    price: "149 ₪", 
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Vespa_orientalis_P1.jpg/500px-Vespa_orientalis_P1.jpg", 
    desc: "פתרון ניטור שקט ויעיל ללכידת מעופפים בבית ובמרפסת." 
  },
  { 
    id: 3, 
    title: "תרסיס מניעה DIY למטבח", 
    price: "120 ₪", 
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Kakerlake_macro.jpg/500px-Kakerlake_macro.jpg", 
    desc: "ערכת ריסוס עצמי ממוקדת לטיפול בתיקנים וחרקי מחסן." 
  },
  { 
    id: 4, 
    title: "דוקרני נירוסטה מקצועיים ליונים", 
    price: "45 ₪", 
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Pigeon_infestation_control.jpg/500px-Pigeon_infestation_control.jpg", 
    desc: "בסיס פוליקרבונט עמיד עם קוצים להרחקת יונים מחלונות ומרפסות." 
  }
];

// פונקציית עזר לוודא שאנחנו מקבלים רק תמונה אמיתית ומרימים פולבק אם יש נתיב זמני או מוקאפ קודם
function getValidImage(imgUrl: string, index: number): string {
  if (!imgUrl || imgUrl.includes("pest-image") || imgUrl.includes("placeholder") || imgUrl === "") {
    return REALISTIC_FALLBACKS[index % REALISTIC_FALLBACKS.length];
  }
  return imgUrl;
}

// פונקציית עזר לחיתוך דינמי של תוכן המאמר במידה ושדות התיאור הקיצרים ריקים
function getPostExcerpt(post: any, defaultText: string): string {
  const textSource = post.identification || post.subtitle || post.content || post.body || "";
  if (!textSource || textSource.length < 5) return defaultText;
  
  // ניקוי תגיות MDX/HTML פשוטות אם ישנן, וחיתוך ל-120 תווים
  const cleanText = textSource.replace(/[#*`_]/g, "").trim();
  return cleanText.length > 120 ? cleanText.slice(0, 120) + "..." : cleanText;
}

export default async function HomePage() {
  const allPests: any[] = getAllPests() || [];

  // 1. כתבות ראשיות
  const heroPost = allPests[0] || null;
  const latestPosts = allPests.slice(1, 5);

  // 2. פילטור מוגן עם פולבק אוטומטי למאמרים קיימים
  let invasivePests = allPests.filter(p => p.category === "מינים פולשים" || p.pestType === "פולש").slice(0, 4);
  if (invasivePests.length === 0 && allPests.length > 4) {
    invasivePests = allPests.slice(2, 6); 
  }

  let diyGuides = allPests.filter(p => p.category === "מזיקי גינה" || p.category === "מניעה").slice(0, 3);
  if (diyGuides.length === 0 && allPests.length > 2) {
    diyGuides = allPests.slice(1, 4); 
  }

  return (
    <>
      <main id="main-content" className="flex-1 bg-gray-50 text-gray-900" dir="rtl">
        
        {/* אזור החיפוש וההרו */}
        <section className="bg-gradient-to-b from-green-50 to-white py-16 px-4 text-center border-b border-gray-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            אנציקלופדיית המזיקים של ישראל
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            זהה כל מזיק, הבן את מחזור החיים שלו, ומצא את הפתרון הנכון.
          </p>
          <SearchBar placeholder="איזה מזיק מטריד אותך? חפש כאן..." />
        </section>

        {/* SECTION 1: הבלוק המגזיני הראשי */}
        {heroPost ? (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-950 border-b-2 border-orange-600 pb-2 -mb-[9px]">
                כתבות ומדריכים אחרונים במערכת
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* המאמר הראשי הגדול */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-64 sm:h-96 w-full bg-gray-100">
                  <Image 
                    src={getValidImage(heroPost.image, 0)} 
                    alt={heroPost.titleHebrew || heroPost.title || "איצ'י מזיקים"} 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-wide text-orange-600">
                    {heroPost.category || heroPost.pestType || "מדריך זיהוי"}
                  </span>
                  <Link href={`/pests/${heroPost.slug}`}>
                    <h3 className="mt-2 text-2xl font-bold text-gray-950 hover:text-orange-600 transition-colors">
                      {heroPost.titleHebrew || heroPost.title}
                    </h3>
                  </Link>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                    {getPostExcerpt(heroPost, "כנסו לקריאת המדריך המלא לזיהוי, טיפול ומניעה של המזיק בישראל.")}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>עודכן ב-{heroPost.date || heroPost.lastUpdated || "2026"}</span>
                    <span className="text-orange-600 font-semibold">לקריאת הכתבה המלאה ←</span>
                  </div>
                </div>
              </div>

              {/* טור המאמרים הקטנים שלצידו */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">עדכונים אחרונים</h3>
                {latestPosts.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">המאמרים הבאים יעלו בקרוב...</p>
                ) : (
                  latestPosts.map((post, idx) => (
                    <div key={post.slug} className="flex gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
                        <Image src={getValidImage(post.image, idx + 1)} alt={post.titleHebrew || post.title} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <Link href={`/pests/${post.slug}`}>
                          <h4 className="font-bold text-sm text-gray-900 hover:text-orange-600 line-clamp-2 transition-colors">
                            {post.titleHebrew || post.title}
                          </h4>
                        </Link>
                        <span className="text-[11px] text-gray-400">{post.date || post.lastUpdated || "2026"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : (
          <div className="text-center py-12 text-gray-400 italic text-sm">המערכת טוענת את אנציקלופדיית המזיקים...</div>
        )}

        {/* קטגוריות המזיקים של איצ'י */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ניווט לפי קטגוריות מזיקים</h2>
          <CategoryGrid />
        </section>

        {/* SECTION 2: חנות המוצרים של איצ'י - שונה ל-<img> רגיל כדי לעקוף חסימות תמונות חיצוניות */}
        <section className="max-w-6xl mx-auto px-4 py-12 bg-white rounded-xl border border-gray-100 my-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">חנות המוצרים של איצ'י</h2>
              <p className="text-xs text-gray-400 mt-1">חומרי הדברה ואביזרי הרחקה מומלצים לטיפול עצמי בטוח</p>
            </div>
            <Link href="/shop" className="text-sm text-orange-600 font-semibold hover:underline">לכל המוצרים בחנות 🡠</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOP_PRODUCTS.map((product) => (
              <div key={product.id} className="flex flex-col justify-between p-4 rounded-lg border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                <div>
                  <div className="relative h-36 w-full bg-white rounded-md overflow-hidden mb-3 flex items-center justify-center">
                    {/* שימוש ב-img רגיל כדי להבטיח טעינת כתובת אינטרנט ישירה מהאתר שלך */}
                    <img 
                      src={product.img} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain p-2" 
                    />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{product.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-3">
                  <span className="text-base font-extrabold text-gray-950">{product.price}</span>
                  <Link href={`/shop`} className="text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded transition-colors">
                    לרכישה מהירה
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: רצועת מינים פולשים ומתפרצים */}
        {invasivePests.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-950 border-b-2 border-red-600 pb-2 -mb-[9px]">
                הפולשים והמתפרצים בישראל
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {invasivePests.map((pest, idx) => (
                <div key={pest.slug} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-40 w-full bg-gray-50">
                    <Image src={getValidImage(pest.image, idx + 3)} alt={pest.titleHebrew || pest.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <Link href={`/pests/${pest.slug}`}>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
                        {pest.titleHebrew || pest.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {getPostExcerpt(pest, "מדריך זיהוי וטיפול מקיף ומקצועי מטעם המערכת.")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: רצועת טיפים ומניעה DIY */}
        {diyGuides.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-950 border-b-2 border-green-600 pb-2 -mb-[9px]">
                לא מזיק לדעת: מדריכי מניעה עצמית
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {diyGuides.map((guide) => (
                <div key={guide.slug} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">DIY</span>
                  <Link href={`/pests/${guide.slug}`}>
                    <h3 className="font-bold text-base text-gray-900 hover:text-green-600 mt-2 transition-colors">
                      {guide.titleHebrew || guide.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {getPostExcerpt(guide, "מדריך מעשי ושלבים פשוטים לביצוע מניעה עצמית יעילה בבית ובחצר.")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* הסליידר המקורי */}
        <section className="max-w-6xl mx-auto px-4 py-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            מזיקים עונתיים ופופולריים
          </h2>
          <SeasonalPestsSlider />
        </section>

      </main>
      <Footer />
    </>
  );
}
