import Image from "next/image";
import Link from "next/link";

import { ExploreSearchForm } from "@/components/explore/ExploreSearchForm";
import type { BackendFeaturedDestinationsResponse } from "@/lib/destinationApi";

type FeaturedCountry = {
  country: string;
  id: string;
  month: string;
  year: string;
  featuredCategory: string;
  featuredHeadline: string;
  whyThisMonth: string;
  heroImage: string;
  heroImageAlt: string;
  places: CuratedPlace[];
  detailPage: string;
};

type CuratedPlace = {
  number: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
};

type ExplorePageProps = {
  featuredSnapshot?: BackendFeaturedDestinationsResponse | null;
};

export function ExplorePage({ featuredSnapshot = null }: ExplorePageProps) {
  const featuredData = mapFeaturedSnapshot(featuredSnapshot);

  return (
    <main className="bg-[#0B0B0C] text-[#F5F1E8]">
      <ExploreHero />
      <FeaturedThisMonth
        countries={featuredData.countries}
        monthlyFeature={featuredData.monthlyFeature}
      />
    </main>
  );
}

function ExploreHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-10 sm:px-8 lg:pb-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[500px] overflow-hidden rounded-[4px] bg-[#111112]">
          <Image
            alt="Travelers overlooking a mountain valley at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, calc(100vw - 40px)"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.78),rgba(5,5,5,0.38)_48%,rgba(5,5,5,0.08)),linear-gradient(0deg,rgba(5,5,5,0.42),transparent_42%)]" />
          <div className="relative z-10 flex min-h-[500px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.42em] text-white/75">
              CoVoyage Discover
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Master the Local Vibe
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
              Discover destinations, local culture, community insights, and
              AI-powered travel guidance before your next adventure.
            </p>
            <ExploreSearchForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedThisMonth({
  countries,
  monthlyFeature,
}: {
  countries: FeaturedCountry[];
  monthlyFeature: MonthlyFeature;
}) {
  return (
    <section
      aria-labelledby="explore-this-month-heading"
      className="px-5 pb-24 pt-8 sm:px-8 lg:pb-32 lg:pt-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl pb-10 text-center sm:pb-12 lg:pb-14">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#D8BE8A]">
            Explore This Month
          </p>
          <h2
            className="mt-3 font-serif text-4xl leading-tight text-[#F5F1E8] sm:text-5xl lg:text-6xl"
            id="explore-this-month-heading"
          >
            Explore This Month
          </h2>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.32em] text-[#D8BE8A]/80 sm:text-base">
            {monthlyFeature.month} {monthlyFeature.year}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#B8B0A4] sm:text-base sm:leading-8">
            {monthlyFeature.description}
          </p>
        </header>
      </div>
      <div className="relative isolate mx-auto grid max-w-7xl items-start gap-9 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)]">
        <div className="relative z-40 lg:sticky lg:top-28 lg:self-start">
          <FeaturedSidebar countries={countries} />
        </div>
        <div className="relative z-0">
          <FeaturedCountries countries={countries} />
        </div>
      </div>
    </section>
  );
}

function FeaturedSidebar({ countries }: { countries: FeaturedCountry[] }) {
  return (
    <nav
      aria-label="Featured countries this month"
      className="relative z-40 border border-white/10 bg-[#111112]/88 px-5 py-5 backdrop-blur-sm sm:px-6 sm:py-6"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#D8BE8A]/82">
        Featured This Month
      </p>
      <ol className="mt-6 space-y-5">
        {countries.map((country, index) => (
          <li
            className="grid grid-cols-[1.1rem_1rem_minmax(0,1fr)] gap-x-3"
            key={country.country}
          >
            <span className="pt-0.5 text-xs font-light text-[#D8BE8A]/52">
              {index + 1}
            </span>
            <span className="mt-0.5 grid h-4 w-4 place-items-center bg-[#D8BE8A]/70 text-[9px] font-semibold text-[#0B0B0C]">
              +
            </span>
            <div>
              <a
                className="block text-sm font-medium uppercase tracking-[0.14em] text-[#F5F1E8] transition-colors hover:text-[#D8BE8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0B0C]"
                href={`#${country.id}`}
              >
                {country.country}
              </a>
              <ul className="mt-3 space-y-1.5 pl-1">
                {getVisiblePlaces(country).map((place) => (
                  <li
                    className="text-xs uppercase tracking-[0.1em] text-[#B8B0A4]"
                    key={place.name}
                  >
                    {place.shortName}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function FeaturedCountries({ countries }: { countries: FeaturedCountry[] }) {
  return (
    <div className="space-y-28 overflow-visible px-0 pb-10 pt-1 md:px-4 lg:-mt-2 xl:space-y-32">
      {countries.map((country) => (
        <FeaturedCountrySection
          country={country}
          key={country.country}
        />
      ))}
    </div>
  );
}

function FeaturedCountrySection({
  country,
}: {
  country: FeaturedCountry;
}) {
  const places = getVisiblePlaces(country);

  return (
    <section
      className="relative scroll-mt-28 overflow-visible border-t border-white/10 pb-8 pt-8 first:border-t-0 first:pt-0 sm:pt-10 lg:min-h-[940px] lg:pb-16 lg:pt-16"
      id={country.id}
    >
      <CountryBackground country={country} />
      <div className="relative z-10 max-w-3xl">
        <h3 className="font-serif text-6xl leading-[0.9] text-[#F5F1E8] sm:text-7xl lg:text-8xl">
          {country.country}
        </h3>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[#D9D0C2] sm:text-base">
          {country.whyThisMonth}
        </p>
      </div>

      <div className="relative z-10 mt-10 pb-4 lg:mt-14 lg:min-h-[640px]">
        <CountryRouteLine placesCount={places.length} />
        <div className="absolute bottom-0 left-4 top-2 w-px bg-[#D8BE8A]/18 lg:hidden" />
        <div className="space-y-10 sm:space-y-12 lg:space-y-0">
          {places.map((place, index) => (
            <CountryPlaceMoment
              countryName={country.country}
              index={index}
              key={place.name}
              place={place}
            />
          ))}
        </div>
      </div>

      <Link
        className="relative z-10 mt-6 inline-flex border border-[#D8BE8A]/55 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0B0C]"
        href={country.detailPage}
      >
        Explore {country.country}
      </Link>
    </section>
  );
}

function CountryBackground({ country }: { country: FeaturedCountry }) {
  const isLocalDestinationImage = country.id === "guatemala" || country.id === "spain";
  const backgroundImage =
    country.id === "iceland"
      ? "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=2200&q=88"
      : country.id === "guatemala"
        ? "/destination/gmm.jpg"
        : country.id === "spain"
          ? "/destination/spain.jpg"
          : null;

  if (!backgroundImage) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-0 z-0 h-full min-h-[920px] w-screen -translate-x-1/2 overflow-hidden lg:left-[calc(-1*((100vw-min(100vw,80rem))/2+19rem))] lg:w-[calc(100vw+2rem)] lg:translate-x-0"
    >
      <Image
        alt=""
        className="h-full w-full object-cover"
        fill
        sizes="100vw"
        src={backgroundImage}
      />
      <div className={`absolute inset-0 ${isLocalDestinationImage ? "bg-black/74" : "bg-black/66"}`} />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0B0B0C] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-b from-transparent to-[#0B0B0C]" />
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0B0B0C] to-transparent sm:w-56 lg:w-72" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#0B0B0C] to-transparent sm:w-56 lg:w-72" />
    </div>
  );
}

function CountryPlaceMoment({
  countryName,
  index,
  place,
}: {
  countryName: string;
  index: number;
  place: CuratedPlace;
}) {
  const imageFirst = index % 2 === 0;
  const offsets = [
    "lg:mr-auto lg:w-[68%]",
    "lg:ml-auto lg:w-[66%] lg:pt-10",
    "lg:mr-auto lg:w-[68%] lg:pl-8 lg:pt-20",
    "lg:ml-auto lg:w-[66%] lg:pt-28",
  ];

  return (
    <article className={`relative pl-10 lg:pl-0 ${offsets[index]}`}>
      <div
        className={`relative max-w-md border-l border-[#D8BE8A]/24 bg-[#090909]/46 px-5 py-5 backdrop-blur-[2px] ${
          imageFirst ? "" : "lg:ml-auto"
        }`}
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#D8BE8A]/78">
          {place.number} / {countryName} Route
        </p>
        <h4 className="mt-2 font-serif text-2xl leading-none text-[#F5F1E8] sm:text-3xl">
          {place.name}
        </h4>
        <p className="mt-3 text-sm leading-6 text-[#D9D0C2]">
          {place.description}
        </p>
      </div>
    </article>
  );
}

function CountryRouteLine({ placesCount }: { placesCount: number }) {
  const height = placesCount > 3 ? 820 : 620;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-6 z-0 hidden w-full text-[#D8BE8A] opacity-40 lg:block"
      fill="none"
      preserveAspectRatio="none"
      style={{ height }}
      viewBox="0 0 820 820"
    >
      <path
        d={
          placesCount > 3
            ? "M118 72 C 280 18, 510 58, 610 174 C 696 274, 548 338, 388 326 C 208 312, 98 408, 188 526 C 286 648, 552 612, 642 744"
            : "M118 72 C 280 18, 510 58, 610 174 C 696 274, 548 338, 388 326 C 208 312, 98 408, 188 526"
        }
        stroke="currentColor"
        strokeDasharray="4 11"
        strokeLinecap="round"
        strokeWidth="1.35"
      />
      <circle cx="118" cy="72" fill="#D8BE8A" r="3.5" />
      <circle cx="388" cy="326" fill="#D8BE8A" r="3.5" />
      <circle cx="188" cy="526" fill="#D8BE8A" r="3.5" />
      {placesCount > 3 ? <circle cx="642" cy="744" fill="#D8BE8A" r="3.5" /> : null}
    </svg>
  );
}

type MonthlyFeature = {
  month: string;
  year: string;
  description: string;
};

const fallbackMonthlyFeature: MonthlyFeature = {
  month: "August",
  year: "2026",
  description:
    "Three destinations selected for one clear reason this month: scenery, value, or a cultural moment worth planning around.",
};

const augustFeaturedCountryIds = ["iceland", "guatemala", "spain"] as const;

const fallbackFeaturedCountries: FeaturedCountry[] = [
  {
    country: "Iceland",
    id: "iceland",
    month: fallbackMonthlyFeature.month,
    year: fallbackMonthlyFeature.year,
    featuredCategory: "Scenic Beauty",
    featuredHeadline:
      "Long daylight, open roads, and landscapes at their most reachable",
    whyThisMonth:
      "August gives Iceland generous daylight, accessible highland routes, and a softer late-summer mood across waterfalls, lava fields, glaciers, and coastal drives. It is a strong month for travelers who want dramatic scenery without building the whole trip around winter conditions.",
    heroImage:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Icelandic waterfall and green cliffs in summer light",
    places: [
      {
        number: "01",
        name: "Landmannalaugar",
        shortName: "Landmannalaugar",
        description:
          "Rhyolite mountains, colorful volcanic slopes, and geothermal valleys become part of the Highlands story while August access is strongest.",
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Colorful mountain landscape under soft daylight",
        align: "left",
      },
      {
        number: "02",
        name: "South Coast",
        shortName: "South Coast",
        description:
          "Waterfalls, black-sand beaches, glaciers, and volcanic horizons make the classic scenic route feel cinematic in late summer.",
        image:
          "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Icelandic black sand coast with dramatic mountains",
        align: "right",
      },
      {
        number: "03",
        name: "Porsmork",
        shortName: "Porsmork",
        description:
          "Glacial valleys, dark ridges, and lush summer trails create a wilder scenic chapter between mountains and ice.",
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Green mountain valley with dramatic peaks",
        align: "left",
      },
    ],
    detailPage: "/explore/iceland",
  },
  {
    country: "Guatemala",
    id: "guatemala",
    month: fallbackMonthlyFeature.month,
    year: fallbackMonthlyFeature.year,
    featuredCategory: "Budget-Friendly",
    featuredHeadline:
      "Rich culture and big landscapes with strong travel value",
    whyThisMonth:
      "Guatemala stands out in August for travelers who want meaningful experiences without stretching the budget. Colonial towns, lake stays, markets, volcano views, and local guesthouses can create a layered trip at a gentler cost than many peak-summer destinations.",
    heroImage:
      "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Colorful Guatemala street with traditional architecture",
    places: [
      {
        number: "01",
        name: "Antigua Guatemala",
        shortName: "Antigua",
        description:
          "Walkable historic streets, local food, and guesthouse stays make Antigua a rich cultural base without a heavy spend.",
        image:
          "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Colorful colonial street in Antigua Guatemala",
        align: "left",
      },
      {
        number: "02",
        name: "Lake Atitlán",
        shortName: "Lake Atitlán",
        description:
          "Lakefront villages, boat days, and volcano views create a slower August rhythm with strong value for longer stays.",
        image:
          "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Lake surrounded by mountains and villages",
        align: "right",
      },
      {
        number: "03",
        name: "Semuc Champey",
        shortName: "Semuc Champey",
        description:
          "Natural pools, waterfalls, and outdoor days bring a big-nature chapter that can still feel accessible and grounded.",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Turquoise natural pools and lush greenery",
        align: "left",
      },
      {
        number: "04",
        name: "Flores / Tikal",
        shortName: "Flores / Tikal",
        description:
          "A colorful island base and access to Tikal make the northern route feel historically rich without losing the value focus.",
        image:
          "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Ancient stone ruins surrounded by forest",
        align: "right",
      },
    ],
    detailPage: "/explore/guatemala",
  },
  {
    country: "Spain",
    id: "spain",
    month: fallbackMonthlyFeature.month,
    year: fallbackMonthlyFeature.year,
    featuredCategory: "Major Festival / Event",
    featuredHeadline:
      "A month shaped by one of Europe's biggest street celebrations",
    whyThisMonth:
      "Spain earns its August feature for festival energy, especially Valencia's La Tomatina period near the end of the month. The country becomes a strong pick for travelers who want a trip anchored by a major cultural event rather than a standard sightseeing route.",
    heroImage:
      "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Spanish city street glowing in warm summer light",
    places: [
      {
        number: "01",
        name: "Buñol",
        shortName: "Buñol",
        description:
          "La Tomatina on 26 August 2026 gives Spain a specific, high-energy reason to anchor an August trip.",
        image:
          "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Crowded summer street festival scene",
        align: "left",
      },
      {
        number: "02",
        name: "Valencia",
        shortName: "Valencia",
        description:
          "Valencia adds the broader city rhythm around Buñol: Mediterranean evenings, food culture, and easy event access.",
        image:
          "https://images.unsplash.com/photo-1606768666853-403c90a981ad?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Valencia architecture and reflecting water",
        align: "right",
      },
      {
        number: "03",
        name: "Málaga",
        shortName: "Málaga",
        description:
          "Feria de Málaga brings a second August festival mood, with city streets, music, and coastal summer energy.",
        image:
          "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Warm Spanish city street with festive lights",
        align: "left",
      },
      {
        number: "04",
        name: "Andalusia",
        shortName: "Andalusia",
        description:
          "Regional summer celebrations and local traditions extend the event-led story beyond one city into a wider cultural route.",
        image:
          "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Southern Spain architecture in golden light",
        align: "right",
      },
    ],
    detailPage: "/explore/spain",
  },
];

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

function getMonthName(month: number) {
  return monthNames[month - 1] ?? fallbackMonthlyFeature.month;
}

function formatRank(rank: number) {
  return String(rank).padStart(2, "0");
}

function getVisiblePlaces(country: FeaturedCountry) {
  if (country.id !== "iceland") {
    return country.places;
  }

  return country.places.slice(0, 3);
}

function mapFeaturedSnapshot(snapshot: BackendFeaturedDestinationsResponse | null) {
  if (!snapshot?.destinations?.length) {
    return {
      countries: fallbackFeaturedCountries,
      monthlyFeature: fallbackMonthlyFeature,
    };
  }

  const fallbackBySlug = new Map(
    fallbackFeaturedCountries.map((country) => [country.id, country]),
  );
  const backendDestinationBySlug = new Map(
    snapshot.destinations.map((destination) => [
      destination.country_slug,
      destination,
    ]),
  );
  const month = getMonthName(snapshot.month);
  const year = String(snapshot.year);
  const countries = augustFeaturedCountryIds.map((countryId) => {
    const fallback = fallbackBySlug.get(countryId);
    const destination = backendDestinationBySlug.get(countryId);

    if (!fallback) {
      throw new Error(`Missing fallback destination for ${countryId}`);
    }

    if (!destination) {
      return {
        ...fallback,
        month,
        year,
      };
    }

    if (countryId === "iceland") {
      return {
        ...fallback,
        country: destination.country_name ?? fallback.country,
        month,
        year,
        featuredCategory: `Rank ${formatRank(destination.rank)} / Score ${destination.final_score}`,
        whyThisMonth: `${destination.recommendation_reason} Recommendation score: ${destination.final_score}.`,
      };
    }

    const fallbackPlacesBySlug = new Map(
      fallback.places.map((place) => [
        place.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        place,
      ]),
    );

    return {
      ...fallback,
      country: destination.country_name ?? fallback.country,
      month,
      year,
      featuredCategory: `Rank ${formatRank(destination.rank)} / Score ${destination.final_score}`,
      whyThisMonth: `${destination.recommendation_reason} Recommendation score: ${destination.final_score}.`,
      places: destination.selected_places.map((place, index) => {
        const placeSlug = place.place_slug;
        const fallbackPlace = fallbackPlacesBySlug.get(placeSlug) ?? fallback.places[index];

        return {
          ...(fallbackPlace ?? {
            image:
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=86",
            imageAlt: `${place.place_name ?? place.place_slug} travel scene`,
            align: index % 2 === 0 ? "left" : "right",
          }),
          number: formatRank(place.rank),
          name: place.place_name ?? fallbackPlace?.name ?? place.place_slug,
          shortName: place.place_name ?? fallbackPlace?.shortName ?? place.place_slug,
          description: `${place.recommendation_reason} Score: ${place.score}.`,
        };
      }),
    };
  });

  return {
    countries,
    monthlyFeature: {
      month,
      year,
      description:
        "Destinations selected from the latest CoVoyage monthly recommendation snapshot.",
    },
  };
}
