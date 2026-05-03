"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(new Error("Failed to read image file as data URL"));
    reader.readAsDataURL(file);
  });
}

function ContactPageContent() {
  const searchParams = useSearchParams();
  const isPhotoFlow = searchParams.get("type") === "photo";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isPhotoFlow && !imageBase64) {
      setError("במסלול זיהוי תמונה יש לצרף תמונה לפני שליחה.");
      setLoading(false);
      return;
    }

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      pestType: isPhotoFlow ? "זיהוי תמונה" : undefined,
      imageName: imageBase64 ? imageName : undefined,
      imageType: imageBase64 ? imageType : undefined,
      imageBase64: imageBase64 || undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.error("contact API error, status:", res.status);
        let errorMsg = "שגיאה בשליחה";
        try {
          const json = await res.json();
          errorMsg = json.error || errorMsg;
        } catch {
          // response was not JSON (e.g. HTML error page)
        }
        throw new Error(errorMsg);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];

    if (!file) {
      setImageName("");
      setImageType("");
      setImageBase64("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("ניתן להעלות רק קבצי תמונה.");
      e.target.value = "";
      setImageName("");
      setImageType("");
      setImageBase64("");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("התמונה גדולה מדי. גודל מקסימלי: 5MB.");
      e.target.value = "";
      setImageName("");
      setImageType("");
      setImageBase64("");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const commaIndex = dataUrl.indexOf(",");
      if (commaIndex === -1) throw new Error("Invalid data URL format");

      setImageName(file.name);
      setImageType(file.type || "application/octet-stream");
      setImageBase64(dataUrl.slice(commaIndex + 1));
    } catch {
      setError("נכשלה קריאת התמונה. נסו קובץ אחר.");
      e.target.value = "";
      setImageName("");
      setImageType("");
      setImageBase64("");
    }
  };

  return (
    <>
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {isPhotoFlow ? "שלח תמונה לזיהוי" : "צור קשר"}
        </h1>
        <p className="text-gray-500 mb-8" dir="rtl">
          {isPhotoFlow
            ? "צרפו תמונה ברורה של המזיק ונחזור אליכם עם זיהוי והכוונה בהקדם."
            : "זיהיתם מזיק? יש לכם שאלה? צרו איתנו קשר ונחזור אליכם בהקדם."}
        </p>

        {submitted ? (
          <div
            className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
            dir="rtl"
          >
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              הפרטים נשלחו בהצלחה לצוות המדבירים! נחזור אליך בהקדם.
            </h2>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5"
          >
            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm"
                dir="rtl"
              >
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                שם מלא
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="ישראל ישראלי"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                טלפון
              </label>
              <input
                type="tel"
                name="phone"
                required
                minLength={9}
                maxLength={10}
                placeholder="05XXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none text-right"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                תמונה {isPhotoFlow ? "(חובה)" : "(אופציונלי)"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={isPhotoFlow}
                className="block w-full text-sm text-gray-700 file:mr-0 file:ml-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {imageName && (
                <p className="text-xs text-gray-500 mt-2">נבחר: {imageName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                הודעה (אופציונלי)
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="תאר את הבעיה שלך, את המזיק שראית, או שאל שאלה..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none resize-none text-right"
                dir="rtl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "שולח..." : "שלח הודעה"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <ContactPageContent />
    </Suspense>
  );
}
