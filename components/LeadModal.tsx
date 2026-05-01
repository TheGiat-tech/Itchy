"use client";

import { useEffect, useRef, useState } from "react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PEST_OPTIONS = [
  "תיקנים",
  "יתושים",
  "זבובים",
  "פשפש מיטה",
  "פרעושים",
  "קרציות",
  "נמלים",
  "עכברים / חולדות",
  "מזיקי מזווה",
  "אחר",
];

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [pestType, setPestType] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setPestType("");
      setCity("");
      setPhone("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="בקשת ייעוץ חינם"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="סגור"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              תודה! קיבלנו את פנייתך.
            </h2>
            <p className="text-gray-600">
              מדביר מוסמך מהאזור שלך ייצור איתך קשר בהקדם.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              קבלו ייעוץ חינם
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              מלאו את הפרטים ומדביר מוסמך מהאזור שלך ייצור איתך קשר – ללא
              עלות וללא התחייבות.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="modal-pest"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  סוג המזיק
                </label>
                <select
                  id="modal-pest"
                  value={pestType}
                  onChange={(e) => setPestType(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white text-gray-800"
                >
                  <option value="">בחרו מזיק...</option>
                  {PEST_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="modal-city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  עיר
                </label>
                <input
                  id="modal-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="לדוגמה: תל אביב"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  מספר טלפון
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05X-XXXXXXX"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-right"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm text-lg"
              >
                שלח בקשה
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
