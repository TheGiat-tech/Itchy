"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

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
  const titleId = useId();
  const descriptionId = useId();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pestType, setPestType] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setSubmitted(false);
    setLoading(false);
    setError("");
    setPestType("");
    setCity("");
    setPhone("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: `עיר: ${city}`, pestType }),
      });
      if (!res.ok) {
        console.error("contact API error, status:", res.status);
        let errorMsg = "שגיאה בשליחה";
        try {
          const json = await res.json();
          errorMsg = json.message || errorMsg;
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        dir="rtl"
      >
        <button
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 text-2xl leading-none"
          aria-label="סגור"
        >
          ×
        </button>

        {submitted ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <h2 id={titleId} className="text-2xl font-bold text-gray-900 mb-2">
                הפרטים נשלחו בהצלחה לצוות המדבירים! נחזור אליך בהקדם.
              </h2>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="text-2xl font-bold text-gray-900 mb-1">
              קבלו ייעוץ חינם
            </h2>
            <p id={descriptionId} className="mb-5 text-sm text-gray-700">
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
                  autoComplete="address-level2"
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
                  placeholder="05XXXXXXXX"
                  autoComplete="tel"
                  minLength={9}
                  maxLength={10}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-right"
                  dir="ltr"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-sm text-lg"
              >
                {loading ? "שולח..." : "שלח בקשה"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
