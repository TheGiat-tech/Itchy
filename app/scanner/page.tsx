"use client";

import { useRef, useState } from "react";
import Footer from "@/components/Footer";

interface ScanResult {
  pestName: string;
  description: string;
  imageDataUrl: string;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError("");
    setResult(null);
    setSubmitted(false);
    setScanning(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "שגיאה בזיהוי");
      }

      const json: { pestName: string; description: string } = await res.json();
      setResult({ ...json, imageDataUrl: dataUrl });
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "שגיאה בזיהוי, נסה שנית");
    } finally {
      setScanning(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          pestType: result.pestName,
          message: result.description,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "שגיאה בשליחה");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "שגיאה בשליחה, נסה שנית");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full" dir="rtl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          🔍 סורק מזיקים חכם
        </h1>
        <p className="text-gray-500 mb-8">
          העלו תמונה של מזיק לא מוכר ונזהה אותו עבורכם באמצעות AI.
        </p>

        {/* Upload area */}
        <div
          className="bg-white border-2 border-dashed border-gray-200 hover:border-green-400 rounded-2xl p-8 text-center cursor-pointer transition-colors mb-6"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="text-4xl mb-3">📷</div>
          <p className="font-semibold text-gray-700">לחצו כאן להעלאת תמונה</p>
          <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP – עד 10MB</p>
        </div>

        {scanning && (
          <div className="text-center py-10">
            <div className="inline-block text-4xl animate-spin">🔄</div>
            <p className="mt-3 text-gray-600 font-medium">מזהה מזיק...</p>
          </div>
        )}

        {scanError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-6">
            {scanError}
          </div>
        )}

        {result && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            {/* Result image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.imageDataUrl}
              alt="תמונה שהועלתה"
              className="w-full max-h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                🐛 זוהה: {result.pestName}
              </h2>
              <p className="text-gray-600 text-sm mb-6">{result.description}</p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-bold text-green-800">
                    הפרטים והתמונה נשלחו בהצלחה לצוות המדבירים! נחזור אליך בהקדם.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 mb-3">
                    🆘 זיהיתם מזיק בבית? אל תחכו!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    הצוות המקצועי של <strong>איצ&apos;י</strong> ו-<strong>גיאת הדברות</strong> זמין עבורכם עכשיו. אל תבזבזו זמן וכסף על פתרונות שלא עובדים – תנו למומחים לטפל בזה עם אחריות מלאה.
                  </p>
                  <form onSubmit={handleLeadSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="שם מלא"
                      required
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-right w-full"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="טלפון"
                      required
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-right w-full"
                      dir="ltr"
                    />
                    {submitError && (
                      <p className="text-red-600 text-sm">{submitError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
                    >
                      {submitting ? "שולח..." : "📍 שלח פרטים ונחזור אליך"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
    reader.readAsDataURL(file);
  });
}
