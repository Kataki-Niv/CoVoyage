import { notFound } from "next/navigation";

import { DestinationPage } from "@/components/explore/DestinationPage";
import type {
  DestinationData,
  StaticDestinationKey,
} from "@/components/explore/destinationData";
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
  AED: "AED 7,500",
  AUD: "AUD 3,000",
  CAD: "CAD 2,700",
  CZK: "CZK 45,000",
  EUR: "EUR 1,800",
  GBP: "GBP 1,600",
  GTQ: "GTQ 12,000",
  IDR: "IDR 30,000,000",
  INR: "INR 150,000",
  ISK: "ISK 230,000",
  JPY: "JPY 220,000",
  KRW: "KRW 2,700,000",
  MAD: "MAD 16,000",
  NOK: "NOK 22,000",
  TRY: "TRY 60,000",
  USD: "USD 2,000",
  ZAR: "ZAR 35,000",
};

function getCurrencyCode(currency: BackendCurrency | undefined) {
  return currency?.code?.trim().toUpperCase();
}

function getDynamicTripBudget(currency: BackendCurrency | undefined) {
  const currencyCode = getCurrencyCode(currency);

  if (!currencyCode) {
    return "Flexible budget";
  }

  return defaultTripBudgetsByCurrency[currencyCode] ?? `${currencyCode} flexible`;
}

function getDynamicDailyBudget(currency: BackendCurrency | undefined) {
  const currencyCode = getCurrencyCode(currency);

  if (!currencyCode) {
    return "Flexible daily budget";
  }

  return `${currencyCode} flexible`;
}

function buildFallbackDestination(
  countrySlug: string,
  countryName: string,
  backendDestination: BackendDestinationResponse,
  staticFallbackDestination: DestinationData | null,
): DestinationData {
  const baseFallbackDestination =
    staticFallbackDestination ?? destinations.japan;
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
      staticFallbackDestination?.heroImage ??
      backendDestination.country.hero_media?.url ??
      destinations.japan.heroImage,
    heroImageAlt:
      staticFallbackDestination?.heroImageAlt ??
      backendDestination.country.hero_media?.alt ??
      backendDestination.country.hero_media?.alt_text ??
      `${countryName} travel scene`,
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
