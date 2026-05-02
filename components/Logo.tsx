import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7 text-emerald-600"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="9" y1="11" x2="13" y2="11" />
        <line x1="11" y1="9" x2="11" y2="13" />
      </svg>
      <span className="font-extrabold tracking-tight text-emerald-600 text-xl md:text-2xl leading-none">
        איצ&#39;י
      </span>
    </Link>
  );
}
