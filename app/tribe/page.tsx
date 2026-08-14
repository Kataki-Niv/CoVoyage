"use client";

import { CalendarDays, Compass, MapPin, RefreshCw, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest, getValidAuthToken } from "@/lib/api";

type MatchProfile = {
  user_id: string;
  name?: string;
  username?: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  available_from?: string | null;
  available_to?: string | null;
  preferred_destinations?: string[];
  interests?: string[];
  country?: string | null;
  city?: string | null;
};

type OwnProfile = {
  tribe_discoverable?: boolean;
};

type ProfileResponse = {
  profile_created: boolean;
  profile: OwnProfile | null;
};

type MatchResult = {
  user_id: string;
  profile: MatchProfile;
  semantic_score?: number;
  compatibility_score: number;
  reason: string;
  factors?: unknown[];
};

const emptyStateMessage =
  "No strong matches yet. Try updating your destination, dates, or interests.";

const heroImage =
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2200&q=88";

const groupTravelImage =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=84";

const matchingJourneyImage =
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=86";

const matchSteps = [
  {
    number: "01",
    title: "SHARED DESTINATIONS",
    description:
      "At least one preferred destination in common.",
  },
  {
    number: "02",
    title: "OVERLAPPING DATES",
    description: "Travel windows overlap.",
  },
  {
    number: "03",
    title: "TRAVEL COMPATIBILITY",
    description:
      "Budget, travel style and languages contribute to compatibility.",
  },
  {
    number: "04",
    title: "AI COMPATIBILITY",
    description:
      "Semantic profile similarity helps rank the strongest matches.",
  },
  {
    number: "05",
    title: "TRAVEL PREFERENCES",
    description: "Mutual travel preferences help determine eligibility.",
  },
];

function formatTravelDates(start?: string | null, end?: string | null) {
  if (!start || !end) {
    return "Not specified";
  }

  return start === end ? start : `${start} to ${end}`;
}

function TagList({ values }: { values?: string[] }) {
  if (!values || values.length === 0) {
    return <span className="text-white/45">Not specified</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          className="border border-white/12 bg-white/[0.045] px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/68"
          key={value}
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function MatchDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-white/10 pt-4">
      <dt className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6 text-white/68">{children}</dd>
    </div>
  );
}

function MatchAvatar({
  displayName,
  imageUrl,
}: {
  displayName: string;
  imageUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageUrl || imageFailed) {
    return (
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-white/12 bg-[#f8f4ea] font-serif text-3xl text-black">
        {displayName.charAt(0)}
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/12">
      <Image
        alt={`${displayName} profile`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        height={80}
        src={imageUrl}
        unoptimized
        width={80}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

export default function TribePage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEnablingTribe, setIsEnablingTribe] = useState(false);
  const [tribeDiscoverable, setTribeDiscoverable] = useState<boolean | null>(null);
  const [consentDeclined, setConsentDeclined] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const fetchMatches = useCallback(async () => {
    const token = getValidAuthToken();

    if (!token) {
      throw new Error("Please log in to view your matches.");
    }

    return apiRequest<MatchResult[]>("/matches", { token });
  }, []);

  const fetchOwnProfile = useCallback(async () => {
    const token = getValidAuthToken();

    if (!token) {
      throw new Error("Please log in to view your matches.");
    }

    return apiRequest<ProfileResponse>("/profile", { token });
  }, []);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const profileResponse = await fetchOwnProfile();
      const isDiscoverable =
        profileResponse.profile?.tribe_discoverable === true;

      setTribeDiscoverable(isDiscoverable);

      if (!isDiscoverable) {
        setMatches([]);
        return;
      }

      setMatches(await fetchMatches());
    } catch (caughtError) {
      setMatches([]);
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : caughtError instanceof Error
            ? caughtError.message
            : "Unable to load matches.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchMatches, fetchOwnProfile]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialMatches = async () => {
      try {
        const profileResponse = await fetchOwnProfile();
        const isDiscoverable =
          profileResponse.profile?.tribe_discoverable === true;

        if (isMounted) {
          setTribeDiscoverable(isDiscoverable);

          if (isDiscoverable) {
            setMatches(await fetchMatches());
          } else {
            setMatches([]);
          }
        }
      } catch (caughtError) {
        if (isMounted) {
          setMatches([]);
          setError(
            caughtError instanceof ApiError
              ? caughtError.detail
              : caughtError instanceof Error
                ? caughtError.message
                : "Unable to load matches.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialMatches();

    return () => {
      isMounted = false;
    };
  }, [fetchMatches, fetchOwnProfile]);

  const handleRefresh = async () => {
    await loadMatches();
  };

  const handleEnableTribe = async () => {
    const token = getValidAuthToken();

    if (!token) {
      setError("Please log in to view your matches.");
      return;
    }

    setIsEnablingTribe(true);
    setError("");

    try {
      await apiRequest<ProfileResponse>("/profile/tribe-discoverable", {
        method: "PATCH",
        token,
        body: JSON.stringify({ tribe_discoverable: true }),
      });
      setTribeDiscoverable(true);
      setConsentDeclined(false);
      await loadMatches();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : caughtError instanceof Error
            ? caughtError.message
            : "Unable to enable Tribe Matching.",
      );
    } finally {
      setIsEnablingTribe(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
        <Navbar />
        <main className="bg-[#050505]">
          <section className="relative grid min-h-[78vh] place-items-center overflow-hidden px-5 text-center sm:px-8">
            <Image
              priority
              alt="Friends gathered around a warm evening campfire"
              className="absolute inset-0 h-full w-full object-cover"
              fill
              sizes="100vw"
              src={heroImage}
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-[#2d2114]/15" />
            <div className="relative z-10 mx-auto max-w-5xl pt-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.42em] text-[#f8f4ea]/62">
                FIND YOUR TRIBE
              </p>
              <h1 className="font-serif text-2xl leading-[1.08] text-white sm:text-4xl lg:text-5xl">
                Meet the people who make your kind of journey better.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Connect with compatible travelers through shared destinations,
                dates, interests, and travel styles.
              </p>
            </div>
            <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/45">
              <span className="text-[10px] uppercase tracking-[0.32em]">
                Scroll
              </span>
              <span className="h-10 w-px overflow-hidden bg-white/16">
                <span className="block h-4 w-px animate-pulse bg-[#f8f4ea]" />
              </span>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="relative overflow-hidden border border-white/10 bg-[#0b0b0b] p-6 sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute left-12 top-12 h-px w-32 bg-[#f8f4ea]/20" />
                <div className="absolute bottom-16 right-16 h-px w-44 bg-white/10" />
                <div className="absolute right-8 top-10 h-24 w-px bg-white/10" />
              </div>

              <div className="relative z-10 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.42em] text-white/42">
                  HOW WE MATCH
                </p>
                <h2 className="mx-auto mt-4 max-w-3xl font-serif text-5xl leading-tight text-white sm:text-6xl">
                  Similar minds. Shared journeys.
                </h2>
              </div>

              <div className="relative z-10 mt-12 grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
                <div className="group relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden border border-white/12 bg-white/[0.03]">
                  <Image
                    alt="Traveler exploring a cinematic local street"
                    className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.035]"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    src={matchingJourneyImage}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-5 left-5 right-5 border border-white/10 bg-black/55 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                      Your profile
                    </p>
                    <p className="mt-2 font-serif text-2xl leading-tight text-white">
                      Plans, preferences, rhythm, and personality.
                    </p>
                  </div>
                </div>

                <div className="relative min-h-[560px] lg:min-h-[620px]">
                  <svg
                    aria-hidden="true"
                    className="absolute inset-0 hidden h-full w-full lg:block"
                    preserveAspectRatio="none"
                    viewBox="0 0 620 620"
                  >
                    {[
                      "M18 286 C150 160 258 82 470 88",
                      "M22 302 C198 276 304 232 548 218",
                      "M22 318 C192 340 300 342 486 330",
                      "M20 334 C182 410 304 470 546 494",
                      "M16 350 C126 500 244 548 430 568",
                    ].map((path, index) => (
                      <path
                        className={`transition duration-300 ${
                          activeStep === index
                            ? "stroke-[#f8f4ea]"
                            : "stroke-white/16"
                        }`}
                        d={path}
                        fill="none"
                        key={path}
                        strokeDasharray="4 10"
                        strokeWidth={activeStep === index ? 1.4 : 1}
                      />
                    ))}
                  </svg>

                  <div className="absolute left-0 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full border border-[#f8f4ea]/50 bg-[#f8f4ea]/20 shadow-sm shadow-[#f8f4ea]/20 lg:block" />

                  <div className="relative grid gap-4 lg:block lg:min-h-[620px]">
                    {matchSteps.map((step, index) => {
                      const isActive = activeStep === index;
                      const nodePositions = [
                        "lg:absolute lg:right-16 lg:top-0 lg:w-72",
                        "lg:absolute lg:right-0 lg:top-32 lg:w-72",
                        "lg:absolute lg:right-20 lg:top-64 lg:w-72",
                        "lg:absolute lg:right-0 lg:top-96 lg:w-72",
                        "lg:absolute lg:bottom-0 lg:right-28 lg:w-72",
                      ];

                      return (
                        <button
                          className={`group text-left transition duration-300 ${nodePositions[index]} ${
                            isActive ? "translate-x-0" : "hover:translate-x-1"
                          }`}
                          key={step.number}
                          type="button"
                          onClick={() => setActiveStep(index)}
                          onFocus={() => setActiveStep(index)}
                          onMouseEnter={() => setActiveStep(index)}
                        >
                          <span className="flex items-start gap-4 border border-white/10 bg-black/40 p-4 backdrop-blur-sm transition duration-300 group-hover:border-[#f8f4ea]/30 group-hover:bg-white/[0.055]">
                            <span
                              className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border font-serif text-sm transition duration-300 ${
                                isActive
                                  ? "border-[#f8f4ea] bg-[#f8f4ea] text-black"
                                  : "border-white/16 bg-white/[0.04] text-white/60 group-hover:text-white"
                              }`}
                            >
                              {step.number}
                            </span>
                            <span>
                              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-white">
                                {step.title}
                              </span>
                              <span className="mt-2 block text-sm leading-6 text-white/62">
                                {step.description}
                              </span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="relative z-10 mx-auto mt-10 max-w-2xl border-t border-white/10 pt-6 text-center font-serif text-2xl leading-tight text-white/82">
                From shared plans to shared rhythm, every match starts with
                compatibility.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
            <div className="group relative min-h-[560px] overflow-hidden border border-white/10 bg-black">
              <Image
                alt="Friends gathered together at sunset"
                className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.025]"
                fill
                sizes="100vw"
                src={groupTravelImage}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

              <div className="relative z-10 grid min-h-[560px] gap-8 p-6 sm:p-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:p-14">
                <div className="max-w-xl">
                  <p className="text-xs font-medium uppercase tracking-[0.38em] text-[#f8f4ea]/58">
                    COMING SOON
                  </p>
                  <h2 className="mt-5 font-serif text-5xl leading-tight text-white sm:text-6xl">
                    Maybe your next journey needs a few more people.
                  </h2>
                  <p className="mt-6 text-base leading-8 text-white/68">
                    Find compatible travelers beyond one-to-one matches. Group
                    voyages are coming to CoVoyage.
                  </p>
                </div>

                <div className="justify-self-start lg:justify-self-end">
                  <div className="w-full max-w-sm border border-white/14 bg-black/58 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/46">
                        GROUP VOYAGE
                      </p>
                      <span className="border border-[#f8f4ea]/28 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f8f4ea]/78">
                        Preview
                      </span>
                    </div>
                    <h3 className="mt-5 font-serif text-3xl leading-tight text-white">
                      Japan · 8 days
                    </h3>
                    <p className="mt-2 text-sm text-white/58">
                      6 compatible travelers
                    </p>
                    <div className="mt-6 flex -space-x-3">
                      {["A", "M", "R", "K", "N", "+"].map((initial) => (
                        <span
                          className="grid h-11 w-11 place-items-center rounded-full border border-white/16 bg-[#f8f4ea] font-serif text-sm text-black"
                          key={initial}
                        >
                          {initial}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Preview only
                      </p>
                      <button
                        className="mt-4 w-full cursor-not-allowed border border-white/14 bg-white/[0.04] px-4 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white/42"
                        disabled
                        type="button"
                      >
                        Group Voyages — Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
            <div className="flex flex-col gap-6 border-y border-white/10 py-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.38em] text-white/42">
                  <Sparkles className="h-4 w-4" />
                  YOUR TRIBE
                </p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                  People who might make your next journey better.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  Matches are based on your saved CoVoyage profile. Update your
                  profile to tune destinations, travel dates, budget, languages,
                  and interests.
                </p>
              </div>
              <Button
                className="w-fit border border-white/16 bg-[#f8f4ea] text-black transition duration-300 hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
                disabled={isLoading || tribeDiscoverable !== true}
                title="Re-fetch and recompute matches from the backend"
                aria-label="Re-fetch and recompute matches from the backend"
                size="lg"
                type="button"
                onClick={handleRefresh}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Loading..." : "Refresh Matches"}
              </Button>
            </div>

            {error ? (
              <p className="mt-8 border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            {!isLoading && !error && tribeDiscoverable === false && !consentDeclined ? (
              <div className="mt-8 border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/42">
                  Tribe consent
                </p>
                <h3 className="mt-4 font-serif text-4xl leading-tight text-white">
                  Ready to meet travelers like you?
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  To find compatible co-travellers, your travel profile needs
                  to be visible to other travelers who have also chosen to join
                  Tribe matching.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                  Your profile will only be used for the Tribe experience, and
                  you can turn this off anytime from your Profile settings.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="bg-[#f8f4ea] text-black hover:bg-white"
                    disabled={isEnablingTribe}
                    type="button"
                    onClick={handleEnableTribe}
                  >
                    {isEnablingTribe ? "Enabling..." : "Enable Tribe Matching"}
                  </Button>
                  <Button
                    className="border-white/16 bg-transparent text-white hover:bg-white/10"
                    disabled={isEnablingTribe}
                    type="button"
                    variant="outline"
                    onClick={() => setConsentDeclined(true)}
                  >
                    Not Now
                  </Button>
                </div>
              </div>
            ) : null}

            {!isLoading && !error && tribeDiscoverable === false && consentDeclined ? (
              <div className="mt-8 border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <h3 className="font-serif text-4xl leading-tight text-white">
                  Your Tribe is waiting.
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  Turn on Tribe Matching to discover compatible travelers and
                  let your profile appear in relevant matches.
                </p>
                <Button
                  className="mt-6 bg-[#f8f4ea] text-black hover:bg-white"
                  disabled={isEnablingTribe}
                  type="button"
                  onClick={handleEnableTribe}
                >
                  {isEnablingTribe ? "Enabling..." : "Enable Tribe Matching"}
                </Button>
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-8 border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/58">Loading your matches...</p>
              </div>
            ) : null}

            {!isLoading && !error && tribeDiscoverable === true && matches.length === 0 ? (
              <div className="mt-8 border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/58">{emptyStateMessage}</p>
              </div>
            ) : null}

            {!isLoading && !error && tribeDiscoverable === true && matches.length > 0 ? (
              <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {matches.map((match) => {
                const profile = match.profile;
                const profileUserId = profile.user_id || match.user_id;
                const displayName =
                  profile.name || profile.username || "CoVoyage Traveler";
                const location = [profile.city, profile.country]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    className="group flex min-h-full flex-col border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#f8f4ea]/32 hover:bg-white/[0.055]"
                    key={profileUserId}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <MatchAvatar
                          displayName={displayName}
                          imageUrl={profile.profile_picture_url}
                        />
                        <div>
                          <h3 className="font-serif text-3xl leading-tight text-white">
                            {displayName}
                          </h3>
                          {profile.username ? (
                            <p className="mt-1 text-sm text-white/42">
                              @{profile.username}
                            </p>
                          ) : null}
                          {location ? (
                            <p className="mt-3 flex items-center gap-2 text-sm text-white/58">
                              <MapPin className="h-4 w-4" />
                              {location}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-4xl leading-none text-[#f8f4ea]">
                          {match.compatibility_score}%
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/38">
                          Match
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 flex-1 text-sm leading-7 text-white/66">
                      {profile.bio || "This traveler has not added a bio yet."}
                    </p>

                    <dl className="mt-6 space-y-5">
                      <MatchDetail label="Travel Dates">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-white/40" />
                          {formatTravelDates(
                            profile.available_from,
                            profile.available_to,
                          )}
                        </span>
                      </MatchDetail>
                      <MatchDetail label="Preferred Destinations">
                        <TagList values={profile.preferred_destinations} />
                      </MatchDetail>
                      <MatchDetail label="Interests">
                        <TagList values={profile.interests} />
                      </MatchDetail>
                      <MatchDetail label="Match Reason">
                        {match.reason}
                      </MatchDetail>
                    </dl>

                    <Button
                      asChild
                      className="mt-7 w-full border-white/16 bg-transparent text-white transition duration-300 hover:border-[#f8f4ea]/50 hover:bg-[#f8f4ea] hover:text-black"
                      variant="outline"
                    >
                      <Link href={`/profile/${encodeURIComponent(profileUserId)}`}>
                        <Compass className="h-4 w-4" />
                        View Profile
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          ) : null}
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
