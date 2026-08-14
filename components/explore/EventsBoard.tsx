"use client";

import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { DestinationEvent } from "@/components/explore/destinationData";
import { EventSubmission } from "@/components/explore/SubmissionActions";
import {
  fetchDestinationEvents,
  type DestinationEventResponse,
} from "@/lib/eventsApi";

type EventsBoardProps = {
  country: string;
  countrySlug: string;
  events: DestinationEvent[];
  isDarkEditorial: boolean;
};

function formatEventDate(dateStart: string, dateEnd?: string | null) {
  const formatter = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const start = new Date(`${dateStart}T00:00:00`);

  if (Number.isNaN(start.getTime())) {
    return dateStart;
  }

  if (!dateEnd || dateEnd === dateStart) {
    return formatter.format(start);
  }

  const end = new Date(`${dateEnd}T00:00:00`);

  if (Number.isNaN(end.getTime())) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function mapApiEvent(
  event: DestinationEventResponse,
  fallback: DestinationEvent,
): DestinationEvent {
  return {
    title: event.title,
    category: event.category,
    location: event.location,
    date: formatEventDate(event.date_start, event.date_end),
    description: event.description,
    image: event.media?.url ?? fallback.image,
    imageAlt: event.media?.alt ?? fallback.imageAlt,
  };
}

export function EventsBoard({
  country,
  countrySlug,
  events,
  isDarkEditorial,
}: EventsBoardProps) {
  const [apiEvents, setApiEvents] = useState<DestinationEventResponse[] | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchDestinationEvents(countrySlug)
      .then((fetchedEvents) => {
        if (!isActive) {
          return;
        }

        setApiEvents(fetchedEvents);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setErrorMessage("Event listings are unavailable right now.");
      });

    return () => {
      isActive = false;
    };
  }, [countrySlug]);

  const renderedEvents = useMemo(() => {
    if (!apiEvents?.length) {
      return events;
    }

    return apiEvents.map((event, index) =>
      mapApiEvent(event, events[index] ?? events[events.length - 1]),
    );
  }, [apiEvents, events]);

  return (
    <section
      className={
        isDarkEditorial
          ? "border border-[#D8BE8A]/20 bg-[#111112] p-4 shadow-2xl shadow-black/24 sm:p-5 lg:p-6"
          : "rounded-[6px] border border-[#7c563f] bg-[linear-gradient(135deg,#7a4f35,#b1805c_45%,#6f452f)] p-4 shadow-2xl shadow-[#7d584e]/25 sm:p-5 lg:p-6"
      }
    >
      <div
        className={
          isDarkEditorial
            ? "border border-white/10 bg-[#151515] px-5 py-7 shadow-inner shadow-black/20 sm:px-8 lg:px-10"
            : "border border-[#b78963] bg-[#f4e5cf] px-5 py-7 shadow-inner shadow-[#6f452f]/20 sm:px-8 lg:px-10"
        }
      >
        <div
          className={
            isDarkEditorial
              ? "border-y border-[#D8BE8A]/20 py-4 text-center"
              : "border-y border-[#7d584e] py-4 text-center"
          }
        >
          <p
            className={
              isDarkEditorial
                ? "text-xs font-medium uppercase tracking-[0.34em] text-[#D8BE8A]"
                : "text-xs font-medium uppercase tracking-[0.34em] text-[#7d584e]"
            }
          >
            Local Vibe Events
          </p>
          <h2
            className={
              isDarkEditorial
                ? "mt-2 font-serif text-5xl leading-none text-[#F5F1E8] sm:text-6xl"
                : "mt-2 font-serif text-5xl leading-none text-[#4a3227] sm:text-6xl"
            }
          >
            {country}
          </h2>
          <p
            className={
              isDarkEditorial
                ? "mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#D8BE8A]/72"
                : "mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#7d584e]"
            }
          >
            Upcoming
          </p>
          <div className="mt-4">
            <EventSubmission
              country={country}
              countrySlug={countrySlug}
              onEventCreated={(event) =>
                setApiEvents((currentEvents) => [event, ...(currentEvents ?? [])])
              }
              variant={isDarkEditorial ? "dark" : "light"}
            />
          </div>
        </div>

        {errorMessage ? (
          <p
            className={
              isDarkEditorial
                ? "mt-5 text-sm text-[#D8BE8A]"
                : "mt-5 text-sm text-[#7d584e]"
            }
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-7 space-y-4">
          {renderedEvents.map((event, index) => (
            <EventCard
              event={event}
              index={index}
              isDarkEditorial={isDarkEditorial}
              key={`${event.title}-${event.date}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({
  event,
  index,
  isDarkEditorial,
}: {
  event: DestinationEvent;
  index: number;
  isDarkEditorial: boolean;
}) {
  return (
    <article
      className={
        isDarkEditorial
          ? "grid gap-4 border border-white/10 bg-[#0E0E0F] p-3 shadow-sm shadow-black/20 transition duration-300 hover:border-[#D8BE8A]/26 hover:bg-[#181817] sm:grid-cols-[126px_minmax(0,1fr)_auto] sm:items-center"
          : "grid gap-4 border border-[#9c7357] bg-[#fbf3e6] p-3 shadow-sm shadow-[#7d584e]/15 sm:grid-cols-[126px_minmax(0,1fr)_auto] sm:items-center"
      }
    >
      <div
        className={
          isDarkEditorial
            ? "group relative min-h-[108px] overflow-hidden border border-white/10 bg-[#151515]"
            : "relative min-h-[108px] overflow-hidden border border-[#b58b6e] bg-[#dec7ae]"
        }
      >
        <Image
          alt={event.imageAlt}
          className={
            isDarkEditorial
              ? "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              : "absolute inset-0 h-full w-full object-cover"
          }
          fill
          sizes="126px"
          src={event.image}
        />
      </div>
      <div className="min-w-0">
        <p
          className={
            isDarkEditorial
              ? "text-[10px] font-medium uppercase tracking-[0.22em] text-[#D8BE8A]/76"
              : "text-[10px] font-medium uppercase tracking-[0.22em] text-[#9b6b5f]"
          }
        >
          Event 0{index + 1}
        </p>
        <h3
          className={
            isDarkEditorial
              ? "mt-1 font-serif text-2xl leading-tight text-[#F5F1E8] sm:text-3xl"
              : "mt-1 font-serif text-2xl leading-tight text-[#443733] sm:text-3xl"
          }
        >
          {event.title}
        </h3>
        <div
          className={
            isDarkEditorial
              ? "mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-[#9E9589]"
              : "mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-[#7b665e]"
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays
              className={
                isDarkEditorial
                  ? "h-3.5 w-3.5 text-[#D8BE8A]"
                  : "h-3.5 w-3.5 text-[#9b6b5f]"
              }
            />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin
              className={
                isDarkEditorial
                  ? "h-3.5 w-3.5 text-[#D8BE8A]"
                  : "h-3.5 w-3.5 text-[#9b6b5f]"
              }
            />
            {event.location}
          </span>
        </div>
        <p
          className={
            isDarkEditorial
              ? "mt-3 text-sm leading-6 text-[#B8B0A4]"
              : "mt-3 text-sm leading-6 text-[#6f5b53]"
          }
        >
          {event.description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
        <span
          className={
            isDarkEditorial
              ? "inline-flex rounded-full border border-[#D8BE8A]/28 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A]"
              : "inline-flex rounded-full border border-[#9c7357] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#7d584e]"
          }
        >
          {event.category}
        </span>
        <button
          className={
            isDarkEditorial
              ? "inline-flex rounded-full border border-[#D8BE8A]/36 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C] sm:mt-4"
              : "inline-flex rounded-full border border-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5a3b2d] sm:mt-4"
          }
          type="button"
        >
          Info
        </button>
      </div>
    </article>
  );
}
