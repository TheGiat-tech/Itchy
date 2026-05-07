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
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[200] focus:bg-white focus:text-green-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
        >
          דלג לתוכן הראשי
        </a>
        <header className="sticky top-0 z-50">
          <StickyLeadBar />
          <Navbar />
        </header>
        <div className="animate-[fade-in-up_0.5s_ease_both] motion-reduce:animate-none">
          {children}
        </div>
        <CookieBanner />
      </body>
    </html>
  );
}
