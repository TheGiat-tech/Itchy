"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "איזה מזיק מופיע אצלך?",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchId = useId();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/pests?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <label htmlFor={searchId} className="sr-only">חיפוש מזיקים</label>
      <div className="flex gap-2">
        <input
          id={searchId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-5 py-4 text-lg rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 shadow-sm text-right"
          dir="rtl"
        />
        <button
          type="submit"
          className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          aria-label="בצע חיפוש מזיקים"
        >
          חפש
        </button>
      </div>
    </form>
  );
}
