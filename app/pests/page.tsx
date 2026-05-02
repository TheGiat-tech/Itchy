import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import { getAllPests } from "@/lib/mdx";
import PestsList from "./PestsList";

export const metadata: Metadata = {
  title: "כל המזיקים",
  description:
    "רשימה מלאה של כל המזיקים באנציקלופדיה – חרקים, מכרסמים, ציפורים ועוד.",
};

export default function PestsIndexPage() {
  const pests = getAllPests();

  return (
    <>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">כל המזיקים</h1>
        <Suspense fallback={<p className="text-gray-500 mb-8">טוען...</p>}>
          <PestsList pests={pests} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
