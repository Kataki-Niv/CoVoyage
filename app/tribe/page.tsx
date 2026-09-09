"use client";

import {
  CalendarDays,
  Check,
  Compass,
  MapPin,
  MessageCircle,
  Plane,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  apiRequest,
  clearAuth,
  createChat,
  createGroupVoyageChat,
  getValidAuthToken,
  resolveMediaUrl,
} from "@/lib/api";

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

type TribeMode = "solo" | "group";

type GroupVisibility = "public" | "private";

type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected"
  | "declined"
  | "cancelled"
  | "blocked";

type GroupViewerStatus =
  | "creator"
  | "participant"
  | "pending_sent"
  | "declined"
  | "cancelled"
  | "closed"
  | "full"
  | "none";

type MatchFactor = {
  type: string;
  label: string;
  value: string | string[];
};

type OwnProfile = {
  tribe_discoverable?: boolean;
  gender?: string | null;
  preferred_travel_gender?: string | null;
  travel_style?: string | null;
  preferred_destinations?: string[];
  available_from?: string | null;
  available_to?: string | null;
  interests?: string[];
  budget_range?: string | null;
  preferred_trip_duration?: string | null;
  languages_spoken?: string[];
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
  explanation?: string;
  factors?: MatchFactor[];
  relationship_status?: RelationshipStatus;
};

type CachedMatchResults = {
  profileFingerprint: string;
  matches: MatchResult[];
};

type ConnectionRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  other_user_id?: string;
  relationship_status?: RelationshipStatus;
  requester_profile?: MatchProfile | null;
  recipient_profile?: MatchProfile | null;
  other_profile?: MatchProfile | null;
  created_at?: string;
};

type GroupSafeProfile = {
  user_id: string;
  name?: string;
  username?: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  travel_style?: string | null;
  relevant_destinations?: string[];
  relevant_date_overlap?: {
    start: string;
    end: string;
  };
};

type GroupVoyage = {
  id: string;
  creator_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  tags?: string[];
  budget_range?: string | null;
  max_participants: number;
  participant_ids: string[];
  participant_count: number;
  participants?: GroupSafeProfile[];
  creator_profile?: GroupSafeProfile | null;
  status: "open" | "closed";
  visibility: GroupVisibility;
  viewer_status?: GroupViewerStatus;
  viewer_join_request?: GroupJoinRequest | null;
  join_request_status?: "pending" | "accepted" | "declined" | "cancelled" | null;
};

type GroupJoinRequest = {
  id: string;
  voyage_id: string;
  requester_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  requester_profile?: GroupSafeProfile | null;
  voyage?: GroupVoyage;
};

type GroupDraft = {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  description: string;
  tags: string;
  budget_range: string;
  max_participants: number;
  visibility: GroupVisibility;
};

const emptyStateMessage =
  "No strong matches yet. Try updating your destination, dates, or interests.";
const tribeMatchCacheKey = "covoyage_find_your_tribe_matches";
const tribeMatchScrollKey = "covoyage_find_your_tribe_scroll";

const initialGroupDraft: GroupDraft = {
  title: "",
  destination: "",
  start_date: "",
  end_date: "",
  description: "",
  tags: "",
  budget_range: "",
  max_participants: 8,
  visibility: "public",
};

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

function formatFactorValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(" · ") : value;
}

function getDisplayName(profile?: MatchProfile | null) {
  return profile?.name || profile?.username || "CoVoyage Traveler";
}

function getGroupProfileName(profile?: GroupSafeProfile | null) {
  return profile?.name || profile?.username || "CoVoyage Traveler";
}

function getLocation(profile: MatchProfile) {
  return [profile.city, profile.country].filter(Boolean).join(", ");
}

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatGroupDates(start?: string | null, end?: string | null) {
  if (!start) {
    return "Dates TBD";
  }

  return end && end !== start ? `${start} to ${end}` : start;
}

function formatGroupViewerStatus(status?: GroupViewerStatus) {
  if (status === "creator") {
    return "Host";
  }

  if (status === "participant") {
    return "Member";
  }

  if (status === "pending_sent") {
    return "Request pending";
  }

  if (status === "declined") {
    return "Request declined";
  }

  if (status === "cancelled") {
    return "Request cancelled";
  }

  if (status === "closed") {
    return "Voyage Closed";
  }

  if (status === "full") {
    return "Full";
  }

  return "Not requested";
}

function getGroupLifecycleLabel(voyage: GroupVoyage) {
  if (voyage.status === "closed") {
    return "Voyage Closed";
  }

  return formatGroupViewerStatus(voyage.viewer_status);
}

function getGroupProfileContext(profile?: GroupSafeProfile | null) {
  if (!profile) {
    return "";
  }

  const context = [];

  if (profile.travel_style) {
    context.push(profile.travel_style);
  }

  if (profile.relevant_destinations?.length) {
    context.push(`Interested in ${profile.relevant_destinations.join(", ")}`);
  }

  if (profile.relevant_date_overlap) {
    context.push(
      `Available ${formatGroupDates(
        profile.relevant_date_overlap.start,
        profile.relevant_date_overlap.end,
      )}`,
    );
  }

  return context.join(" - ");
}

function getApiError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError
    ? caughtError.detail || fallback
    : caughtError instanceof Error
      ? caughtError.message
      : fallback;
}

function groupVoyageToDraft(voyage: GroupVoyage): GroupDraft {
  return {
    title: voyage.title,
    destination: voyage.destination,
    start_date: voyage.start_date,
    end_date: voyage.end_date || "",
    description: voyage.description || "",
    tags: voyage.tags?.join(", ") || "",
    budget_range: voyage.budget_range || "",
    max_participants: voyage.max_participants,
    visibility: voyage.visibility || "public",
  };
}

function isMatchingServiceUnavailable(caughtError: unknown) {
  if (!(caughtError instanceof ApiError) || caughtError.status !== 503) {
    return false;
  }

  const rawDetail = caughtError.rawDetail;

  return (
    typeof rawDetail === "object" &&
    rawDetail !== null &&
    "code" in rawDetail &&
    typeof rawDetail.code === "string" &&
    rawDetail.code.startsWith("matching_")
  );
}

function isIncompleteProfileError(caughtError: unknown) {
  if (!(caughtError instanceof ApiError) || caughtError.status !== 409) {
    return false;
  }

  const rawDetail = caughtError.rawDetail;

  return (
    typeof rawDetail === "object" &&
    rawDetail !== null &&
    "code" in rawDetail &&
    rawDetail.code === "profile_incomplete"
  );
}

function buildMatchProfileFingerprint(profile?: OwnProfile | null) {
  return JSON.stringify({
    gender: profile?.gender || null,
    preferred_travel_gender: profile?.preferred_travel_gender || null,
    travel_style: profile?.travel_style || null,
    preferred_destinations: profile?.preferred_destinations || [],
    available_from: profile?.available_from || null,
    available_to: profile?.available_to || null,
    interests: profile?.interests || [],
    budget_range: profile?.budget_range || null,
    preferred_trip_duration: profile?.preferred_trip_duration || null,
    languages_spoken: profile?.languages_spoken || [],
    tribe_discoverable: profile?.tribe_discoverable === true,
  });
}

function readCachedMatches(profileFingerprint: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawCache = window.sessionStorage.getItem(tribeMatchCacheKey);

    if (!rawCache) {
      return null;
    }

    const cached = JSON.parse(rawCache) as Partial<CachedMatchResults>;

    if (
      cached.profileFingerprint !== profileFingerprint ||
      !Array.isArray(cached.matches)
    ) {
      return null;
    }

    return cached.matches as MatchResult[];
  } catch {
    return null;
  }
}

function writeCachedMatches(profileFingerprint: string, matches: MatchResult[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    tribeMatchCacheKey,
    JSON.stringify({ profileFingerprint, matches }),
  );
}

function saveTribeMatchScrollPosition() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(tribeMatchScrollKey, String(window.scrollY));
}

function restoreTribeMatchScrollPosition() {
  if (typeof window === "undefined") {
    return;
  }

  const rawScrollPosition = window.sessionStorage.getItem(tribeMatchScrollKey);

  if (!rawScrollPosition) {
    return;
  }

  window.sessionStorage.removeItem(tribeMatchScrollKey);
  const scrollPosition = Number(rawScrollPosition);

  if (!Number.isFinite(scrollPosition)) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
    });
  });
}

function clearCachedMatches() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(tribeMatchCacheKey);
  window.sessionStorage.removeItem(tribeMatchScrollKey);
}

function getTokenOrThrow(message = "Please log in to continue.") {
  const token = getValidAuthToken();

  if (!token) {
    throw new Error(message);
  }

  return token;
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: TribeMode;
  onChange: (mode: TribeMode) => void;
}) {
  return (
    <div className="inline-flex w-full max-w-md border border-white/12 bg-black/42 p-1 sm:w-auto">
      {[
        { value: "solo" as const, label: "Solo Travel", icon: Plane },
        { value: "group" as const, label: "Group Voyages", icon: UsersRound },
      ].map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.value;

        return (
          <button
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] transition duration-300 sm:flex-none ${
              isActive
                ? "bg-[#f8f4ea] text-black"
                : "text-white/56 hover:bg-white/[0.06] hover:text-white"
            }`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
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

  const resolvedImageUrl = resolveMediaUrl(imageUrl);

  if (!resolvedImageUrl || imageFailed) {
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
        src={resolvedImageUrl}
        unoptimized
        width={80}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

function ConnectionAction({
  status,
  disabled,
  onConnect,
  onAccept,
  onDecline,
  onCancel,
}: {
  status: RelationshipStatus;
  disabled: boolean;
  onConnect: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
}) {
  if (status === "blocked") {
    return (
      <Button className="w-full border-white/16 bg-white/[0.08] text-white/60" disabled type="button">
        <X className="h-4 w-4" />
        Unavailable
      </Button>
    );
  }

  if (status === "connected") {
    return (
      <Button className="w-full border-white/16 bg-white/[0.08] text-white/60" disabled type="button">
        <Check className="h-4 w-4" />
        Connected
      </Button>
    );
  }

  if (status === "pending_sent") {
    return (
      <div className="grid gap-2">
        <Button className="w-full border-white/16 bg-white/[0.08] text-white/60" disabled type="button">
          <Send className="h-4 w-4" />
          Request Sent
        </Button>
        <Button
          className="w-full border-white/16 bg-transparent text-white hover:bg-white/10"
          disabled={disabled}
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          Cancel Request
        </Button>
      </div>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          className="bg-[#f8f4ea] text-black hover:bg-white"
          disabled={disabled}
          type="button"
          onClick={onAccept}
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
        <Button
          className="border-white/16 bg-transparent text-white hover:bg-white/10"
          disabled={disabled}
          type="button"
          variant="outline"
          onClick={onDecline}
        >
          <X className="h-4 w-4" />
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full bg-[#f8f4ea] text-black transition duration-300 hover:bg-white"
      disabled={disabled}
      type="button"
      onClick={onConnect}
    >
      <UserPlus className="h-4 w-4" />
      {status === "declined" ? "Connect Again" : "Connect"}
    </Button>
  );
}

function IncomingRequestsPanel({
  requests,
  isLoading,
  error,
  actionId,
  onAccept,
  onDecline,
}: {
  requests: ConnectionRequest[];
  isLoading: boolean;
  error: string;
  actionId: string;
  onAccept: (request: ConnectionRequest) => void;
  onDecline: (request: ConnectionRequest) => void;
}) {
  return (
    <div className="mt-8 border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/42">
            Incoming Requests
          </p>
          <h3 className="mt-2 font-serif text-3xl leading-tight text-white">
            Travellers waiting to connect
          </h3>
        </div>
        <span className="w-fit border border-white/12 px-3 py-1 text-xs text-white/58">
          {requests.length} pending
        </span>
      </div>

      {error ? (
        <p className="mt-4 border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-5 text-sm text-white/58">
          Loading incoming requests...
        </p>
      ) : null}

      {!isLoading && !error && requests.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-white/55">
          No pending connection requests right now.
        </p>
      ) : null}

      {!isLoading && !error && requests.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {requests.map((request) => {
            const profile = request.requester_profile || request.other_profile;
            const displayName = getDisplayName(profile);

            return (
              <div
                className="flex flex-col gap-4 border border-white/10 bg-black/30 p-4 md:flex-row md:items-center md:justify-between"
                key={request.id}
              >
                <div className="flex items-center gap-3">
                  <MatchAvatar
                    displayName={displayName}
                    imageUrl={profile?.profile_picture_url}
                  />
                  <div>
                    <p className="font-serif text-2xl leading-tight text-white">
                      {displayName}
                    </p>
                    {profile?.username ? (
                      <p className="mt-1 text-sm text-white/42">
                        @{profile.username}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-white/42">
                      Wants to establish a Tribe connection.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    className="bg-[#f8f4ea] text-black hover:bg-white"
                    disabled={actionId === request.requester_id}
                    type="button"
                    onClick={() => onAccept(request)}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    className="border-white/16 bg-transparent text-white hover:bg-white/10"
                    disabled={actionId === request.requester_id}
                    type="button"
                    variant="outline"
                    onClick={() => onDecline(request)}
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function GroupVoyagesView({
  voyages,
  selectedVoyage,
  pendingRequests,
  draft,
  editDraft,
  editingVoyageId,
  isLoading,
  isCreating,
  isSavingEdit,
  actionId,
  error,
  needsProfileCompletion,
  onDraftChange,
  onEditDraftChange,
  onCreate,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onReload,
  onView,
  onRequestJoin,
  onCancelJoinRequest,
  onCloseVoyage,
  onLeaveVoyage,
  onOpenGroupChat,
  onJoinDecision,
}: {
  voyages: GroupVoyage[];
  selectedVoyage: GroupVoyage | null;
  pendingRequests: GroupJoinRequest[];
  draft: GroupDraft;
  editDraft: GroupDraft;
  editingVoyageId: string;
  isLoading: boolean;
  isCreating: boolean;
  isSavingEdit: boolean;
  actionId: string;
  error: string;
  needsProfileCompletion: boolean;
  onDraftChange: (draft: GroupDraft) => void;
  onEditDraftChange: (draft: GroupDraft) => void;
  onCreate: () => void;
  onStartEdit: (voyage: GroupVoyage) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onReload: () => void;
  onView: (voyageId: string) => void;
  onRequestJoin: (voyageId: string) => void;
  onCancelJoinRequest: (voyage: GroupVoyage) => void;
  onCloseVoyage: (voyage: GroupVoyage) => void;
  onLeaveVoyage: (voyage: GroupVoyage) => void;
  onOpenGroupChat: (voyage: GroupVoyage) => void;
  onJoinDecision: (requestId: string, decision: "accept" | "decline") => void;
}) {
  return (
    <div className="mt-10 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6">
        <div className="border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/42">
                Create
              </p>
              <h3 className="mt-2 font-serif text-3xl leading-tight text-white">
                Start a Group Voyage
              </h3>
            </div>
            <Plus className="h-5 w-5 text-white/48" />
          </div>

          <div className="mt-6 grid gap-3">
            <input
              className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
              placeholder="Voyage title"
              value={draft.title}
              onChange={(event) =>
                onDraftChange({ ...draft, title: event.target.value })
              }
            />
            <input
              className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
              placeholder="Destination"
              value={draft.destination}
              onChange={(event) =>
                onDraftChange({ ...draft, destination: event.target.value })
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
                type="date"
                value={draft.start_date}
                onChange={(event) =>
                  onDraftChange({ ...draft, start_date: event.target.value })
                }
              />
              <input
                className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
                type="date"
                value={draft.end_date}
                onChange={(event) =>
                  onDraftChange({ ...draft, end_date: event.target.value })
                }
              />
            </div>
            <textarea
              className="min-h-28 resize-none border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
              placeholder="What kind of trip are you creating?"
              value={draft.description}
              onChange={(event) =>
                onDraftChange({ ...draft, description: event.target.value })
              }
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_0.45fr]">
              <input
                className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                placeholder="Tags, comma separated"
                value={draft.tags}
                onChange={(event) =>
                  onDraftChange({ ...draft, tags: event.target.value })
                }
              />
              <input
                className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                min={2}
                max={50}
                type="number"
                value={draft.max_participants}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    max_participants: Number(event.target.value),
                  })
                }
              />
            </div>
            <input
              className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
              placeholder="Budget range, optional"
              value={draft.budget_range}
              onChange={(event) =>
                onDraftChange({ ...draft, budget_range: event.target.value })
              }
            />
            <select
              className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
              value={draft.visibility}
              onChange={(event) =>
                onDraftChange({
                  ...draft,
                  visibility: event.target.value as GroupVisibility,
                })
              }
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <Button
            className="mt-5 w-full bg-[#f8f4ea] text-black hover:bg-white"
            disabled={isCreating}
            type="button"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            {isCreating ? "Creating..." : "Create Voyage"}
          </Button>
        </div>

        <div className="border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/42">
            Creator requests
          </p>
          {pendingRequests.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-white/55">
              No pending join requests for your voyages.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingRequests.map((request) => {
                const requesterProfile = request.requester_profile;
                const displayName = getGroupProfileName(requesterProfile);
                const profileContext = getGroupProfileContext(requesterProfile);

                return (
                  <div
                    className="border border-white/10 bg-black/30 p-4"
                    key={request.id}
                  >
                    <p className="text-sm font-medium text-white">
                      {request.voyage?.title || "Group voyage"}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <MatchAvatar
                        displayName={displayName}
                        imageUrl={requesterProfile?.profile_picture_url}
                      />
                      <div>
                        <p className="font-serif text-2xl leading-tight text-white">
                          {displayName}
                        </p>
                        {requesterProfile?.username ? (
                          <p className="mt-1 text-xs text-white/45">
                            @{requesterProfile.username}
                          </p>
                        ) : null}
                        {profileContext ? (
                          <p className="mt-2 text-xs leading-5 text-white/50">
                            {profileContext}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/38">
                          {request.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Button
                        className="bg-[#f8f4ea] text-black hover:bg-white"
                        disabled={actionId === request.id}
                        type="button"
                        onClick={() => onJoinDecision(request.id, "accept")}
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        className="border-white/16 bg-transparent text-white hover:bg-white/10"
                        disabled={actionId === request.id}
                        type="button"
                        variant="outline"
                        onClick={() => onJoinDecision(request.id, "decline")}
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/42">
              Discover
            </p>
            <h3 className="mt-2 font-serif text-3xl leading-tight text-white">
              Open Group Voyages
            </h3>
          </div>
          <Button
            className="w-fit border-white/16 bg-transparent text-white hover:bg-white/10"
            disabled={isLoading}
            type="button"
            variant="outline"
            onClick={onReload}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="mt-5 border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
            <p>{error}</p>
            {needsProfileCompletion ? (
              <Button
                asChild
                className="mt-4 border-red-200/30 bg-transparent text-red-50 hover:bg-red-900/30"
                type="button"
                variant="outline"
              >
                <Link href="/profile">Complete Profile</Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/58">Loading group voyages...</p>
          </div>
        ) : null}

        {!isLoading && voyages.length === 0 ? (
          <div className="mt-6 border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/58">
              No group voyages yet. Create the first one for travelers to join.
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          {voyages.map((voyage) => {
            const isClosed = voyage.status === "closed";
            const isFull = voyage.participant_count >= voyage.max_participants;
            const canRequest =
              (voyage.viewer_status === "none" ||
                voyage.viewer_status === "declined" ||
                voyage.viewer_status === "cancelled") &&
              !isFull &&
              !isClosed;
            const canCancel = voyage.viewer_status === "pending_sent" && !isClosed;

            return (
              <article
                className="border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:border-[#f8f4ea]/32 hover:bg-white/[0.055]"
                key={voyage.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-white/58">
                      <MapPin className="h-4 w-4" />
                      {voyage.destination}
                    </p>
                    <h4 className="mt-2 font-serif text-3xl leading-tight text-white">
                      {voyage.title}
                    </h4>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
                      <CalendarDays className="h-4 w-4" />
                      {formatGroupDates(voyage.start_date, voyage.end_date)}
                    </p>
                    <p className="mt-3 w-fit border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/42">
                      {voyage.visibility || "public"}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-serif text-3xl leading-none text-[#f8f4ea]">
                      {voyage.participant_count} / {voyage.max_participants}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/38">
                      Travellers
                    </p>
                  </div>
                </div>

                {voyage.tags?.length ? (
                  <div className="mt-5">
                    <TagList values={voyage.tags} />
                  </div>
                ) : null}

                {voyage.description ? (
                  <p className="mt-5 text-sm leading-7 text-white/64">
                    {voyage.description}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="border-white/16 bg-transparent text-white hover:bg-white/10"
                    type="button"
                    variant="outline"
                    onClick={() => onView(voyage.id)}
                  >
                    <Compass className="h-4 w-4" />
                    View Voyage
                  </Button>
                  <Button
                    className={
                      canCancel
                        ? "border-white/16 bg-transparent text-white hover:bg-white/10 disabled:bg-white/[0.08] disabled:text-white/45"
                        : "bg-[#f8f4ea] text-black hover:bg-white disabled:bg-white/[0.08] disabled:text-white/45"
                    }
                    disabled={(!canRequest && !canCancel) || actionId === voyage.id}
                    type="button"
                    variant={canCancel ? "outline" : "default"}
                    onClick={() =>
                      canCancel
                        ? onCancelJoinRequest(voyage)
                        : onRequestJoin(voyage.id)
                    }
                  >
                    {canCancel ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {voyage.viewer_status === "creator"
                      ? "Your Voyage"
                      : voyage.viewer_status === "participant"
                        ? "Joined"
                        : isClosed
                          ? "Voyage Closed"
                          : voyage.viewer_status === "pending_sent"
                            ? "Cancel Request"
                          : voyage.viewer_status === "declined"
                            ? "Request Again"
                          : voyage.viewer_status === "cancelled"
                            ? "Request Again"
                          : isFull
                            ? "Full"
                            : "Request to Join"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {selectedVoyage ? (
          <div className="mt-6 border border-[#f8f4ea]/20 bg-black/45 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#f8f4ea]/68">
              Voyage details
            </p>
            <h3 className="mt-3 font-serif text-4xl leading-tight text-white">
              {selectedVoyage.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/62">
              {selectedVoyage.destination} ·{" "}
              {formatGroupDates(selectedVoyage.start_date, selectedVoyage.end_date)}
            </p>
            <p className="mt-3 text-sm text-white/55">
              {selectedVoyage.participant_count} of{" "}
              {selectedVoyage.max_participants} travellers are participating.
            </p>
            <p className="mt-3 w-fit border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/42">
              {(selectedVoyage.visibility || "public")} - {selectedVoyage.status}
            </p>
            {editingVoyageId === selectedVoyage.id ? (
              <div className="mt-5 grid gap-3 border-t border-white/10 pt-5">
                <input
                  className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                  placeholder="Voyage title"
                  value={editDraft.title}
                  onChange={(event) =>
                    onEditDraftChange({ ...editDraft, title: event.target.value })
                  }
                />
                <input
                  className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                  placeholder="Destination"
                  value={editDraft.destination}
                  onChange={(event) =>
                    onEditDraftChange({
                      ...editDraft,
                      destination: event.target.value,
                    })
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
                    type="date"
                    value={editDraft.start_date}
                    onChange={(event) =>
                      onEditDraftChange({
                        ...editDraft,
                        start_date: event.target.value,
                      })
                    }
                  />
                  <input
                    className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
                    type="date"
                    value={editDraft.end_date}
                    onChange={(event) =>
                      onEditDraftChange({
                        ...editDraft,
                        end_date: event.target.value,
                      })
                    }
                  />
                </div>
                <textarea
                  className="min-h-28 resize-none border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                  placeholder="What kind of trip are you creating?"
                  value={editDraft.description}
                  onChange={(event) =>
                    onEditDraftChange({
                      ...editDraft,
                      description: event.target.value,
                    })
                  }
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_0.45fr]">
                  <input
                    className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                    placeholder="Tags, comma separated"
                    value={editDraft.tags}
                    onChange={(event) =>
                      onEditDraftChange({ ...editDraft, tags: event.target.value })
                    }
                  />
                  <input
                    className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                    min={selectedVoyage.participant_count}
                    max={50}
                    type="number"
                    value={editDraft.max_participants}
                    onChange={(event) =>
                      onEditDraftChange({
                        ...editDraft,
                        max_participants: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <input
                  className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                  placeholder="Budget range, optional"
                  value={editDraft.budget_range}
                  onChange={(event) =>
                    onEditDraftChange({
                      ...editDraft,
                      budget_range: event.target.value,
                    })
                  }
                />
                <select
                  className="border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f8f4ea]/45"
                  value={editDraft.visibility}
                  onChange={(event) =>
                    onEditDraftChange({
                      ...editDraft,
                      visibility: event.target.value as GroupVisibility,
                    })
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-[#f8f4ea] text-black hover:bg-white"
                    disabled={isSavingEdit}
                    type="button"
                    onClick={onSaveEdit}
                  >
                    <Check className="h-4 w-4" />
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    className="border-white/16 bg-transparent text-white hover:bg-white/10"
                    disabled={isSavingEdit}
                    type="button"
                    variant="outline"
                    onClick={onCancelEdit}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : selectedVoyage.description ? (
              <p className="mt-5 text-sm leading-7 text-white/68">
                {selectedVoyage.description}
              </p>
            ) : null}
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/38">
                Participants
              </p>
              {selectedVoyage.participants?.length ? (
                <div className="mt-4 grid gap-3">
                  {selectedVoyage.participants.map((participant) => {
                    const displayName = getGroupProfileName(participant);
                    const profileContext = getGroupProfileContext(participant);

                    return (
                      <div
                        className="flex items-center gap-3 border border-white/10 bg-white/[0.03] p-3"
                        key={participant.user_id}
                      >
                        <MatchAvatar
                          displayName={displayName}
                          imageUrl={participant.profile_picture_url}
                        />
                        <div>
                          <p className="font-serif text-2xl leading-tight text-white">
                            {displayName}
                          </p>
                          {participant.username ? (
                            <p className="mt-1 text-xs text-white/45">
                              @{participant.username}
                            </p>
                          ) : null}
                          {profileContext ? (
                            <p className="mt-2 text-xs leading-5 text-white/50">
                              {profileContext}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/50">
                  Participant profiles are not available yet.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                {getGroupLifecycleLabel(selectedVoyage)}
              </p>
              {selectedVoyage.viewer_status === "creator" &&
              editingVoyageId !== selectedVoyage.id ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="w-fit bg-[#f8f4ea] text-black hover:bg-white"
                    disabled={actionId === selectedVoyage.id}
                    type="button"
                    onClick={() => onOpenGroupChat(selectedVoyage)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Group Chat
                  </Button>
                  <Button
                    className="w-fit border-white/16 bg-transparent text-white hover:bg-white/10"
                    disabled={actionId === selectedVoyage.id}
                    type="button"
                    variant="outline"
                    onClick={() => onStartEdit(selectedVoyage)}
                  >
                    <Compass className="h-4 w-4" />
                    Edit Voyage
                  </Button>
                  {selectedVoyage.status === "open" ? (
                    <Button
                      className="w-fit border-red-300/25 bg-transparent text-red-100 hover:bg-red-950/35"
                      disabled={actionId === selectedVoyage.id}
                      type="button"
                      variant="outline"
                      onClick={() => onCloseVoyage(selectedVoyage)}
                    >
                      <X className="h-4 w-4" />
                      Close Voyage
                    </Button>
                  ) : null}
                </div>
              ) : selectedVoyage.viewer_status === "participant" ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="w-fit bg-[#f8f4ea] text-black hover:bg-white"
                    disabled={actionId === selectedVoyage.id}
                    type="button"
                    onClick={() => onOpenGroupChat(selectedVoyage)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Group Chat
                  </Button>
                  <Button
                    className="w-fit border-white/16 bg-transparent text-white hover:bg-white/10"
                    disabled={actionId === selectedVoyage.id}
                    type="button"
                    variant="outline"
                    onClick={() => onLeaveVoyage(selectedVoyage)}
                  >
                    <X className="h-4 w-4" />
                    Leave Voyage
                  </Button>
                </div>
              ) : selectedVoyage.viewer_status === "pending_sent" &&
                selectedVoyage.status === "open" ? (
                <Button
                  className="w-fit border-white/16 bg-transparent text-white hover:bg-white/10"
                  disabled={actionId === selectedVoyage.id}
                  type="button"
                  variant="outline"
                  onClick={() => onCancelJoinRequest(selectedVoyage)}
                >
                  <X className="h-4 w-4" />
                  Cancel Request
                </Button>
              ) : selectedVoyage.status === "open" &&
                (selectedVoyage.viewer_status === "none" ||
                  selectedVoyage.viewer_status === "declined" ||
                  selectedVoyage.viewer_status === "cancelled") ? (
                <Button
                  className="w-fit bg-[#f8f4ea] text-black hover:bg-white"
                  disabled={
                    selectedVoyage.participant_count >=
                      selectedVoyage.max_participants ||
                    actionId === selectedVoyage.id
                  }
                  type="button"
                  onClick={() => onRequestJoin(selectedVoyage.id)}
                >
                  <Send className="h-4 w-4" />
                  Request to Join
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function TribePage() {
  const router = useRouter();
  const [mode, setMode] = useState<TribeMode>("solo");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");
  const [isMatchingServiceError, setIsMatchingServiceError] = useState(false);
  const [isIncompleteProfileErrorState, setIsIncompleteProfileErrorState] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnablingTribe, setIsEnablingTribe] = useState(false);
  const [tribeDiscoverable, setTribeDiscoverable] = useState<boolean | null>(null);
  const [consentDeclined, setConsentDeclined] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [outgoingConnectionRequests, setOutgoingConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [isIncomingLoading, setIsIncomingLoading] = useState(false);
  const [incomingError, setIncomingError] = useState("");
  const [connectionActionId, setConnectionActionId] = useState("");
  const [messageActionId, setMessageActionId] = useState("");
  const [groupVoyages, setGroupVoyages] = useState<GroupVoyage[]>([]);
  const [selectedVoyage, setSelectedVoyage] = useState<GroupVoyage | null>(null);
  const [groupJoinRequests, setGroupJoinRequests] = useState<GroupJoinRequest[]>(
    [],
  );
  const [groupDraft, setGroupDraft] = useState<GroupDraft>(initialGroupDraft);
  const [groupEditDraft, setGroupEditDraft] =
    useState<GroupDraft>(initialGroupDraft);
  const [editingVoyageId, setEditingVoyageId] = useState("");
  const [groupError, setGroupError] = useState("");
  const [isGroupProfileError, setIsGroupProfileError] = useState(false);
  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSavingGroupEdit, setIsSavingGroupEdit] = useState(false);
  const [groupActionId, setGroupActionId] = useState("");

  const incomingRequestsByRequesterId = useMemo(() => {
    const requestsByUserId = new Map<string, ConnectionRequest>();

    connectionRequests.forEach((request) => {
      requestsByUserId.set(request.requester_id, request);
    });

    return requestsByUserId;
  }, [connectionRequests]);

  const outgoingRequestsByRecipientId = useMemo(() => {
    const requestsByUserId = new Map<string, ConnectionRequest>();

    outgoingConnectionRequests.forEach((request) => {
      requestsByUserId.set(request.recipient_id, request);
    });

    return requestsByUserId;
  }, [outgoingConnectionRequests]);

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

  const fetchIncomingConnectionRequests = useCallback(async () => {
    const token = getTokenOrThrow("Please log in to view connection requests.");

    return apiRequest<ConnectionRequest[]>("/connections/requests/incoming", {
      token,
    });
  }, []);

  const fetchOutgoingConnectionRequests = useCallback(async () => {
    const token = getTokenOrThrow("Please log in to view connection requests.");

    return apiRequest<ConnectionRequest[]>("/connections/requests/outgoing", {
      token,
    });
  }, []);

  const loadConnectionRequests = useCallback(async () => {
    setIsIncomingLoading(true);
    setIncomingError("");

    try {
      const [incomingRequests, outgoingRequests] = await Promise.all([
        fetchIncomingConnectionRequests(),
        fetchOutgoingConnectionRequests(),
      ]);

      setConnectionRequests(incomingRequests);
      setOutgoingConnectionRequests(outgoingRequests);
    } catch (caughtError) {
      setConnectionRequests([]);
      setOutgoingConnectionRequests([]);
      setIncomingError(
        getApiError(caughtError, "Unable to load connection requests."),
      );
    } finally {
      setIsIncomingLoading(false);
    }
  }, [fetchIncomingConnectionRequests, fetchOutgoingConnectionRequests]);

  const loadGroups = useCallback(async () => {
    setIsGroupLoading(true);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to view group voyages.");
      const [voyages, pendingRequests] = await Promise.all([
        apiRequest<GroupVoyage[]>("/group-voyages", { token }),
        apiRequest<GroupJoinRequest[]>("/group-voyages/requests/incoming", {
          token,
        }),
      ]);

      setGroupVoyages(voyages);
      setGroupJoinRequests(pendingRequests);
      setSelectedVoyage((currentVoyage) =>
        currentVoyage
          ? voyages.find((voyage) => voyage.id === currentVoyage.id) ||
            currentVoyage
          : null,
      );
    } catch (caughtError) {
      setGroupVoyages([]);
      setGroupJoinRequests([]);
      setGroupError(getApiError(caughtError, "Unable to load group voyages."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setIsGroupLoading(false);
    }
  }, []);

  const fetchGroupVoyage = useCallback(async (voyageId: string) => {
    const token = getTokenOrThrow("Please log in to view group voyage details.");

    return apiRequest<GroupVoyage>(
      `/group-voyages/${encodeURIComponent(voyageId)}`,
      { token },
    );
  }, []);

  const refreshGroupState = async (voyageId?: string) => {
    await loadGroups();

    if (voyageId) {
      setSelectedVoyage(await fetchGroupVoyage(voyageId));
    }
  };

  const loadMatches = useCallback(async (options?: { useCachedMatches?: boolean }) => {
    setIsLoading(true);
    setError("");
    setIsMatchingServiceError(false);
    setIsIncompleteProfileErrorState(false);

    try {
      const profileResponse = await fetchOwnProfile();
      const isDiscoverable =
        profileResponse.profile?.tribe_discoverable === true;

      setTribeDiscoverable(isDiscoverable);

      if (!isDiscoverable) {
        setMatches([]);
        setConnectionRequests([]);
        setOutgoingConnectionRequests([]);
        clearCachedMatches();
        return;
      }

      await loadConnectionRequests();
      const profileFingerprint = buildMatchProfileFingerprint(
        profileResponse.profile,
      );
      const cachedMatches = options?.useCachedMatches
        ? readCachedMatches(profileFingerprint)
        : null;

      if (cachedMatches) {
        setMatches(cachedMatches);
        restoreTribeMatchScrollPosition();
        return;
      }

      const nextMatches = await fetchMatches();

      setMatches(nextMatches);
      writeCachedMatches(profileFingerprint, nextMatches);
    } catch (caughtError) {
      setMatches([]);
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : caughtError instanceof Error
            ? caughtError.message
            : "Unable to load matches.",
      );
      setIsMatchingServiceError(isMatchingServiceUnavailable(caughtError));
      setIsIncompleteProfileErrorState(isIncompleteProfileError(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [fetchMatches, fetchOwnProfile, loadConnectionRequests]);

  useEffect(() => {
    void Promise.resolve().then(() => loadMatches({ useCachedMatches: true }));
  }, [loadMatches]);

  const handleRefresh = async () => {
    clearCachedMatches();
    await loadMatches();
  };

  useEffect(() => {
    if (mode === "group") {
      void Promise.resolve().then(loadGroups);
    }
  }, [loadGroups, mode]);

  const handleEnableTribe = async () => {
    const token = getValidAuthToken();

    if (!token) {
      setError("Please log in to view your matches.");
      return;
    }

    setIsEnablingTribe(true);
    setError("");
    setIsIncompleteProfileErrorState(false);
    clearCachedMatches();

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
      setIsIncompleteProfileErrorState(isIncompleteProfileError(caughtError));
    } finally {
      setIsEnablingTribe(false);
    }
  };

  const refreshSoloState = async () => {
    await loadConnectionRequests();
    const profileResponse = await fetchOwnProfile();
    const profileFingerprint = buildMatchProfileFingerprint(
      profileResponse.profile,
    );
    const nextMatches = await fetchMatches();

    setMatches(nextMatches);
    writeCachedMatches(profileFingerprint, nextMatches);
  };

  const handleConnect = async (targetUserId: string) => {
    setConnectionActionId(targetUserId);
    setError("");
    clearCachedMatches();

    try {
      const token = getTokenOrThrow("Please log in to send a connection request.");
      await apiRequest<ConnectionRequest>("/connections/requests", {
        method: "POST",
        token,
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
      await refreshSoloState();
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to send connection request."));
    } finally {
      setConnectionActionId("");
    }
  };

  const handleConnectionDecision = async (
    request: ConnectionRequest | undefined,
    decision: "accept" | "decline",
  ) => {
    if (!request) {
      setError("Unable to find the incoming connection request.");
      return;
    }

    setConnectionActionId(request.requester_id);
    setError("");
    clearCachedMatches();

    try {
      const token = getTokenOrThrow("Please log in to manage connection requests.");
      await apiRequest<ConnectionRequest>(
        `/connections/requests/${encodeURIComponent(request.id)}/${decision}`,
        { method: "PATCH", token },
      );
      await refreshSoloState();
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to update connection request."));
    } finally {
      setConnectionActionId("");
    }
  };

  const handleCancelConnectionRequest = async (
    request: ConnectionRequest | undefined,
  ) => {
    if (!request) {
      setError("Unable to find the outgoing connection request.");
      return;
    }

    setConnectionActionId(request.recipient_id);
    setError("");
    clearCachedMatches();

    try {
      const token = getTokenOrThrow("Please log in to manage connection requests.");
      await apiRequest<ConnectionRequest>(
        `/connections/requests/${encodeURIComponent(request.id)}/cancel`,
        { method: "PATCH", token },
      );
      await refreshSoloState();
    } catch (caughtError) {
      setError(getApiError(caughtError, "Unable to cancel connection request."));
    } finally {
      setConnectionActionId("");
    }
  };

  const handleMessage = async (targetUserId: string) => {
    setMessageActionId(targetUserId);
    setError("");

    try {
      const token = getTokenOrThrow("Please log in to message this traveler.");
      const conversation = await createChat(targetUserId, token);
      router.push(`/chat/${encodeURIComponent(conversation.id)}`);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.push("/login");
        return;
      }

      if (
        caughtError instanceof ApiError &&
        (caughtError.status === 403 || caughtError.status === 404)
      ) {
        try {
          await refreshSoloState();
        } catch {
          // Keep the original chat failure visible if reconciliation also fails.
        }
      }

      setError(getApiError(caughtError, "Unable to open this conversation."));
    } finally {
      setMessageActionId("");
    }
  };

  const handleCreateGroup = async () => {
    setIsCreatingGroup(true);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to create a group voyage.");
      const createdVoyage = await apiRequest<GroupVoyage>("/group-voyages", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: groupDraft.title,
          destination: groupDraft.destination,
          start_date: groupDraft.start_date,
          end_date: groupDraft.end_date || null,
          description: groupDraft.description || null,
          tags: normalizeTags(groupDraft.tags),
          budget_range: groupDraft.budget_range || null,
          max_participants: groupDraft.max_participants,
          visibility: groupDraft.visibility,
        }),
      });
      setGroupDraft(initialGroupDraft);
      setSelectedVoyage(createdVoyage);
      await refreshGroupState(createdVoyage.id);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to create group voyage."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleViewVoyage = async (voyageId: string) => {
    setGroupActionId(voyageId);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      setSelectedVoyage(await fetchGroupVoyage(voyageId));
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to load voyage details."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
    }
  };

  const handleStartEditGroup = (voyage: GroupVoyage) => {
    setEditingVoyageId(voyage.id);
    setGroupEditDraft(groupVoyageToDraft(voyage));
    setGroupError("");
    setIsGroupProfileError(false);
  };

  const handleCancelGroupEdit = () => {
    setEditingVoyageId("");
    setGroupEditDraft(initialGroupDraft);
  };

  const handleSaveGroupEdit = async () => {
    if (!editingVoyageId) {
      setGroupError("Select a group voyage before saving changes.");
      setIsGroupProfileError(false);
      return;
    }

    setIsSavingGroupEdit(true);
    setGroupActionId(editingVoyageId);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to edit this group voyage.");
      const updatedVoyage = await apiRequest<GroupVoyage>(
        `/group-voyages/${encodeURIComponent(editingVoyageId)}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({
            title: groupEditDraft.title,
            destination: groupEditDraft.destination,
            start_date: groupEditDraft.start_date,
            end_date: groupEditDraft.end_date || null,
            description: groupEditDraft.description || null,
            tags: normalizeTags(groupEditDraft.tags),
            budget_range: groupEditDraft.budget_range || null,
            max_participants: groupEditDraft.max_participants,
            visibility: groupEditDraft.visibility,
          }),
        },
      );

      setSelectedVoyage(updatedVoyage);
      setEditingVoyageId("");
      setGroupEditDraft(initialGroupDraft);
      await refreshGroupState(updatedVoyage.id);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to save group voyage."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setIsSavingGroupEdit(false);
      setGroupActionId("");
    }
  };

  const handleCloseGroup = async (voyage: GroupVoyage) => {
    if (!window.confirm("Close this Group Voyage? Existing members stay in it, but new join requests will stop.")) {
      return;
    }

    setGroupActionId(voyage.id);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to close this group voyage.");
      const updatedVoyage = await apiRequest<GroupVoyage>(
        `/group-voyages/${encodeURIComponent(voyage.id)}/close`,
        { method: "PATCH", token },
      );

      setEditingVoyageId("");
      setSelectedVoyage(updatedVoyage);
      await refreshGroupState(updatedVoyage.id);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to close group voyage."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
    }
  };

  const handleLeaveGroup = async (voyage: GroupVoyage) => {
    if (!window.confirm("Leave this Group Voyage? You can request to join again later if it remains open.")) {
      return;
    }

    setGroupActionId(voyage.id);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to leave this group voyage.");
      const updatedVoyage = await apiRequest<GroupVoyage>(
        `/group-voyages/${encodeURIComponent(voyage.id)}/leave`,
        { method: "PATCH", token },
      );

      setSelectedVoyage(updatedVoyage);
      await refreshGroupState(updatedVoyage.id);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to leave group voyage."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
    }
  };

  const handleOpenGroupChat = async (voyage: GroupVoyage) => {
    setGroupActionId(voyage.id);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to open this group chat.");
      const conversation = await createGroupVoyageChat(voyage.id, token);
      router.push(`/chat/${encodeURIComponent(conversation.id)}`);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.push("/login");
        return;
      }

      setGroupError(getApiError(caughtError, "Unable to open group chat."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
    }
  };

  const handleJoinRequest = async (voyageId: string) => {
    setGroupActionId(voyageId);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to request to join.");
      await apiRequest<GroupJoinRequest>(
        `/group-voyages/${encodeURIComponent(voyageId)}/join-requests`,
        { method: "POST", token },
      );
      await refreshGroupState(selectedVoyage?.id === voyageId ? voyageId : undefined);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to request to join."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
    }
  };

  const handleCancelJoinRequest = async (voyage: GroupVoyage) => {
    const requestId = voyage.viewer_join_request?.id;

    if (!requestId) {
      setGroupError("Unable to find your pending join request.");
      setIsGroupProfileError(false);
      return;
    }

    setGroupActionId(voyage.id);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to cancel this request.");
      await apiRequest<GroupJoinRequest>(
        `/group-voyages/join-requests/${encodeURIComponent(requestId)}/cancel`,
        { method: "PATCH", token },
      );
      await refreshGroupState(voyage.id);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to cancel join request."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
    }
  };

  const handleJoinDecision = async (
    requestId: string,
    decision: "accept" | "decline",
  ) => {
    setGroupActionId(requestId);
    setGroupError("");
    setIsGroupProfileError(false);

    try {
      const token = getTokenOrThrow("Please log in to manage join requests.");
      await apiRequest<GroupJoinRequest>(
        `/group-voyages/join-requests/${encodeURIComponent(
          requestId,
        )}/${decision}`,
        { method: "PATCH", token },
      );
      await refreshGroupState(selectedVoyage?.id);
    } catch (caughtError) {
      setGroupError(getApiError(caughtError, "Unable to update join request."));
      setIsGroupProfileError(isIncompleteProfileError(caughtError));
    } finally {
      setGroupActionId("");
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

          <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="flex flex-col gap-5 border-y border-white/10 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.36em] text-white/42">
                  Choose your path
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl">
                  Solo matches or open group voyages.
                </h2>
              </div>
              <ModeToggle mode={mode} onChange={setMode} />
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

          {mode === "group" ? (
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
                    GROUP VOYAGES
                  </p>
                  <h2 className="mt-5 font-serif text-5xl leading-tight text-white sm:text-6xl">
                    Maybe your next journey needs a few more people.
                  </h2>
                  <p className="mt-6 text-base leading-8 text-white/68">
                    Find compatible travelers beyond one-to-one matches. Create
                    a real voyage, discover open trips, and request to join.
                  </p>
                </div>

                <div className="justify-self-start lg:justify-self-end">
                  <div className="w-full max-w-sm border border-white/14 bg-black/58 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/46">
                        GROUP VOYAGE
                      </p>
                      <span className="border border-[#f8f4ea]/28 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f8f4ea]/78">
                        Live
                      </span>
                    </div>
                    <h3 className="mt-5 font-serif text-3xl leading-tight text-white">
                      Tokyo, Japan · Dec 14 to 20
                    </h3>
                    <p className="mt-2 text-sm text-white/58">
                      Request access from each voyage creator
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
                        Real join flow
                      </p>
                      <button
                        className="mt-4 w-full border border-white/14 bg-[#f8f4ea] px-4 py-3 text-xs font-medium uppercase tracking-[0.22em] text-black transition hover:bg-white"
                        type="button"
                        onClick={() => {
                          document
                            .getElementById("group-voyages")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Explore Group Voyages
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          ) : null}

          <section
            className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"
            id="group-voyages"
          >
            <div className="flex flex-col gap-6 border-y border-white/10 py-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.38em] text-white/42">
                  <Sparkles className="h-4 w-4" />
                  YOUR TRIBE
                </p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                  {mode === "solo"
                    ? "People who might make your next journey better."
                    : "Group voyages ready for real travel plans."}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  {mode === "solo"
                    ? "Matches are based on your saved CoVoyage profile. Update your profile to tune destinations, travel dates, budget, languages, and interests."
                    : "Create open voyages, request access to interesting trips, and manage join requests for the journeys you host."}
                </p>
              </div>
              {mode === "solo" ? (
                <div className="flex flex-wrap items-center gap-3">
                  {connectionRequests.length > 0 ? (
                    <span className="border border-white/12 px-3 py-2 text-xs text-white/58">
                      {connectionRequests.length} incoming
                    </span>
                  ) : null}
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
              ) : (
                <ModeToggle mode={mode} onChange={setMode} />
              )}
            </div>

            {mode === "solo" ? (
              <>
            {tribeDiscoverable === true ? (
              <IncomingRequestsPanel
                actionId={connectionActionId}
                error={incomingError}
                isLoading={isIncomingLoading}
                requests={connectionRequests}
                onAccept={(request) =>
                  handleConnectionDecision(request, "accept")
                }
                onDecline={(request) =>
                  handleConnectionDecision(request, "decline")
                }
              />
            ) : null}

            {error ? (
              <div className="mt-8 border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                <p>{error}</p>
                {isMatchingServiceError ? (
                  <Button
                    className="mt-4 border-red-200/30 bg-transparent text-red-50 hover:bg-red-900/30"
                    disabled={isLoading}
                    type="button"
                    variant="outline"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                ) : null}
                {isIncompleteProfileErrorState ? (
                  <Button
                    asChild
                    className="mt-4 border-red-200/30 bg-transparent text-red-50 hover:bg-red-900/30"
                    type="button"
                    variant="outline"
                  >
                    <Link href="/profile">Complete Profile</Link>
                  </Button>
                ) : null}
              </div>
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
                const displayName = getDisplayName(profile);
                const location = getLocation(profile);
                const relationshipStatus = match.relationship_status || "none";
                const incomingRequest =
                  incomingRequestsByRequesterId.get(profileUserId);
                const outgoingRequest =
                  outgoingRequestsByRecipientId.get(profileUserId);

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
                      <MatchDetail label="Why You Match">
                        {match.factors?.length ? (
                          <ul className="space-y-2">
                            {match.factors.slice(0, 5).map((factor) => (
                              <li
                                className="flex items-start gap-2 text-sm leading-6 text-white/72"
                                key={`${profileUserId}-${factor.type}-${factor.label}`}
                              >
                                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#f8f4ea]" />
                                <span>
                                  <span className="text-white/82">
                                    {factor.label}
                                  </span>
                                  {" - "}
                                  <span className="text-white/58">
                                    {formatFactorValue(factor.value)}
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-white/45">
                            Compatibility is based on your saved travel profile.
                          </span>
                        )}
                        <p className="mt-4 border-t border-white/10 pt-4 font-serif text-xl leading-7 text-white/82">
                          &quot;{match.explanation || match.reason}&quot;
                        </p>
                      </MatchDetail>
                    </dl>

                    <div className="mt-7 grid gap-3">
                      <Button
                        asChild
                        className="w-full border-white/16 bg-transparent text-white transition duration-300 hover:border-[#f8f4ea]/50 hover:bg-[#f8f4ea] hover:text-black"
                        variant="outline"
                      >
                        <Link
                          href={`/profile/${encodeURIComponent(profileUserId)}`}
                          onClick={saveTribeMatchScrollPosition}
                        >
                          <Compass className="h-4 w-4" />
                          View Profile
                        </Link>
                      </Button>
                      <ConnectionAction
                        disabled={connectionActionId === profileUserId}
                        status={relationshipStatus}
                        onAccept={() =>
                          handleConnectionDecision(incomingRequest, "accept")
                        }
                        onConnect={() => handleConnect(profileUserId)}
                        onCancel={() =>
                          handleCancelConnectionRequest(outgoingRequest)
                        }
                        onDecline={() =>
                          handleConnectionDecision(incomingRequest, "decline")
                        }
                      />
                      {relationshipStatus === "connected" ? (
                        <Button
                          className="w-full bg-[#f8f4ea] text-black transition duration-300 hover:bg-white"
                          disabled={messageActionId === profileUserId}
                          type="button"
                          onClick={() => handleMessage(profileUserId)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          {messageActionId === profileUserId
                            ? "Opening..."
                            : "Message"}
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
              </>
            ) : (
              <GroupVoyagesView
                actionId={groupActionId}
                draft={groupDraft}
                editDraft={groupEditDraft}
                editingVoyageId={editingVoyageId}
                error={groupError}
                isCreating={isCreatingGroup}
                isLoading={isGroupLoading}
                isSavingEdit={isSavingGroupEdit}
                needsProfileCompletion={isGroupProfileError}
                pendingRequests={groupJoinRequests}
                selectedVoyage={selectedVoyage}
                voyages={groupVoyages}
                onCancelJoinRequest={handleCancelJoinRequest}
                onCancelEdit={handleCancelGroupEdit}
                onCloseVoyage={handleCloseGroup}
                onCreate={handleCreateGroup}
                onDraftChange={setGroupDraft}
                onEditDraftChange={setGroupEditDraft}
                onJoinDecision={handleJoinDecision}
                onLeaveVoyage={handleLeaveGroup}
                onOpenGroupChat={handleOpenGroupChat}
                onReload={loadGroups}
                onRequestJoin={handleJoinRequest}
                onSaveEdit={handleSaveGroupEdit}
                onStartEdit={handleStartEditGroup}
                onView={handleViewVoyage}
              />
            )}
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
