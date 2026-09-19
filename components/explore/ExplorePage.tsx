import Image from "next/image";
import Link from "next/link";

import { ExploreSearchForm } from "@/components/explore/ExploreSearchForm";
import { FloatingAiAssistant } from "@/components/explore/FloatingAiAssistant";
import { getCuratedPlaceContent } from "@/components/explore/curatedPlaceContent";
import {
  getCuratedCountryHeroImage,
  getCuratedPlaceImage,
} from "@/components/explore/curatedPlaceImages";
import type {
  BackendFeaturedDestination,
  BackendFeaturedDestinationsResponse,
  BackendFeaturedPlace,
} from "@/lib/destinationApi";

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
      <FloatingAiAssistant country="Local Vibe" variant="icon" />
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
            Monthly Destination Picks
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
          : country.heroImage;

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

const fallbackMonthlyFeature: MonthlyFeature = {
  month: monthNames[new Date().getMonth()],
  year: String(new Date().getFullYear()),
  description:
    "Three destinations selected for the current month from CoVoyage destination intelligence.",
};

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

const countryRecommendationCopy: Record<string, string> = {
  argentina:
    "Argentina is a strong pick this month if you want expressive city life, wine country, and big landscapes in one route. Buenos Aires gives the trip food, tango, and neighborhood texture, while Mendoza and Patagonia-style extensions can make the journey feel expansive without needing every day to be packed.",
  canada:
    "Canada works well this month for travelers who want outdoor scale with reliable visitor infrastructure. National parks, lake routes, and city bases are especially appealing when longer days support hikes, scenic drives, and relaxed evenings, though popular park access should still be planned early.",
  france:
    "France is especially rewarding this month if you want culture, food, and regional variety without treating the trip as one city only. Paris can anchor museums and neighborhoods, while Provence, the Riviera, or wine regions add markets, villages, and slower seasonal days.",
  guatemala:
    "Guatemala stands out for a value-rich trip through colonial streets, volcanic lake scenery, Maya heritage, and market culture. It is a good month for travelers who want the route to feel layered, with Antigua, Lake Atitlan, and northern ruins each adding a different pace.",
  iceland:
    "Iceland is a compelling choice this month because late summer keeps scenic routes more reachable than much of the year. Long daylight, Highlands access, waterfalls, black-sand beaches, and glacier landscapes make it easier to build a road trip around nature rather than weather logistics alone.",
  indonesia:
    "Indonesia is a good choice this month for travelers who want island culture, food, temples, and water-based days. Bali and Java can combine rice terraces, local rituals, markets, and coastal downtime, while careful routing helps avoid turning the archipelago into rushed transfers.",
  italy:
    "Italy is rewarding this month for warm city evenings, art, food, and regional routes that can mix historic centers with coast or countryside. It can be busier and pricier than some European options, so the best trips balance major sights with slower neighborhood time and advance booking.",
  japan:
    "Japan is a strong seasonal pick for travelers who want summer festivals, food streets, temples, and highly connected city travel. Heat and humidity matter, so the best routes use early starts, indoor breaks, evening neighborhoods, and northern or mountain options when possible.",
  kenya:
    "Kenya is compelling this month for wildlife-focused travelers, with safari routes, conservancies, and coastal extensions offering very different textures. Planning with reputable guides and park guidance matters, but the payoff is a route built around landscapes and animal movement rather than checklist sightseeing.",
  mexico:
    "Mexico works well this month for travelers who want food, archaeology, city neighborhoods, and coastal or highland variety. Routes can pair Mexico City or Oaxaca with ruins, markets, and regional cooking, while weather and altitude should shape the daily pace.",
  morocco:
    "Morocco is a strong recommendation this month for travelers drawn to medinas, craft traditions, desert-edge landscapes, and layered city stays. The best routes leave time for slower navigation, tea stops, markets, and cooler morning or evening exploration.",
  "new-zealand":
    "New Zealand is best approached this month as a nature-forward trip with strong planning around weather and driving distances. Even outside the warmest summer window, scenic roads, Maori cultural context, coastal towns, and national parks can create a memorable route when logistics are realistic.",
  norway:
    "Norway is a rewarding pick this month for fjords, rail journeys, coastal cities, and mountain scenery. Long daylight and outdoor access make scenic days feel generous, though ferries, tunnels, weather, and high local costs are worth building into the plan.",
  peru:
    "Peru is especially appealing this month for travelers who want archaeology, Andes culture, markets, and dramatic landscapes. Cusco, the Sacred Valley, and Machu Picchu can form a strong route, but altitude makes slower first days and careful ticket planning part of the experience.",
  portugal:
    "Portugal is a strong this-month choice for walkable cities, Atlantic coast, food, and relative value compared with many Western European trips. Lisbon and Porto pair well with day trips, tiled streets, seafood, and slower neighborhood evenings.",
  "south-africa":
    "South Africa works well this month for travelers who want a varied route across Cape Town, wine regions, coastal drives, and wildlife experiences. The country rewards practical planning, but it offers unusual range in a single trip, from city culture to national parks.",
  spain:
    "Spain is a lively pick this month for travelers who want festivals, late evenings, regional food, and city-to-coast variety. Heat can shape the schedule, so the strongest trips use mornings for sights, afternoons for rest, and evenings for markets, tapas, and local celebrations.",
  thailand:
    "Thailand is a strong option this month for travelers who want temples, street food, markets, islands, and warm hospitality. Weather can vary by coast, so a good route chooses regions deliberately and leaves room for slower meals, local transport, and temple etiquette.",
  turkey:
    "Turkey is especially rewarding this month for travelers who want Istanbul's layered history, coastal towns, Cappadocia landscapes, and generous food culture. Itineraries work best when they leave space for markets, ferries, tea breaks, and early starts at major sites.",
  vietnam:
    "Vietnam is a strong pick this month for street food, rail-linked cities, old towns, river landscapes, and coastal breaks. A good route balances Hanoi or Ho Chi Minh City energy with Hoi An, Hue, or northern scenery so the trip feels paced rather than rushed.",
};

function getMonthName(month: number) {
  return monthNames[month - 1] ?? fallbackMonthlyFeature.month;
}

function formatRank(rank: number) {
  return String(rank).padStart(2, "0");
}

function getVisiblePlaces(country: FeaturedCountry) {
  return country.places;
}

function getCountryRecommendationCopy(destination: BackendFeaturedDestination) {
  const countryId = destination.country_slug;

  return (
    countryRecommendationCopy[countryId] ??
    `${destination.country_name ?? destination.country?.name ?? "This destination"} is a strong monthly pick for travelers who want a well-rounded route shaped by season, local culture, practical access, and memorable places. Build the trip around the strongest current experiences, then leave room for local pacing and regional differences.`
  );
}

function joinReadableList(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function buildPlaceItineraryDescription(place: BackendFeaturedPlace) {
  const curatedContent = getCuratedPlaceContent(place.place_slug);

  if (curatedContent) {
    return curatedContent.journeyDescription;
  }

  const name = place.place_name ?? place.place_slug;
  const duration = place.place?.time_required ?? "2-3 days";
  const description = place.place?.description ?? place.place?.story;
  const highlights = place.place?.highlights?.slice(0, 3);
  const highlightText = highlights?.length
    ? ` Include ${joinReadableList(highlights)}.`
    : "";
  const descriptionText = description ? ` ${description}` : "";

  return `Spend ${duration} in ${name}.${descriptionText}${highlightText}`.trim();
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
  const month = getMonthName(snapshot.month);
  const year = String(snapshot.year);
  const countries = snapshot.destinations.slice(0, 3).map((destination) => {
    const countryId = destination.country_slug;
    const fallback = fallbackBySlug.get(countryId);
    const backendPlaces = destination.recommended_places ?? destination.selected_places ?? [];
    const curatedHeroImage = getCuratedCountryHeroImage(countryId);
    const fallbackPlacesBySlug = new Map(
      (fallback?.places ?? []).map((place) => [
        place.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        place,
      ]),
    );
    const baseCountry: FeaturedCountry =
      fallback ?? {
        country:
          destination.country_name ??
          destination.country?.name ??
          countryId
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
        id: countryId,
        month,
        year,
        featuredCategory: "Monthly Pick",
        featuredHeadline: "A strong CoVoyage recommendation for this month",
        whyThisMonth: getCountryRecommendationCopy(destination),
        heroImage:
          destination.country?.hero_media?.url ??
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88",
        heroImageAlt:
          destination.country?.hero_media?.alt ??
          destination.country?.hero_media?.alt_text ??
          `${destination.country_name ?? countryId} travel scene`,
        places: [],
        detailPage: `/explore/${countryId}`,
      };

    return {
      ...baseCountry,
      country: destination.country_name ?? destination.country?.name ?? baseCountry.country,
      month,
      year,
      featuredCategory: baseCountry.featuredCategory,
      heroImage: curatedHeroImage?.image ?? baseCountry.heroImage,
      heroImageAlt: curatedHeroImage?.imageAlt ?? baseCountry.heroImageAlt,
      whyThisMonth: getCountryRecommendationCopy(destination),
      places: backendPlaces.map((place, index) => {
        const placeSlug = place.place_slug;
        const fallbackPlace = fallbackPlacesBySlug.get(placeSlug) ?? baseCountry.places[index];
        const curatedImage = getCuratedPlaceImage(placeSlug);

        return {
          ...(fallbackPlace ?? {
            align: index % 2 === 0 ? "left" : "right",
          }),
          image:
            curatedImage?.image ??
            fallbackPlace?.image ??
            place.media?.url ??
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=86",
          imageAlt:
            curatedImage?.imageAlt ??
            fallbackPlace?.imageAlt ??
            place.media?.alt ??
            place.media?.alt_text ??
            `${place.place_name ?? place.place_slug} travel scene`,
          number: formatRank(place.rank),
          name: place.place_name ?? fallbackPlace?.name ?? place.place_slug,
          shortName: place.place_name ?? fallbackPlace?.shortName ?? place.place_slug,
          description: buildPlaceItineraryDescription(place),
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
