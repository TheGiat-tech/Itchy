export default function GalleryPlaceholder({ pestName }: { pestName: string }) {
  return (
    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
      <h3 className="font-bold text-lg text-amber-800 mb-2">
        📸 תמונות מהשטח
      </h3>
      <p className="text-amber-700 text-sm mb-4">
        עדיין אין תמונות של {pestName} מהקהילה. היה הראשון לשלוח!
      </p>
      <a
        href="/contact?type=photo"
        className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-xl transition-colors text-sm"
      >
        שלח תמונה לזיהוי
      </a>
    </div>
  );
}
