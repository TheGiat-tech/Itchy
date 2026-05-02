import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-700">
          🐛 Itchy
        </Link>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/pests" className="hover:text-green-700 transition-colors">
            מזיקים
          </Link>
          <Link href="/articles" className="hover:text-green-700 transition-colors">
            מאמרים
          </Link>
          <Link href="/contact" className="hover:text-green-700 transition-colors">
            צור קשר
          </Link>
          <Link href="/about" className="hover:text-green-700 transition-colors">
            אודות
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            חנות הדברה
          </Link>
        </div>
      </div>
    </nav>
  );
}
