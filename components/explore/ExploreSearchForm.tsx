"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const supportedDestinations: Record<string, string> = {
  japan: "/explore/japan",
};

export function ExploreSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = query.trim().toLowerCase();
    const destinationRoute = supportedDestinations[normalizedQuery];

    if (destinationRoute) {
      setMessage("");
      router.push(destinationRoute);
      return;
    }

    setMessage("No destination available yet.");
  };

  return (
    <form className="mt-9 max-w-2xl" onSubmit={handleSubmit}>
      <div className="flex h-16 items-center gap-4 border border-white/35 bg-[#fbf8f2]/95 px-5 shadow-2xl shadow-stone-950/25 backdrop-blur sm:h-18 sm:px-6">
        <button
          aria-label="Search destinations"
          className="grid h-9 w-9 shrink-0 place-items-center text-stone-500 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b87666] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f2]"
          type="submit"
        >
          <Search className="h-5 w-5" />
        </button>
        <input
          aria-describedby={message ? "explore-search-message" : undefined}
          aria-label="Search destinations"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-500"
          onChange={(event) => {
            setQuery(event.target.value);
            if (message) {
              setMessage("");
            }
          }}
          placeholder="Search countries, cities or regions..."
          type="search"
          value={query}
        />
      </div>
      {message ? (
        <p
          className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-white/80"
          id="explore-search-message"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
