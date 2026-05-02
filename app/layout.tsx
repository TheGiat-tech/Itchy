import type { Metadata } from "next";
import "./globals.css";
import StickyLeadBar from "@/components/StickyLeadBar";
import Navbar from "@/components/Navbar";

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
        <header className="sticky top-0 z-50">
          <StickyLeadBar />
          <Navbar />
        </header>
        {children}
      </body>
    </html>
  );
}
