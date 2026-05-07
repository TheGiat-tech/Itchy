"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function FeedbackButton({ pestTitle }: { pestTitle: string }) {
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const triggerElement = triggerRef.current;
    textareaRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="mt-8 text-sm text-gray-700 hover:text-red-600 underline transition-colors"
      >
        מצאת שגיאה? דווח כאן
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className="font-bold text-xl mb-1">דיווח על שגיאה</h2>
            <p id={descriptionId} className="text-gray-700 text-sm mb-4">
              דף:{" "}
              <span className="font-medium text-gray-700">{pestTitle}</span>
            </p>
            <form onSubmit={() => setOpen(false)}>
              <label htmlFor="feedback-message" className="sr-only">
                תיאור השגיאה
              </label>
              <textarea
                id="feedback-message"
                ref={textareaRef}
                name="message"
                rows={4}
                placeholder="תאר את השגיאה שמצאת..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-green-500 focus:outline-none resize-none"
                dir="rtl"
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition-colors"
                >
                  שלח דיווח
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 py-2 rounded-xl transition-colors text-gray-600"
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
