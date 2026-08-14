"use client";

import { ArrowLeft, CalendarDays, Camera, MapPin } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest, clearAuth, getValidAuthToken } from "@/lib/api";

type PublicTravelProfile = {
  user_id: string;
  name?: string;
  username?: string;
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
      <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border border-dashed border-white/18 bg-white/[0.04] text-white/45">
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
      <dt className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-white/68">
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
      <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
        <Navbar />
        <main className="overflow-hidden bg-[#050505]">
          <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 text-center sm:px-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.38em] text-white/42">
              Traveler profile
            </p>
            <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-tight text-white sm:text-6xl">
              {displayName}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/62">
              A read-only travel profile for reviewing a potential CoVoyage companion.
            </p>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <Button
            className="mb-6 w-fit border-white/16 bg-transparent text-white hover:bg-white/10"
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tribe
          </Button>

          {error ? (
            <p className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <section className="border border-white/10 bg-white/[0.035] p-6">
              <p className="text-sm text-white/58">Loading profile...</p>
            </section>
          ) : null}

          {!isLoading && !error && profile ? (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <section className="h-fit border border-white/10 bg-white/[0.035] p-6 text-center shadow-2xl shadow-black/20">
                <ProfilePhoto
                  displayName={displayName}
                  imageUrl={profile.profile_picture_url}
                />
                <h2 className="mt-6 font-serif text-3xl text-white">
                  {displayName}
                </h2>
                {profile.username ? (
                  <p className="mt-1 text-sm text-white/42">
                    @{profile.username}
                  </p>
                ) : null}
                {location ? (
                  <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/58">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </p>
                ) : null}
              </section>

              <div className="grid gap-6">
                <section className="border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <h2 className="font-serif text-3xl text-white">
                    About
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-white/66">
                    {profile.bio || "This traveler has not added a bio yet."}
                  </p>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <DetailItem
                      label="Travel Style"
                      value={profile.travel_style}
                    />
                    <DetailItem label="Budget" value={profile.budget_range} />
                  </dl>
                </section>

                <section className="border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <h2 className="font-serif text-3xl text-white">
                    Travel Plans
                  </h2>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/38">
                        <CalendarDays className="h-4 w-4" />
                        Travel Dates
                      </dt>
                      <dd className="mt-2 text-sm leading-6 text-white/68">
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
                  </dl>
                </section>

                <section className="border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <h2 className="font-serif text-3xl text-white">
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
                </section>
              </div>
            </div>
          ) : null}
        </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
