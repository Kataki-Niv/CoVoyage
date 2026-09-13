const DESTINATION_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export type BackendSourceMetadata = {
  source_name?: string;
  source_url?: string;
  source_type?: string;
  retrieved_at?: string;
  last_verified_at?: string;
  valid_from?: string;
  valid_to?: string;
  confidence?: number;
  verification_status?: string;
  notes?: string;
};

export type BackendTextNote = {
  title?: string;
  body?: string;
  sources?: BackendSourceMetadata[];
};

export type BackendLocalInsight = {
  title?: string;
  content?: string;
  category?: string;
  sources?: BackendSourceMetadata[];
};

export type BackendLocalPhrase = {
  english?: string;
  local?: string;
  pronunciation?: string;
  usage_note?: string;
  sources?: BackendSourceMetadata[];
};

export type BackendCurrency = {
  name?: string;
  code?: string;
};

export type BackendMedia = {
  url?: string;
  alt?: string;
  alt_text?: string;
  credit?: string;
  source?: BackendSourceMetadata;
};

export type BackendCountry = {
  id?: string;
  slug: string;
  name?: string;
  country_code?: string;
  flag?: string;
  region?: string;
  currency?: BackendCurrency;
  languages?: string[];
  timezone?: string;
  emergency_numbers?: string[];
  visa_entry_summary?: BackendTextNote;
  travel_styles?: string[];
  hero_media?: BackendMedia;
  featured_category?: string;
  journey_title?: string;
  journey_intro?: string;
  overview?: string;
  culture_notes?: BackendTextNote[];
  etiquette_notes?: BackendTextNote[];
  communication_notes?: BackendTextNote[];
  common_visitor_mistakes?: BackendTextNote[];
  local_insights?: BackendLocalInsight[];
  local_phrases?: BackendLocalPhrase[];
  practical_notes?: BackendTextNote[];
  sources?: BackendSourceMetadata[];
};

export type BackendPlace = {
  id?: string;
  slug: string;
  country_slug: string;
  name?: string;
  region?: string;
  type?: string;
  story?: string;
  description?: string;
  media?: BackendMedia[];
  highlights?: string[];
  tags?: string[];
  why_visit?: string;
  time_required?: string;
  activities?: string[];
  local_experience?: string;
  access_notes?: BackendTextNote[];
  local_vibe_notes?: string[];
  safety_warnings?: BackendTextNote[];
  seasonal_warnings?: BackendTextNote[];
  sources?: BackendSourceMetadata[];
};

export type BackendWeatherClimate = {
  summary?: string;
  temperature_range?: string;
  rainfall_summary?: string;
  daylight_summary?: string;
  sources?: BackendSourceMetadata[];
};

export type BackendMonthlyFactor = {
  id?: string;
  year: number;
  month: number;
  country_slug: string;
  place_slug?: string;
  weather_climate?: BackendWeatherClimate;
  weather_suitability_input?: string;
  daylight_information?: string;
  seasonal_conditions?: BackendTextNote[];
  seasonal_highlights?: string[];
  accessibility_information?: string;
  seasonal_activities?: string[];
  event_activity_density_input?: string;
  affordability_value_input?: string;
  travel_conditions?: BackendTextNote[];
  seasonal_warnings?: BackendTextNote[];
  sources?: BackendSourceMetadata[];
};

export type BackendDestinationResponse = {
  country: BackendCountry;
  places: BackendPlace[];
  monthly_factors: BackendMonthlyFactor[];
};

export type BackendFeaturedPlace = {
  place_slug: string;
  place_name?: string;
  rank: number;
  score: number;
  recommendation_reason: string;
  score_breakdown: Record<string, number>;
  seasonal_note?: string;
  experiences?: string[];
  local_vibe_notes?: string[];
  budget_value?: string;
  media?: BackendMedia | null;
  place?: BackendPlace;
};

export type BackendFeaturedDestination = {
  country_slug: string;
  slug?: string;
  country_name?: string;
  country?: BackendCountry;
  rank: number;
  final_score: number;
  score?: number;
  recommendation_reason: string;
  why_now?: string;
  score_breakdown: Record<string, number>;
  selected_places: BackendFeaturedPlace[];
  recommended_places?: BackendFeaturedPlace[];
};

export type BackendFeaturedDestinationsResponse = {
  year: number;
  month: number;
  destinations: BackendFeaturedDestination[];
};

export type BackendDestinationSearchResponse = {
  query: string;
  countries: BackendCountry[];
  places: BackendPlace[];
};

export type BackendCountryRecommendationsResponse = {
  year: number;
  month: number;
  country: BackendCountry;
  recommendations: BackendFeaturedPlace[];
  monthly_factor?: BackendMonthlyFactor | null;
};

export type LocalVibeChatResponse = {
  country_slug: string;
  country: string;
  year: number;
  month: number;
  message: string;
  response_source?: "gemini" | "fallback";
  recommended_places: BackendFeaturedPlace[];
};

export type LocalVibeDiscoveryChatResponse = {
  year: number;
  month: number;
  message: string;
  response_source?: "gemini" | "fallback";
  featured_destinations: BackendFeaturedDestination[];
};

export type LocalVibeItineraryDay = {
  day: number;
  place: string;
  focus: string;
  morning: string;
  afternoon: string;
  evening: string;
  local_vibe_note: string;
};

export type LocalVibeItineraryResponse = {
  country_slug: string;
  country: string;
  year: number;
  month: number;
  days: number;
  budget?: string | null;
  interests?: string | null;
  pace?: string | null;
  recommended_places: BackendFeaturedPlace[];
  itinerary: LocalVibeItineraryDay[];
  summary: string;
  response_source?: "gemini" | "fallback";
};

export async function fetchDestination(
  countrySlug: string,
): Promise<BackendDestinationResponse | null> {
  try {
    const response = await fetch(
      `${DESTINATION_API_BASE_URL}/destinations/${countrySlug}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(
        `Destination fetch failed for ${countrySlug}: ${response.status}`,
      );
      return null;
    }

    return (await response.json()) as BackendDestinationResponse;
  } catch (error) {
    console.error(`Destination fetch failed for ${countrySlug}:`, error);
    return null;
  }
}

export async function fetchFeaturedDestinations(): Promise<BackendFeaturedDestinationsResponse | null> {
  try {
    const response = await fetch(
      `${DESTINATION_API_BASE_URL}/destinations/featured`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(`Featured destinations fetch failed: ${response.status}`);
      return null;
    }

    return (await response.json()) as BackendFeaturedDestinationsResponse;
  } catch (error) {
    console.error("Featured destinations fetch failed:", error);
    return null;
  }
}

export async function searchDestinations(
  query: string,
): Promise<BackendDestinationSearchResponse> {
  const response = await fetch(
    `${DESTINATION_API_BASE_URL}/destinations/search?q=${encodeURIComponent(query)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Destination search failed: ${response.status}`);
  }

  return (await response.json()) as BackendDestinationSearchResponse;
}

export async function fetchCountryRecommendations(
  countrySlug: string,
): Promise<BackendCountryRecommendationsResponse | null> {
  try {
    const response = await fetch(
      `${DESTINATION_API_BASE_URL}/destinations/${encodeURIComponent(countrySlug)}/recommendations`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(
        `Destination recommendations fetch failed for ${countrySlug}: ${response.status}`,
      );
      return null;
    }

    return (await response.json()) as BackendCountryRecommendationsResponse;
  } catch (error) {
    console.error(`Destination recommendations fetch failed for ${countrySlug}:`, error);
    return null;
  }
}

export async function sendLocalVibeChatMessage(payload: {
  country_slug: string;
  country?: string;
  message: string;
  year?: number;
  month?: number;
  selected_place_slugs?: string[];
}): Promise<LocalVibeChatResponse> {
  const response = await fetch(`${DESTINATION_API_BASE_URL}/assistant/local-vibe/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Local vibe chat failed: ${response.status}`);
  }

  return (await response.json()) as LocalVibeChatResponse;
}

export async function sendLocalVibeDiscoveryChatMessage(payload: {
  message: string;
  year?: number;
  month?: number;
}): Promise<LocalVibeDiscoveryChatResponse> {
  const response = await fetch(`${DESTINATION_API_BASE_URL}/assistant/local-vibe/discovery-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Local vibe discovery chat failed: ${response.status}`);
  }

  return (await response.json()) as LocalVibeDiscoveryChatResponse;
}

export async function generateLocalVibeItinerary(payload: {
  country_slug: string;
  country?: string;
  days: number;
  budget?: string;
  interests?: string;
  pace?: string;
  year?: number;
  month?: number;
  selected_place_slugs?: string[];
}): Promise<LocalVibeItineraryResponse> {
  const response = await fetch(
    `${DESTINATION_API_BASE_URL}/assistant/local-vibe/itinerary`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`Local vibe itinerary generation failed: ${response.status}`);
  }

  return (await response.json()) as LocalVibeItineraryResponse;
}
