"use client";

import { ArrowLeft, CalendarDays, Camera, Globe2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ContentCard } from "@/components/shared/ContentCard";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest, clearAuth, getValidAuthToken } from "@/lib/api";

type PublicTravelProfile = {
  user_id: string;
  name?: string;
  username?: string;
  age?: number | null;
  gender?: string | null;
  preferred_travel_gender?: string | null;
  bio?: string | null;
  profile_picture_url?: string | null;
  travel_style?: string | null;
  preferred_destinations?: string[];
  budget_range?: string | null;
  preferred_trip_duration?: string | null;
  available_from?: string | null;
  available_to?: string | null;
  interests?: string[];
  languages_spoken?: string[];
  country?: string | null;
  city?: string | null;
  previously_visited_countries?: string[];
  linkedin?: string | null;
  instagram?: string | null;
  personal_website?: string | null;
};

type PublicProfileResponse = {
  profile: PublicTravelProfile;
};

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

function ProfilePhoto({
  displayName,
  imageUrl,
}: {
  displayName: string;
  imageUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageUrl || imageFailed) {
    return (
      <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border border-dashed border-stone-300 bg-[#f4eee4] text-stone-500">
        <Camera className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Image
      alt={`${displayName} profile`}
      className="mx-auto h-36 w-36 rounded-full object-cover"
      height={144}
      src={imageUrl}
      unoptimized
      width={144}
      onError={() => setImageFailed(true)}
    />
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-stone-800">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-stone-600">
        {value || "Not specified"}
      </dd>
    </div>
  );
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const rawTravelerId = params.travelerId;
  const travelerId = Array.isArray(rawTravelerId)
    ? rawTravelerId[0]
    : rawTravelerId;
  const [profile, setProfile] = useState<PublicTravelProfile | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPublicProfile = async () => {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      if (!travelerId) {
        setError("Traveler profile not found.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<PublicProfileResponse>(
          `/profiles/${encodeURIComponent(travelerId)}`,
          { token },
        );

        setProfile(response.profile);
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearAuth();
          router.push("/login");
          return;
        }

        setError(
          caughtError instanceof ApiError
            ? caughtError.detail
            : "Unable to load profile.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicProfile();
  }, [router, travelerId]);

  const displayName = profile?.name || profile?.username || "CoVoyage Traveler";
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");

  return (
    <AuthGuard>
      <PageShell
        description="A read-only travel profile for reviewing a potential CoVoyage companion."
        eyebrow="Traveler profile"
        title={displayName}
      >
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <Button asChild className="mb-6 w-fit" variant="outline">
            <Link href="/tribe">
              <ArrowLeft className="h-4 w-4" />
              Back to Tribe
            </Link>
          </Button>

          {error ? (
            <p className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <ContentCard>
              <p className="text-sm text-stone-600">Loading profile...</p>
            </ContentCard>
          ) : null}

          {!isLoading && !error && profile ? (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <ContentCard className="h-fit text-center">
                <ProfilePhoto
                  displayName={displayName}
                  imageUrl={profile.profile_picture_url}
                />
                <h2 className="mt-6 font-serif text-3xl text-stone-900">
                  {displayName}
                </h2>
                {profile.username ? (
                  <p className="mt-1 text-sm text-stone-500">
                    @{profile.username}
                  </p>
                ) : null}
                {location ? (
                  <p className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-600">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </p>
                ) : null}
              </ContentCard>

              <div className="grid gap-6">
                <ContentCard>
                  <h2 className="font-serif text-3xl text-stone-900">
                    About
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-stone-600">
                    {profile.bio || "This traveler has not added a bio yet."}
                  </p>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <DetailItem label="Age" value={profile.age} />
                    <DetailItem label="Gender" value={profile.gender} />
                    <DetailItem
                      label="Preferred Gender to Travel With"
                      value={profile.preferred_travel_gender}
                    />
                    <DetailItem
                      label="Travel Style"
                      value={profile.travel_style}
                    />
                    <DetailItem label="Budget" value={profile.budget_range} />
                  </dl>
                </ContentCard>

                <ContentCard>
                  <h2 className="font-serif text-3xl text-stone-900">
                    Travel Plans
                  </h2>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-stone-800">
                        <CalendarDays className="h-4 w-4" />
                        Travel Dates
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-stone-600">
                        {formatTravelDates(
                          profile.available_from,
                          profile.available_to,
                        )}
                      </dd>
                    </div>
                    <DetailItem
                      label="Preferred Trip Duration"
                      value={profile.preferred_trip_duration}
                    />
                    <DetailItem
                      label="Preferred Destinations"
                      value={formatList(profile.preferred_destinations)}
                    />
                    <DetailItem
                      label="Previously Visited Countries"
                      value={formatList(profile.previously_visited_countries)}
                    />
                  </dl>
                </ContentCard>

                <ContentCard>
                  <h2 className="font-serif text-3xl text-stone-900">
                    Interests And Languages
                  </h2>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <DetailItem
                      label="Interests"
                      value={formatList(profile.interests)}
                    />
                    <DetailItem
                      label="Languages Spoken"
                      value={formatList(profile.languages_spoken)}
                    />
                  </dl>
                </ContentCard>

                <ContentCard>
                  <h2 className="font-serif text-3xl text-stone-900">
                    Links
                  </h2>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-3">
                    <DetailItem label="LinkedIn" value={profile.linkedin} />
                    <DetailItem label="Instagram" value={profile.instagram} />
                    <DetailItem
                      label="Personal Website"
                      value={profile.personal_website}
                    />
                  </dl>
                  <p className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                    <Globe2 className="h-4 w-4" />
                    Read-only public profile
                  </p>
                </ContentCard>
              </div>
            </div>
          ) : null}
        </section>
      </PageShell>
    </AuthGuard>
  );
}
