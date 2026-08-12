import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";

import type {
  CommunityTip,
  DestinationData,
  DestinationEvent,
  InfoSection,
  JourneyPlace,
  LocalPhrase,
} from "@/components/explore/destinationData";
import { FloatingAiAssistant } from "@/components/explore/FloatingAiAssistant";
import {
  CommunityTipSubmission,
  EventSubmission,
} from "@/components/explore/SubmissionActions";

type DestinationPageProps = {
  destination: DestinationData;
};

export function DestinationPage({ destination }: DestinationPageProps) {
  return (
    <main className="bg-[#fbf8f2] text-[#3f342f]">
      <DestinationHero destination={destination} />
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8 lg:pb-32 lg:pt-16">
        <div className="space-y-24 lg:space-y-28">
          <TravelSnapshot destination={destination} />
          <CuratedJourney destination={destination} />
          <GoodToKnow
            phrases={destination.localPhrases}
            phrasesTitle={destination.localPhrasesTitle}
            sections={destination.goodToKnow}
          />
          <EventsSection destination={destination} />
        </div>
      </div>
      <FloatingAiAssistant
        country={destination.country}
        flag={destination.flag}
        itineraryFields={destination.itineraryFields}
        variant="icon"
      />
    </main>
  );
}

function DestinationHero({ destination }: DestinationPageProps) {
  const heroMeta =
    destination.destinationType === "searched"
      ? `${destination.month} ${destination.year} / Destination Search`
      : `${destination.month} ${destination.year} / ${destination.featuredCategory}`;

  return (
    <section className="px-5 pb-8 pt-10 sm:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[430px] overflow-hidden bg-[#d9c0b3] sm:min-h-[540px] lg:min-h-[620px]">
          <Image
            alt={destination.heroImageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, calc(100vw - 40px)"
            src={destination.heroImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.03),rgba(50,40,35,0.46))]" />
        </div>
        <div className="mx-auto max-w-4xl border-x border-b border-[#dfc9be] bg-[#f6eee6] px-6 py-10 text-center sm:px-12 lg:px-16 lg:py-12">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#a16f61]">
            {heroMeta}
          </p>
          <h1 className="mt-4 font-serif text-6xl leading-none text-[#3f342f] sm:text-7xl lg:text-8xl">
            {destination.country}
          </h1>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-[#594840] sm:text-4xl">
            {destination.heroTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6e5a52] sm:text-base">
            {destination.intro}
          </p>
        </div>
      </div>
    </section>
  );
}

function TravelSnapshot({ destination }: DestinationPageProps) {
  const items = destination.snapshot.map((item) => {
    if (item.label === "Currency") {
      return {
        ...item,
        value: `${destination.currency.name} (${destination.currency.code})`,
      };
    }

    if (item.label === "Daily Budget") {
      return {
        ...item,
        value: destination.averageDailyBudget.value,
        note: destination.averageDailyBudget.note,
      };
    }

    return item;
  });

  return (
    <section className="bg-[#efe1d8] px-5 py-9 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#9b6b5f]">
          Quick Travel Snapshot
        </p>
        <div className="mt-8 grid gap-x-6 gap-y-7 sm:grid-cols-2 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a7a70]">
                {item.label}
              </p>
              <p className="mt-2 font-serif text-lg leading-tight text-[#463934]">
                {item.value}
              </p>
              {"note" in item ? (
                <p className="mx-auto mt-1 max-w-[11rem] text-[10px] leading-4 text-[#9a7a70]">
                  {item.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CuratedJourney({ destination }: DestinationPageProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
          {destination.journeyEyebrow ?? "Curated Journey"}
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
          {destination.journeyTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#746158]">
          {destination.journeyIntro}
        </p>
      </div>

      <JourneyPath />

      <div className="relative z-10 mt-12 space-y-12 md:space-y-14">
        {destination.journeyPlaces.map((place) => (
          <JourneyPlaceSection key={place.name} place={place} />
        ))}
      </div>
    </section>
  );
}

function JourneyPlaceSection({ place }: { place: JourneyPlace }) {
  const image = <JourneyPlaceImage place={place} />;
  const copy = <JourneyPlaceCopy place={place} />;

  return (
    <section className="border-y border-[#e6d5cb] bg-[#fffaf3]/45 px-4 py-5 sm:px-5 lg:px-6">
      <article className="grid items-start gap-5 md:grid-cols-[minmax(230px,320px)_minmax(0,1fr)] md:gap-7">
        {place.align === "left" ? (
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
      <PlaceCommunityTips placeName={place.name} tips={place.communityTips} />
    </section>
  );
}

function JourneyPlaceImage({ place }: { place: JourneyPlace }) {
  return (
    <figure className="relative aspect-[4/3] overflow-hidden border border-[#dfc9be] bg-[#e6d3c9] shadow-lg shadow-[#b99686]/10">
      <Image
        alt={place.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        sizes="(min-width: 1024px) 320px, (min-width: 768px) 34vw, calc(100vw - 58px)"
        src={place.image}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.02),rgba(72,55,48,0.18))]" />
    </figure>
  );
}

function JourneyPlaceCopy({ place }: { place: JourneyPlace }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.26em] text-[#c09886]">
        {place.number} / {place.region}
      </p>
      <h3 className="mt-2 font-serif text-3xl leading-none text-[#4e3f39] sm:text-4xl">
        {place.name}
      </h3>
      <p className="mt-3 text-xs leading-5 text-[#6f5b53] sm:text-sm sm:leading-6">
        {place.story}
      </p>
      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {place.facts.map((fact) => (
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
      <div className="mt-5 border-t border-[#e4d0c6] pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]">
          Local Vibe Notes
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {place.localVibe.map((note) => (
            <li
              className="border-l border-[#d8b7aa] pl-3 text-[11px] leading-5 text-[#6f5b53]"
              key={note}
            >
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function JourneyPath() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-36 z-0 hidden h-[1220px] w-full text-[#c8a598] opacity-75 md:block"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 850 1220"
    >
      <path
        d="M95 165 C 248 44, 560 88, 686 214 C 790 318, 690 426, 520 430 C 332 435, 170 356, 106 476 C 28 622, 230 742, 464 704 C 684 668, 754 804, 612 928 C 492 1033, 284 992, 164 1084"
        stroke="currentColor"
        strokeDasharray="3 8"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
      <circle cx="95" cy="165" fill="#b87666" r="3" />
      <circle cx="520" cy="430" fill="#b87666" r="3" />
      <circle cx="464" cy="704" fill="#b87666" r="3" />
      <circle cx="164" cy="1084" fill="#b87666" r="3" />
    </svg>
  );
}

function PlaceCommunityTips({
  placeName,
  tips,
}: {
  placeName: string;
  tips: CommunityTip[];
}) {
  return (
    <section className="mt-5 border-t border-[#e4d0c6] bg-[#f5ece4] px-3 py-4 sm:px-4">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#9b6b5f]">
            Community Tips
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#443733] sm:text-4xl">
            {placeName} Community Tips
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#a89288]">
          Prototype content
        </p>
      </div>
      <div className="mb-4">
        <CommunityTipSubmission placeName={placeName} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {tips.map((tip) => (
          <article
            className="min-h-[130px] border border-[#dfc9be] bg-[#fffaf3] px-4 py-4"
            key={`${tip.traveler}-${tip.location}`}
          >
            <div className="flex gap-0.5 text-[10px] tracking-[0.08em] text-[#8d6255]">
              <span>*</span>
              <span>*</span>
              <span>*</span>
              <span>*</span>
              <span>*</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6f5b53]">
              &quot;{tip.quote}&quot;
            </p>
            <div className="mt-4 border-t border-[#eadbd2] pt-3 text-[10px] uppercase tracking-[0.14em] text-[#a89288]">
              <p>{tip.location}</p>
              <p className="mt-1 text-[#6f5b53]">
                {tip.traveler} / {tip.rating}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GoodToKnow({
  sections,
  phrases,
  phrasesTitle,
}: {
  sections: InfoSection[];
  phrases: LocalPhrase[];
  phrasesTitle: string;
}) {
  return (
    <section className="border border-[#d8b7aa] bg-[#fffaf3] px-5 py-8 sm:px-7 lg:px-9">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
          Good To Know Before You Go
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl">
          Practical notes before arrival
        </h2>
      </div>
      <div className="mt-8 border-y border-[#eadbd2]">
        {sections.map((section, index) => (
          <article
            className="grid gap-4 border-b border-[#eadbd2] bg-[#fbf8f2] px-5 py-6 last:border-b-0 sm:grid-cols-[4rem_minmax(0,1fr)] sm:px-6"
            key={section.title}
          >
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c09886]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#a16f61]">
                {section.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5b53]">
                {section.content}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 border-t border-[#eadbd2] pt-7">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]">
          {phrasesTitle}
        </p>
        <div className="mt-5 grid gap-px overflow-hidden border border-[#eadbd2] bg-[#eadbd2] sm:grid-cols-2 lg:grid-cols-3">
          {phrases.map((phrase) => (
            <div className="bg-[#fbf8f2] px-4 py-4" key={phrase.english}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a7a70]">
                {phrase.english}
              </p>
              <p className="mt-1 font-serif text-xl leading-tight text-[#463934]">
                {phrase.local}
              </p>
              {phrase.pronunciation ? (
                <p className="mt-1 text-xs leading-5 text-[#8d6255]">
                  {phrase.pronunciation}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventsSection({ destination }: DestinationPageProps) {
  return (
    <section className="rounded-[6px] border border-[#7c563f] bg-[linear-gradient(135deg,#7a4f35,#b1805c_45%,#6f452f)] p-4 shadow-2xl shadow-[#7d584e]/25 sm:p-5 lg:p-6">
      <div className="border border-[#b78963] bg-[#f4e5cf] px-5 py-7 shadow-inner shadow-[#6f452f]/20 sm:px-8 lg:px-10">
        <div className="border-y border-[#7d584e] py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#7d584e]">
            Local Vibe Events
          </p>
          <h2 className="mt-2 font-serif text-5xl leading-none text-[#4a3227] sm:text-6xl">
            {destination.country}
          </h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#7d584e]">
            Upcoming
          </p>
          <div className="mt-4">
            <EventSubmission country={destination.country} />
          </div>
        </div>
        <div className="mt-7 space-y-4">
          {destination.events.map((event, index) => (
            <EventCard event={event} index={index} key={event.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({
  event,
  index,
}: {
  event: DestinationEvent;
  index: number;
}) {
  return (
    <article className="grid gap-4 border border-[#9c7357] bg-[#fbf3e6] p-3 shadow-sm shadow-[#7d584e]/15 sm:grid-cols-[126px_minmax(0,1fr)_auto] sm:items-center">
      <div className="relative min-h-[108px] overflow-hidden border border-[#b58b6e] bg-[#dec7ae]">
        <Image
          alt={event.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          fill
          sizes="126px"
          src={event.image}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9b6b5f]">
          Event 0{index + 1}
        </p>
        <h3 className="mt-1 font-serif text-2xl leading-tight text-[#443733] sm:text-3xl">
          {event.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-[#7b665e]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#9b6b5f]" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#9b6b5f]" />
            {event.location}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#6f5b53]">
          {event.description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
        <span className="inline-flex rounded-full border border-[#9c7357] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#7d584e]">
          {event.category}
        </span>
        <button
          className="inline-flex rounded-full border border-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5a3b2d] sm:mt-4"
          type="button"
        >
          Info
        </button>
      </div>
    </article>
  );
}
