import { notFound } from "next/navigation";

import { DestinationPage } from "@/components/explore/DestinationPage";
import type {
  DestinationData,
  StaticDestinationKey,
} from "@/components/explore/destinationData";
import { getCuratedDemoEvents } from "@/components/explore/curatedCountryContent";
import { getCuratedPlaceContent } from "@/components/explore/curatedPlaceContent";
import {
  getCuratedCountryHeroImage,
  getCuratedPlaceImage,
} from "@/components/explore/curatedPlaceImages";
import { destinations } from "@/components/explore/destinationData";
import { mapBackendDestinationToDestinationData } from "@/components/explore/destinationMapper";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  fetchCountryRecommendations,
  fetchDestination,
  type BackendCurrency,
  type BackendDestinationResponse,
  type BackendPlace,
} from "@/lib/destinationApi";

const countryNamesBySlug: Record<string, string> = {
  czechia: "Czechia",
  india: "India",
  indonesia: "Indonesia",
  ireland: "Ireland",
  italy: "Italy",
  japan: "Japan",
  morocco: "Morocco",
  portugal: "Portugal",
  "south-korea": "South Korea",
  "united-arab-emirates": "United Arab Emirates",
  "united-kingdom": "United Kingdom",
  "united-states": "United States",
};

function getCountryName(countrySlug: string) {
  return (
    countryNamesBySlug[countrySlug] ??
    countrySlug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function isBackendPlace(place: BackendPlace | undefined): place is BackendPlace {
  return Boolean(place);
}

function getStaticFallbackDestination(countrySlug: string) {
  if (countrySlug in destinations) {
    return destinations[countrySlug as StaticDestinationKey];
  }

  return null;
}

const defaultTripBudgetsByCurrency: Record<string, string> = {
  ARS: "ARS 480,000",
  CAD: "CAD 1,750",
  EUR: "EUR 1,200",
  GTQ: "GTQ 3,200",
  IDR: "IDR 9,000,000",
  ISK: "ISK 230,000",
  JPY: "JPY 220,000",
  KES: "KES 120,000",
  MAD: "MAD 7,000",
  MXN: "MXN 13,500",
  NOK: "NOK 14,000",
  NZD: "NZD 2,100",
  PEN: "PEN 2,200",
  THB: "THB 18,000",
  TRY: "TRY 36,000",
  VND: "VND 10,000,000",
  ZAR: "ZAR 18,000",
};

const defaultDailyBudgetsByCurrency: Record<string, string> = {
  ARS: "ARS 45,000-90,000",
  CAD: "CAD 180-320",
  EUR: "EUR 90-210",
  GTQ: "GTQ 230-460",
  IDR: "IDR 850,000-1,800,000",
  ISK: "ISK 22,000-39,500",
  JPY: "JPY 18,000-33,000",
  KES: "KES 12,000-28,000",
  MAD: "MAD 650-1,300",
  MXN: "MXN 1,200-2,700",
  NOK: "NOK 1,600-2,900",
  NZD: "NZD 220-380",
  PEN: "PEN 220-480",
  THB: "THB 1,600-3,500",
  TRY: "TRY 3,000-6,500",
  VND: "VND 900,000-2,000,000",
  ZAR: "ZAR 1,600-3,400",
};

function getCurrencyCode(currency: BackendCurrency | undefined) {
  return currency?.code?.trim().toUpperCase();
}

function getDynamicTripBudget(currency: BackendCurrency | undefined) {
  const currencyCode = getCurrencyCode(currency);

  if (!currencyCode) {
    return "Route-based budget estimate";
  }

  return defaultTripBudgetsByCurrency[currencyCode] ?? `${currencyCode} route-based estimate`;
}

function getDynamicDailyBudget(currency: BackendCurrency | undefined) {
  const currencyCode = getCurrencyCode(currency);

  if (!currencyCode) {
    return "Route-based daily estimate";
  }

  return defaultDailyBudgetsByCurrency[currencyCode] ?? `${currencyCode} planning range varies by route`;
}

function getPrimaryLocalLanguage(languages: string[] | undefined) {
  const cleanedLanguages =
    languages
      ?.map((language) => language.split(",")[0].replace(/\s+used.*$/i, "").trim())
      .filter(Boolean) ?? [];

  if (!cleanedLanguages.length) {
    return null;
  }

  const nonEnglishLanguages = cleanedLanguages.filter(
    (language) => !/^english\b/i.test(language),
  );

  if (nonEnglishLanguages.length === 1) {
    return nonEnglishLanguages[0];
  }

  if (cleanedLanguages.length === 1 && !/^english\b/i.test(cleanedLanguages[0])) {
    return cleanedLanguages[0];
  }

  return null;
}

function getLocalPhrasesTitle(languages: string[] | undefined) {
  const primaryLanguage = getPrimaryLocalLanguage(languages);
  return primaryLanguage ? `A Little ${primaryLanguage}` : "A Few Local Phrases";
}

function getSnapshotItems(
  countryName: string,
  backendDestination: BackendDestinationResponse,
): DestinationData["snapshot"] {
  const { country } = backendDestination;
  const currency = country.currency?.name && country.currency?.code
    ? `${country.currency.name} (${country.currency.code})`
    : "Local currency";

  return [
    { label: "Currency", value: currency },
    {
      label: "Language",
      value: country.languages?.length ? country.languages.join(", ") : "Local language",
    },
    {
      label: "Visa / Entry",
      value: country.visa_entry_summary?.title ?? "Varies by passport",
    },
    {
      label: "Daily Budget",
      value: getDynamicDailyBudget(country.currency),
    },
    {
      label: "Trip Style",
      value: country.travel_styles?.length
        ? country.travel_styles.join(", ")
        : "Culture, food, neighborhoods",
    },
    { label: "Best Month", value: "Seasonal planning varies by route" },
    {
      label: "Emergency",
      value: country.emergency_numbers?.length
        ? country.emergency_numbers.join(", ")
        : "Check local emergency numbers",
    },
    { label: "Time Zone", value: country.timezone ?? `${countryName} local time` },
  ];
}

function getNeutralJourneyPlaces(
  countryName: string,
  places: BackendPlace[],
): DestinationData["journeyPlaces"] {
  if (!places.length) {
    return [
      {
        number: "01",
        name: countryName,
        region: "Local Route",
        story:
          "Use this destination guide as a starting point for local culture, seasonal planning, and practical travel context.",
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=84",
        imageAlt: `${countryName} travel landscape`,
        align: "left",
        facts: [
          { label: "Why Visit", value: "Culture, food, neighborhoods, and seasonal travel context" },
          { label: "Time Required", value: "Plan around your route" },
          { label: "Local Experience", value: "Use official guidance and local pacing" },
          { label: "Seasonal Note", value: "Keep plans flexible around weather, access, and demand" },
        ],
        localVibe: ["Plan locally", "Respect place rules", "Leave buffers"],
        communityTips: [],
      },
    ];
  }

  return places.map((place, index) => {
    const curatedContent = getCuratedPlaceContent(place.slug);
    const curatedImage = getCuratedPlaceImage(place.slug);

    return {
      number: String(index + 1).padStart(2, "0"),
      placeSlug: place.slug,
      name: place.name ?? place.slug,
      region: place.region ?? "Local Stop",
      story:
        curatedContent?.journeyDescription ??
        place.story ??
        place.description ??
        `A useful ${countryName} stop for route planning and local context.`,
      image:
        curatedImage?.image ??
        place.media?.[0]?.url ??
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=84",
      imageAlt:
        curatedImage?.imageAlt ??
        place.media?.[0]?.alt_text ??
        place.media?.[0]?.alt ??
        `${place.name ?? countryName} travel landscape`,
      align: index % 2 === 0 ? "left" : "right",
      facts: [
        {
          label: "Why Visit",
          value:
            curatedContent?.whyVisit ??
            place.why_visit ??
            "Use this stop for route planning and local context.",
        },
        {
          label: "Time Required",
          value: curatedContent?.timeRequired ?? place.time_required ?? "Plan around your route",
        },
        {
          label: "Local Experience",
          value:
            curatedContent?.localExperience ??
            place.local_experience ??
            "Use official place guidance before finalizing the day.",
        },
        {
          label: "Seasonal Note",
          value:
            curatedContent?.seasonalNote ??
            "Use current local conditions, access notes, and opening details before going.",
        },
      ],
      localVibe: place.local_vibe_notes?.length
        ? place.local_vibe_notes
        : [...(place.tags ?? []), ...(place.highlights ?? [])].slice(0, 5),
      communityTips: [],
    };
  });
}

function buildFallbackDestination(
  countrySlug: string,
  countryName: string,
  backendDestination: BackendDestinationResponse,
  staticFallbackDestination: DestinationData | null,
): DestinationData {
  const curatedHeroImage = getCuratedCountryHeroImage(backendDestination.country.slug);
  const neutralFallback: DestinationData = {
    key: countrySlug,
    destinationType: "searched",
    country: countryName,
    flag:
      backendDestination.country.flag ??
      backendDestination.country.country_code ??
      countryName.slice(0, 2).toUpperCase(),
    month: "This Month",
    year: "2026",
    featuredCategory:
      backendDestination.country.featured_category ?? "Local Vibe Guide",
    currency: {
      name:
        backendDestination.country.currency?.name ??
        backendDestination.country.currency?.code ??
        "Local currency",
      code: backendDestination.country.currency?.code ?? "",
    },
    averageDailyBudget: {
      value: getDynamicDailyBudget(backendDestination.country.currency),
      note: "Curated planning estimate, not a guaranteed price",
    },
    heroTitle: `Planning to Visit ${countryName}?`,
    intro:
      backendDestination.country.overview ??
      `A practical ${countryName} guide for local culture, seasonal planning, useful places, and traveler context.`,
    heroImage:
      curatedHeroImage?.image ??
      backendDestination.country.hero_media?.url ??
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt:
      curatedHeroImage?.imageAlt ??
      backendDestination.country.hero_media?.alt ??
      backendDestination.country.hero_media?.alt_text ??
      `${countryName} travel landscape`,
    snapshot: getSnapshotItems(countryName, backendDestination),
    journeyTitle:
      backendDestination.country.journey_title ?? `${countryName} Route Notes`,
    journeyIntro:
      backendDestination.country.journey_intro ??
      `A country-specific route guide built from ${countryName} destination data.`,
    journeyPlaces: getNeutralJourneyPlaces(countryName, backendDestination.places),
    vibeNotes: [
      {
        title: "Local Context",
        body:
          backendDestination.country.overview ??
          "Use current local guidance, cultural context, and seasonal conditions when planning.",
      },
    ],
    events: getCuratedDemoEvents(countrySlug),
    itineraryFields: [
      {
        label: "Budget",
        value: getDynamicTripBudget(backendDestination.country.currency),
      },
      { label: "Days", value: "7" },
      { label: "Interests", value: "Food, culture, local neighborhoods" },
    ],
    goodToKnow: [
      {
        title: "Use current local guidance",
        content:
          "Check official transport, entry, safety, and site guidance before finalizing plans.",
      },
    ],
    localPhrasesTitle: getLocalPhrasesTitle(backendDestination.country.languages),
    localPhrases: [],
  };
  const baseFallbackDestination = staticFallbackDestination ?? neutralFallback;
  const isStaticFallbackForCountry =
    staticFallbackDestination?.country === countryName;

  return {
    ...baseFallbackDestination,
    key: countrySlug,
    country: countryName,
    flag:
      staticFallbackDestination?.flag ??
      backendDestination.country.flag ??
      backendDestination.country.country_code ??
      baseFallbackDestination.flag,
    currency:
      backendDestination.country.currency?.name ||
      backendDestination.country.currency?.code
        ? {
            name:
              backendDestination.country.currency.name ??
              backendDestination.country.currency.code ??
              baseFallbackDestination.currency.name,
            code:
              backendDestination.country.currency.code ??
              baseFallbackDestination.currency.code,
          }
        : baseFallbackDestination.currency,
    averageDailyBudget: staticFallbackDestination
      ? baseFallbackDestination.averageDailyBudget
      : {
          value: getDynamicDailyBudget(backendDestination.country.currency),
          note: "Accommodation, meals & local transport",
        },
    itineraryFields: staticFallbackDestination
      ? baseFallbackDestination.itineraryFields
      : [
          {
            label: "Budget",
            value: getDynamicTripBudget(backendDestination.country.currency),
          },
          { label: "Days", value: "7" },
          {
            label: "Interests",
            value: "Food, culture, local neighborhoods",
          },
        ],
    heroTitle: isStaticFallbackForCountry
      ? staticFallbackDestination?.heroTitle ?? baseFallbackDestination.heroTitle
      : `Planning to Visit ${countryName}?`,
    intro: isStaticFallbackForCountry
      ? staticFallbackDestination?.intro ?? baseFallbackDestination.intro
      : `You searched for ${countryName}, so this guide gives you a simple starting point for local culture, seasonal planning, and practical travel context.`,
    heroImage:
      staticFallbackDestination?.heroImage ?? neutralFallback.heroImage,
    heroImageAlt:
      staticFallbackDestination?.heroImageAlt ?? neutralFallback.heroImageAlt,
  };
}

export async function CountryExplorePage({
  countrySlug,
}: {
  countrySlug: string;
}) {
  const [backendDestination, recommendations] = await Promise.all([
    fetchDestination(countrySlug),
    fetchCountryRecommendations(countrySlug),
  ]);

  if (!backendDestination && !recommendations) {
    notFound();
  }

  const countryName =
    recommendations?.country.name ??
    backendDestination?.country.name ??
    getCountryName(countrySlug);
  const recommendedPlaces =
    recommendations?.recommendations
      .map((recommendation) => recommendation.place)
      .filter(isBackendPlace) ?? [];
  const recommendationMonthlyFactor = recommendations?.monthly_factor
    ? [recommendations.monthly_factor]
    : [];
  const monthlyBackendDestination: BackendDestinationResponse = {
    country:
      backendDestination?.country ??
      recommendations?.country ?? {
        slug: countrySlug,
        name: countryName,
      },
    places: recommendedPlaces.length
      ? recommendedPlaces
      : backendDestination?.places ?? [],
    monthly_factors: recommendationMonthlyFactor.length
      ? recommendationMonthlyFactor
      : backendDestination?.monthly_factors ?? [],
  };
  const staticFallbackDestination = getStaticFallbackDestination(countrySlug);
  const fallbackDestination = buildFallbackDestination(
    countrySlug,
    countryName,
    monthlyBackendDestination,
    staticFallbackDestination,
  );
  const mappedDestination = mapBackendDestinationToDestinationData(
    monthlyBackendDestination,
    fallbackDestination,
  );
  const destination =
    countrySlug === "guatemala"
      ? {
          ...mappedDestination,
          heroImage: "/destination/gmm.jpg",
          heroImageAlt: "Antigua Guatemala street with volcano in the background",
        }
      : mappedDestination;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <DestinationPage destination={destination} />
      <Footer />
    </div>
  );
}
