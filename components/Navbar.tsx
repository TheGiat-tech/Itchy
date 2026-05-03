"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/pests", label: "מזיקים" },
  { href: "/articles", label: "מאמרים" },
  { href: "/prices", label: "מחירון" },
  { href: "/contact", label: "צור קשר" },
  { href: "/about", label: "אודות" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 relative">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
        <Logo theme="light" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-green-700 transition-colors">
              {label}
            </Link>
          ))}
          <Link
            href="/shop"
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            חנות
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-green-700 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full right-0 left-0 bg-white border-b border-gray-100 shadow-lg z-50"
          dir="rtl"
        >
          <div className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-3 px-2 text-gray-700 hover:text-green-700 font-medium border-b border-gray-100 last:border-0 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/shop"
              className="mt-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              חנות
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
