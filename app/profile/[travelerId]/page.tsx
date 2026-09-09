"use client";

import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Camera,
  Check,
  Flag,
  MessageCircle,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  apiRequest,
  clearAuth,
  createChat,
  getValidAuthToken,
  resolveMediaUrl,
} from "@/lib/api";

type PublicTravelProfile = {
  user_id: string;
  name?: string;
  username?: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  travel_style?: string | null;
  preferred_destinations?: string[];
  available_from?: string | null;
  available_to?: string | null;
  interests?: string[];
  match_context?: {
    explanation?: string;
    shared_destinations?: string[];
    shared_interests?: string[];
  };
};

type PublicProfileResponse = {
  profile: PublicTravelProfile;
};

type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected"
  | "declined"
  | "cancelled"
  | "blocked"
  | "self";

type ConnectionRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
};

type ConnectionStatusResponse = {
  relationship_status: RelationshipStatus;
  request?: ConnectionRequest | null;
};

const reportReasons = [
  "Harassment",
  "Spam or scam",
  "Unsafe travel behavior",
  "Fake profile",
  "Inappropriate content",
  "Other",
] as const;
const tribeMatchCacheKey = "covoyage_find_your_tribe_matches";

function clearTribeMatchCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(tribeMatchCacheKey);
}

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

  const resolvedImageUrl = resolveMediaUrl(imageUrl);

  if (!resolvedImageUrl || imageFailed) {
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
      src={resolvedImageUrl}
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
  const [relationshipStatus, setRelationshipStatus] =
    useState<RelationshipStatus>("none");
  const [connectionRequest, setConnectionRequest] =
    useState<ConnectionRequest | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isConnectionActionLoading, setIsConnectionActionLoading] =
    useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [reportReason, setReportReason] =
    useState<(typeof reportReasons)[number]>("Harassment");
  const [reportDescription, setReportDescription] = useState("");

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
        const statusResponse = await apiRequest<ConnectionStatusResponse>(
          `/connections/status/${encodeURIComponent(response.profile.user_id)}`,
          { token },
        );

        setProfile(response.profile);
        setRelationshipStatus(statusResponse.relationship_status);
        setConnectionRequest(statusResponse.request || null);
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
  const matchExplanation = profile?.match_context?.explanation;
  const sharedDestinations =
    profile?.match_context?.shared_destinations || profile?.preferred_destinations;

  const refreshRelationshipStatus = async (targetUserId: string) => {
    const token = getValidAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const statusResponse = await apiRequest<ConnectionStatusResponse>(
      `/connections/status/${encodeURIComponent(targetUserId)}`,
      { token },
    );

    setRelationshipStatus(statusResponse.relationship_status);
    setConnectionRequest(statusResponse.request || null);
  };

  const handleConnect = async () => {
    if (!profile) {
      return;
    }

    setIsConnectionActionLoading(true);
    setActionError("");
    setActionMessage("");
    clearTribeMatchCache();

    try {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest<ConnectionRequest>("/connections/requests", {
        method: "POST",
        token,
        body: JSON.stringify({ target_user_id: profile.user_id }),
      });
      await refreshRelationshipStatus(profile.user_id);
      setActionMessage("Connection request sent.");
    } catch (caughtError) {
      setActionError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to send connection request.",
      );
    } finally {
      setIsConnectionActionLoading(false);
    }
  };

  const handleConnectionDecision = async (decision: "accept" | "decline") => {
    if (!profile || !connectionRequest) {
      setActionError("Unable to find this connection request.");
      return;
    }

    setIsConnectionActionLoading(true);
    setActionError("");
    setActionMessage("");
    clearTribeMatchCache();

    try {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest<ConnectionRequest>(
        `/connections/requests/${encodeURIComponent(
          connectionRequest.id,
        )}/${decision}`,
        { method: "PATCH", token },
      );
      await refreshRelationshipStatus(profile.user_id);
      setActionMessage(
        decision === "accept"
          ? "Connection accepted. Chat is now available."
          : "Connection request declined.",
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to update connection request.",
      );
    } finally {
      setIsConnectionActionLoading(false);
    }
  };

  const handleCancelConnectionRequest = async () => {
    if (!profile || !connectionRequest) {
      setActionError("Unable to find this connection request.");
      return;
    }

    setIsConnectionActionLoading(true);
    setActionError("");
    setActionMessage("");
    clearTribeMatchCache();

    try {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest<ConnectionRequest>(
        `/connections/requests/${encodeURIComponent(connectionRequest.id)}/cancel`,
        { method: "PATCH", token },
      );
      await refreshRelationshipStatus(profile.user_id);
      setActionMessage("Connection request cancelled.");
    } catch (caughtError) {
      setActionError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to cancel connection request.",
      );
    } finally {
      setIsConnectionActionLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profile) {
      return;
    }

    setIsConnectionActionLoading(true);
    setActionError("");

    try {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const conversation = await createChat(profile.user_id, token);
      router.push(`/chat/${encodeURIComponent(conversation.id)}`);
    } catch (caughtError) {
      setActionError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to open chat.",
      );
    } finally {
      setIsConnectionActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!profile) {
      return;
    }

    setIsReportLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest("/connections/reports", {
        method: "POST",
        token,
        body: JSON.stringify({
          reported_user_id: profile.user_id,
          reason: reportReason,
          description: reportDescription || null,
        }),
      });
      setReportDescription("");
      setIsReportDialogOpen(false);
      setActionMessage("Report submitted.");
    } catch (caughtError) {
      setActionError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to submit report.",
      );
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) {
      return;
    }

    setIsBlockLoading(true);
    setActionError("");
    setActionMessage("");
    clearTribeMatchCache();

    try {
      const token = getValidAuthToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest("/connections/blocks", {
        method: "POST",
        token,
        body: JSON.stringify({ target_user_id: profile.user_id }),
      });
      setIsBlockDialogOpen(false);
      setRelationshipStatus("blocked");
      setConnectionRequest(null);
      setActionMessage("This traveler has been blocked.");
    } catch (caughtError) {
      setActionError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to block traveler.",
      );
    } finally {
      setIsBlockLoading(false);
    }
  };

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
                <div className="mt-6 grid gap-3">
                  {relationshipStatus === "connected" ? (
                    <Button
                      className="w-full bg-[#f8f4ea] text-black hover:bg-white"
                      disabled={isConnectionActionLoading}
                      type="button"
                      onClick={handleMessage}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  ) : null}

                  {relationshipStatus === "pending_received" ? (
                    <div className="grid gap-2">
                      <Button
                        className="w-full bg-[#f8f4ea] text-black hover:bg-white"
                        disabled={isConnectionActionLoading}
                        type="button"
                        onClick={() => handleConnectionDecision("accept")}
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        className="w-full border-white/16 bg-transparent text-white hover:bg-white/10"
                        disabled={isConnectionActionLoading}
                        type="button"
                        variant="outline"
                        onClick={() => handleConnectionDecision("decline")}
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  ) : null}

                  {relationshipStatus === "pending_sent" ? (
                    <div className="grid gap-2">
                      <Button
                        className="w-full border-white/16 bg-white/[0.08] text-white/60"
                        disabled
                        type="button"
                      >
                        <Send className="h-4 w-4" />
                        Request Sent
                      </Button>
                      <Button
                        className="w-full border-white/16 bg-transparent text-white hover:bg-white/10"
                        disabled={isConnectionActionLoading}
                        type="button"
                        variant="outline"
                        onClick={handleCancelConnectionRequest}
                      >
                        <X className="h-4 w-4" />
                        Cancel Request
                      </Button>
                    </div>
                  ) : null}

                  {["none", "declined", "cancelled"].includes(
                    relationshipStatus,
                  ) ? (
                    <Button
                      className="w-full bg-[#f8f4ea] text-black hover:bg-white"
                      disabled={isConnectionActionLoading}
                      type="button"
                      onClick={handleConnect}
                    >
                      <UserPlus className="h-4 w-4" />
                      {relationshipStatus === "declined"
                        ? "Connect Again"
                        : "Connect"}
                    </Button>
                  ) : null}

                  {relationshipStatus === "connected" ? (
                    <Button
                      className="w-full border-white/16 bg-white/[0.08] text-white/60"
                      disabled
                      type="button"
                    >
                      <Check className="h-4 w-4" />
                      Connected
                    </Button>
                  ) : null}

                  {relationshipStatus === "blocked" ? (
                    <Button
                      className="w-full border-white/16 bg-white/[0.08] text-white/60"
                      disabled
                      type="button"
                    >
                      <Ban className="h-4 w-4" />
                      Unavailable
                    </Button>
                  ) : null}
                </div>

                {actionError ? (
                  <p className="mt-4 border border-red-400/30 bg-red-950/30 px-3 py-2 text-left text-sm text-red-100">
                    {actionError}
                  </p>
                ) : null}
                {actionMessage ? (
                  <p className="mt-4 border border-emerald-300/20 bg-emerald-950/20 px-3 py-2 text-left text-sm text-emerald-100">
                    {actionMessage}
                  </p>
                ) : null}
              </section>

              <div className="grid gap-6">
                <section className="border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <h2 className="font-serif text-3xl text-white">
                    Public Snapshot
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-white/66">
                    {profile.bio || "This traveler has not added a bio yet."}
                  </p>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <DetailItem
                      label="Shared Travel Style"
                      value={profile.travel_style}
                    />
                    <DetailItem
                      label="Why You Match"
                      value={matchExplanation}
                    />
                  </dl>
                </section>

                <section className="border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <h2 className="font-serif text-3xl text-white">Match Signals</h2>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/38">
                        <CalendarDays className="h-4 w-4" />
                        Overlapping Dates
                      </dt>
                      <dd className="mt-2 text-sm leading-6 text-white/68">
                        {formatTravelDates(
                          profile.available_from,
                          profile.available_to,
                        )}
                      </dd>
                    </div>
                    <DetailItem
                      label="Shared Destinations"
                      value={formatList(sharedDestinations)}
                    />
                  </dl>
                </section>

                {relationshipStatus !== "self" && relationshipStatus !== "blocked" ? (
                  <section className="border-t border-white/10 pt-6">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="border-white/16 bg-transparent text-white hover:bg-white/10"
                        disabled={isReportLoading}
                        type="button"
                        variant="outline"
                        onClick={() => setIsReportDialogOpen(true)}
                      >
                        <Flag className="h-4 w-4" />
                        Report this traveler
                      </Button>
                      <Button
                        className="border-red-300/20 bg-transparent text-red-100 hover:bg-red-950/30"
                        disabled={isBlockLoading}
                        type="button"
                        variant="outline"
                        onClick={() => setIsBlockDialogOpen(true)}
                      >
                        <Ban className="h-4 w-4" />
                        {isBlockLoading ? "Blocking..." : "Block this traveler"}
                      </Button>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        {isReportDialogOpen && profile ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-5">
            <section
              aria-modal="true"
              className="w-full max-w-lg border border-white/12 bg-[#050505] p-6 shadow-2xl shadow-black"
              role="dialog"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">
                    Report
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-white">
                    Report {displayName}
                  </h2>
                </div>
                <Button
                  className="h-10 w-10 border-white/16 bg-transparent p-0 text-white hover:bg-white/10"
                  disabled={isReportLoading}
                  type="button"
                  variant="outline"
                  onClick={() => setIsReportDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <label
                className="mt-6 block text-xs font-medium uppercase tracking-[0.22em] text-white/38"
                htmlFor="report-reason"
              >
                Reason
              </label>
              <select
                className="mt-3 w-full border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
                disabled={isReportLoading}
                id="report-reason"
                value={reportReason}
                onChange={(event) =>
                  setReportReason(
                    event.target.value as (typeof reportReasons)[number],
                  )
                }
              >
                {reportReasons.map((reason) => (
                  <option className="bg-black text-white" key={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <label
                className="mt-5 block text-xs font-medium uppercase tracking-[0.22em] text-white/38"
                htmlFor="report-description"
              >
                Optional details
              </label>
              <textarea
                className="mt-3 min-h-28 w-full resize-y border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                disabled={isReportLoading}
                id="report-description"
                maxLength={1000}
                placeholder="Add context if needed"
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
              />

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  className="border-white/16 bg-transparent text-white hover:bg-white/10"
                  disabled={isReportLoading}
                  type="button"
                  variant="outline"
                  onClick={() => setIsReportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#f8f4ea] text-black hover:bg-white"
                  disabled={isReportLoading}
                  type="button"
                  onClick={handleReport}
                >
                  <Flag className="h-4 w-4" />
                  {isReportLoading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </section>
          </div>
        ) : null}

        {isBlockDialogOpen && profile ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-5">
            <section
              aria-modal="true"
              className="w-full max-w-md border border-red-300/20 bg-[#050505] p-6 shadow-2xl shadow-black"
              role="dialog"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-red-300/25 bg-red-950/25 text-red-100">
                  <Ban className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-100/60">
                    Block traveler
                  </p>
                  <h2 className="mt-2 font-serif text-3xl leading-tight text-white">
                    Block {displayName}?
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/62">
                    You will no longer be able to connect or chat with this
                    traveler, and they will not be able to interact with you
                    through Tribe.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <Button
                  className="border-white/16 bg-transparent text-white hover:bg-white/10"
                  disabled={isBlockLoading}
                  type="button"
                  variant="outline"
                  onClick={() => setIsBlockDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-100 text-black hover:bg-white"
                  disabled={isBlockLoading}
                  type="button"
                  onClick={handleBlock}
                >
                  <Ban className="h-4 w-4" />
                  {isBlockLoading ? "Blocking..." : "Yes, Block"}
                </Button>
              </div>
            </section>
          </div>
        ) : null}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
