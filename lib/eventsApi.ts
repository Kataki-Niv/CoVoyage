import { apiRequest } from "@/lib/api";

export type DestinationEventResponse = {
  id: string;
  title: string;
  category: string;
  country_slug: string;
  place_slug?: string | null;
  date_start: string;
  date_end?: string | null;
  time?: string | null;
  location: string;
  description: string;
  media?: {
    url: string;
    alt: string;
    credit?: string | null;
  } | null;
  sources?: unknown[];
  verification_status: "unverified" | "source-recorded" | "verified" | "needs-review";
  organizer_id?: string | null;
  organizer_name?: string | null;
  participant_count: number;
  viewer_has_joined: boolean;
  viewer_has_saved: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateDestinationEventRequest = {
  title: string;
  category: string;
  country_slug: string;
  place_slug?: string | null;
  date_start: string;
  date_end?: string | null;
  time?: string | null;
  location: string;
  description: string;
  media?: {
    url: string;
    alt: string;
  } | null;
  verification_status?: "unverified" | "source-recorded" | "verified" | "needs-review";
};

export function fetchDestinationEvents(countrySlug: string, token?: string | null) {
  return apiRequest<DestinationEventResponse[]>(
    `/events/${encodeURIComponent(countrySlug)}`,
    { token },
  );
}

export function fetchDestinationEventDetail(eventId: string, token?: string | null) {
  return apiRequest<DestinationEventResponse>(
    `/events/detail/${encodeURIComponent(eventId)}`,
    { token },
  );
}

export function createDestinationEvent(
  event: CreateDestinationEventRequest,
  token?: string | null,
) {
  return apiRequest<DestinationEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(event),
    token,
  });
}

export function joinDestinationEvent(eventId: string, token: string) {
  return apiRequest<DestinationEventResponse>(
    `/events/${encodeURIComponent(eventId)}/participants`,
    {
      method: "POST",
      token,
    },
  );
}

export function leaveDestinationEvent(eventId: string, token: string) {
  return apiRequest<DestinationEventResponse>(
    `/events/${encodeURIComponent(eventId)}/participants/me`,
    {
      method: "DELETE",
      token,
    },
  );
}

export function saveDestinationEvent(eventId: string, token: string) {
  return apiRequest<DestinationEventResponse>(
    `/events/${encodeURIComponent(eventId)}/saved`,
    {
      method: "POST",
      token,
    },
  );
}

export function unsaveDestinationEvent(eventId: string, token: string) {
  return apiRequest<DestinationEventResponse>(
    `/events/${encodeURIComponent(eventId)}/saved/me`,
    {
      method: "DELETE",
      token,
    },
  );
}
