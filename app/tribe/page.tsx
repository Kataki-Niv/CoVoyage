"use client";

import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ContentCard } from "@/components/shared/ContentCard";
import { FormField } from "@/components/shared/FormField";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";

const tripFields = [
  "Destination",
  "Travel Dates",
  "Trip Duration",
  "Budget",
  "Travel Style",
  "Interests",
  "Languages",
];

const matches = [
  {
    name: "Maya Chen",
    country: "Singapore",
    compatibility: "94%",
    interests: "Street food, slow museums, sunrise walks",
    destination: "Lisbon",
    reason: "Similar dates, mid-range budget, and a shared love for neighborhood food tours.",
  },
  {
    name: "Arjun Mehta",
    country: "India",
    compatibility: "89%",
    interests: "Photography, rail journeys, architecture",
    destination: "Lisbon",
    reason: "Overlapping travel style and strong interest match for photo-led city exploring.",
  },
  {
    name: "Elena Rossi",
    country: "Italy",
    compatibility: "86%",
    interests: "Markets, coastal walks, local history",
    destination: "Lisbon",
    reason: "Aligned language preferences and a relaxed pace for culture-forward travel.",
  },
];

export default function TribePage() {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Showing sample matches for Phase 1.");
  };

  return (
    <AuthGuard>
      <PageShell
        description="Plan a specific trip and discover placeholder traveler matches prepared for future compatibility logic."
        eyebrow="Find your tribe"
        title="Plan One Shared Journey"
      >
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <ContentCard>
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-stone-500" />
              <h2 className="font-serif text-3xl text-stone-900">
                Trip Planning Form
              </h2>
            </div>
            <form
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              onSubmit={handleSubmit}
            >
              {tripFields.map((field) => (
                <FormField key={field} label={field} placeholder={field} />
              ))}
              <label className="flex items-center gap-3 rounded-[4px] border border-stone-200 bg-[#fbf8f2] px-4 py-3 text-sm text-stone-700 md:col-span-2 lg:col-span-3">
                <input className="h-4 w-4 accent-stone-900" type="checkbox" />
                Use My Travel Profile Preferences
              </label>
              {status ? (
                <p className="text-sm text-stone-600 md:col-span-2 lg:col-span-3">
                  {status}
                </p>
              ) : null}
              <Button className="w-fit" size="lg" type="submit">
                Find My Tribe
              </Button>
            </form>
          </ContentCard>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {matches.map((match) => (
              <ContentCard key={match.name}>
                <div className="flex items-start gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ead9bd] font-serif text-2xl text-stone-700">
                    {match.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-stone-900">
                      {match.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-stone-600">
                      <MapPin className="h-4 w-4" />
                      {match.country}
                    </p>
                  </div>
                </div>
                <p className="mt-6 font-serif text-4xl text-stone-900">
                  {match.compatibility}
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Compatibility
                </p>
                <dl className="mt-6 space-y-4 text-sm leading-6 text-stone-600">
                  <div>
                    <dt className="font-medium text-stone-800">Shared Interests</dt>
                    <dd>{match.interests}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-800">Shared Destination</dt>
                    <dd>{match.destination}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-800">Match Reason</dt>
                    <dd>{match.reason}</dd>
                  </div>
                </dl>
                <Button asChild className="mt-6 w-full" variant="outline">
                  <Link href="/profile">View Profile</Link>
                </Button>
              </ContentCard>
            ))}
          </div>
        </section>
      </PageShell>
    </AuthGuard>
  );
}
