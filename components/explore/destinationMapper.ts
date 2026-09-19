import type {
  BackendDestinationResponse,
  BackendLocalInsight,
  BackendMedia,
  BackendMonthlyFactor,
  BackendPlace,
  BackendTextNote,
} from "@/lib/destinationApi";
import type {
  DestinationData,
  InfoSection,
  JourneyFact,
  JourneyPlace,
  SnapshotItem,
} from "@/components/explore/destinationData";
import { getCuratedPlaceContent } from "@/components/explore/curatedPlaceContent";
import {
  getCuratedCountryHeroImage,
  getCuratedPlaceImage,
} from "@/components/explore/curatedPlaceImages";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const localPhraseTitlesByCountrySlug: Record<string, string> = {
  argentina: "A Little Spanish",
  canada: "A Little English and French",
  france: "A Little French",
  guatemala: "A Little Spanish",
  iceland: "A Little Icelandic",
  indonesia: "A Little Indonesian",
  italy: "A Little Italian",
  japan: "A Little Japanese",
  kenya: "A Little Swahili",
  mexico: "A Little Spanish",
  morocco: "A Little Moroccan Arabic",
  "new-zealand": "A Little English and Te Reo Maori",
  norway: "A Little Norwegian",
  peru: "A Little Spanish",
  portugal: "A Little Portuguese",
  "south-africa": "A Little Local Language",
  spain: "A Little Spanish",
  thailand: "A Little Thai",
  turkey: "A Little Turkish",
  vietnam: "A Little Vietnamese",
};

function getMonthName(month?: number) {
  if (!month || month < 1 || month > 12) {
    return null;
  }

  return monthNames[month - 1];
}

function normalizePlaceKey(value: string) {
  return value
    .toLowerCase()
    .replace(/þ/g, "th")
    .replace(/ð/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getMediaAlt(media: BackendMedia | undefined) {
  return media?.alt_text ?? media?.alt;
}

function isMatchingPlace(fallbackPlace: JourneyPlace, backendPlace: BackendPlace) {
  const fallbackKey = normalizePlaceKey(fallbackPlace.name);
  const backendSlug = normalizePlaceKey(backendPlace.slug);
  const backendName = normalizePlaceKey(backendPlace.name ?? backendPlace.slug);

  return (
    fallbackKey === backendSlug ||
    fallbackKey === backendName ||
    fallbackKey.includes(backendSlug) ||
    backendSlug.includes(fallbackKey) ||
    fallbackKey.includes(backendName) ||
    backendName.includes(fallbackKey)
  );
}

function textNoteToInfoSection(note: BackendTextNote): InfoSection | null {
  if (!note.title || !note.body) {
    return null;
  }

  return {
    title: note.title,
    content: note.body,
  };
}

function localInsightToInfoSection(insight: BackendLocalInsight): InfoSection | null {
  if (!insight.title || !insight.content) {
    return null;
  }

  return {
    title: insight.title,
    content: insight.content,
  };
}

function getNotesAsSections(notes: BackendTextNote[] | undefined) {
  return notes
    ?.map(textNoteToInfoSection)
    .filter((section): section is InfoSection => Boolean(section)) ?? [];
}

function getInsightsAsSections(insights: BackendLocalInsight[] | undefined) {
  return insights
    ?.map(localInsightToInfoSection)
    .filter((section): section is InfoSection => Boolean(section)) ?? [];
}

function getLatestMonthlyFactor(monthlyFactors: BackendMonthlyFactor[]) {
  return [...monthlyFactors].sort((left, right) => {
    if (left.year !== right.year) {
      return right.year - left.year;
    }

    return right.month - left.month;
  })[0];
}

function getSnapshotValue(
  item: SnapshotItem,
  backend: BackendDestinationResponse,
  latestMonthlyFactor: BackendMonthlyFactor | undefined,
  fallback: DestinationData,
) {
  const { country } = backend;

  switch (item.label) {
    case "Currency":
      return country.currency?.name && country.currency?.code
        ? `${country.currency.name} (${country.currency.code})`
        : item.value;
    case "Language":
      return country.languages?.length ? country.languages.join(", ") : item.value;
    case "Visa / Entry":
      return country.visa_entry_summary?.title ?? item.value;
    case "Daily Budget":
      return fallback.averageDailyBudget.value;
    case "Trip Style":
      return country.travel_styles?.length
        ? country.travel_styles.join(", ")
        : item.value;
    case "Best Month": {
      const monthName = getMonthName(latestMonthlyFactor?.month);
      return monthName
        ? `${monthName} for access and daylight`
        : item.value;
    }
    case "Emergency":
      return country.emergency_numbers?.length
        ? country.emergency_numbers.join(", ")
        : item.value;
    case "Time Zone":
      return country.timezone ?? item.value;
    default:
      return item.value;
  }
}

function buildPlaceFacts(
  fallbackFacts: JourneyFact[],
  place: BackendPlace,
  monthlyFactor: BackendMonthlyFactor | undefined,
  monthName: string | null,
) {
  const curatedContent = getCuratedPlaceContent(place.slug);

  return fallbackFacts.map((fact) => {
    switch (fact.label) {
      case "Why Visit":
        return {
          ...fact,
          value: curatedContent?.whyVisit ?? place.why_visit ?? fact.value,
        };
      case "Time Required":
        return {
          ...fact,
          value: curatedContent?.timeRequired ?? place.time_required ?? fact.value,
        };
      case "Local Experience":
        return {
          ...fact,
          value:
            curatedContent?.localExperience ??
            getNonGenericLocalExperience(place.local_experience) ??
            fact.value,
        };
      case "August Note":
        return {
          ...fact,
          label: monthName ? `${monthName} Note` : "Seasonal Note",
          value:
            curatedContent?.seasonalNote ??
            monthlyFactor?.accessibility_information ??
            monthlyFactor?.weather_suitability_input ??
            fact.value,
        };
      default:
        return fact;
    }
  });
}

function getNonGenericLocalExperience(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (
    normalizedValue.includes("more than a checklist stop") ||
    normalizedValue.includes("local food, seasonal pacing") ||
    normalizedValue.includes("transit buffers")
  ) {
    return null;
  }

  return value;
}

function mapJourneyPlace(
  fallbackPlace: JourneyPlace,
  backendPlace: BackendPlace | undefined,
  monthlyFactor: BackendMonthlyFactor | undefined,
  monthName: string | null,
) {
  if (!backendPlace) {
    return fallbackPlace;
  }

  const curatedImage = getCuratedPlaceImage(backendPlace.slug);

  return {
    ...fallbackPlace,
    placeSlug: backendPlace.slug,
    name: backendPlace.name ?? fallbackPlace.name,
    region: backendPlace.region ?? fallbackPlace.region,
    image: curatedImage?.image ?? backendPlace.media?.[0]?.url ?? fallbackPlace.image,
    imageAlt:
      curatedImage?.imageAlt ?? getMediaAlt(backendPlace.media?.[0]) ?? fallbackPlace.imageAlt,
    story:
      getCuratedPlaceContent(backendPlace.slug)?.journeyDescription ??
      backendPlace.story ??
      backendPlace.description ??
      fallbackPlace.story,
    facts: buildPlaceFacts(
      fallbackPlace.facts,
      backendPlace,
      monthlyFactor,
      monthName,
    ),
    localVibe: backendPlace.local_vibe_notes?.length
      ? backendPlace.local_vibe_notes
      : fallbackPlace.localVibe,
  };
}

function getBackendJourneyPlaces(
  fallbackPlaces: JourneyPlace[],
  backendPlaces: BackendPlace[],
  monthlyFactor: BackendMonthlyFactor | undefined,
) {
  if (!backendPlaces.length) {
    return fallbackPlaces;
  }

  const mappedPlaces: JourneyPlace[] = [];
  const usedBackendSlugs = new Set<string>();
  const monthName = getMonthName(monthlyFactor?.month);

  fallbackPlaces.forEach((fallbackPlace) => {
    const backendPlace = backendPlaces.find(
      (place) =>
        !usedBackendSlugs.has(place.slug) &&
        isMatchingPlace(fallbackPlace, place),
    );

    if (!backendPlace) {
      return;
    }

    usedBackendSlugs.add(backendPlace.slug);
    mappedPlaces.push(
      mapJourneyPlace(
        {
          ...fallbackPlace,
          number: String(mappedPlaces.length + 1).padStart(2, "0"),
        },
        backendPlace,
        monthlyFactor,
        monthName,
      ),
    );
  });

  backendPlaces
    .filter((place) => !usedBackendSlugs.has(place.slug))
    .forEach((backendPlace) => {
      const fallbackPlace =
        fallbackPlaces[mappedPlaces.length] ??
        fallbackPlaces[fallbackPlaces.length - 1];

      mappedPlaces.push(
        mapJourneyPlace(
          {
            ...fallbackPlace,
            number: String(mappedPlaces.length + 1).padStart(2, "0"),
          },
          backendPlace,
          monthlyFactor,
          monthName,
        ),
      );
    });

  return mappedPlaces;
}

export function mapBackendDestinationToDestinationData(
  backend: BackendDestinationResponse | null,
  fallback: DestinationData,
): DestinationData {
  if (!backend) {
    return fallback;
  }

  const latestMonthlyFactor = getLatestMonthlyFactor(backend.monthly_factors);
  const monthName = getMonthName(latestMonthlyFactor?.month);
  const journeyPlaces = getBackendJourneyPlaces(
    fallback.journeyPlaces,
    backend.places,
    latestMonthlyFactor,
  );
  const backendGoodToKnow = [
    ...getInsightsAsSections(backend.country.local_insights),
    ...getNotesAsSections(backend.country.practical_notes),
    ...getNotesAsSections(backend.country.common_visitor_mistakes),
  ];
  const backendVibeNotes = [
    ...(backend.country.culture_notes ?? []).map((note) => ({
      title: note.title ?? "Culture",
      body: note.body ?? "",
    })),
    ...(backend.country.etiquette_notes ?? []).map((note) => ({
      title: note.title ?? "Etiquette",
      body: note.body ?? "",
    })),
    ...(backend.country.communication_notes ?? []).map((note) => ({
      title: note.title ?? "Communication",
      body: note.body ?? "",
    })),
  ].filter((note) => note.body);
  const snapshot = fallback.snapshot.map((item) => ({
    ...item,
    value: getSnapshotValue(item, backend, latestMonthlyFactor, fallback),
  }));
  const curatedHeroImage = getCuratedCountryHeroImage(backend.country.slug);

  return {
    ...fallback,
    key: backend.country.slug ?? fallback.key,
    country: backend.country.name ?? fallback.country,
    currency: {
      name: backend.country.currency?.name ?? fallback.currency.name,
      code: backend.country.currency?.code ?? fallback.currency.code,
    },
    featuredCategory:
      backend.country.featured_category ?? fallback.featuredCategory,
    heroImage:
      curatedHeroImage?.image ?? backend.country.hero_media?.url ?? fallback.heroImage,
    heroImageAlt:
      curatedHeroImage?.imageAlt ??
      getMediaAlt(backend.country.hero_media) ??
      fallback.heroImageAlt,
    intro: backend.country.overview ?? fallback.intro,
    journeyTitle: backend.country.journey_title ?? fallback.journeyTitle,
    journeyIntro: backend.country.journey_intro ?? fallback.journeyIntro,
    month: monthName ?? fallback.month,
    year: latestMonthlyFactor?.year
      ? String(latestMonthlyFactor.year)
      : fallback.year,
    snapshot,
    journeyPlaces,
    vibeNotes: backendVibeNotes.length ? backendVibeNotes : fallback.vibeNotes,
    goodToKnow: backendGoodToKnow.length
      ? backendGoodToKnow
      : fallback.goodToKnow,
    localPhrasesTitle:
      localPhraseTitlesByCountrySlug[backend.country.slug ?? ""] ??
      fallback.localPhrasesTitle,
    localPhrases: backend.country.local_phrases?.length
      ? backend.country.local_phrases.slice(0, 9).map((phrase) => ({
          english: phrase.english ?? "",
          local: phrase.local ?? "",
          pronunciation: phrase.pronunciation,
          usageNote: phrase.usage_note,
        }))
      : fallback.localPhrases.slice(0, 9),
  };
}
