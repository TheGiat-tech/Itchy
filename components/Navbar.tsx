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
          <Link href="/contact" className="hover:text-green-700 transition-colors">
            צור קשר
          </Link>
          <Link href="/about" className="hover:text-green-700 transition-colors">
            אודות
          </Link>
        </div>
      </div>
    </nav>
  );
}
