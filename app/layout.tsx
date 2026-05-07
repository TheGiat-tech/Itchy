import type { Metadata } from "next";
import "./globals.css";
import StickyLeadBar from "@/components/StickyLeadBar";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "Itchy – אנציקלופדיית המזיקים של ישראל",
    template: "%s | Itchy",
  },
  description:
    "אנציקלופדיית המזיקים המובילה בישראל. זהה מזיקים, למד על מחזור החיים שלהם ומצא פתרונות.",
  metadataBase: new URL("https://itchy.co.il"),
  openGraph: {
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased font-heebo">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[120] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-green-800 focus:shadow-lg"
        >
          דלג לתוכן הראשי
        </a>
        <header className="sticky top-0 z-50">
          <StickyLeadBar />
          <Navbar />
        </header>
        <div className="motion-safe:animate-[fade-in-up_0.5s_ease_both]">
          {children}
        </div>
        <CookieBanner />
      </body>
    </html>
  );
}
