"use client";

import { MapPin, RefreshCw, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ContentCard } from "@/components/shared/ContentCard";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest, getAuthToken } from "@/lib/api";

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

type MatchResult = {
  profile: MatchProfile;
  compatibility_score: number;
  reason: string;
};

const emptyStateMessage =
  "No strong matches yet. Try updating your destination, dates, or interests.";

function formatList(values?: string[]) {
  if (!values || values.length === 0) {
    return "Not specified";
  }

  return values.join(", ");
}

function formatTravelDates(start?: string | null, end?: string | null) {
  if (!start || !end) {
    return "Not specified";
  }

  return start === end ? start : `${start} to ${end}`;
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
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ead9bd] font-serif text-2xl text-stone-700">
        {displayName.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      alt={`${displayName} profile`}
      className="h-16 w-16 shrink-0 rounded-full object-cover"
      height={64}
      src={imageUrl}
      unoptimized
      width={64}
      onError={() => setImageFailed(true)}
    />
  );
}

export default function TribePage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Please log in to view your matches.");
    }

    return apiRequest<MatchResult[]>("/matches", { token });
  }, []);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
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
  }, [fetchMatches]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialMatches = async () => {
      try {
        const response = await fetchMatches();

        if (isMounted) {
          setMatches(response);
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
  }, [fetchMatches]);

  const handleRefresh = async () => {
    await loadMatches();
  };

  return (
    <AuthGuard>
      <PageShell
        description="Discover travelers whose saved profile preferences align with your destinations, dates, interests, and travel rhythm."
        eyebrow="Find your tribe"
        title="Plan One Shared Journey"
      >
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <ContentCard>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-stone-500" />
                <div>
                  <h2 className="font-serif text-3xl text-stone-900">
                    Your Compatibility Matches
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                    Matches are based on your saved CoVoyage profile. Update your
                    profile to tune destinations, travel dates, budget, languages,
                    and interests.
                  </p>
                </div>
              </div>
              <Button
                className="w-fit"
                disabled={isLoading}
                title="Re-fetch and recompute matches from the backend"
                aria-label="Re-fetch and recompute matches from the backend"
                size="lg"
                type="button"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                {isLoading ? "Loading..." : "Refresh Matches"}
              </Button>
            </div>
          </ContentCard>

          {error ? (
            <p className="mt-8 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <ContentCard className="mt-8">
              <p className="text-sm text-stone-600">Loading your matches...</p>
            </ContentCard>
          ) : null}

          {!isLoading && !error && matches.length === 0 ? (
            <ContentCard className="mt-8">
              <p className="text-sm text-stone-600">{emptyStateMessage}</p>
            </ContentCard>
          ) : null}

          {!isLoading && !error && matches.length > 0 ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {matches.map((match) => {
                const profile = match.profile;
                const displayName =
                  profile.name || profile.username || "CoVoyage Traveler";
                const location = [profile.city, profile.country]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <ContentCard key={profile.user_id}>
                    <div className="flex items-start gap-4">
                      <MatchAvatar
                        displayName={displayName}
                        imageUrl={profile.profile_picture_url}
                      />
                      <div>
                        <h3 className="font-serif text-2xl text-stone-900">
                          {displayName}
                        </h3>
                        {profile.username ? (
                          <p className="mt-1 text-sm text-stone-500">
                            @{profile.username}
                          </p>
                        ) : null}
                        {location ? (
                          <p className="mt-1 flex items-center gap-2 text-sm text-stone-600">
                            <MapPin className="h-4 w-4" />
                            {location}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-6 font-serif text-4xl text-stone-900">
                      {match.compatibility_score}%
                    </p>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Compatibility
                    </p>
                    <p className="mt-5 text-sm leading-7 text-stone-600">
                      {profile.bio || "This traveler has not added a bio yet."}
                    </p>
                    <dl className="mt-6 space-y-4 text-sm leading-6 text-stone-600">
                      <div>
                        <dt className="font-medium text-stone-800">
                          Travel Dates
                        </dt>
                        <dd>
                          {formatTravelDates(
                            profile.available_from,
                            profile.available_to,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-stone-800">
                          Preferred Destinations
                        </dt>
                        <dd>{formatList(profile.preferred_destinations)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-stone-800">
                          Interests
                        </dt>
                        <dd>{formatList(profile.interests)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-stone-800">
                          Match Reason
                        </dt>
                        <dd>{match.reason}</dd>
                      </div>
                    </dl>
                    <Button asChild className="mt-6 w-full" variant="outline">
                      <Link href={`/profile/${encodeURIComponent(profile.user_id)}`}>
                        View Profile
                      </Link>
                    </Button>
                  </ContentCard>
                );
              })}
            </div>
          ) : null}
        </section>
      </PageShell>
    </AuthGuard>
  );
}
