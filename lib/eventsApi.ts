import { apiRequest } from "@/lib/api";

export type DestinationEventResponse = {
  id: string;
  title: string;
  category: string;
  country_slug: string;
  place_slug?: string | null;
  date_start: string;
  date_end?: string | null;
  location: string;
  description: string;
  media?: {
    url: string;
    alt: string;
    credit?: string | null;
  } | null;
  sources?: unknown[];
  verification_status: "unverified" | "source-recorded" | "verified" | "needs-review";
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
  location: string;
  description: string;
  media?: {
    url: string;
    alt: string;
  } | null;
  verification_status?: "unverified" | "source-recorded" | "verified" | "needs-review";
};

export function fetchDestinationEvents(countrySlug: string) {
  return apiRequest<DestinationEventResponse[]>(
    `/events/${encodeURIComponent(countrySlug)}`,
  );
}

export function createDestinationEvent(event: CreateDestinationEventRequest) {
  return apiRequest<DestinationEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}
