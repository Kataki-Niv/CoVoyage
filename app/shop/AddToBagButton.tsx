"use client";

import { useState } from "react";

export function AddToBagButton() {
  const [added, setAdded] = useState(false);

  return (
    <div>
      <button
        className="inline-flex h-12 items-center justify-center bg-stone-900 px-7 text-xs font-medium uppercase tracking-[0.2em] text-[#fbf8f2] transition-colors hover:bg-stone-700"
        onClick={() => setAdded(true)}
        type="button"
      >
        Add to Bag
      </button>
      {added ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
          Added to bag
        </p>
      ) : null}
    </div>
  );
}
