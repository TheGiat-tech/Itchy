"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function FeedbackButton({ pestTitle }: { pestTitle: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    requestAnimationFrame(() => {
      const first = modalRef.current?.querySelector<HTMLElement>("textarea");
      first?.focus();
    });
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("נא לתאר את השגיאה.");
      return;
    }
    setError("");
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-8 text-sm text-gray-500 hover:text-red-600 underline transition-colors"
      >
        מצאת שגיאה? דווח כאן
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="דיווח על שגיאה"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <h2 className="font-bold text-xl mb-1">דיווח על שגיאה</h2>
            <p className="text-gray-600 text-sm mb-4">
              דף:{" "}
              <span className="font-medium text-gray-700">{pestTitle}</span>
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
                תיאור השגיאה
              </label>
              <textarea
                id={textareaId}
                name="message"
                rows={4}
                placeholder="תאר את השגיאה שמצאת..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${textareaId}-error` : undefined}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 resize-none"
                dir="rtl"
              />
              {error && <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                  aria-label="שלח דיווח"
                >
                  שלח דיווח
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 py-2 rounded-xl transition-colors text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
