import {
  CalendarDays,
  ChevronDown,
  Clock,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { DestinationSectionNav } from "@/components/explore/DestinationSectionNav";
import { FloatingAiAssistant } from "@/components/explore/FloatingAiAssistant";

type SnapshotItem = {
  label: string;
  value: string;
};

type JourneyFact = {
  label: string;
  value: string;
};

type JourneyStop = {
  name: string;
  region: string;
  story: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
  facts: JourneyFact[];
};

type CommunityTipGroup = {
  city: string;
  tips: string[];
};

type VibeNote = {
  title: string;
  body: string;
};

type LocalEvent = {
  title: string;
  category: string;
  city: string;
  date: string;
  time: string;
  description: string;
  image: string;
  imageAlt: string;
  organizer: string;
  organizerAvatar: string;
  joined: string;
};

export function JapanDestinationPage() {
  return (
    <main className="bg-[#fbf8f2] text-[#3f342f]">
      <JapanHero />
      <DestinationSectionNav sections={destinationSections} />
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8 lg:pb-32 lg:pt-16">
        <div className="min-w-0 space-y-24 lg:space-y-28">
          <SectionAnchor id="snapshot">
            <TravelSnapshot />
          </SectionAnchor>
          <SectionAnchor id="featured-cities">
            <CuratedJourney />
          </SectionAnchor>
          <SectionAnchor id="local-events">
            <LocalEvents />
          </SectionAnchor>
          <SectionAnchor id="culture-etiquette">
            <AiLocalVibe />
          </SectionAnchor>
          <SectionAnchor id="essential-info">
            <RequiredDocuments />
          </SectionAnchor>
          <SectionAnchor id="itinerary-generator">
            <AiItineraryGeneratorPlaceholder />
          </SectionAnchor>
        </div>
      </div>
      <FloatingAiAssistant country="Japan" flag="🇯🇵" />
    </main>
  );
}

function SectionAnchor({ children, id }: { children: ReactNode; id: string }) {
  return (
    <div className="scroll-mt-40" id={id}>
      {children}
    </div>
  );
}

function JapanHero() {
  return (
    <section className="px-5 pb-8 pt-10 sm:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[430px] overflow-hidden bg-[#d9c0b3] sm:min-h-[540px] lg:min-h-[620px]">
          <Image
            alt="Snow-dusted Japanese temple surrounded by warm autumn trees"
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, calc(100vw - 40px)"
            src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=88"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.03),rgba(50,40,35,0.42))]" />
        </div>
        <div className="mx-auto max-w-4xl border-x border-b border-[#dfc9be] bg-[#f6eee6] px-6 py-10 text-center sm:px-12 lg:px-16 lg:py-12">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#a16f61]">
            Destination Intelligence
          </p>
          <h1 className="mt-4 font-serif text-6xl leading-none text-[#3f342f] sm:text-7xl lg:text-8xl">
            Japan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6e5a52] sm:text-base">
            A journey into serenity and contrast, moving through temple
            mornings, neon food streets, and northern landscapes shaped by
            season, ritual, and quiet local grace.
          </p>
        </div>
      </div>
    </section>
  );
}

function TravelSnapshot() {
  return (
    <section className="bg-[#efe1d8] px-5 py-9 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#9b6b5f]">
          Quick Travel Snapshot
        </p>
        <div className="mt-8 grid gap-x-6 gap-y-7 sm:grid-cols-2 md:grid-cols-5">
          {snapshotItems.map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a7a70]">
                {item.label}
              </p>
              <p className="mt-2 font-serif text-lg leading-tight text-[#463934]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CuratedJourney() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
          Curated Journey
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
          Kyoto to Hokkaido
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#746158]">
          A three-stop editorial route designed for culture, food, nature, and
          the quiet details that make Japan feel deeply local.
        </p>
      </div>

      <JapanTravelPath />

      <div className="relative z-10 mt-12 space-y-12 md:space-y-14">
        {journeyStops.map((stop, index) => (
          <JourneyCitySection index={index} key={stop.name} stop={stop} />
        ))}
      </div>
    </section>
  );
}

function JourneyCitySection({
  stop,
  index,
}: {
  stop: JourneyStop;
  index: number;
}) {
  return (
    <section className="border-y border-[#e6d5cb] bg-[#fffaf3]/45 px-4 py-5 sm:px-5 lg:px-6">
      <JourneyStopFeature index={index} stop={stop} />
      <CityCommunityTips city={stop.name} />
    </section>
  );
}

function JourneyStopFeature({
  stop,
  index,
}: {
  stop: JourneyStop;
  index: number;
}) {
  const image = <JourneyStopImage stop={stop} />;
  const copy = <JourneyStopCopy index={index} stop={stop} />;

  return (
    <article className="grid items-start gap-5 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] md:gap-7">
      {stop.align === "left" ? (
        <>
          {image}
          {copy}
        </>
      ) : (
        <>
          <div className="md:order-2">{image}</div>
          <div className="md:order-1">{copy}</div>
        </>
      )}
    </article>
  );
}

function JourneyStopImage({ stop }: { stop: JourneyStop }) {
  return (
    <figure className="relative aspect-[4/3] overflow-hidden border border-[#dfc9be] bg-[#e6d3c9] shadow-lg shadow-[#b99686]/10">
      <Image
        alt={stop.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        sizes="(min-width: 1024px) 300px, (min-width: 768px) 34vw, calc(100vw - 58px)"
        src={stop.image}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.02),rgba(72,55,48,0.18))]" />
    </figure>
  );
}

function JourneyStopCopy({
  stop,
  index,
}: {
  stop: JourneyStop;
  index: number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.26em] text-[#c09886]">
        0{index + 1} / {stop.region}
      </p>
      <h3 className="mt-2 font-serif text-3xl leading-none text-[#4e3f39] sm:text-4xl">
        {stop.name}
      </h3>
      <p className="mt-3 text-xs leading-5 text-[#6f5b53] sm:text-sm sm:leading-6">
        {stop.story}
      </p>
      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {stop.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]">
              {fact.label}
            </dt>
            <dd className="mt-1 text-xs leading-5 text-[#4f413c] sm:text-sm">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function JapanTravelPath() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-36 z-0 hidden h-[1060px] w-full text-[#c8a598] opacity-75 md:block"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 850 1060"
    >
      <path
        d="M95 165 C 248 44, 560 88, 686 214 C 790 318, 690 426, 520 430 C 332 435, 170 356, 106 476 C 28 622, 230 742, 464 704 C 684 668, 754 804, 612 928 C 492 1033, 284 992, 164 884"
        stroke="currentColor"
        strokeDasharray="3 8"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
      <circle cx="95" cy="165" fill="#b87666" r="3" />
      <circle cx="520" cy="430" fill="#b87666" r="3" />
      <circle cx="612" cy="928" fill="#b87666" r="3" />
    </svg>
  );
}

function CityCommunityTips({ city }: { city: string }) {
  const group = communityTips.find((tipGroup) => tipGroup.city === city);

  if (!group) {
    return null;
  }

  return (
    <section
      aria-labelledby={`${city.toLowerCase()}-community-tips`}
      className="mt-5 border-t border-[#e4d0c6] bg-[#f5ece4] px-3 py-4 sm:px-4"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <h4
          className="font-serif text-lg leading-tight text-[#4e3f39] sm:text-xl"
          id={`${city.toLowerCase()}-community-tips`}
        >
          {city} Community Tips
        </h4>
        <div className="hidden items-center gap-2 text-[#9b6b5f] sm:flex">
          <span className="grid h-7 w-7 place-items-center border border-[#d8b7aa] text-sm">
            &lt;
          </span>
          <span className="grid h-7 w-7 place-items-center border border-[#d8b7aa] text-sm">
            &gt;
          </span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {group.tips.map((tip) => (
          <article
            className="min-h-[92px] border border-[#dfc9be] bg-[#fffaf3] px-3 py-3"
            key={tip}
          >
            <div className="flex gap-0.5 text-[10px] tracking-[0.08em] text-[#8d6255]">
              <span>*</span>
              <span>*</span>
              <span>*</span>
              <span>*</span>
              <span>*</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#6f5b53]">{tip}</p>
            <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-[#a89288]">
              <span>Local note</span>
              <span>Save</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LocalEvents() {
  return (
    <section>
      <div className="rounded-[6px] border border-[#d7b8a8] bg-[#f0e0d5] p-3 shadow-2xl shadow-[#b99686]/20">
        <div className="rounded-[5px] border border-[#caa895] bg-[#fbf4eb] px-4 py-6 sm:px-6 lg:px-7">
          <div className="flex flex-col gap-6 border-b border-[#d9c0b3] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#9b6b5f]">
                Local Vibe Events
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
                Local Events
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#746158]">
                Small-group gatherings across Japan, chosen for neighborhood
                texture, seasonal rituals, and the kind of details travelers
                remember.
              </p>
            </div>

            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#332a26] px-6 text-xs font-medium uppercase tracking-[0.18em] text-[#fffaf3] shadow-lg shadow-[#5f4035]/20 transition-colors hover:bg-[#5c4038]"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {eventFilters.map((filter) => (
              <button
                className="flex h-11 items-center justify-between rounded-full border border-[#d8b7aa] bg-[#fffaf3] px-4 text-left text-xs font-medium uppercase tracking-[0.14em] text-[#6f5b53] shadow-sm shadow-[#b99686]/10"
                key={filter}
                type="button"
              >
                {filter}
                <ChevronDown className="h-4 w-4 text-[#9b6b5f]" />
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {localEvents.map((event) => (
              <LocalEventRow event={event} key={event.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalEventRow({ event }: { event: LocalEvent }) {
  return (
    <article className="grid overflow-hidden rounded-[8px] border border-[#d7b8a8] bg-[#fffaf3] shadow-xl shadow-[#b99686]/15 md:grid-cols-[40%_60%]">
      <figure className="relative min-h-[260px] bg-[#e6d3c9] md:min-h-[340px]">
        <Image
          alt={event.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 40vw, calc(100vw - 56px)"
          src={event.image}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.02),rgba(57,43,37,0.2))]" />
      </figure>

      <div className="flex min-w-0 flex-col px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#caa895] bg-[#f0e0d5] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7d584e]">
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#8a6c61]">
            <MapPin className="h-3.5 w-3.5" />
            {event.city}
          </span>
        </div>

        <h3 className="mt-4 font-serif text-3xl leading-tight text-[#443733] sm:text-4xl">
          {event.title}
        </h3>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em] text-[#7b665e]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#9b6b5f]" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#9b6b5f]" />
            {event.time}
          </span>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6f5b53]">
          {event.description}
        </p>

        <div className="mt-6 flex flex-col gap-5 border-t border-[#eadbd2] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              alt={`${event.organizer} avatar`}
              className="h-10 w-10 rounded-full border border-[#d8b7aa] object-cover"
              height={40}
              src={event.organizerAvatar}
              width={40}
            />
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#a16f61]">
                Organized by
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#4f413c]">
                {event.organizer}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#7b665e]">
            <Users className="h-4 w-4 text-[#9b6b5f]" />
            {event.joined} joined
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#b99686] px-5 text-xs font-medium uppercase tracking-[0.16em] text-[#5f4d47] transition-colors hover:bg-[#f0e0d5]"
            type="button"
          >
            View Details
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#7d584e] px-5 text-xs font-medium uppercase tracking-[0.16em] text-[#fffaf3] shadow-lg shadow-[#7d584e]/20 transition-colors hover:bg-[#5f4038]"
            type="button"
          >
            Join Event
          </button>
        </div>
      </div>
    </article>
  );
}

function AiLocalVibe() {
  return (
    <section className="border border-[#d8b7aa] bg-[#fbf8f2] p-3">
      <div className="border border-[#e8d5ca] px-6 py-10 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
            AI Local Vibe
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
            A kinder way to read the room
          </h2>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {vibeNotes.map((note) => (
            <article key={note.title}>
              <h3 className="font-serif text-2xl text-[#4e3f39]">
                {note.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5b53]">
                {note.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RequiredDocuments() {
  return (
    <section>
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
          Required Documents
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
          Prepared Before Departure
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#746158]">
          Static planning placeholders for now, ready to become
          country-specific guidance when the destination intelligence layer is
          connected.
        </p>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {requiredDocuments.map((document) => (
          <div
            className="border-l border-[#d8b7aa] bg-[#fffaf3] px-5 py-5"
            key={document}
          >
            <p className="font-serif text-xl text-[#4e3f39]">{document}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AiItineraryGeneratorPlaceholder() {
  return (
    <section className="border border-[#d8b7aa] bg-[#efe1d8] px-6 py-8 sm:px-8 lg:px-10">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
          AI Itinerary Generator
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
          Build Around Your Japan Rhythm
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#746158]">
          A dedicated itinerary planning space for budget, duration, and travel
          interests.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {itineraryFields.map((field) => (
          <label
            className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
            key={field.label}
          >
            {field.label}
            <input
              className="mt-2 h-12 w-full border border-[#d8b7aa] bg-[#fffaf3] px-4 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
              placeholder={field.placeholder}
              readOnly
              type="text"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

const destinationSections = [
  { id: "snapshot", label: "Snapshot" },
  { id: "featured-cities", label: "Featured Cities" },
  { id: "local-events", label: "Local Events" },
  { id: "culture-etiquette", label: "Culture & Etiquette" },
  { id: "essential-info", label: "Essential Travel Info" },
  { id: "itinerary-generator", label: "AI Itinerary" },
];

const snapshotItems: SnapshotItem[] = [
  { label: "Currency", value: "Japanese Yen" },
  { label: "Language", value: "Japanese" },
  { label: "Visa Requirement", value: "Varies by passport" },
  { label: "Time Zone", value: "JST, UTC +9" },
  { label: "Best Season", value: "Spring or autumn" },
  { label: "Average Daily Budget", value: "$120-220" },
  { label: "Emergency Number", value: "110 / 119" },
  { label: "Plug Type", value: "Type A / B" },
  { label: "Local SIM availability", value: "Airport or eSIM" },
  { label: "Weather overview", value: "Four-season climate" },
];

const journeyStops: JourneyStop[] = [
  {
    name: "Kyoto",
    region: "Temple Mornings",
    story:
      "Begin in quiet lanes where incense, cedar gates, riverside paths, and small tea houses make the old capital feel intimate before the crowds arrive.",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=86",
    imageAlt: "Traditional Japanese temple framed by warm seasonal foliage",
    align: "left",
    facts: [
      { label: "Why visit", value: "Temples, tea culture, and old streets" },
      { label: "Best season", value: "March-May, October-November" },
      { label: "Time required", value: "3-4 days" },
      { label: "Local food", value: "Kaiseki, yudofu, matcha sweets" },
    ],
  },
  {
    name: "Osaka",
    region: "Food Street Glow",
    story:
      "Move into generous night markets, bright canal reflections, tiny counter seats, and neighborhoods where food becomes the easiest way to meet the city.",
    image:
      "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1400&q=86",
    imageAlt: "Osaka city street glowing with signs at night",
    align: "right",
    facts: [
      { label: "Why visit", value: "Street food, nightlife, and warm energy" },
      { label: "Best season", value: "April-June, September-November" },
      { label: "Time required", value: "2-3 days" },
      { label: "Local food", value: "Takoyaki, okonomiyaki, kushikatsu" },
    ],
  },
  {
    name: "Hokkaido",
    region: "Northern Air",
    story:
      "Finish in wide northern scenery, from flower fields and volcanic lakes to powder snow towns where the pace softens into open space.",
    image:
      "https://images.unsplash.com/photo-1532236204992-f5e85c024202?auto=format&fit=crop&w=1400&q=86",
    imageAlt: "Snowy Hokkaido landscape with travelers walking across open ground",
    align: "left",
    facts: [
      { label: "Why visit", value: "Landscapes, hot springs, and slow drives" },
      { label: "Best season", value: "July-August or December-February" },
      { label: "Time required", value: "4-6 days" },
      { label: "Local food", value: "Miso ramen, seafood, dairy desserts" },
    ],
  },
];

const communityTips: CommunityTipGroup[] = [
  {
    city: "Kyoto",
    tips: [
      "Start temple visits early, then save late afternoon for smaller lanes around Higashiyama.",
      "Carry cash for tea houses, shrine shops, and older family-run restaurants.",
      "Keep voices low on residential streets, especially around geisha districts.",
    ],
  },
  {
    city: "Osaka",
    tips: [
      "Dotonbori is brightest at night, but side streets nearby are better for calmer meals.",
      "Stand to the right on escalators here, unlike Tokyo's usual left-side habit.",
      "Try counter seating when available; it is often friendlier than it looks.",
    ],
  },
  {
    city: "Hokkaido",
    tips: [
      "Distances are bigger than they appear, so avoid packing too many stops into one day.",
      "Reserve popular farm, flower field, and winter transport options ahead of time.",
      "Layers matter even in summer because evenings can cool quickly outside Sapporo.",
    ],
  },
];

const vibeNotes: VibeNote[] = [
  {
    title: "Etiquette",
    body:
      "Small gestures carry weight. Queue carefully, avoid phone calls on trains, and treat public spaces as shared quiet rather than personal overflow.",
  },
  {
    title: "Culture",
    body:
      "Seasonality shapes daily life, from sweets and flowers to festivals and train posters. Noticing the season is part of noticing Japan.",
  },
  {
    title: "What tourists miss",
    body:
      "Convenience stores, station food halls, and neighborhood bathhouses can be as revealing as major landmarks when approached with curiosity.",
  },
  {
    title: "Useful behaviour",
    body:
      "Have a small towel, sort trash patiently, keep coins handy, and learn simple phrases for thanks, greetings, and apologies.",
  },
];

const eventFilters = ["All Cities", "Category", "Date", "Sort"];

const localEvents: LocalEvent[] = [
  {
    title: "Tokyo Cherry Blossom Walk",
    category: "Seasonal Walk",
    city: "Tokyo",
    date: "March 28",
    time: "8:30 AM",
    description:
      "A gentle morning route through canal-side blossoms, quiet neighborhood shrines, and small coffee stops before the parks become crowded.",
    image:
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Cherry blossoms blooming over a calm Japanese walkway",
    organizer: "Aiko Tanaka",
    organizerAvatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80",
    joined: "42 people",
  },
  {
    title: "Kyoto Lantern Festival",
    category: "Culture",
    city: "Kyoto",
    date: "April 12",
    time: "6:45 PM",
    description:
      "Follow lantern-lit lanes with a local host who shares temple etiquette, seasonal sweets, and the stories behind Kyoto's evening rituals.",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Traditional Kyoto temple scene glowing in warm evening light",
    organizer: "Ren Sato",
    organizerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    joined: "31 people",
  },
  {
    title: "Osaka Food Market Crawl",
    category: "Food",
    city: "Osaka",
    date: "April 19",
    time: "7:15 PM",
    description:
      "Taste takoyaki, kushikatsu, and tucked-away counter snacks while moving through bright side streets with a host who knows the best queues.",
    image:
      "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Osaka night street filled with signs and food market energy",
    organizer: "Mika Yamamoto",
    organizerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    joined: "58 people",
  },
  {
    title: "Hokkaido Lavender Field Picnic",
    category: "Nature",
    city: "Furano",
    date: "July 8",
    time: "10:00 AM",
    description:
      "A slow countryside gathering among lavender rows, local dairy treats, and open northern views with plenty of time for photos and quiet wandering.",
    image:
      "https://images.unsplash.com/photo-1532236204992-f5e85c024202?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Hokkaido landscape with wide open seasonal fields",
    organizer: "Daichi Mori",
    organizerAvatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
    joined: "24 people",
  },
];

const requiredDocuments = [
  "Passport",
  "Visa",
  "Travel Insurance",
  "Flight Tickets",
  "Hotel Confirmation",
  "Identification",
  "Vaccination (if applicable)",
  "Currency/Payment advice",
];

const itineraryFields = [
  { label: "Budget", placeholder: "$1800" },
  { label: "Duration", placeholder: "10 days" },
  { label: "Interests", placeholder: "Culture, food, nature" },
];
