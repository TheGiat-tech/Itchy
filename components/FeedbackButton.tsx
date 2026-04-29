"use client";

import { useState } from "react";

export default function FeedbackButton({ pestTitle }: { pestTitle: string }) {
  const [open, setOpen] = useState(false);

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
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-xl mb-1">דיווח על שגיאה</h2>
            <p className="text-gray-500 text-sm mb-4">
              דף:{" "}
              <span className="font-medium text-gray-700">{pestTitle}</span>
            </p>
            <form onSubmit={() => setOpen(false)}>
              <textarea
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
