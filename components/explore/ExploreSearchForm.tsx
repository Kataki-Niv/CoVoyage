"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const supportedDestinations: Record<string, string> = {
  japan: "/explore/japan",
  kyoto: "/explore/japan",
  osaka: "/explore/japan",
  tokyo: "/explore/japan",
};

export function ExploreSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = query.trim().toLowerCase();
    const compactQuery = normalizedQuery.replace(/[^a-z]/g, "");
    const destinationRoute = supportedDestinations[normalizedQuery];
    const compactDestinationRoute = supportedDestinations[compactQuery];

    if (destinationRoute || compactDestinationRoute) {
      setMessage("");
      router.push(destinationRoute ?? compactDestinationRoute);
      return;
    }

    const destinationSlug = normalizedQuery
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (destinationSlug) {
      setMessage("");
      router.push(`/explore/${destinationSlug}`);
      return;
    }

    setMessage("Enter a destination to search.");
  };

  return (
    <form className="mt-9 max-w-2xl" onSubmit={handleSubmit}>
      <div className="flex h-16 items-center gap-4 border border-white/18 bg-black/45 px-5 shadow-2xl shadow-black/30 backdrop-blur sm:h-18 sm:px-6">
        <button
          aria-label="Search destinations"
          className="grid h-9 w-9 shrink-0 place-items-center text-[#D8BE8A]/72 transition-colors hover:text-[#F5F1E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]"
          type="submit"
        >
          <Search className="h-5 w-5" />
        </button>
        <input
          aria-describedby={message ? "explore-search-message" : undefined}
          aria-label="Search destinations"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-[#F5F1E8] outline-none placeholder:text-white/45"
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
