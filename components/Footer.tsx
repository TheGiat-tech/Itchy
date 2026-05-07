import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo theme="dark" />
            <p className="mt-3 text-sm text-gray-200 leading-6">
              אנציקלופדיית המזיקים המובילה בישראל. מידע מקצועי, מדויק ונגיש.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">ניווט</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pests" className="hover:text-white transition-colors">
                  כל המזיקים
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-white transition-colors">
                  מאמרים
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  אודות
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">קהילה</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact?type=photo"
                  className="hover:text-white transition-colors"
                >
                  שלח תמונה לזיהוי
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?type=error"
                  className="hover:text-white transition-colors"
                >
                  דיווח על שגיאה
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col gap-3 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between">
          <span>© איצ&#39;י 2026 – כל הזכויות שמורות</span>
          <ul className="flex flex-wrap items-center justify-center gap-4">
            <li>
              <Link
                href="/accessibility"
                className="hover:text-white transition-colors"
              >
                הצהרת נגישות
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                מדיניות פרטיות
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                תנאי שימוש
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
