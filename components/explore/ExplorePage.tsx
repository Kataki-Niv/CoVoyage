import Image from "next/image";
import Link from "next/link";

import { ExploreSearchForm } from "@/components/explore/ExploreSearchForm";

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

export function ExplorePage() {
  return (
    <main className="bg-[#fbf8f2] text-stone-900">
      <ExploreHero />
      <FeaturedThisMonth />
    </main>
  );
}

function ExploreHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-14 sm:px-8 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[620px] overflow-hidden rounded-[4px] bg-stone-900">
          <Image
            alt="Travelers overlooking a mountain valley at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, calc(100vw - 40px)"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,25,23,0.82),rgba(28,25,23,0.42)_48%,rgba(28,25,23,0.12)),linear-gradient(0deg,rgba(28,25,23,0.42),transparent_42%)]" />
          <div className="relative z-10 flex min-h-[620px] flex-col justify-end px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
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

function FeaturedThisMonth() {
  return (
    <section
      aria-labelledby="explore-this-month-heading"
      className="px-5 pb-24 pt-8 sm:px-8 lg:pb-32 lg:pt-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl pb-10 text-center sm:pb-12 lg:pb-14">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#a97867]">
            Explore This Month
          </p>
          <h2
            className="mt-3 font-serif text-4xl leading-tight text-[#4f413c] sm:text-5xl lg:text-6xl"
            id="explore-this-month-heading"
          >
            Explore This Month
          </h2>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.32em] text-[#8d6255] sm:text-base">
            {monthlyFeature.month} {monthlyFeature.year}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#7b665e] sm:text-base sm:leading-8">
            {monthlyFeature.description}
          </p>
        </header>
      </div>
      <div className="mx-auto grid max-w-7xl items-start gap-9 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)]">
        <FeaturedSidebar countries={featuredCountries} />
        <FeaturedCountries countries={featuredCountries} />
      </div>
    </section>
  );
}

function FeaturedSidebar({ countries }: { countries: FeaturedCountry[] }) {
  return (
    <nav
      aria-label="Featured countries this month"
      className="border border-[#d8b7aa] bg-[#fbf8f2] px-5 py-5 sm:px-6 sm:py-6 lg:sticky lg:top-28"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7a5f56]">
        Featured This Month
      </p>
      <ol className="mt-6 space-y-5">
        {countries.map((country, index) => (
          <li
            className="grid grid-cols-[1.1rem_1rem_minmax(0,1fr)] gap-x-3"
            key={country.country}
          >
            <span className="pt-0.5 text-xs font-light text-[#cfae9e]">
              {index + 1}
            </span>
            <span className="mt-0.5 grid h-4 w-4 place-items-center bg-[#d8b7aa] text-[9px] font-semibold text-white">
              +
            </span>
            <div>
              <a
                className="block text-sm font-medium uppercase tracking-[0.14em] text-[#5e4d48] transition-colors hover:text-[#8d6255] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b87666] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf8f2]"
                href={`#${country.id}`}
              >
                {country.country}
              </a>
              <ul className="mt-3 space-y-1.5 pl-1">
                {country.places.map((place) => (
                  <li
                    className="text-xs uppercase tracking-[0.1em] text-[#6f5a53]"
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
    <div className="space-y-28 overflow-hidden px-0 pb-10 pt-1 md:px-4 lg:-mt-2 xl:space-y-32">
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
  return (
    <section
      className="relative scroll-mt-28 border-t border-[#eadbd2] pt-14 first:border-t-0 first:pt-0 lg:pt-16"
      id={country.id}
    >
      <CountryStoryIntro country={country} />
      <CountryRoute country={country} />
    </section>
  );
}

function CountryStoryIntro({ country }: { country: FeaturedCountry }) {
  return (
    <div className="grid items-end gap-9 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:gap-14">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#a97867]">
          {country.month} {country.year}
        </p>
        <h3 className="mt-3 font-serif text-5xl leading-[0.96] text-[#4f413c] sm:text-6xl lg:text-7xl xl:text-8xl">
          {country.country}
        </h3>
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.28em] text-[#8d6255]">
          {country.featuredCategory}
        </p>
        <h4 className="mt-5 font-serif text-3xl leading-tight text-[#5a4740] sm:text-4xl">
          {country.featuredHeadline}
        </h4>
        <p className="mt-5 text-sm leading-7 text-[#745f57] sm:text-base sm:leading-8">
          {country.whyThisMonth}
        </p>
      </div>
      <figure
        className="relative min-h-[360px] overflow-hidden bg-[#e8d8cf] shadow-2xl shadow-[#b99686]/20 sm:min-h-[460px] lg:min-h-[560px]"
        style={{
          clipPath:
            "polygon(7% 4%, 34% 0, 78% 4%, 100% 12%, 95% 80%, 82% 93%, 47% 100%, 13% 95%, 0 80%, 3% 22%)",
        }}
      >
        <Image
          alt={country.heroImageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          fill
          sizes="(min-width: 1024px) 39vw, calc(100vw - 40px)"
          src={country.heroImage}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0),rgba(87,68,60,0.18))]" />
      </figure>
    </div>
  );
}

function CountryRoute({ country }: { country: FeaturedCountry }) {
  return (
    <div className="relative mt-14 overflow-hidden pb-4 pt-2 sm:mt-16 lg:mt-20">
      <RouteLine />
      <div className="relative z-10 space-y-14 sm:space-y-16 lg:space-y-12">
        {country.places.map((place) => (
          <CuratedPlaceMoment key={place.name} place={place} />
        ))}
      </div>
      <Link
        className="relative z-10 mt-12 inline-flex border border-[#b87666] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#8d6255] transition-colors hover:bg-[#8d6255] hover:text-[#fffaf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b87666] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf8f2]"
        href={country.detailPage}
      >
        Explore {country.country}
      </Link>
    </div>
  );
}

function CuratedPlaceMoment({ place }: { place: CuratedPlace }) {
  const image = <PlaceImage place={place} />;
  const copy = <PlaceCopy place={place} />;

  return (
    <article className="grid items-center gap-7 md:grid-cols-2 md:gap-8 lg:gap-12">
      {place.align === "left" ? (
        <>
          {image}
          <div className="md:pl-2 lg:pl-8">{copy}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{image}</div>
          <div className="md:order-1 md:pr-4 lg:pr-10">{copy}</div>
        </>
      )}
    </article>
  );
}

function PlaceImage({ place }: { place: CuratedPlace }) {
  return (
    <figure
      className="relative min-h-[280px] overflow-hidden bg-[#e8d8cf] shadow-2xl shadow-[#b99686]/20 sm:min-h-[350px] lg:min-h-[390px]"
      style={{
        clipPath:
          place.align === "left"
            ? "polygon(0 11%, 9% 3%, 36% 0, 76% 4%, 100% 15%, 95% 83%, 74% 94%, 33% 100%, 8% 91%, 0 70%)"
            : "polygon(7% 5%, 34% 0, 77% 3%, 100% 12%, 96% 75%, 84% 91%, 50% 100%, 13% 95%, 0 82%, 4% 24%)",
      }}
    >
      <Image
        alt={place.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        sizes="(min-width: 1024px) 32vw, (min-width: 768px) 45vw, calc(100vw - 40px)"
        src={place.image}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.02),rgba(87,68,60,0.2))]" />
    </figure>
  );
}

function PlaceCopy({ place }: { place: CuratedPlace }) {
  return (
    <div className="max-w-sm">
      <p className="text-xs uppercase tracking-[0.28em] text-[#c09886]">
        {place.number} / Curated Place
      </p>
      <h4 className="mt-3 font-serif text-4xl leading-none text-[#5a4740] sm:text-[2.65rem]">
        {place.name}
      </h4>
      <p className="mt-4 text-sm leading-7 text-[#745f57]">
        {place.description}
      </p>
    </div>
  );
}

function RouteLine() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-8 z-0 hidden h-[1260px] w-full text-[#c8a598] opacity-70 md:block"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 780 1260"
    >
      <path
        d="M92 118 C 248 26, 488 46, 620 164 C 734 266, 650 382, 490 398 C 310 416, 166 350, 102 486 C 32 634, 248 746, 476 702 C 680 662, 736 802, 594 928 C 474 1034, 278 988, 164 1110"
        stroke="currentColor"
        strokeDasharray="3 9"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
      <circle cx="92" cy="118" fill="#b87666" r="3" />
      <circle cx="490" cy="398" fill="#b87666" r="3" />
      <circle cx="476" cy="702" fill="#b87666" r="3" />
      <circle cx="164" cy="1110" fill="#b87666" r="3" />
    </svg>
  );
}

const monthlyFeature = {
  month: "August",
  year: "2026",
  description:
    "Three destinations selected for one clear reason this month: scenery, value, or a cultural moment worth planning around.",
};

const featuredCountries: FeaturedCountry[] = [
  {
    country: "Iceland",
    id: "iceland",
    month: monthlyFeature.month,
    year: monthlyFeature.year,
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
        name: "Thorsmork",
        shortName: "Thorsmork",
        description:
          "Glacial valleys, dark ridges, and lush summer trails create a wilder scenic chapter between mountains and ice.",
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Green mountain valley with dramatic peaks",
        align: "right",
      },
      {
        number: "03",
        name: "Westfjords",
        shortName: "Westfjords",
        description:
          "Remote fjords, cliffs, and quiet coastlines give Iceland's August scenery a more spacious, less expected edge.",
        image:
          "https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Remote northern coastline and cliffs",
        align: "left",
      },
      {
        number: "04",
        name: "South Coast",
        shortName: "South Coast",
        description:
          "Waterfalls, black-sand beaches, glaciers, and volcanic horizons make the classic scenic route feel cinematic in late summer.",
        image:
          "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Icelandic black sand coast with dramatic mountains",
        align: "right",
      },
    ],
    detailPage: "/explore/iceland",
  },
  {
    country: "Guatemala",
    id: "guatemala",
    month: monthlyFeature.month,
    year: monthlyFeature.year,
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
        name: "Lake Atitlan",
        shortName: "Lake Atitlan",
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
    month: monthlyFeature.month,
    year: monthlyFeature.year,
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
        name: "Bunol",
        shortName: "Bunol",
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
          "Valencia adds the broader city rhythm around Bunol: Mediterranean evenings, food culture, and easy event access.",
        image:
          "https://images.unsplash.com/photo-1606768666853-403c90a981ad?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Valencia architecture and reflecting water",
        align: "right",
      },
      {
        number: "03",
        name: "Malaga",
        shortName: "Malaga",
        description:
          "Feria de Malaga brings a second August festival mood, with city streets, music, and coastal summer energy.",
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
