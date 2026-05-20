"use client";

import { useState } from "react";
import Link from "next/link";
import LeadModal from "./LeadModal";

export default function StickyLeadBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="w-full bg-amber-500 text-white py-2.5 px-4 text-center text-sm md:text-base"
        dir="rtl"
      >
        <span className="font-medium">
          זיהיתם מזיק בבית? קבלו ייעוץ והצעת מחיר ממדביר מוסמך בסביבתכם –
          ללא עלות וללא התחייבות.
        </span>
        <Link
          href="/what-bit-me"
          className="mr-3 inline-block bg-fuchsia-700 text-white font-bold px-4 py-1 rounded-full text-sm hover:bg-fuchsia-800 transition-colors whitespace-nowrap"
        >
          נעקצתם ולא יודעים ממה? גלו עכשיו
        </Link>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mr-3 inline-block bg-white text-amber-600 font-bold px-4 py-1 rounded-full text-sm hover:bg-amber-50 transition-colors whitespace-nowrap"
        >
          בקש ייעוץ חינם
        </button>
      </div>

      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
