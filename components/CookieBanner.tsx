"use client";

import { useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "itchy_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(STORAGE_KEY);
  });

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 bg-gray-900 text-gray-200 shadow-lg"
      role="dialog"
      aria-label="הודעת עוגיות"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4 text-sm">
        <p className="flex-1 text-center sm:text-right">
          אנחנו משתמשים בעוגיות (Cookies) כדי להעניק לך את חוויית הגלישה הטובה ביותר,
          לנתח את התנועה באתר ולהתאים עבורך פרסומות רלוונטיות. המשך הגלישה באתר מהווה
          הסכמה לשימוש בעוגיות בהתאם ל
          <Link href="/privacy" className="underline hover:text-white mx-1">
            מדיניות הפרטיות
          </Link>
          שלנו.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={accept}
            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            אישור והמשך
          </button>
          <Link
            href="/privacy"
            className="border border-gray-500 hover:border-gray-300 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            מידע נוסף
          </Link>
        </div>
      </div>
    </div>
  );
}
