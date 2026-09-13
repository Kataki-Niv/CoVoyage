import Image from "next/image";

import type {
  CommunityTip,
  DestinationData,
  InfoSection,
  JourneyPlace,
  LocalPhrase,
} from "@/components/explore/destinationData";
import { CommunityTipsBoard } from "@/components/explore/CommunityTipsBoard";
import { EventsBoard } from "@/components/explore/EventsBoard";
import { FloatingAiAssistant } from "@/components/explore/FloatingAiAssistant";

type DestinationPageProps = {
  destination: DestinationData;
};

export function DestinationPage({ destination }: DestinationPageProps) {
  const isDarkEditorial = true;

  return (
    <main
      className={
        isDarkEditorial
          ? "bg-[#0B0B0C] text-[#F5F1E8]"
          : "bg-[#fbf8f2] text-[#3f342f]"
      }
    >
      <DestinationHero destination={destination} isDarkEditorial={isDarkEditorial} />
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8 lg:pb-32 lg:pt-16">
        <div className="space-y-24 lg:space-y-28">
          <TravelSnapshot
            destination={destination}
            isDarkEditorial={isDarkEditorial}
          />
          <CuratedJourney
            destination={destination}
            isDarkEditorial={isDarkEditorial}
          />
          <GoodToKnow
            isDarkEditorial={isDarkEditorial}
            phrases={destination.localPhrases}
            phrasesTitle={destination.localPhrasesTitle}
            sections={destination.goodToKnow}
          />
          <EventsSection
            destination={destination}
            isDarkEditorial={isDarkEditorial}
          />
        </div>
      </div>
      <FloatingAiAssistant
        country={destination.country}
        countrySlug={destination.key}
        flag={destination.flag}
        itineraryFields={destination.itineraryFields}
        selectedPlaceSlugs={destination.journeyPlaces
          .map((place) => place.placeSlug)
          .filter((placeSlug): placeSlug is string => Boolean(placeSlug))}
        variant="icon"
      />
    </main>
  );
}

function DestinationHero({
  destination,
  isDarkEditorial,
}: DestinationPageProps & { isDarkEditorial: boolean }) {
  const heroMeta =
    destination.destinationType === "searched"
      ? `${destination.month} ${destination.year} / Destination Search`
      : `${destination.month} ${destination.year} / ${destination.featuredCategory}`;

  return (
    <section className="px-5 pb-8 pt-10 sm:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <div
          className={
            isDarkEditorial
              ? "relative min-h-[430px] overflow-hidden bg-[#111112] shadow-2xl shadow-black/35 sm:min-h-[540px] lg:min-h-[620px]"
              : "relative min-h-[430px] overflow-hidden bg-[#d9c0b3] sm:min-h-[540px] lg:min-h-[620px]"
          }
        >
          <Image
            alt={destination.heroImageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, calc(100vw - 40px)"
            src={destination.heroImage}
          />
          <div
            className={
              isDarkEditorial
                ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.06),rgba(5,5,5,0.2)_42%,rgba(11,11,12,0.78))]"
                : "absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.03),rgba(50,40,35,0.46))]"
            }
          />
        </div>
        <div
          className={
            isDarkEditorial
              ? "mx-auto max-w-4xl border-x border-b border-white/10 bg-[#111112]/82 px-6 py-10 text-center shadow-2xl shadow-black/24 backdrop-blur-sm sm:px-12 lg:px-16 lg:py-12"
              : "mx-auto max-w-4xl border-x border-b border-[#dfc9be] bg-[#f6eee6] px-6 py-10 text-center sm:px-12 lg:px-16 lg:py-12"
          }
        >
          <p
            className={
              isDarkEditorial
                ? "text-xs font-medium uppercase tracking-[0.34em] text-[#D8BE8A]"
                : "text-xs font-medium uppercase tracking-[0.34em] text-[#a16f61]"
            }
          >
            {heroMeta}
          </p>
          <h1
            className={
              isDarkEditorial
                ? "mt-4 font-serif text-6xl leading-none text-[#F5F1E8] sm:text-7xl lg:text-8xl"
                : "mt-4 font-serif text-6xl leading-none text-[#3f342f] sm:text-7xl lg:text-8xl"
            }
          >
            {destination.country}
          </h1>
          <h2
            className={
              isDarkEditorial
                ? "mt-4 font-serif text-3xl leading-tight text-[#E8E0D2] sm:text-4xl"
                : "mt-4 font-serif text-3xl leading-tight text-[#594840] sm:text-4xl"
            }
          >
            {destination.heroTitle}
          </h2>
          <p
            className={
              isDarkEditorial
                ? "mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#B8B0A4] sm:text-base"
                : "mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6e5a52] sm:text-base"
            }
          >
            {destination.intro}
          </p>
        </div>
      </div>
    </section>
  );
}

function TravelSnapshot({
  destination,
  isDarkEditorial,
}: DestinationPageProps & { isDarkEditorial: boolean }) {
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
    <section
      className={
        isDarkEditorial
          ? "border border-white/10 bg-[#111112] px-5 py-9 shadow-2xl shadow-black/20 sm:px-8 lg:px-10"
          : "bg-[#efe1d8] px-5 py-9 sm:px-8 lg:px-10"
      }
    >
      <div className="mx-auto max-w-6xl text-center">
        <p
          className={
            isDarkEditorial
              ? "text-xs font-medium uppercase tracking-[0.3em] text-[#D8BE8A]"
              : "text-xs font-medium uppercase tracking-[0.3em] text-[#9b6b5f]"
          }
        >
          Quick Travel Snapshot
        </p>
        <div className="mt-8 grid gap-x-6 gap-y-7 sm:grid-cols-2 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label}>
              <p
                className={
                  isDarkEditorial
                    ? "text-[10px] uppercase tracking-[0.18em] text-[#D8BE8A]/72"
                    : "text-[10px] uppercase tracking-[0.18em] text-[#9a7a70]"
                }
              >
                {item.label}
              </p>
              <p
                className={
                  isDarkEditorial
                    ? "mt-2 font-serif text-lg leading-tight text-[#F5F1E8]"
                    : "mt-2 font-serif text-lg leading-tight text-[#463934]"
                }
              >
                {item.value}
              </p>
              {"note" in item ? (
                <p
                  className={
                    isDarkEditorial
                      ? "mx-auto mt-1 max-w-[11rem] text-[10px] leading-4 text-[#9E9589]"
                      : "mx-auto mt-1 max-w-[11rem] text-[10px] leading-4 text-[#9a7a70]"
                  }
                >
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

function CuratedJourney({
  destination,
  isDarkEditorial,
}: DestinationPageProps & { isDarkEditorial: boolean }) {
  const journeyPlaces = destination.journeyPlaces;

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className={
            isDarkEditorial
              ? "text-xs font-medium uppercase tracking-[0.32em] text-[#D8BE8A]"
              : "text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]"
          }
        >
          {destination.journeyEyebrow ?? "Curated Journey"}
        </p>
        <h2
          className={
            isDarkEditorial
              ? "mt-3 font-serif text-4xl leading-tight text-[#F5F1E8] sm:text-5xl"
              : "mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl"
          }
        >
          {destination.journeyTitle}
        </h2>
        <p
          className={
            isDarkEditorial
              ? "mx-auto mt-4 max-w-xl text-sm leading-7 text-[#B8B0A4]"
              : "mx-auto mt-4 max-w-xl text-sm leading-7 text-[#746158]"
          }
        >
          {destination.journeyIntro}
        </p>
      </div>

      <JourneyPath isDarkEditorial={isDarkEditorial} />

      <div className="relative z-10 mt-12 space-y-12 md:space-y-14">
        {journeyPlaces.map((place) => (
          <JourneyPlaceSection
            countrySlug={destination.key}
            isDarkEditorial={isDarkEditorial}
            key={place.name}
            place={place}
          />
        ))}
      </div>
    </section>
  );
}

function JourneyPlaceSection({
  countrySlug,
  isDarkEditorial,
  place,
}: {
  countrySlug: string;
  isDarkEditorial: boolean;
  place: JourneyPlace;
}) {
  const image = <JourneyPlaceImage isDarkEditorial={isDarkEditorial} place={place} />;
  const copy = <JourneyPlaceCopy isDarkEditorial={isDarkEditorial} place={place} />;

  return (
    <section
      className={
        isDarkEditorial
          ? "border-y border-white/10 bg-[#111112]/56 px-4 py-5 transition-colors duration-300 hover:bg-[#151515]/72 sm:px-5 lg:px-6"
          : "border-y border-[#e6d5cb] bg-[#fffaf3]/45 px-4 py-5 sm:px-5 lg:px-6"
      }
    >
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
      <PlaceCommunityTips
        countrySlug={countrySlug}
        isDarkEditorial={isDarkEditorial}
        placeName={place.name}
        placeSlug={place.placeSlug}
        tips={place.communityTips}
      />
    </section>
  );
}

function JourneyPlaceImage({
  isDarkEditorial,
  place,
}: {
  isDarkEditorial: boolean;
  place: JourneyPlace;
}) {
  return (
    <figure
      className={
        isDarkEditorial
          ? "group relative aspect-[4/3] overflow-hidden border border-white/10 bg-[#151515] shadow-2xl shadow-black/25"
          : "relative aspect-[4/3] overflow-hidden border border-[#dfc9be] bg-[#e6d3c9] shadow-lg shadow-[#b99686]/10"
      }
    >
      <Image
        alt={place.imageAlt}
        className={
          isDarkEditorial
            ? "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            : "absolute inset-0 h-full w-full object-cover"
        }
        fill
        sizes="(min-width: 1024px) 320px, (min-width: 768px) 34vw, calc(100vw - 58px)"
        src={place.image}
      />
      <div
        className={
          isDarkEditorial
            ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.22))]"
            : "absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.02),rgba(72,55,48,0.18))]"
        }
      />
    </figure>
  );
}

function JourneyPlaceCopy({
  isDarkEditorial,
  place,
}: {
  isDarkEditorial: boolean;
  place: JourneyPlace;
}) {
  return (
    <div className="min-w-0">
      <p
        className={
          isDarkEditorial
            ? "text-[11px] uppercase tracking-[0.26em] text-[#D8BE8A]/76"
            : "text-[11px] uppercase tracking-[0.26em] text-[#c09886]"
        }
      >
        {place.number} / {place.region}
      </p>
      <h3
        className={
          isDarkEditorial
            ? "mt-2 font-serif text-3xl leading-none text-[#F5F1E8] sm:text-4xl"
            : "mt-2 font-serif text-3xl leading-none text-[#4e3f39] sm:text-4xl"
        }
      >
        {place.name}
      </h3>
      <p
        className={
          isDarkEditorial
            ? "mt-3 text-xs leading-5 text-[#B8B0A4] sm:text-sm sm:leading-6"
            : "mt-3 text-xs leading-5 text-[#6f5b53] sm:text-sm sm:leading-6"
        }
      >
        {place.story}
      </p>
      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {place.facts.map((fact) => (
          <div key={fact.label}>
            <dt
              className={
                isDarkEditorial
                  ? "text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/78"
                  : "text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]"
              }
            >
              {fact.label}
            </dt>
            <dd
              className={
                isDarkEditorial
                  ? "mt-1 text-xs leading-5 text-[#E8E0D2] sm:text-sm"
                  : "mt-1 text-xs leading-5 text-[#4f413c] sm:text-sm"
              }
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      <div
        className={
          isDarkEditorial
            ? "mt-5 border-t border-white/10 pt-4"
            : "mt-5 border-t border-[#e4d0c6] pt-4"
        }
      >
        <p
          className={
            isDarkEditorial
              ? "text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/78"
              : "text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]"
          }
        >
          Local Vibe Notes
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {place.localVibe.map((note) => (
            <li
              className={
                isDarkEditorial
                  ? "border-l border-[#D8BE8A]/28 pl-3 text-[11px] leading-5 text-[#B8B0A4]"
                  : "border-l border-[#d8b7aa] pl-3 text-[11px] leading-5 text-[#6f5b53]"
              }
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

function JourneyPath({ isDarkEditorial }: { isDarkEditorial: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={
        isDarkEditorial
          ? "pointer-events-none absolute left-0 top-36 z-0 hidden h-[940px] w-full text-[#D8BE8A] opacity-28 md:block"
          : "pointer-events-none absolute left-0 top-36 z-0 hidden h-[1220px] w-full text-[#c8a598] opacity-75 md:block"
      }
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
      <circle cx="95" cy="165" fill={isDarkEditorial ? "#D8BE8A" : "#b87666"} r="3" />
      <circle cx="520" cy="430" fill={isDarkEditorial ? "#D8BE8A" : "#b87666"} r="3" />
      <circle cx="464" cy="704" fill={isDarkEditorial ? "#D8BE8A" : "#b87666"} r="3" />
      <circle cx="164" cy="1084" fill={isDarkEditorial ? "#D8BE8A" : "#b87666"} r="3" />
    </svg>
  );
}

function PlaceCommunityTips({
  countrySlug,
  isDarkEditorial,
  placeName,
  placeSlug,
  tips,
}: {
  countrySlug: string;
  isDarkEditorial: boolean;
  placeName: string;
  placeSlug?: string;
  tips: CommunityTip[];
}) {
  return (
    <CommunityTipsBoard
      countrySlug={countrySlug}
      isDarkEditorial={isDarkEditorial}
      placeName={placeName}
      placeSlug={placeSlug}
      tips={tips}
    />
  );
}

function GoodToKnow({
  isDarkEditorial,
  sections,
  phrases,
  phrasesTitle,
}: {
  isDarkEditorial: boolean;
  sections: InfoSection[];
  phrases: LocalPhrase[];
  phrasesTitle: string;
}) {
  return (
    <section
      className={
        isDarkEditorial
          ? "border border-white/10 bg-[#111112] px-5 py-8 shadow-2xl shadow-black/20 sm:px-7 lg:px-9"
          : "border border-[#d8b7aa] bg-[#fffaf3] px-5 py-8 sm:px-7 lg:px-9"
      }
    >
      <div className="max-w-3xl">
        <p
          className={
            isDarkEditorial
              ? "text-xs font-medium uppercase tracking-[0.32em] text-[#D8BE8A]"
              : "text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]"
          }
        >
          Good To Know Before You Go
        </p>
        <h2
          className={
            isDarkEditorial
              ? "mt-3 font-serif text-4xl leading-tight text-[#F5F1E8] sm:text-5xl"
              : "mt-3 font-serif text-4xl leading-tight text-[#443733] sm:text-5xl"
          }
        >
          Practical notes before arrival
        </h2>
      </div>
      <div
        className={
          isDarkEditorial
            ? "mt-8 border-y border-white/10"
            : "mt-8 border-y border-[#eadbd2]"
        }
      >
        {sections.map((section, index) => (
          <article
            className={
              isDarkEditorial
                ? "grid gap-4 border-b border-white/10 bg-[#151515]/64 px-5 py-6 transition-colors hover:bg-[#191918] last:border-b-0 sm:grid-cols-[4rem_minmax(0,1fr)] sm:px-6"
                : "grid gap-4 border-b border-[#eadbd2] bg-[#fbf8f2] px-5 py-6 last:border-b-0 sm:grid-cols-[4rem_minmax(0,1fr)] sm:px-6"
            }
            key={section.title}
          >
            <p
              className={
                isDarkEditorial
                  ? "text-xs font-medium uppercase tracking-[0.22em] text-[#D8BE8A]/70"
                  : "text-xs font-medium uppercase tracking-[0.22em] text-[#c09886]"
              }
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <div>
              <h3
                className={
                  isDarkEditorial
                    ? "text-[11px] font-medium uppercase tracking-[0.22em] text-[#D8BE8A]"
                    : "text-[11px] font-medium uppercase tracking-[0.22em] text-[#a16f61]"
                }
              >
                {section.title}
              </h3>
              <p
                className={
                  isDarkEditorial
                    ? "mt-3 text-sm leading-7 text-[#B8B0A4]"
                    : "mt-3 text-sm leading-7 text-[#6f5b53]"
                }
              >
                {section.content}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div
        className={
          isDarkEditorial
            ? "mt-8 border-t border-white/10 pt-7"
            : "mt-8 border-t border-[#eadbd2] pt-7"
        }
      >
        <p
          className={
            isDarkEditorial
              ? "text-xs font-medium uppercase tracking-[0.32em] text-[#D8BE8A]"
              : "text-xs font-medium uppercase tracking-[0.32em] text-[#a16f61]"
          }
        >
          {phrasesTitle}
        </p>
        <div
          className={
            isDarkEditorial
              ? "mt-5 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-5 grid gap-px overflow-hidden border border-[#eadbd2] bg-[#eadbd2] sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {phrases.map((phrase) => (
            <div
              className={
                isDarkEditorial
                  ? "bg-[#151515] px-4 py-4 transition-colors hover:bg-[#191918]"
                  : "bg-[#fbf8f2] px-4 py-4"
              }
              key={phrase.english}
            >
              <p
                className={
                  isDarkEditorial
                    ? "text-[10px] uppercase tracking-[0.18em] text-[#D8BE8A]/72"
                    : "text-[10px] uppercase tracking-[0.18em] text-[#9a7a70]"
                }
              >
                {phrase.english}
              </p>
              <p
                className={
                  isDarkEditorial
                    ? "mt-1 font-serif text-xl leading-tight text-[#F5F1E8]"
                    : "mt-1 font-serif text-xl leading-tight text-[#463934]"
                }
              >
                {phrase.local}
              </p>
              {phrase.pronunciation ? (
                <p
                  className={
                    isDarkEditorial
                      ? "mt-1 text-xs leading-5 text-[#B8B0A4]"
                      : "mt-1 text-xs leading-5 text-[#8d6255]"
                  }
                >
                  {phrase.pronunciation}
                </p>
              ) : null}
              {phrase.usageNote ? (
                <p
                  className={
                    isDarkEditorial
                      ? "mt-3 text-xs leading-5 text-[#9E9589]"
                      : "mt-3 text-xs leading-5 text-[#8d6255]"
                  }
                >
                  {phrase.usageNote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventsSection({
  destination,
  isDarkEditorial,
}: DestinationPageProps & { isDarkEditorial: boolean }) {
  return (
    <EventsBoard
      country={destination.country}
      countrySlug={destination.key}
      events={destination.events}
      isDarkEditorial={isDarkEditorial}
    />
  );
}
