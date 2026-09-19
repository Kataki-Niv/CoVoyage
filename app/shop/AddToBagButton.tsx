"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError, getValidAuthToken } from "@/lib/api";
import { addBackpackItem } from "@/lib/essentialsApi";

export function AddToBagButton({ productSlug }: { productSlug: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToBag = async () => {
    setMessage("");
    setError("");

    const token = getValidAuthToken();

    if (!token) {
      setError("Log in to save this essential to your bag.");
      return;
    }

    setIsAdding(true);

    try {
      await addBackpackItem(productSlug, token);
      setMessage("Saved to planning bag");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to add this essential.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <button
        className="inline-flex h-12 items-center justify-center bg-[#f8f4ea] px-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#050505] transition-colors hover:bg-white"
        disabled={isAdding}
        onClick={handleAddToBag}
        type="button"
      >
        {isAdding ? "Saving..." : "Save to Bag"}
      </button>
      {message ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-white/54">
          <p>{message}</p>
          <Link className="text-white underline-offset-4 hover:underline" href="/essentials/bag">
            View planning bag
          </Link>
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#d8b7aa]">
          {error}{" "}
          <Link
            className="font-medium underline-offset-4 hover:underline"
            href="/login?returnTo=/essentials/bag"
          >
            Login
          </Link>
        </p>
      ) : null}
    </div>
  );
}
