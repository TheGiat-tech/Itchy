import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import SeasonalPestsSlider from "@/components/SeasonalPestsSlider";
import { getAllPests } from "@/lib/mdx"; // ודא שפונקציה זו קיימת ב-lib/mdx.ts

export const metadata: Metadata = {
  title: "Itchy – אנציקלופדיית המזיקים של ישראל",
  description:
    "זהה מזיקים, למד על מחזור החיים שלהם ומצא פתרונות. המדריך המקיף ביותר למזיקים בישראל.",
};

export const revalidate = 3600; // האתר יתרנדר מחדש ברקע כל שעה כדי להציג את המאמרים החדשים מהבוט

export default async function HomePage() {
// שאיבת המאמרים ישירות מה-MDX עם הסקת סוגים אוטומטית של TypeScript
  const allPests = await getAllPests().catch((error) => {
    console.error("Failed to load pests from MDX:", error);
    return []; // מחזיר מערך ריק במקרה של שגיאה
  });
  }

  // חלוקת הכתבות לרצועות התוכן השונות במגזין
  const heroPost = allPests[0] || null;
  const latestPosts = allPests.slice(1, 5);

  // פילטור ממוקד לפי קטגוריות (בהתאם ל-category או ה-pestType שיש לך ב-frontmatter)
  const invasivePests = allPests.filter(p => p.category === "מינים פולשים" || p.pestType === "פולש").slice(0, 4);
  const diyGuides = allPests.filter(p => p.category === "מזיקי גינה" || p.category === "מניעה").slice(0, 3);

  return (
    <>
      <main id="main-content" className="flex-1 bg-gray-50 text-gray-900" dir="rtl">
        
        {/* אזור החיפוש וההרו - שמרנו על העיצוב שלך עם שיפור קל */}
        <section className="bg-gradient-to-b from-green-50 to-white py-16 px-4 text-center border-b border-gray-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            אנציקלופדיית המזיקים של ישראל
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            זהה כל מזיק, הבן את מחזור החיים שלו, ומצא את הפתרון הנכון.
          </p>
          <SearchBar placeholder="איזה מזיק מטריד אותך? חפש כאן..." />
        </section>

        {/* SECTION 1: הבלוק המגזיני הראשי (קוטיקולה סטייל) */}
        {heroPost && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-950 border-b-2 border-orange-600 pb-2 -mb-[9px]">
                כתבות ומדריכים אחרונים
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* המאמר הראשי הגדול */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-64 sm:h-96 w-full bg-gray-100">
                  {heroPost.image && (
                    <Image 
                      src={heroPost.image} 
                      alt={heroPost.titleHebrew || heroPost.title} 
                      fill 
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-wide text-orange-600">
                    {heroPost.category || heroPost.pestType || "מדריך"}
                  </span>
                  <Link href={`/pests/${heroPost.slug}`}>
                    <h3 className="mt-2 text-2xl font-bold text-gray-950 hover:text-orange-600 transition-colors">
                      {heroPost.titleHebrew || heroPost.title}
                    </h3>
                  </Link>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                    {heroPost.subtitle || heroPost.identification}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>עודכן ב-{heroPost.date || heroPost.lastUpdated}</span>
                    <span className="text-orange-600 font-semibold">לקריאת הכתבה המלאה ←</span>
                  </div>
                </div>
              </div>

              {/* טור המאמרים הקטנים שלצידו */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">עודכן לאחרונה במערכת</h3>
                {latestPosts.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">המאמרים הבאים מתעדכנים כעת...</p>
                ) : (
                  latestPosts.map((post) => (
                    <div key={post.slug} className="flex gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
                        {post.image && <Image src={post.image} alt={post.titleHebrew || post.title} fill className="object-cover" />}
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <Link href={`/pests/${post.slug}`}>
                          <h4 className="font-bold text-sm text-gray-900 hover:text-orange-600 line-clamp-2 transition-colors">
                            {post.titleHebrew || post.title}
                          </h4>
                        </Link>
                        <span className="text-[11px] text-gray-400">{post.date || post.lastUpdated}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* הקטגוריות המקוריות שלך */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ניווט לפי קטגוריות מזיקים</h2>
          <CategoryGrid />
        </section>

        {/* SECTION 2: רצועת מינים פולשים (אם יש מאמרים רלוונטיים) */}
        {invasivePests.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-950 border-b-2 border-red-600 pb-2 -mb-[9px]">
                הפולשים והמתפרצים בישראל
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {invasivePests.map((pest) => (
                <div key={pest.slug} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-40 w-full bg-gray-50">
                    {pest.image && <Image src={pest.image} alt={pest.titleHebrew || pest.title} fill className="object-cover" />}
                  </div>
                  <div className="p-4">
                    <Link href={`/pests/${pest.slug}`}>
                      <h3 className="font-bold text-sm text-gray-900 hover:text-red-600 line-clamp-2 transition-colors">
                        {pest.titleHebrew || pest.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{pest.subtitle || pest.identification}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: רצועת טיפים ומניעה DIY */}
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
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{guide.subtitle || guide.habitat}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* הסליידר המקורי שלך */}
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
