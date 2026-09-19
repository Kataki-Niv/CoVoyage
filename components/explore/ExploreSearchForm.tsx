"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  searchDestinations,
  type BackendCountry,
  type BackendPlace,
} from "@/lib/destinationApi";

export function ExploreSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [countries, setCountries] = useState<BackendCountry[]>([]);
  const [places, setPlaces] = useState<BackendPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    let isActive = true;

    const timeout = window.setTimeout(() => {
      searchDestinations(normalizedQuery)
        .then((result) => {
          if (!isActive) {
            return;
          }

          setCountries(result.countries);
          setPlaces(result.places);
          setMessage(
            result.countries.length || result.places.length
              ? ""
              : "No supported destinations found.",
          );
        })
        .catch(() => {
          if (isActive) {
            setCountries([]);
            setPlaces([]);
            setMessage("Destination search is unavailable right now.");
          }
        })
        .finally(() => {
          if (isActive) {
            setIsSearching(false);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = query.trim().toLowerCase();
    const exactCountry = countries.find((country) => {
      const countryName = country.name?.toLowerCase() ?? "";
      return country.slug === normalizedQuery || countryName === normalizedQuery;
    });
    const country = exactCountry ?? countries[0];
    const place = places[0];

    if (country) {
      setMessage("");
      router.push(`/explore/${country.slug}`);
      return;
    }

    if (place?.country_slug) {
      setMessage("");
      router.push(`/explore/${place.country_slug}#place-${place.slug}`);
      return;
    }

    setMessage(normalizedQuery ? "No supported destinations found." : "Enter a destination to search.");
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
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (message) {
              setMessage("");
            }
            if (nextQuery.trim().length < 2) {
              setCountries([]);
              setPlaces([]);
              setIsSearching(false);
            } else {
              setIsSearching(true);
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
      {isSearching ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
          Searching CoVoyage destinations...
        </p>
      ) : null}
      {countries.length || places.length ? (
        <div className="mt-3 border border-white/14 bg-black/58 p-2 backdrop-blur">
          {countries.slice(0, 5).map((country) => (
            <button
              className="block w-full px-3 py-3 text-left text-sm text-[#F5F1E8] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
              key={country.slug}
              onClick={() => router.push(`/explore/${country.slug}`)}
              type="button"
            >
              <span className="font-medium">{country.name ?? country.slug}</span>
              {country.region ? (
                <span className="ml-2 text-xs uppercase tracking-[0.16em] text-[#D8BE8A]/75">
                  {country.region}
                </span>
              ) : null}
            </button>
          ))}
          {places.slice(0, 5).map((place) => (
            <button
              className="block w-full px-3 py-3 text-left text-sm text-[#F5F1E8] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
              key={`${place.country_slug}-${place.slug}`}
              onClick={() => router.push(`/explore/${place.country_slug}#place-${place.slug}`)}
              type="button"
            >
              <span className="font-medium">{place.name ?? place.slug}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.16em] text-[#D8BE8A]/75">
                {place.region ? `${place.region} / ` : ""}
                {place.country_slug.replace(/-/g, " ")}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
