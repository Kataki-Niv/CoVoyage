"use client";

import { useEffect, useState } from "react";

const TOAST_STORAGE_KEY = "covoyage_toast";
const VISIBLE_DURATION_MS = 4500;
const FADE_DURATION_MS = 400;

export function GlobalToast() {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const queuedMessage = window.sessionStorage.getItem(TOAST_STORAGE_KEY);

    if (!queuedMessage) {
      return;
    }

    const showTimer = window.setTimeout(() => {
      window.sessionStorage.removeItem(TOAST_STORAGE_KEY);
      setMessage(queuedMessage);
      setIsVisible(true);
    }, 0);

    const fadeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, VISIBLE_DURATION_MS);

    const clearTimer = window.setTimeout(() => {
      setMessage("");
    }, VISIBLE_DURATION_MS + FADE_DURATION_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div
      className={`fixed left-1/2 top-5 z-50 w-[min(calc(100%-2rem),38rem)] -translate-x-1/2 rounded-[6px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800 shadow-lg shadow-stone-900/10 transition duration-[400ms] ease-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
